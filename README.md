# Omniful Partner Portal

A comprehensive partner management system for tracking deals, managing users, setting targets, and monitoring performance.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)

---

## 🚀 Features

- **User Management** - Create and manage portal users with role-based access control
- **Deal Tracking** - Track partner deals from lead to close
- **Target Management** - Set and monitor revenue and deal targets for PAMs, Companies, and SPOCs
- **Analytics Dashboard** - Real-time insights into partner performance
- **Company Management** - Manage partner companies and relationships
- **Payout Tracking** - Track and manage partner payouts
- **File Management** - Upload and manage deal-related documents

---

## 🏗️ Architecture

### Backend
- **Framework:** Flask (Python 3.11)
- **Database:** SQLite (upgradeable to PostgreSQL)
- **Authentication:** JWT-based
- **API:** RESTful API with CORS support

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Components:** Custom components with Tailwind CSS
- **State Management:** React Hooks
- **Routing:** React Router

---

## 📦 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/omniful-PartnerPortal-Oct25.git
cd omniful-PartnerPortal-Oct25

# Start all services
docker-compose up -d

# Access the portal
open http://localhost
```

**Default Credentials:**
- Email: `mahmoud@portal.omniful`
- Password: `Admin123`

### Manual Installation

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions for Docker and VM
- **[Bug Fixes Report](BUG_FIXES_REPORT.md)** - Recent bug fixes and improvements
- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Quick testing and usage guide
- **[API Documentation](docs/API.md)** - API endpoints and usage (if available)

---

## 🛠️ Technology Stack

### Backend
- Python 3.11
- Flask
- SQLAlchemy
- JWT Authentication
- Gunicorn (Production)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### DevOps
- Docker
- Docker Compose
- Nginx
- Let's Encrypt (SSL)

---

## 🔧 Development

### Backend Development

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python3 migrate_target_description.py

# Start development server
python3 src/main.py
```

Backend runs on: http://localhost:5000

### Frontend Development

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Frontend runs on: http://localhost:3000

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- SSL/TLS configuration
- Environment variables
- Database backups
- Monitoring
- Scaling

---

## 📊 Project Structure

```
omniful-PartnerPortal-Oct25/
├── backend/                 # Flask backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── database/       # Database files
│   │   └── main.py         # Application entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── docker-compose.yml
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── main.tsx       # Application entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml     # Main orchestration file
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── README.md              # This file
```

---

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS configuration
- SQL injection protection via SQLAlchemy ORM
- XSS protection headers
- HTTPS support (production)

---

## 🐛 Recent Bug Fixes (v1.1.0)

1. ✅ **Targets Description Field** - Fixed invalid keyword error
2. ✅ **Add Deal Button** - Implemented functional Add Deal dialog
3. ✅ **Add User Button** - Implemented functional Add User dialog

See [BUG_FIXES_REPORT.md](BUG_FIXES_REPORT.md) for details.

---

## 🤝 Contributing

This is a proprietary project. For access or contribution inquiries, contact the development team.

---

## 📝 License

Proprietary - Omniful Partner Portal  
© 2025 Omniful. All rights reserved.

---

## 📞 Support

For support or questions:
- Email: support@omniful.com
- Documentation: See docs/ directory
- Issues: Contact development team

---

## 🔄 Version History

### v1.1.0 (October 19, 2025)
- Fixed Targets description field error
- Implemented Add Deal dialog
- Implemented Add User dialog
- Added Docker support
- Created comprehensive deployment guide

### v1.0.0 (Initial Release)
- User management
- Deal tracking
- Target management
- Analytics dashboard
- Company management

---

## 🎯 Roadmap

- [ ] PostgreSQL migration
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Export functionality
- [ ] Mobile responsive improvements
- [ ] API rate limiting
- [ ] Automated testing

---

**Made with ❤️ for Omniful Partners**

