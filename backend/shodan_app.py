from flask import Flask, request, jsonify, Response, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, verify_jwt_in_request
import shodan
import logging
import os
import bcrypt
from datetime import timedelta
from functools import wraps
from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError, OperationalError
import sys
from sqlalchemy import text
import psutil
from prometheus_client import start_http_server, Counter, Gauge, generate_latest, Histogram
import time

# Load environment variables from .env file
load_dotenv()

# Configure logging first
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Set logging level for urllib3 to WARNING to suppress debug logs
logging.getLogger("urllib3").setLevel(logging.WARNING)

app = Flask(__name__)
app.url_map.strict_slashes = False
# Enable CORS for all routes with support for Authorization header
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

# Prometheus metrics
SITE_VISITS = Counter('site_visits', 'Number of visits to the Blackjack site')

# System metrics
CPU_USAGE = Gauge('cpu_usage_percent', 'Current CPU usage in percent')
MEMORY_USAGE = Gauge('memory_usage_bytes', 'Current memory usage in bytes')
NETWORK_IO_COUNTERS = Gauge('network_io_bytes', 'Network I/O counters', ['direction'])

# HTTP metrics
HTTP_REQUESTS = Counter('http_requests_total', 'Total number of HTTP requests', ['method', 'endpoint', 'status_code'])
HTTP_REQUEST_DURATION = Histogram('http_request_duration_seconds', 'Histogram of HTTP request durations',
                                  ['method', 'endpoint'])


# Before and after request hooks to track request durations and counts
@app.before_request
def track_request_start():
    # Record the start time of the request
    g.start_time = time.time()


@app.after_request
def track_request_end(response):
    # Measure request duration
    if hasattr(g, 'start_time'):
        request_duration = time.time() - g.start_time
        HTTP_REQUEST_DURATION.labels(method=request.method, endpoint=request.path).observe(request_duration)

    # Count the request
    HTTP_REQUESTS.labels(method=request.method, endpoint=request.path, status_code=response.status_code).inc()

    return response

def read_secret(secret_path):
    try:
        with open(secret_path, 'r') as file:
            return file.read().strip()
    except Exception as e:
        logger.error(f"Failed to read secret {secret_path}: {str(e)}")
        raise

# Mask sensitive information
def mask_secret(secret, show_last=4):
    return '*' * (len(secret) - show_last) + secret[-show_last:]

# Database Configuration
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME', 'postgres')

# Fallback to reading secrets if environment variables are paths
if db_user and os.path.exists(db_user):
    db_user = read_secret(db_user)
if db_password and os.path.exists(db_password):
    db_password = read_secret(db_password)
if db_host and os.path.exists(db_host):
    db_host = read_secret(db_host)
if db_name and os.path.exists(db_name):
    db_name = read_secret(db_name)

# Validate database configuration
if not all([db_user, db_password, db_host]):
    logger.error("Missing required database configuration")
    raise ValueError("Missing required database configuration. Check your .env file.")

# Log the database configuration for debugging
logger.debug(f"DB_USER: {mask_secret(db_user)}")
logger.debug(f"DB_PASSWORD: {mask_secret(db_password)}")
logger.debug(f"DB_HOST: {mask_secret(db_host)}")
logger.debug(f"DB_NAME: {db_name}")

try:
    # Construct database URL
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:5432/{db_name}"
    # Log the constructed database URL
    masked_db_url = f"postgresql://{mask_secret(db_user)}:{mask_secret(db_password)}@{mask_secret(db_host)}:5432/{db_name}"
    logger.debug(f"Constructed DATABASE_URL: {masked_db_url}")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 5,
        'max_overflow': 10,
        'pool_timeout': 30,
        'pool_recycle': 1800,
        'pool_pre_ping': True,
        'connect_args': {
            'connect_timeout': 10,
            'application_name': 'shodan_sentinel'
        }
    }
except Exception as e:
    logger.error(f"Failed to configure database: {str(e)}")
    raise

# JWT Configuration
jwt_secret = os.getenv('JWT_SECRET_KEY')
if not jwt_secret:
    raise ValueError("No JWT_SECRET_KEY found in environment variables.")

app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Load the Shodan API key from environment variables
shodan_secret = os.getenv('SHODAN_API_KEY')
if shodan_secret and os.path.exists(shodan_secret):
    shodan_secret = read_secret(shodan_secret)
if not shodan_secret:
    raise ValueError("No SHODAN_API_KEY found in environment variables.")

# Log the Shodan API key for debugging (masked for security)
logger.debug(f"Shodan API Key: {mask_secret(shodan_secret)}")

api = shodan.Shodan(shodan_secret)

# Database error handling decorator
def handle_db_error(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except OperationalError as e:
            logger.error(f"Database connection error: {str(e)}")
            return jsonify({'error': 'Database connection error. Please try again later.'}), 500
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            return jsonify({'error': 'Database error. Please try again later.'}), 500
    return decorated_function

# Custom JWT decorator
def jwt_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user_id = int(current_user_id)
                user = db.session.get(User, user_id)  # Updated to use Session.get()
                if not user:
                    return jsonify({"error": "User not found"}), 401
                return fn(*args, **kwargs)
            except Exception as e:
                logger.error(f"JWT Error: {str(e)}")
                return jsonify({"error": "Invalid or expired token"}), 401
        return decorator
    return wrapper

# User Model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.LargeBinary, nullable=False)
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password)

def test_database_connection():
    try:
        with app.app_context():
            # Use SQLAlchemy text() for raw SQL
            db.session.execute(text('SELECT 1'))
            db.session.commit()
            logger.info("Database connection test successful")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False

def initialize_database():
    try:
        with app.app_context():
            if not test_database_connection():
                return False
            db.create_all()
            logger.info("Database tables created successfully")
            return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        return False

# Authentication routes
@app.route('/api/register', methods=['POST'])
@handle_db_error
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    try:
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        logger.info(f"New user registered: {email}")
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
@handle_db_error
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        logger.info(f"User logged in: {email}")
        return jsonify({
            'token': access_token,
            'user_id': user.id,
            'email': user.email
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/perform_ip_search', methods=['POST'])
@jwt_required()
def perform_ip_search():
    current_user_id = get_jwt_identity()
    try:
        user = db.session.get(User, int(current_user_id))  # Updated to use Session.get()
        if not user:
            return jsonify({'error': 'User not found'}), 401

        data = request.get_json()
        ip = data.get('ip')

        if not ip:
            return jsonify({'error': 'IP address is required'}), 400

        logger.debug(f"User {user.email} searching for IP: {ip}")
        results = api.host(ip)

        if results and 'ip_str' in results:
            return jsonify(results)
        return jsonify({'error': "No information available for that IP."}), 404

    except shodan.APIError as e:
        logger.error(f"Shodan API Error: {str(e)}")
        return jsonify({'error': f"Shodan API Error: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Unexpected Error in IP search: {str(e)}")
        return jsonify({'error': "An unexpected error occurred"}), 500

@app.route('/api/perform_filter_search', methods=['POST'])
@jwt_required()
def perform_filter_search():
    current_user_id = get_jwt_identity()
    try:
        user = db.session.get(User, int(current_user_id))  # Updated to use Session.get()
        if not user:
            return jsonify({'error': 'User not found'}), 401

        data = request.get_json()
        filters = []
        
        if data.get('port'): filters.append(f'port:{data["port"]}')
        if data.get('country'): filters.append(f'country:{data["country"]}')
        if data.get('product'): filters.append(f'product:{data["product"]}')
        if data.get('os'): filters.append(f'os:{data["os"]}')
        if data.get('category'): filters.append(f'category:{data["category"]}')
        
        query = ' '.join(filters)
        logger.debug(f"User {user.email} searching with query: {query}")
        
        if not query:
            return jsonify({'error': 'At least one search filter is required'}), 400

        results = api.search(query)
        formatted_results = []
        
        for result in results.get('matches', []):
            formatted_result = {
                'ip_str': result.get('ip_str'),
                'port': result.get('port'),
                'product': result.get('product'),
                'version': result.get('version'),
                'org': result.get('org'),
                'os': result.get('os'),
                'hostnames': result.get('hostnames', []),
                'domains': result.get('domains', []),
                'timestamp': result.get('timestamp'),
                'vulns': list(result.get('vulns', {}).keys()) if result.get('vulns') else [],
                'opts': {'vulns': result.get('vulns', {})},
                'location': {
                    'city': result.get('location', {}).get('city'),
                    'country_name': result.get('location', {}).get('country_name'),
                    'country_code': result.get('location', {}).get('country_code')
                },
                'transport': result.get('transport', 'tcp'),
                'data': [{
                    'port': result.get('port'),
                    'transport': result.get('transport', 'tcp'),
                    'product': result.get('product'),
                    'version': result.get('version'),
                    'info': result.get('info'),
                    'http': result.get('http') if 'http' in result else None
                }]
            }
            
            if 'data' in result:
                formatted_result['raw_data'] = result['data']
            
            formatted_results.append(formatted_result)

        return jsonify(formatted_results)

    except shodan.APIError as e:
        logger.error(f"Shodan API Error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected Error in filter search: {str(e)}")
        return jsonify({'error': "An unexpected error occurred"}), 500

@app.route('/api/check_auth', methods=['GET'])
@jwt_required()
def check_auth():
    current_user_id = get_jwt_identity()
    try:
        user = User.query.get(int(current_user_id))
        if user:
            return jsonify({
                'authenticated': True,
                'user_id': user.id,
                'email': user.email
            }), 200
    except Exception as e:
        logger.error(f"Auth check error: {str(e)}")
    return jsonify({'authenticated': False}), 401

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        if test_database_connection():
            return jsonify({'message': 'Database connection successful'}), 200
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        logger.error(f"Database test failed: {str(e)}")
        return jsonify({'error': f'Database connection failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/metrics')
def metrics():
    # Update system metrics before serving
    CPU_USAGE.set(psutil.cpu_percent())
    MEMORY_USAGE.set(psutil.virtual_memory().used)
    net_io = psutil.net_io_counters()
    NETWORK_IO_COUNTERS.labels('in').set(net_io.bytes_recv)
    NETWORK_IO_COUNTERS.labels('out').set(net_io.bytes_sent)

    # Return Prometheus metrics in the required format
    return Response(generate_latest(), mimetype='text/plain')

if __name__ == "__main__":
    try:
        if initialize_database():
            logger.info("Starting application server...")
            app.run(host='0.0.0.0', port=5055, debug=True)
        else:
            logger.error("Failed to initialize database. Exiting...")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        sys.exit(1)