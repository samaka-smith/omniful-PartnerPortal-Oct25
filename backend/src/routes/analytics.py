"""
Analytics routes
"""
from flask import Blueprint, request, jsonify
from src.models.database import db, Deal, Company, User
from sqlalchemy import func

bp = Blueprint('analytics', __name__)

@bp.route('/partner-performance', methods=['GET'])
def get_partner_performance():
    """Get performance metrics for all partners"""
    try:
        # Get all companies
        companies = Company.query.all()
        
        performance_data = []
        
        for company in companies:
            # Count total deals
            total_deals = Deal.query.filter_by(company_id=company.id).count()
            
            # Count won deals
            won_deals = Deal.query.filter_by(company_id=company.id, status='Won').count()
            
            # Calculate total revenue from won deals
            won_deals_list = Deal.query.filter_by(company_id=company.id, status='Won').all()
            total_revenue = sum([deal.revenue_actual or deal.revenue_arr for deal in won_deals_list])
            
            # Get PAM name if assigned
            pam_name = None
            if company.pam_id:
                pam = User.query.get(company.pam_id)
                pam_name = pam.username if pam else None
            
            performance_data.append({
                'company_id': company.id,
                'company_name': company.name,
                'pam_name': pam_name,
                'total_deals': total_deals,
                'won_deals': won_deals,
                'total_revenue': total_revenue,
                'tags': company.tags.split(',') if company.tags else []
            })
        
        return jsonify(performance_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Get overall dashboard statistics"""
    try:
        # Total companies
        total_companies = Company.query.count()
        
        # Total deals
        total_deals = Deal.query.count()
        
        # Won deals
        won_deals = Deal.query.filter_by(status='Won').count()
        
        # Total revenue from won deals
        won_deals_list = Deal.query.filter_by(status='Won').all()
        total_revenue = sum([deal.revenue_actual or deal.revenue_arr for deal in won_deals_list])
        
        # Active deals (Open + In Progress)
        active_deals = Deal.query.filter(Deal.status.in_(['Open', 'In Progress'])).count()
        
        return jsonify({
            'total_companies': total_companies,
            'total_deals': total_deals,
            'won_deals': won_deals,
            'active_deals': active_deals,
            'total_revenue': total_revenue
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

