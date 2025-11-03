# Omniful Partner Portal - Deployment Guide

**Version:** 1.1.0  
**Last Updated:** October 19, 2025

---

## Table of Contents

1. [Quick Start with Docker](#quick-start-with-docker)
2. [VM Deployment](#vm-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start with Docker

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

### One-Command Deployment

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/omniful-PartnerPortal-Oct25.git
cd omniful-PartnerPortal-Oct25

# Start all services (this will create the database with correct schema)
docker-compose up -d

# NOTE: If you have an existing database and want to preserve data,
# run the migration script BEFORE starting services:
# cd backend && python3 migrate_add_company_fields.py && cd ..

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The portal will be available at:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000

### Default Credentials

- **Email:** mahmoud@portal.omniful
- **Password:** Admin123

### Stop Services

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

---

## VM Deployment

### Option 1: Ubuntu/Debian VM

#### 1. Install Docker

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version
```

#### 2. Deploy the Portal

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/omniful-PartnerPortal-Oct25.git
cd omniful-PartnerPortal-Oct25

# Start services
sudo docker compose up -d

# Check status
sudo docker compose ps
```

#### 3. Configure Firewall

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if configured)
sudo ufw allow 443/tcp

# Allow backend API (optional, for direct access)
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw enable
```

### Option 2: CentOS/RHEL VM

#### 1. Install Docker

```bash
# Install required packages
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
sudo docker --version
sudo docker compose version
```

#### 2. Deploy the Portal

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/omniful-PartnerPortal-Oct25.git
cd omniful-PartnerPortal-Oct25

# Start services
sudo docker compose up -d
```

#### 3. Configure Firewall

```bash
# Allow HTTP
sudo firewall-cmd --permanent --add-port=80/tcp

# Allow HTTPS
sudo firewall-cmd --permanent --add-port=443/tcp

# Reload firewall
sudo firewall-cmd --reload
```

### Option 3: Manual Installation (Without Docker)

#### Backend Setup

```bash
# Install Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Navigate to backend directory
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python3 migrate_target_description.py

# Create admin user
python3 create_admin_user.py

# Start backend (development)
python3 src/main.py

# OR start with Gunicorn (production)
gunicorn --bind 0.0.0.0:5000 --workers 4 src.main:app
```

#### Frontend Setup

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Build for production
pnpm run build

# Serve with a static file server
npx serve -s dist -l 3000

# OR use nginx
sudo apt-get install -y nginx
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

---

## Production Deployment

### 1. SSL/TLS Configuration

#### Using Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

#### Update docker-compose.yml for SSL

```yaml
services:
  frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 2. Environment Variables

Create a `.env` file:

```bash
# Backend
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=sqlite:///src/database/app.db

# Frontend
VITE_API_URL=https://yourdomain.com/api
```

Update docker-compose.yml:

```yaml
services:
  backend:
    env_file:
      - .env
```

### 3. Database Backup

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups/omniful"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
docker exec omniful-backend tar czf - /app/src/database | \
  cat > $BACKUP_DIR/database_$DATE.tar.gz

# Keep only last 7 days
find $BACKUP_DIR -name "database_*.tar.gz" -mtime +7 -delete
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### 4. Monitoring

#### Health Checks

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check frontend health
curl http://localhost/

# Docker health status
docker compose ps
```

#### Logs

```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100
```

### 5. Scaling

Update docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment mode | `production` |
| `SECRET_KEY` | Flask secret key | Required |
| `DATABASE_URL` | Database connection string | `sqlite:///src/database/app.db` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_APP_TITLE` | Application title | `Omniful Partner Portal` |

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8080:80"
```

#### 2. Database Permission Issues

```bash
# Fix permissions
sudo chown -R 1000:1000 backend/src/database

# Or use volume
volumes:
  - ./backend/src/database:/app/src/database:rw
```

#### 3. Frontend Can't Connect to Backend

Check nginx configuration:

```bash
# View nginx logs
docker compose logs frontend

# Test backend connectivity from frontend container
docker compose exec frontend wget -O- http://backend:5000/api/health
```

#### 4. Build Failures

```bash
# Clear Docker cache
docker compose build --no-cache

# Remove old images
docker system prune -a
```

### Performance Optimization

#### 1. Enable Redis Caching

Add to docker-compose.yml:

```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    networks:
      - omniful-network
```

#### 2. Database Optimization

```bash
# Use PostgreSQL instead of SQLite for production
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: omniful
      POSTGRES_USER: omniful
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

#### 3. CDN for Static Assets

Configure nginx to serve static files with long cache headers.

---

## Security Best Practices

1. **Change Default Credentials** immediately after deployment
2. **Use Strong SECRET_KEY** - generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
3. **Enable HTTPS** in production
4. **Regular Updates** - keep Docker images updated
5. **Firewall Rules** - restrict access to necessary ports only
6. **Database Backups** - automate daily backups
7. **Monitor Logs** - set up log aggregation and monitoring

---

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review documentation in this guide
- Contact: support@omniful.com

---

## Quick Reference

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### View Logs
```bash
docker compose logs -f
```

### Update Application
```bash
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Backup Database
```bash
docker exec omniful-backend tar czf - /app/src/database > backup.tar.gz
```

### Restore Database
```bash
cat backup.tar.gz | docker exec -i omniful-backend tar xzf - -C /
docker compose restart backend
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** October 19, 2025

