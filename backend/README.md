# Backend Service App

This repository contains the backend service for the Shodapp application. The backend is responsible for handling API requests, processing data, and interacting with the database.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the backend service, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/shodapp-k8s.git
    cd shodapp-k8s/backend
    ```

2. Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Create an RDS Postgres instance:
- Go to the AWS Management Console.
- Navigate to RDS and create a new Postgres instance.
- Note down the endpoint, username, and password for the database.

5. Create a Security Group to allow inbound and outbound traffic to the RDS instance:
    - Go to the AWS Management Console.
    - Navigate to EC2 and create a new Security Group.
    - Add inbound rules to allow traffic on the port your Postgres instance is using (default is 5432).
    - Attach this Security Group to your RDS instance.

## Usage

6. Set up environment variables:
    Create a `.env` file in the `backend` directory and add the necessary environment variables. Refer to `.env.example` for the required variables.

    Example `.env` file:
    ```
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=your_db_host
    DB_NAME=your_db_name
    JWT_SECRET_KEY=your_jwt_secret_key
    SHODAN_API_KEY=your_shodan_api_key
    ```

7. Start the development server:
    ```bash
    python3 shodan_app.py
    ```

## API Endpoints

The backend service exposes the following API endpoints:

- `POST /register` - Registers a new user.
- `POST /login` - Authenticates a user and returns a JWT token.
- `POST /perform_ip_search` - Performs an IP search using the Shodan API (requires JWT).
- `POST /perform_filter_search` - Performs a filtered search using the Shodan API (requires JWT).
- `GET /check_auth` - Checks if the user is authenticated (requires JWT).
- `GET /test-db` - Tests the database connection.

## Contributing

We welcome contributions to the backend service. To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.