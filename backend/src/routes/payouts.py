"""
Payouts management routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Deal, User, Company
from datetime import datetime

bp = Blueprint('payouts', __name__)

@bp.route('', methods=['GET'])
def get_payouts():
    """Get all payouts (calculated from won deals)"""
    try:
        # Get all won deals
        won_deals = Deal.query.filter_by(status='Won').all()
        
        payouts = []
        for deal in won_deals:
            # Get company info
            company = Company.query.get(deal.company_id)
            if not company:
                continue
                
            # Calculate payout (example: 10% commission)
            payout_amount = deal.revenue_arr * 0.10
            
            payouts.append({
                'id': deal.id,
                'deal_id': deal.id,
                'company_id': deal.company_id,
                'company_name': company.name,
                'customer_company': deal.customer_company,
                'revenue_arr': deal.revenue_arr,
                'payout_amount': payout_amount,
                'status': 'Pending',
                'created_at': deal.created_at.isoformat() if deal.created_at else None
            })
        
        return jsonify(payouts), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/calculate', methods=['POST'])
def calculate_payouts():
    """Calculate payouts for all won deals"""
    try:
        won_deals = Deal.query.filter_by(status='Won').all()
        
        total_payouts = sum(deal.revenue_arr * 0.10 for deal in won_deals)
        
        return jsonify({
            'message': 'Payouts calculated successfully',
            'total_deals': len(won_deals),
            'total_payouts': total_payouts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:payout_id>/approve', methods=['POST'])
def approve_payout(payout_id):
    """Approve a payout"""
    try:
        # In a real system, you'd update a payout record
        # For now, we'll just return success
        return jsonify({'message': 'Payout approved successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:payout_id>/reject', methods=['POST'])
def reject_payout(payout_id):
    """Reject a payout"""
    try:
        # In a real system, you'd update a payout record
        # For now, we'll just return success
        return jsonify({'message': 'Payout rejected successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/summary', methods=['GET'])
def get_payouts_summary():
    """Get payout summary grouped by company"""
    try:
        # Get all companies
        companies = Company.query.all()
        
        summary = []
        for company in companies:
            # Get open deals for this company (20% payout based on open deals)
            open_deals = Deal.query.filter_by(
                company_id=company.id,
                status='Open'
            ).all()
            
            if not open_deals:
                continue
            
            # Calculate totals
            deals_count = len(open_deals)
            total_deals_value = sum(deal.revenue_arr or 0 for deal in open_deals)
            payout_amount = total_deals_value * 0.20  # 20% of deal value
            
            # Get PAM info
            pam = User.query.get(company.pam_id) if company.pam_id else None
            pam_name = pam.username if pam else 'Unassigned'
            
            summary.append({
                'company_id': company.id,
                'company_name': company.name,
                'pam_name': pam_name,
                'deals_count': deals_count,
                'total_deals_value': total_deals_value,
                'payout_amount': payout_amount,
                'calculated_payout': payout_amount,  # Same as payout_amount
                'progress_percentage': min(100, (payout_amount / (total_deals_value or 1)) * 100)
            })
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

