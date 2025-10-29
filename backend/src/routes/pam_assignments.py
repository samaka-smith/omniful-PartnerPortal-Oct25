"""
PAM (Partner Account Manager) assignments routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, User, Company

bp = Blueprint('pam_assignments', __name__)

@bp.route('', methods=['GET'])
def get_pam_assignments():
    """Get all PAM assignments"""
    try:
        # Get all PAM users
        pams = User.query.filter_by(role='Partner Account Manager').all()
        
        assignments = []
        for pam in pams:
            # Get companies assigned to this PAM
            companies = Company.query.filter_by(id=pam.company_id).all() if pam.company_id else []
            
            assignments.append({
                'id': pam.id,
                'pam_id': pam.id,
                'pam_name': pam.username,
                'pam_email': pam.email,
                'company_id': pam.company_id,
                'companies': [{'id': c.id, 'name': c.name} for c in companies],
                'created_at': pam.created_at.isoformat() if pam.created_at else None
            })
        
        return jsonify(assignments), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_pam_assignment():
    """Assign a PAM to a company"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'pam_id' not in data or 'company_id' not in data:
            return jsonify({'error': 'pam_id and company_id are required'}), 400
        
        # Get PAM user
        pam = User.query.get(data['pam_id'])
        if not pam or pam.role != 'Partner Account Manager':
            return jsonify({'error': 'Invalid PAM user'}), 400
        
        # Update PAM's company assignment
        pam.company_id = data['company_id']
        db.session.commit()
        
        return jsonify({
            'message': 'PAM assigned successfully',
            'assignment': {
                'pam_id': pam.id,
                'pam_name': pam.username,
                'company_id': pam.company_id
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:assignment_id>', methods=['DELETE'])
def delete_pam_assignment(assignment_id):
    """Remove a PAM assignment"""
    try:
        # Get PAM user
        pam = User.query.get(assignment_id)
        if not pam:
            return jsonify({'error': 'PAM not found'}), 404
        
        # Remove company assignment
        pam.company_id = None
        db.session.commit()
        
        return jsonify({'message': 'PAM assignment removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

