"""
Database configuration and initialization
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'company_id': self.company_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    website = db.Column(db.String(255))
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'website': self.website,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Deal(db.Model):
    __tablename__ = 'deals'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    customer_company = db.Column(db.String(200), nullable=False)
    customer_company_url = db.Column(db.String(255))
    customer_spoc = db.Column(db.String(100), nullable=False)
    customer_spoc_email = db.Column(db.String(120), nullable=False)
    customer_spoc_phone = db.Column(db.String(50))
    revenue_arr = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Open')
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_company': self.customer_company,
            'customer_company_url': self.customer_company_url,
            'customer_spoc': self.customer_spoc,
            'customer_spoc_email': self.customer_spoc_email,
            'customer_spoc_phone': self.customer_spoc_phone,
            'revenue_arr': self.revenue_arr,
            'status': self.status,
            'comments': self.comments,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Target(db.Model):
    __tablename__ = 'targets'
    
    id = db.Column(db.Integer, primary_key=True)
    target_type = db.Column(db.String(50), nullable=False)  # PAM, Company, SPOC
    target_entity_id = db.Column(db.Integer, nullable=False)
    target_metric = db.Column(db.String(50), nullable=False)  # revenue, deals_count, won_deals
    target_value = db.Column(db.Float, nullable=False)
    target_period = db.Column(db.String(50), nullable=False)  # monthly, quarterly, yearly
    description = db.Column(db.String(500), nullable=True, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'target_type': self.target_type,
            'target_entity_id': self.target_entity_id,
            'target_metric': self.target_metric,
            'target_value': self.target_value,
            'target_period': self.target_period,
            'description': self.description or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

def init_db():
    """Initialize database and create default admin user"""
    db.create_all()
    
    # Check if admin user exists
    admin = User.query.filter_by(email='mahmoud@portal.omniful').first()
    if not admin:
        admin = User(
            username='Mahmoud Portal Admin',
            email='mahmoud@portal.omniful',
            role='Portal Administrator'
        )
        admin.set_password('Admin123')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully")

