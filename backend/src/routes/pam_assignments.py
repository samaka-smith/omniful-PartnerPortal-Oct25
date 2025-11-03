"""
PAM (Partner Account Manager) assignments routes - Multi-company support
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, User, Company, pam_company_assignments

bp = Blueprint('pam_assignments', __name__)

@bp.route('', methods=['GET'])
def get_pam_assignments():
    """Get all PAM users and their company assignments"""
    try:
        # Get all PAM users
        pams = User.query.filter_by(role='Partner Account Manager').all()
        
        # Get all companies for reference
        all_companies = Company.query.all()
        
        assignments = []
        for pam in pams:
            # Get assigned companies for this PAM
            assigned_companies = pam.assigned_companies
            assigned_company_ids = [c.id for c in assigned_companies]
            assigned_company_names = [c.name for c in assigned_companies]
            
            assignment = {
                'id': pam.id,
                'pam_id': pam.id,
                'pam_name': pam.username,
                'pam_email': pam.email,
                'assigned_company_ids': assigned_company_ids,
                'assigned_company_names': assigned_company_names,
                'company_count': len(assigned_companies),
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
    """Assign a PAM to one or more companies"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'pam_id' not in data or 'company_ids' not in data:
            return jsonify({'error': 'pam_id and company_ids are required'}), 400
        
        # Get PAM user
        pam = User.query.get(data['pam_id'])
        if not pam or pam.role != 'Partner Account Manager':
            return jsonify({'error': 'Invalid PAM user'}), 400
        
        # Verify all companies exist
        company_ids = data['company_ids'] if isinstance(data['company_ids'], list) else [data['company_ids']]
        companies = Company.query.filter(Company.id.in_(company_ids)).all()
        
        if len(companies) != len(company_ids):
            return jsonify({'error': 'One or more invalid company IDs'}), 400
        
        # Clear existing assignments for this PAM
        pam.assigned_companies.clear()
        
        # Add new assignments
        for company in companies:
            if company not in pam.assigned_companies:
                pam.assigned_companies.append(company)
        
        db.session.commit()
        
        return jsonify({
            'message': 'PAM assigned successfully',
            'assignment': {
                'pam_id': pam.id,
                'pam_name': pam.username,
                'assigned_company_ids': [c.id for c in pam.assigned_companies],
                'assigned_company_names': [c.name for c in pam.assigned_companies]
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:pam_id>', methods=['DELETE'])
def delete_pam_assignment(pam_id):
    """Remove all company assignments for a PAM"""
    try:
        # Get PAM user
        pam = User.query.get(pam_id)
        if not pam:
            return jsonify({'error': 'PAM not found'}), 404
        
        # Remove all company assignments
        pam.assigned_companies.clear()
        db.session.commit()
        
        return jsonify({'message': 'PAM assignments removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:pam_id>', methods=['PUT'])
def update_pam_assignment(pam_id):
    """Update a PAM's company assignments"""
    try:
        data = request.get_json()
        
        # Get PAM user
        pam = User.query.get(pam_id)
        if not pam or pam.role != 'Partner Account Manager':
            return jsonify({'error': 'Invalid PAM user'}), 404
        
        # Update company assignments if provided
        if 'company_ids' in data:
            company_ids = data['company_ids'] if isinstance(data['company_ids'], list) else [data['company_ids']]
            
            # Verify all companies exist
            companies = Company.query.filter(Company.id.in_(company_ids)).all()
            
            if len(companies) != len(company_ids):
                return jsonify({'error': 'One or more invalid company IDs'}), 400
            
            # Clear existing assignments
            pam.assigned_companies.clear()
            
            # Add new assignments
            for company in companies:
                if company not in pam.assigned_companies:
                    pam.assigned_companies.append(company)
        
        db.session.commit()
        
        return jsonify({
            'message': 'PAM assignment updated successfully',
            'assignment': {
                'pam_id': pam.id,
                'pam_name': pam.username,
                'assigned_company_ids': [c.id for c in pam.assigned_companies],
                'assigned_company_names': [c.name for c in pam.assigned_companies]
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
