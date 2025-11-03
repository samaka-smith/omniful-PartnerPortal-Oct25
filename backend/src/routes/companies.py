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
        
        # Validate required fields
        required_fields = ['name', 'company_type', 'contact_email', 'spoc_name', 'spoc_email', 
                          'country', 'serving_regions', 'partner_stage']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Required fields missing: {", ".join(missing_fields)}'}), 400
        
        # Check for duplicates
        if Company.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Company with this name already exists'}), 400
        
        if data.get('spoc_email') and Company.query.filter_by(spoc_email=data['spoc_email']).first():
            return jsonify({'error': 'A company with this SPOC email already exists'}), 400
        
        if data.get('contact_email') and Company.query.filter_by(contact_email=data['contact_email']).first():
            return jsonify({'error': 'A company with this email already exists'}), 400
        
        if data.get('website') and Company.query.filter_by(website=data['website']).first():
            return jsonify({'error': 'A company with this website already exists'}), 400
        
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
            pam_id=data.get('pam_id') or data.get('assigned_pam_id'),  # Support both field names
            payout_percentage=float(data.get('payout_percentage', 0.0))
        )
        
        db.session.add(company)
        db.session.commit()
        
        # Sync PAM assignment if PAM is assigned
        if company.pam_id:
            from src.models.database import PAMCompanyAssignment
            # Check if assignment already exists
            existing = PAMCompanyAssignment.query.filter_by(
                pam_id=company.pam_id,
                company_id=company.id
            ).first()
            if not existing:
                assignment = PAMCompanyAssignment(
                    pam_id=company.pam_id,
                    company_id=company.id
                )
                db.session.add(assignment)
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
        
        # Check for duplicates when updating
        if 'name' in data and data['name'] != company.name:
            if Company.query.filter_by(name=data['name']).first():
                return jsonify({'error': 'Company with this name already exists'}), 400
            company.name = data['name']
        
        if 'spoc_email' in data and data['spoc_email'] != company.spoc_email:
            if Company.query.filter_by(spoc_email=data['spoc_email']).first():
                return jsonify({'error': 'A company with this SPOC email already exists'}), 400
            company.spoc_email = data['spoc_email']
        
        if 'contact_email' in data and data['contact_email'] != company.contact_email:
            existing = Company.query.filter_by(contact_email=data['contact_email']).first()
            if existing:
                return jsonify({'error': 'A company with this email already exists'}), 400
            company.contact_email = data['contact_email']
        
        if 'website' in data and data['website'] != company.website:
            if Company.query.filter_by(website=data['website']).first():
                return jsonify({'error': 'A company with this website already exists'}), 400
            company.website = data['website']
        if 'company_type' in data:
            company.company_type = data['company_type']
        if 'contact_phone' in data or 'phone_number' in data:
            company.contact_phone = data.get('contact_phone') or data.get('phone_number')
        if 'logo_url' in data:
            company.logo_url = data['logo_url']
        if 'spoc_name' in data:
            company.spoc_name = data['spoc_name']
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
            old_pam_id = company.pam_id
            new_pam_id = data.get('pam_id') or data.get('assigned_pam_id')
            company.pam_id = new_pam_id
            
            # Sync PAM assignment
            if new_pam_id != old_pam_id:
                from src.models.database import PAMCompanyAssignment
                # Remove old assignment if exists
                if old_pam_id:
                    PAMCompanyAssignment.query.filter_by(
                        pam_id=old_pam_id,
                        company_id=company.id
                    ).delete()
                # Add new assignment if PAM is assigned
                if new_pam_id:
                    existing = PAMCompanyAssignment.query.filter_by(
                        pam_id=new_pam_id,
                        company_id=company.id
                    ).first()
                    if not existing:
                        assignment = PAMCompanyAssignment(
                            pam_id=new_pam_id,
                            company_id=company.id
                        )
                        db.session.add(assignment)
        if 'payout_percentage' in data:
            company.payout_percentage = float(data['payout_percentage'])
        
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

