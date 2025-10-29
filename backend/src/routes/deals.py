"""
Deals management routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Deal

bp = Blueprint('deals', __name__)

@bp.route('', methods=['GET'])
def get_deals():
    """Get all deals"""
    try:
        deals = Deal.query.all()
        return jsonify([deal.to_dict() for deal in deals]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_deal():
    """Create a new deal"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['company_id', 'customer_company', 'customer_spoc', 
                          'customer_spoc_email', 'revenue_arr']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        deal = Deal(
            company_id=data['company_id'],
            customer_company=data['customer_company'],
            customer_company_url=data.get('customer_company_url'),
            customer_spoc=data['customer_spoc'],
            customer_spoc_email=data['customer_spoc_email'],
            customer_spoc_phone=data.get('customer_spoc_phone'),
            revenue_arr=data['revenue_arr'],
            status=data.get('status', 'Open'),
            comments=data.get('comments')
        )
        
        db.session.add(deal)
        db.session.commit()
        
        return jsonify({
            'message': 'Deal created successfully',
            'deal': deal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:deal_id>', methods=['PUT'])
def update_deal(deal_id):
    """Update a deal"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'error': 'Deal not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field in ['customer_company', 'customer_company_url', 'customer_spoc',
                     'customer_spoc_email', 'customer_spoc_phone', 'revenue_arr',
                     'status', 'comments']:
            if field in data:
                setattr(deal, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Deal updated successfully',
            'deal': deal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:deal_id>', methods=['DELETE'])
def delete_deal(deal_id):
    """Delete a deal"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'error': 'Deal not found'}), 404
        
        db.session.delete(deal)
        db.session.commit()
        
        return jsonify({'message': 'Deal deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/archived', methods=['GET'])
def get_archived_deals():
    """Get archived deals"""
    try:
        deals = Deal.query.filter(Deal.status.in_(['Won', 'Lost'])).all()
        return jsonify([deal.to_dict() for deal in deals]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

