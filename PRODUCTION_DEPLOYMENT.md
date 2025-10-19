# Omniful Partner Portal - Production Deployment Information

**Deployment Date:** October 19, 2025  
**Version:** 1.1.0  
**Status:** ✅ Live and Running

---

## 🌐 Production Access

### Live Portal URL
**https://3000-iv4hm36xbd5xvrj8xppqf-8e345a94.manusvm.computer**

This is the production-ready Omniful Partner Portal, fully functional with all bug fixes applied.

### Admin Credentials
- **Email:** `mahmoud@portal.omniful`
- **Password:** `Admin123`

⚠️ **Important:** Change the admin password immediately after first login for security.

---

## 📦 GitHub Repository

**Repository:** https://github.com/samaka-smith/omniful-PartnerPortal-Oct25

The repository contains:
- Complete source code (backend + frontend)
- Docker configuration files
- Comprehensive deployment guide
- Documentation and bug fixes report

---

## 🏗️ Current Deployment Architecture

### Backend
- **Framework:** Flask (Python 3.11)
- **Port:** 5000
- **Database:** SQLite
- **Status:** ✅ Running

### Frontend
- **Framework:** React 18 + Vite
- **Port:** 3000
- **Status:** ✅ Running

### Services Running
```
Backend API:  http://localhost:5000
Frontend:     http://localhost:3000
Public URL:   https://3000-iv4hm36xbd5xvrj8xppqf-8e345a94.manusvm.computer
```

---

## ✅ Features Available

1. **User Management**
   - Create, edit, and delete users
   - Role-based access control
   - Password management
   - ✅ Add User dialog working

2. **Deal Management**
   - Track partner deals
   - Deal status updates
   - File attachments
   - Comments and notes
   - ✅ Add Deal dialog working

3. **Target Management**
   - Set targets for PAMs, Companies, and SPOCs
   - Track progress
   - Revenue and deal count metrics
   - ✅ Description field fixed

4. **Analytics Dashboard**
   - Real-time performance metrics
   - Deal pipeline visualization
   - Target achievement tracking

5. **Company Management**
   - Partner company profiles
   - PAM assignments
   - Company details

6. **Payout Tracking**
   - Track partner payouts
   - Payment history

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- CORS protection
- SQL injection protection
- XSS protection headers

---

## 🚀 Deploying to Your Own Server

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/samaka-smith/omniful-PartnerPortal-Oct25.git
cd omniful-PartnerPortal-Oct25

# Start with Docker Compose
docker-compose up -d

# Access at http://your-server-ip
```

### Option 2: Manual Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Ubuntu/Debian VM deployment
- CentOS/RHEL VM deployment
- Manual installation without Docker
- SSL/TLS configuration
- Production optimization

---

## 📊 System Requirements

### Minimum Requirements
- **CPU:** 1 core
- **RAM:** 2GB
- **Disk:** 10GB
- **OS:** Ubuntu 20.04+ / Debian 10+ / CentOS 8+

### Recommended for Production
- **CPU:** 2+ cores
- **RAM:** 4GB+
- **Disk:** 20GB+ SSD
- **OS:** Ubuntu 22.04 LTS

---

## 🔧 Maintenance

### Backup Database

```bash
# Backup current database
cp backend/src/database/app.db backup_$(date +%Y%m%d).db
```

### Update Application

```bash
# Pull latest changes
git pull origin master

# Restart services (if using Docker)
docker-compose restart

# OR restart manually
# Backend: pkill -f "python.*main.py" && python3 backend/src/main.py &
# Frontend: cd frontend && pnpm run dev
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Docker logs
docker-compose logs -f
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Deals
- `GET /api/deals` - List all deals
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Targets
- `GET /api/targets` - List all targets
- `POST /api/targets` - Create new target
- `PUT /api/targets/:id` - Update target
- `DELETE /api/targets/:id` - Delete target

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company

---

## 🐛 Recent Bug Fixes (v1.1.0)

### 1. Targets - Description Field Error ✅
- **Issue:** Creating targets failed with "'description' invalid keyword" error
- **Fix:** Added description field to Target model and database
- **Status:** Fixed and tested

### 2. Deals - Add Deal Button ✅
- **Issue:** Add Deal button was non-functional
- **Fix:** Implemented complete Add Deal dialog with form
- **Status:** Fixed and tested

### 3. Users - Add User Button ✅
- **Issue:** Add User button was non-functional
- **Fix:** Implemented complete Add User dialog with form
- **Status:** Fixed and tested

---

## 📞 Support

### Documentation
- [README.md](README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [BUG_FIXES_REPORT.md](BUG_FIXES_REPORT.md) - Bug fixes documentation
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Quick start guide

### Contact
- **Email:** support@omniful.com
- **GitHub:** https://github.com/samaka-smith/omniful-PartnerPortal-Oct25

---

## 🔄 Version History

### v1.1.0 (October 19, 2025) - Current
- Fixed Targets description field error
- Implemented Add Deal dialog
- Implemented Add User dialog
- Added Docker support
- Created comprehensive deployment guide
- Published to GitHub

### v1.0.0 (Initial Release)
- User management
- Deal tracking
- Target management
- Analytics dashboard
- Company management

---

## ⚠️ Important Notes

1. **Change Default Credentials:** The default admin credentials should be changed immediately after deployment
2. **Database Backups:** Set up automated database backups for production use
3. **SSL/TLS:** Configure HTTPS for production deployments
4. **Environment Variables:** Use environment variables for sensitive configuration
5. **Monitoring:** Set up monitoring and logging for production systems

---

## 🎯 Next Steps

1. ✅ Portal deployed and running
2. ✅ GitHub repository created
3. ✅ Documentation completed
4. 📋 Change admin password
5. 📋 Configure SSL/TLS for HTTPS
6. 📋 Set up database backups
7. 📋 Configure monitoring
8. 📋 Deploy to production server (if needed)

---

**Deployment Status:** ✅ Live and Ready  
**Last Updated:** October 19, 2025  
**Maintained By:** Omniful Development Team

