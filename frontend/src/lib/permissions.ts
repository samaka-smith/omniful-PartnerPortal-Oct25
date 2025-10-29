/**
 * Frontend Permission Utilities
 * Role-based access control for UI elements
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  company_id?: number | null;
}

// Role constants
export const ROLES = {
  PORTAL_ADMIN: 'Portal Administrator',
  PAM: 'Partner Account Manager',
  SPOC_ADMIN: 'Partner SPOC Admin',
  TEAM_MEMBER: 'Partner Team Member',
  VIEWER: 'Viewer',
};

// Permission check functions
export const isPortalAdmin = (user: User | null): boolean => {
  return user?.role === ROLES.PORTAL_ADMIN;
};

export const isPAM = (user: User | null): boolean => {
  return user?.role === ROLES.PAM;
};

export const isSPOCAdmin = (user: User | null): boolean => {
  return user?.role === ROLES.SPOC_ADMIN;
};

export const isTeamMember = (user: User | null): boolean => {
  return user?.role === ROLES.TEAM_MEMBER;
};

export const isViewer = (user: User | null): boolean => {
  return user?.role === ROLES.VIEWER;
};

// Feature access permissions
export const canViewAnalytics = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user) || isViewer(user);
};

export const canViewDashboardNumbers = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

export const canAddCompany = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user);
};

export const canManageUsers = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

export const canAddTargets = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

export const canViewPayouts = (user: User | null): boolean => {
  return isPortalAdmin(user) || isSPOCAdmin(user);
};

export const canAddDeals = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user) || isSPOCAdmin(user) || isTeamMember(user);
};

export const canEditDeals = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user) || isSPOCAdmin(user);
};

export const canViewCompanies = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user) || isSPOCAdmin(user);
};

export const canEditCompany = (user: User | null, companyId: number): boolean => {
  if (isPortalAdmin(user)) return true;
  if (isPAM(user) && user.company_id === companyId) return true;
  if (isSPOCAdmin(user) && user.company_id === companyId) return true;
  return false;
};

export const canAccessCompany = (user: User | null, companyId: number): boolean => {
  if (isPortalAdmin(user)) return true;
  if ((isPAM(user) || isSPOCAdmin(user) || isTeamMember(user)) && user.company_id === companyId) {
    return true;
  }
  return false;
};

export const canViewPAMAssignments = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

export const canManagePAMAssignments = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

// Navigation permissions
export const canAccessDashboard = (user: User | null): boolean => {
  return !!user; // All logged-in users can access dashboard
};

export const canAccessAnalytics = (user: User | null): boolean => {
  return canViewAnalytics(user);
};

export const canAccessCompaniesPage = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user);
};

export const canAccessDealsPage = (user: User | null): boolean => {
  return !!user; // All users can view deals (filtered by permissions)
};

export const canAccessTargetsPage = (user: User | null): boolean => {
  return isPortalAdmin(user) || isPAM(user);
};

export const canAccessUsersPage = (user: User | null): boolean => {
  return isPortalAdmin(user);
};

export const canAccessPayoutsPage = (user: User | null): boolean => {
  return canViewPayouts(user);
};

export const canAccessPAMAssignmentsPage = (user: User | null): boolean => {
  return canViewPAMAssignments(user);
};

// Filter data based on user permissions
export const filterCompaniesByAccess = (companies: any[], user: User | null): any[] => {
  if (isPortalAdmin(user)) return companies;
  if (!user || !user.company_id) return [];
  return companies.filter(c => c.id === user.company_id);
};

export const filterDealsByAccess = (deals: any[], user: User | null): any[] => {
  if (isPortalAdmin(user)) return deals;
  if (!user || !user.company_id) return [];
  return deals.filter(d => d.company_id === user.company_id);
};

export const filterTargetsByAccess = (targets: any[], user: User | null): any[] => {
  if (isPortalAdmin(user)) return targets;
  if (isPAM(user) && user.company_id) {
    return targets.filter(t => t.target_type === 'Company' && t.target_entity_id === user.company_id);
  }
  return [];
};

export const filterPayoutsByAccess = (payouts: any[], user: User | null): any[] => {
  if (isPortalAdmin(user)) return payouts;
  if (isSPOCAdmin(user) && user.company_id) {
    return payouts.filter(p => p.company_id === user.company_id);
  }
  return [];
};

