from flask import Flask, request, jsonify
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

app = Flask(__name__)
# Enable CORS for all routes with support for Authorization header
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

# Database Configuration
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME', 'postgres')

# Validate database configuration
if not all([db_user, db_password, db_host]):
    logger.error("Missing required database configuration")
    raise ValueError("Missing required database configuration. Check your .env file.")

try:
    # Construct database URL
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:5432/{db_name}"
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
if not shodan_secret:
    raise ValueError("No SHODAN_API_KEY found in environment variables.")

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
                user = User.query.get(user_id)
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
@app.route('/register', methods=['POST'])
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

@app.route('/login', methods=['POST'])
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

@app.route('/perform_ip_search', methods=['POST'])
@jwt_required()
def perform_ip_search():
    current_user_id = get_jwt_identity()
    try:
        user = User.query.get(int(current_user_id))
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

@app.route('/perform_filter_search', methods=['POST'])
@jwt_required()
def perform_filter_search():
    current_user_id = get_jwt_identity()
    try:
        user = User.query.get(int(current_user_id))
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

@app.route('/check_auth', methods=['GET'])
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

@app.route('/test-db', methods=['GET'])
def test_db():
    try:
        if test_database_connection():
            return jsonify({'message': 'Database connection successful'}), 200
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        logger.error(f"Database test failed: {str(e)}")
        return jsonify({'error': f'Database connection failed: {str(e)}'}), 500

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