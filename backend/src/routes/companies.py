"""
Companies management routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Company

bp = Blueprint('companies', __name__)

@bp.route('', methods=['GET'])
def get_companies():
    """Get all companies"""
    try:
        companies = Company.query.all()
        return jsonify([company.to_dict() for company in companies]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_company():
    """Create a new company"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'error': 'Company name is required'}), 400
        
        # Check if company already exists
        if Company.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Company with this name already exists'}), 400
        
        company = Company(
            name=data['name'],
            website=data.get('website'),
            contact_email=data.get('contact_email'),
            contact_phone=data.get('contact_phone'),
            published=data.get('published', False),
            tags=data.get('tags', ''),
            pam_id=data.get('pam_id')
        )
        
        db.session.add(company)
        db.session.commit()
        
        return jsonify({
            'message': 'Company created successfully',
            'company': company.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:company_id>', methods=['PUT'])
def update_company(company_id):
    """Update a company"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            company.name = data['name']
        if 'website' in data:
            company.website = data['website']
        if 'contact_email' in data:
            company.contact_email = data['contact_email']
        if 'contact_phone' in data:
            company.contact_phone = data['contact_phone']
        if 'published' in data:
            company.published = data['published']
        if 'tags' in data:
            company.tags = data['tags']
        if 'pam_id' in data:
            company.pam_id = data['pam_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:company_id>', methods=['DELETE'])
def delete_company(company_id):
    """Delete a company"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        db.session.delete(company)
        db.session.commit()
        
        return jsonify({'message': 'Company deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

