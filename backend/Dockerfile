# Omniful Partner Portal - Backend Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create database directory with proper permissions
RUN mkdir -p src/database && chmod 777 src/database

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=src.main:app
ENV PYTHONUNBUFFERED=1

# Run with Gunicorn for production
# Use single worker to prevent database initialization race conditions
# Can be increased after first successful start
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "--preload", "src.main:app"]

