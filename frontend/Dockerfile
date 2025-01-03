FROM node:lts-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --silent

# Required for Create React App's development mode in container
ENV CI=true
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true

# Install development tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start development server with host set to 0.0.0.0
CMD ["npm", "start"]