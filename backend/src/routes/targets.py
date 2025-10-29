"""
Targets management routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Target

bp = Blueprint('targets', __name__)

@bp.route('', methods=['GET'])
def get_targets():
    """Get all targets"""
    try:
        targets = Target.query.all()
        return jsonify([target.to_dict() for target in targets]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_target():
    """Create a new target"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['target_type', 'target_entity_id', 'target_metric', 
                          'target_value', 'target_period']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate target type
        valid_types = ['PAM', 'Company', 'SPOC']
        if data['target_type'] not in valid_types:
            return jsonify({'error': f'Invalid target type. Valid types: {", ".join(valid_types)}'}), 400
        
        # Validate target metric
        valid_metrics = ['deals_count', 'revenue', 'won_deals']
        if data['target_metric'] not in valid_metrics:
            return jsonify({'error': f'Invalid target metric. Valid metrics: {", ".join(valid_metrics)}'}), 400
        
        # Validate target period
        valid_periods = ['monthly', 'quarterly', 'yearly']
        if data['target_period'] not in valid_periods:
            return jsonify({'error': f'Invalid target period. Valid periods: {", ".join(valid_periods)}'}), 400
        
        target = Target(
            target_type=data['target_type'],
            target_entity_id=data['target_entity_id'],
            target_metric=data['target_metric'],
            target_value=data['target_value'],
            target_period=data['target_period'],
            description=data.get('description', '')
        )
        
        db.session.add(target)
        db.session.commit()
        
        return jsonify({
            'message': 'Target created successfully',
            'target': target.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:target_id>', methods=['PUT'])
def update_target(target_id):
    """Update a target"""
    try:
        target = Target.query.get(target_id)
        if not target:
            return jsonify({'error': 'Target not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field in ['target_value', 'description']:
            if field in data:
                setattr(target, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Target updated successfully',
            'target': target.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:target_id>', methods=['DELETE'])
def delete_target(target_id):
    """Delete a target"""
    try:
        target = Target.query.get(target_id)
        if not target:
            return jsonify({'error': 'Target not found'}), 404
        
        db.session.delete(target)
        db.session.commit()
        
        return jsonify({'message': 'Target deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

