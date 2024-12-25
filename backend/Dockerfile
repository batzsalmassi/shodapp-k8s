FROM python:3.9-alpine

WORKDIR /app

# Install required packages for building Python packages
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev \
    linux-headers

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose the port the app runs on
EXPOSE 5055

# Run the application
CMD ["python", "shodan_app.py"]