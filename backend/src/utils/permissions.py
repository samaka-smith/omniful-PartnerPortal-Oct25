"""
Permission utilities for role-based access control
"""
from functools import wraps
from flask import request, jsonify
import jwt
import os

def get_current_user_from_token():
    """Extract user info from JWT token"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        secret_key = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        return {
            'user_id': payload.get('user_id'),
            'email': payload.get('email'),
            'role': payload.get('role'),
            'company_id': payload.get('company_id')
        }
    except:
        return None

def require_roles(*allowed_roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user_from_token()
            
            if not user:
                return jsonify({'error': 'Authentication required'}), 401
            
            if user['role'] not in allowed_roles:
                return jsonify({'error': 'Permission denied'}), 403
            
            # Pass user info to the route
            return f(current_user=user, *args, **kwargs)
        
        return decorated_function
    return decorator

def is_portal_admin(user):
    """Check if user is Portal Administrator"""
    return user and user.get('role') == 'Portal Administrator'

def is_pam(user):
    """Check if user is Partner Account Manager"""
    return user and user.get('role') == 'Partner Account Manager'

def is_spoc_admin(user):
    """Check if user is Partner SPOC Admin"""
    return user and user.get('role') == 'Partner SPOC Admin'

def is_team_member(user):
    """Check if user is Partner Team Member"""
    return user and user.get('role') == 'Partner Team Member'

def is_viewer(user):
    """Check if user is Viewer"""
    return user and user.get('role') == 'Viewer'

def can_access_company(user, company_id):
    """Check if user can access a specific company"""
    if is_portal_admin(user):
        return True
    
    if is_pam(user):
        # PAM can only access assigned company
        return user.get('company_id') == company_id
    
    if is_spoc_admin(user) or is_team_member(user):
        # SPOC and Team Member can only access their own company
        return user.get('company_id') == company_id
    
    return False

def can_add_company(user):
    """Check if user can add companies"""
    return is_portal_admin(user) or is_pam(user)

def can_manage_users(user):
    """Check if user can add/edit users"""
    return is_portal_admin(user)

def can_add_targets(user):
    """Check if user can add targets"""
    return is_portal_admin(user)

def can_view_payouts(user):
    """Check if user can view payouts"""
    return is_portal_admin(user) or is_spoc_admin(user)

def can_view_analytics(user):
    """Check if user can view analytics"""
    return is_portal_admin(user) or is_pam(user) or is_viewer(user)

def can_add_deals(user):
    """Check if user can add deals"""
    return is_portal_admin(user) or is_pam(user) or is_spoc_admin(user) or is_team_member(user)

def filter_by_company_access(user, query_result, company_id_field='company_id'):
    """Filter query results based on user's company access"""
    if is_portal_admin(user):
        return query_result
    
    user_company_id = user.get('company_id')
    if not user_company_id:
        return []
    
    # Filter to only show items for user's company
    if isinstance(query_result, list):
        return [item for item in query_result if getattr(item, company_id_field, None) == user_company_id]
    
    return query_result

