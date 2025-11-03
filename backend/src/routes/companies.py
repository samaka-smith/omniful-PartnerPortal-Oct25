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
        
        # Handle tags - convert array to comma-separated string
        tags_str = ''
        if 'tags' in data:
            if isinstance(data['tags'], list):
                tags_str = ','.join(data['tags'])
            else:
                tags_str = data['tags']
        
        company = Company(
            name=data['name'],
            company_type=data.get('company_type', 'Partner'),
            website=data.get('website'),
            contact_email=data.get('contact_email') or data.get('email'),  # Support both field names
            contact_phone=data.get('contact_phone') or data.get('phone_number'),  # Support both field names
            logo_url=data.get('logo_url'),
            spoc_name=data.get('spoc_name'),
            spoc_email=data.get('spoc_email'),
            spoc_phone=data.get('spoc_phone'),
            country=data.get('country'),
            serving_regions=data.get('serving_regions'),
            partner_stage=data.get('partner_stage', 'Registered'),
            published=data.get('published') or data.get('published_on_website', False),  # Support both field names
            tags=tags_str,
            pam_id=data.get('pam_id') or data.get('assigned_pam_id')  # Support both field names
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
        if 'company_type' in data:
            company.company_type = data['company_type']
        if 'website' in data:
            company.website = data['website']
        if 'contact_email' in data or 'email' in data:
            company.contact_email = data.get('contact_email') or data.get('email')
        if 'contact_phone' in data or 'phone_number' in data:
            company.contact_phone = data.get('contact_phone') or data.get('phone_number')
        if 'logo_url' in data:
            company.logo_url = data['logo_url']
        if 'spoc_name' in data:
            company.spoc_name = data['spoc_name']
        if 'spoc_email' in data:
            company.spoc_email = data['spoc_email']
        if 'spoc_phone' in data:
            company.spoc_phone = data['spoc_phone']
        if 'country' in data:
            company.country = data['country']
        if 'serving_regions' in data:
            company.serving_regions = data['serving_regions']
        if 'partner_stage' in data:
            company.partner_stage = data['partner_stage']
        if 'published' in data or 'published_on_website' in data:
            company.published = data.get('published') or data.get('published_on_website', False)
        if 'tags' in data:
            # Handle tags - convert array to comma-separated string
            if isinstance(data['tags'], list):
                company.tags = ','.join(data['tags'])
            else:
                company.tags = data['tags']
        if 'pam_id' in data or 'assigned_pam_id' in data:
            company.pam_id = data.get('pam_id') or data.get('assigned_pam_id')
        
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

