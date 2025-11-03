# Omniful Partner Portal - TODO List

## Payouts Section
- [x] Fix Payouts section functionality (added /summary endpoint)

## User Permissions & Access Control

### PAM (Partner Account Manager)
- [ ] Allow PAM to be assigned to multiple companies
- [ ] PAM can only view data from companies assigned to them
- [ ] PAM can access Analytics section (only their companies' data)
- [ ] PAM can access Companies section (view/edit assigned companies)
- [ ] PAM can access Targets section (view their target + assigned companies' targets)
- [ ] PAM cannot access Users section

### Partner SPOC Admin
- [ ] Assign Partner SPOC Admin to exactly 1 company
- [ ] Partner SPOC Admin can only view data from their assigned company
- [ ] Partner SPOC Admin can access Analytics section (only their company's data)
- [ ] Partner SPOC Admin can access Targets section (only their company's targets)
- [ ] Partner SPOC Admin cannot access Users section
- [ ] Partner SPOC Admin cannot access Companies section

### Partner Team Member
- [ ] Assign Partner Team Member to exactly 1 company
- [ ] Partner Team Member can only add/edit deals for their assigned company
- [ ] Partner Team Member cannot view other companies' data or numbers
- [ ] Partner Team Member cannot access Users section
- [ ] Partner Team Member cannot access Analytics section
- [ ] Partner Team Member cannot access Targets section
- [ ] Partner Team Member cannot access Companies section

### Portal Administrator
- [ ] Portal Administrator has full access to all sections
- [ ] Only Portal Administrator can access Users section
- [ ] Only Portal Administrator can assign companies to PAMs
- [ ] Portal Administrator can see all data in Analytics with detailed graphs
- [ ] Portal Administrator can create targets for any entity

## Targets Section
- [ ] Add "Create New Target" button (visible only to Portal Admin)
- [ ] Hide Targets section from users except Portal Admin, PAM, Partner SPOC Admin
- [ ] PAM can see their target + targets of assigned companies
- [ ] Partner SPOC Admin can see only their company's targets

## Companies Section

### Access Control
- [ ] Only Portal Admin and PAM can access Companies section (frontend pending)
- [ ] Only Portal Admin and PAM can create/edit companies (frontend pending)
- [ ] Only Portal Admin can assign companies to PAMs (frontend pending)

### Validation & Duplicate Prevention
- [x] Prevent duplicate company names
- [x] Prevent duplicate SPOC emails
- [x] Prevent duplicate company emails
- [x] Prevent duplicate company websites
- [x] Show error message when duplicate detected

### Form Fixes
- [x] Fix Published on Website checkbox (now works correctly)
- [x] Fix Company Type dropdown (now locks selection)
- [x] Fix Partner Stage dropdown (now locks selection)
- [x] Make all fields required when creating new company

### Logo Update
- [x] Update company logo next to name when Logo URL is provided
- [x] Display logo in company list
- [x] Display logo in company details

## Dashboard Section

### Portal Administrator Dashboard
- [ ] Show detailed graphs with open/won/in-progress/lost deals
- [ ] Show graph comparing targets vs actual revenue (in-progress + won deals)
- [ ] Add on-click elaboration of numbers (drill-down feature)
- [ ] Show all companies' data

### PAM Dashboard
- [ ] Show only data from PAM's assigned companies
- [ ] Show graphs comparing numbers across assigned companies
- [ ] Show PAM's target vs actual performance
- [ ] No drill-down feature

### Partner SPOC Admin Dashboard
- [ ] Show only their company's data
- [ ] Compare their company to average of other companies (without names)
- [ ] Show their company's target vs actual performance
- [ ] No drill-down feature

### Partner Team Member Dashboard
- [ ] Show only their company's basic metrics
- [ ] No comparison graphs
- [ ] No drill-down feature

## Backend Changes Needed
- [ ] Update User model to support multiple company assignments for PAM
- [ ] Create PAM-Company assignment table (many-to-many relationship)
- [ ] Add role-based API endpoint filters
- [ ] Add duplicate validation in Companies API
- [ ] Update Deals API to filter by user's assigned companies
- [ ] Update Analytics API to filter by user's assigned companies
- [ ] Update Targets API to filter by user's assigned companies

## Frontend Changes Needed
- [ ] Implement role-based component visibility
- [ ] Update navigation to hide sections based on role
- [ ] Add PAM multi-company assignment UI
- [ ] Fix Companies form dropdowns and checkbox
- [ ] Add duplicate validation feedback
- [ ] Create role-specific Dashboard components
- [ ] Add interactive graphs for Portal Admin
- [ ] Update Targets section with Create button (role-based)

## Testing Checklist
- [ ] Test Portal Admin - full access to all sections
- [ ] Test PAM - multi-company assignment and filtered data
- [ ] Test Partner SPOC Admin - single company access
- [ ] Test Partner Team Member - limited deal access
- [ ] Test duplicate validation in Companies
- [ ] Test Published checkbox in Companies
- [ ] Test Company Type and Partner Stage dropdowns
- [ ] Test logo update functionality
- [ ] Test Payouts section
- [ ] Test all Dashboard views for each role
- [ ] Test Targets section visibility and Create button
