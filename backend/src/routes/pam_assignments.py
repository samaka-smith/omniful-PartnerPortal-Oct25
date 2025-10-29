"""
PAM (Partner Account Manager) assignments routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, User, Company

bp = Blueprint('pam_assignments', __name__)

@bp.route('', methods=['GET'])
def get_pam_assignments():
    """Get all PAM users and their company assignments"""
    try:
        # Get all PAM users
        pams = User.query.filter_by(role='Partner Account Manager').all()
        
        # Get all companies for reference
        all_companies = Company.query.all()
        companies_dict = {c.id: c.name for c in all_companies}
        
        assignments = []
        for pam in pams:
            assignment = {
                'id': pam.id,
                'pam_id': pam.id,
                'pam_name': pam.username,
                'pam_email': pam.email,
                'company_id': pam.company_id,
                'company_name': companies_dict.get(pam.company_id) if pam.company_id else None,
                'created_at': pam.created_at.isoformat() if pam.created_at else None
            }
            assignments.append(assignment)
        
        return jsonify({
            'assignments': assignments,
            'pams': [{'id': p.id, 'name': p.username, 'email': p.email} for p in pams],
            'companies': [{'id': c.id, 'name': c.name} for c in all_companies]
        }), 200
        
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
        
        # Verify company exists
        company = Company.query.get(data['company_id'])
        if not company:
            return jsonify({'error': 'Invalid company'}), 400
        
        # Update PAM's company assignment
        pam.company_id = data['company_id']
        db.session.commit()
        
        return jsonify({
            'message': 'PAM assigned successfully',
            'assignment': {
                'pam_id': pam.id,
                'pam_name': pam.username,
                'company_id': pam.company_id,
                'company_name': company.name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:pam_id>', methods=['DELETE'])
def delete_pam_assignment(pam_id):
    """Remove a PAM's company assignment"""
    try:
        # Get PAM user
        pam = User.query.get(pam_id)
        if not pam:
            return jsonify({'error': 'PAM not found'}), 404
        
        # Remove company assignment
        pam.company_id = None
        db.session.commit()
        
        return jsonify({'message': 'PAM assignment removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:pam_id>', methods=['PUT'])
def update_pam_assignment(pam_id):
    """Update a PAM's company assignment"""
    try:
        data = request.get_json()
        
        # Get PAM user
        pam = User.query.get(pam_id)
        if not pam or pam.role != 'Partner Account Manager':
            return jsonify({'error': 'Invalid PAM user'}), 404
        
        # Verify company exists
        if 'company_id' in data:
            if data['company_id']:
                company = Company.query.get(data['company_id'])
                if not company:
                    return jsonify({'error': 'Invalid company'}), 400
            pam.company_id = data['company_id']
        
        db.session.commit()
        
        company_name = None
        if pam.company_id:
            company = Company.query.get(pam.company_id)
            company_name = company.name if company else None
        
        return jsonify({
            'message': 'PAM assignment updated successfully',
            'assignment': {
                'pam_id': pam.id,
                'pam_name': pam.username,
                'company_id': pam.company_id,
                'company_name': company_name
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

