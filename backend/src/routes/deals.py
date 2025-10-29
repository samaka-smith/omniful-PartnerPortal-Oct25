"""
Deals management routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Deal, Company, DealNote, User

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
                     'revenue_actual', 'status', 'comments', 'proof_of_engagement', 'proof_of_sale']:
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

@bp.route('/<int:deal_id>/notes', methods=['GET'])
def get_deal_notes(deal_id):
    """Get notes for a deal"""
    try:
        notes = DealNote.query.filter_by(deal_id=deal_id).order_by(DealNote.created_at.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:deal_id>/notes', methods=['POST'])
def add_deal_note(deal_id):
    """Add a note to a deal"""
    try:
        # Verify deal exists
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'error': 'Deal not found'}), 404
        
        data = request.get_json()
        
        # Get user_id from token (for now, use a default)
        # TODO: Extract from JWT token
        user_id = data.get('user_id', 1)  # Default to admin for now
        
        note = DealNote(
            deal_id=deal_id,
            user_id=user_id,
            note_text=data.get('note_text', ''),
            note_type=data.get('note_type', 'general')
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'message': 'Note added successfully',
            'note': note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

