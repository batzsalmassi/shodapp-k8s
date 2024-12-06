# Running the Docker Compose File

To run the `docker-compose.yaml` file, follow these steps:

1. **Install Docker and Docker Compose**:
    Ensure you have Docker and Docker Compose installed on your machine. You can download them from [Docker's official website](https://www.docker.com/get-started).

2. **Clone the Repository**:
    Clone this repository to your local machine using the following command:
    ```sh
    git clone https://github.com/batzsalmassi/shodapp-k8s
    ```

    After cloning, navigate to the `docker-compose` subfolder:
    ```sh
    cd shodapp-k8s/docker-compose
    ```

3. **Navigate to the Directory**:
    Change your working directory to the location of the `docker-compose.yaml` file:
    ```sh
    cd /path/to/docker-compose.yaml
    ```

4. **Create Secrets**:
    Create the necessary secrets within the `secrets` folder. The secrets should be stored in individual files as follows:
    - `secrets/db_password.txt`: Contains the database password.
    - `secrets/shodan_api_key.txt`: Contains the Shodan API key.
    - `secrets/db_name.txt`: Contains the database name.
    - `secrets/db_user.txt`: Contains the database username.
    - `secrets/jwt_secret_key.txt`: Contains the JWT secret key.
    - `secrets/db_host.txt`: Contains the database host.

    Ensure the `secrets` folder has the following structure:
    ```
    secrets/
    ├── db_password.txt
    ├── shodan_api_key.txt
    ├── db_name.txt
    ├── db_user.txt
    ├── jwt_secret_key.txt
    └── db_host.txt
    ```

    Each file should contain the corresponding secret value. For example, `db_password.txt` should contain the database password as plain text.

5. **Run Docker Compose**:
    Use the following command to start the services defined in the `docker-compose.yaml` file:
    ```sh
    docker-compose up
    ```

6. **Access the Services**:
    Once the services are up and running, you can access them as defined in the `docker-compose.yaml` file. Check the output logs for specific URLs and ports.

7. **Stopping the Services**:
    To stop the services, press `Ctrl+C` in the terminal where the services are running. Alternatively, you can run:
    ```sh
    docker-compose down
    ```

### Additional Commands:

- To run the services in the background (detached mode), use:
  ```sh
  docker-compose up -d
  ```

- To view the logs of a specific service, use:
  ```sh
  docker-compose logs <service_name>
  ```

For more information, refer to the [Docker Compose documentation](https://docs.docker.com/compose/).
