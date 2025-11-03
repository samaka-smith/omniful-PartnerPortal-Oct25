"""
Role-Based Access Control (RBAC) utilities
"""
from functools import wraps
from flask import request, jsonify
from src.models.database import User, Company

# Role definitions
ROLE_PORTAL_ADMIN = 'Portal Administrator'
ROLE_PAM = 'Partner Account Manager'
ROLE_PARTNER_SPOC_ADMIN = 'Partner SPOC Admin'
ROLE_PARTNER_TEAM_MEMBER = 'Partner Team Member'

def get_current_user():
    """Get current user from request headers (mock implementation)"""
    # In a real app, this would decode JWT token or session
    # For now, return a mock user based on header
    user_id = request.headers.get('X-User-Id')
    if user_id:
        return User.query.get(int(user_id))
    return None

def get_user_accessible_company_ids(user):
    """Get list of company IDs the user has access to"""
    if not user:
        return []
    
    if user.role == ROLE_PORTAL_ADMIN:
        # Portal Admin has access to all companies
        return [c.id for c in Company.query.all()]
    
    elif user.role == ROLE_PAM:
        # PAM has access to assigned companies
        return [c.id for c in user.assigned_companies]
    
    elif user.role in [ROLE_PARTNER_SPOC_ADMIN, ROLE_PARTNER_TEAM_MEMBER]:
        # Partner users have access to their single assigned company
        return [user.company_id] if user.company_id else []
    
    return []

def filter_companies_by_access(companies, user):
    """Filter companies list based on user access"""
    if not user:
        return []
    
    if user.role == ROLE_PORTAL_ADMIN:
        return companies
    
    accessible_ids = get_user_accessible_company_ids(user)
    return [c for c in companies if c.id in accessible_ids]

def filter_deals_by_access(deals, user):
    """Filter deals list based on user access"""
    if not user:
        return []
    
    if user.role == ROLE_PORTAL_ADMIN:
        return deals
    
    accessible_company_ids = get_user_accessible_company_ids(user)
    return [d for d in deals if d.company_id in accessible_company_ids]

def can_access_section(user, section):
    """Check if user can access a specific section"""
    if not user:
        return False
    
    # Portal Admin has access to everything
    if user.role == ROLE_PORTAL_ADMIN:
        return True
    
    # Section access rules
    section_access = {
        'users': [ROLE_PORTAL_ADMIN],
        'companies': [ROLE_PORTAL_ADMIN, ROLE_PAM],
        'deals': [ROLE_PORTAL_ADMIN, ROLE_PAM, ROLE_PARTNER_SPOC_ADMIN, ROLE_PARTNER_TEAM_MEMBER],
        'analytics': [ROLE_PORTAL_ADMIN, ROLE_PAM, ROLE_PARTNER_SPOC_ADMIN],
        'targets': [ROLE_PORTAL_ADMIN, ROLE_PAM, ROLE_PARTNER_SPOC_ADMIN],
        'payouts': [ROLE_PORTAL_ADMIN, ROLE_PAM],
        'dashboard': [ROLE_PORTAL_ADMIN, ROLE_PAM, ROLE_PARTNER_SPOC_ADMIN, ROLE_PARTNER_TEAM_MEMBER]
    }
    
    return user.role in section_access.get(section, [])

def can_create_target(user):
    """Check if user can create targets"""
    if not user:
        return False
    return user.role == ROLE_PORTAL_ADMIN

def can_assign_pam_to_company(user):
    """Check if user can assign PAMs to companies"""
    if not user:
        return False
    return user.role == ROLE_PORTAL_ADMIN

def can_edit_company(user, company_id):
    """Check if user can edit a specific company"""
    if not user:
        return False
    
    if user.role == ROLE_PORTAL_ADMIN:
        return True
    
    if user.role == ROLE_PAM:
        # PAM can edit assigned companies
        return company_id in [c.id for c in user.assigned_companies]
    
    return False

def can_edit_deal(user, deal):
    """Check if user can edit a specific deal"""
    if not user:
        return False
    
    if user.role == ROLE_PORTAL_ADMIN:
        return True
    
    if user.role == ROLE_PAM:
        # PAM can edit deals from assigned companies
        return deal.company_id in [c.id for c in user.assigned_companies]
    
    if user.role in [ROLE_PARTNER_SPOC_ADMIN, ROLE_PARTNER_TEAM_MEMBER]:
        # Partner users can edit deals from their company
        return deal.company_id == user.company_id
    
    return False

def require_role(*allowed_roles):
    """Decorator to require specific roles for an endpoint"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user or user.role not in allowed_roles:
                return jsonify({'error': 'Unauthorized access'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
