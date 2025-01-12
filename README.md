# Shodapp K8s

This repository contains the Kubernetes configurations and Docker setup for the Shodapp project, which includes both frontend and backend applications.

## Table of Contents

- [Project Description](#project-description)
- [Frontend Application](#frontend-application)
- [Backend Service](#backend-service)
- [Docker Compose Setup](#docker-compose-setup)
- [Kubernetes Setup](#kubernetes-setup)
- [Contributing](#contributing)
- [License](#license)

## Project Description

Shodapp is a web application that provides a seamless user experience for interacting with the Shodan API. It consists of a frontend application built with modern web technologies and a backend service that handles API requests, processes data, and interacts with the database.

## Frontend Application

### Project Description

This is the frontend application for the Shodapp project. It is built using modern web technologies to provide a seamless user experience.

### Installation

To install the dependencies, run the following command:

```bash
npm install
```

### Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner in interactive watch mode.
- `npm run build`: Builds the app for production.
- `npm run eject`: Ejects the configuration files and dependencies.

For more information, refer to the [frontend README](./frontend/README.md).

## Backend Service

This repository contains the backend service for the Shodapp application. The backend is responsible for handling API requests, processing data, and interacting with the database.
**Note:** The backend application works with an online RDS, so you need an available RDS endpoint or any other available database to run the backend app.


### Installation

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

4. Set up environment variables:
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

    **Note:** You need to have an RDS Postgres endpoint filled within the DB_HOST in the `.env` file in order to run the backend application.

5. Start the development server:
    ```bash
    python3 shodan_app.py
    ```

For more information, refer to the [backend README](./backend/README.md).

## Docker Compose Setup

To run the entire application stack using Docker Compose, use the provided `docker-compose.yaml` file.

1. Ensure Docker and Docker Compose are installed on your machine.
2. Navigate to the root directory of the repository.
3. Create the necessary secret files in the `docker-compose/secrets` directory:
    - `db_user.txt`
    - `db_password.txt`
    - `jwt_secret_key.txt`
    - `shodan_api_key.txt`
    - `db_host.txt`
    - `db_name.txt`

    Example content for `db_user.txt`:
    ```
    postgres
    ```

4. Run the following command to start the services:
    ```bash
    docker-compose up
    ```

## Kubernetes Setup

The Kubernetes configurations for deploying the Shodapp project are located in the `k8s` directory. To deploy the application to a Kubernetes cluster, follow these steps:

1. Ensure `kubectl` and `kustomize` are installed on your machine.
2. Navigate to the `k8s` directory.
3. Apply the configurations using `kubectl`:
    ```bash
    kubectl apply -k .
    ```

## Contributing

We welcome contributions to the Shodapp project. To contribute, follow these steps:

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

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.