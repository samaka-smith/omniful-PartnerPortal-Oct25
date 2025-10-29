#!/usr/bin/env python3
"""
Test script for permission system
Verifies all permission logic works correctly
"""

import sys
sys.path.insert(0, '/home/ubuntu/portal-fix/backend')

from src.utils.permissions import *

# Mock user objects for testing
portal_admin = {
    'user_id': 1,
    'email': 'admin@test.com',
    'role': 'Portal Administrator',
    'company_id': None
}

pam_user = {
    'user_id': 2,
    'email': 'pam@test.com',
    'role': 'Partner Account Manager',
    'company_id': 1
}

spoc_admin = {
    'user_id': 3,
    'email': 'spoc@test.com',
    'role': 'Partner SPOC Admin',
    'company_id': 1
}

team_member = {
    'user_id': 4,
    'email': 'team@test.com',
    'role': 'Partner Team Member',
    'company_id': 1
}

viewer = {
    'user_id': 5,
    'email': 'viewer@test.com',
    'role': 'Viewer',
    'company_id': None
}

def test_role_checks():
    """Test role checking functions"""
    print("Testing role checks...")
    
    assert is_portal_admin(portal_admin) == True
    assert is_portal_admin(pam_user) == False
    
    assert is_pam(pam_user) == True
    assert is_pam(portal_admin) == False
    
    assert is_spoc_admin(spoc_admin) == True
    assert is_spoc_admin(team_member) == False
    
    assert is_team_member(team_member) == True
    assert is_team_member(viewer) == False
    
    assert is_viewer(viewer) == True
    assert is_viewer(portal_admin) == False
    
    print("✅ Role checks passed")

def test_company_access():
    """Test company access permissions"""
    print("Testing company access...")
    
    # Portal admin can access any company
    assert can_access_company(portal_admin, 1) == True
    assert can_access_company(portal_admin, 999) == True
    
    # PAM can only access assigned company
    assert can_access_company(pam_user, 1) == True
    assert can_access_company(pam_user, 2) == False
    
    # SPOC admin can only access their company
    assert can_access_company(spoc_admin, 1) == True
    assert can_access_company(spoc_admin, 2) == False
    
    # Team member can only access their company
    assert can_access_company(team_member, 1) == True
    assert can_access_company(team_member, 2) == False
    
    # Viewer has no company access
    assert can_access_company(viewer, 1) == False
    
    print("✅ Company access checks passed")

def test_feature_permissions():
    """Test feature-specific permissions"""
    print("Testing feature permissions...")
    
    # Add company
    assert can_add_company(portal_admin) == True
    assert can_add_company(pam_user) == True
    assert can_add_company(spoc_admin) == False
    assert can_add_company(team_member) == False
    assert can_add_company(viewer) == False
    
    # Manage users
    assert can_manage_users(portal_admin) == True
    assert can_manage_users(pam_user) == False
    assert can_manage_users(spoc_admin) == False
    
    # Add targets
    assert can_add_targets(portal_admin) == True
    assert can_add_targets(pam_user) == False
    assert can_add_targets(spoc_admin) == False
    
    # View payouts
    assert can_view_payouts(portal_admin) == True
    assert can_view_payouts(pam_user) == False
    assert can_view_payouts(spoc_admin) == True
    assert can_view_payouts(team_member) == False
    
    # View analytics
    assert can_view_analytics(portal_admin) == True
    assert can_view_analytics(pam_user) == True
    assert can_view_analytics(spoc_admin) == False
    assert can_view_analytics(team_member) == False
    assert can_view_analytics(viewer) == True
    
    # Add deals
    assert can_add_deals(portal_admin) == True
    assert can_add_deals(pam_user) == True
    assert can_add_deals(spoc_admin) == True
    assert can_add_deals(team_member) == True
    assert can_add_deals(viewer) == False
    
    print("✅ Feature permission checks passed")

def run_all_tests():
    """Run all permission tests"""
    print("\n" + "="*50)
    print("PERMISSION SYSTEM TEST SUITE")
    print("="*50 + "\n")
    
    try:
        test_role_checks()
        test_company_access()
        test_feature_permissions()
        
        print("\n" + "="*50)
        print("✅ ALL TESTS PASSED!")
        print("="*50 + "\n")
        return True
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)

