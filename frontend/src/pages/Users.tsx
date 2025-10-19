import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Key, Edit, Upload, Plus, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pams, setPams] = useState<any[]>([]);
  const [pamAssignments, setPamAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isPamAssignDialogOpen, setIsPamAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  
  const currentUser = getCurrentUser();
  const isPortalAdmin = currentUser?.role === 'Portal Administrator';
  const isPAM = currentUser?.role === 'Partner Account Manager';

  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '',
    company_id: '',
    phone_number: '',
    photo_url: '',
    status: '',
  });

  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    role: '',
    company_id: '',
    password: '',
  });

  const [selectedPamCompanies, setSelectedPamCompanies] = useState<number[]>([]);

  useEffect(() => {
    loadUsers();
    loadCompanies();
    loadPamAssignments();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiRequest<any[]>('/users');
      setUsers(response);
      setPams(response.filter(u => u.role === 'Partner Account Manager'));
    } catch (error: any) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await apiRequest<any[]>('/companies');
      setCompanies(response);
    } catch (error: any) {
      console.error('Failed to load companies');
    }
  };

  const loadPamAssignments = async () => {
    try {
      const response = await apiRequest<any[]>('/users/pam-assignments');
      setPamAssignments(response);
    } catch (error: any) {
      console.error('Failed to load PAM assignments');
    }
  };

  const handlePasswordChange = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/auth/change-password/${selectedUser.id}`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      toast.success('Password changed successfully');
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to delete user');
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || '',
      company_id: user.company_id?.toString() || '',
      phone_number: user.phone_number || '',
      photo_url: user.photo_url || '',
      status: user.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.phone_number || editFormData.phone_number.trim() === '') {
      toast.error('Phone number is required');
      return;
    }

    try {
      await apiRequest(`/users/${selectedUser.id}/edit`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editFormData,
          company_id: editFormData.company_id ? parseInt(editFormData.company_id) : null,
        }),
      });
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to update user');
    }
  };

  const handlePhotoClick = (user: any) => {
    setSelectedUser(user);
    setPhotoUrl(user.photo_url || '');
    setIsPhotoDialogOpen(true);
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/users/${selectedUser.id}/photo`, {
        method: 'POST',
        body: JSON.stringify({ photo_url: photoUrl }),
      });
      toast.success('Photo uploaded successfully');
      setIsPhotoDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to upload photo');
    }
  };

  const handlePamAssignClick = (pam: any) => {
    setSelectedUser(pam);
    const assignment = pamAssignments.find(a => a.pam_id === pam.id);
    const companyIds = assignment ? assignment.assigned_companies.map((c: any) => c.id) : [];
    setSelectedPamCompanies(companyIds);
    setIsPamAssignDialogOpen(true);
  };

  const handlePamAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/users/${selectedUser.id}/companies`, {
        method: 'POST',
        body: JSON.stringify({ company_ids: selectedPamCompanies }),
      });
      toast.success('PAM assignments updated successfully');
      setIsPamAssignDialogOpen(false);
      loadPamAssignments();
    } catch (error: any) {
      toast.error('Failed to update PAM assignments');
    }
  };

  const toggleCompanySelection = (companyId: number) => {
    setSelectedPamCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        username: addFormData.username,
        email: addFormData.email,
        role: addFormData.role,
        password: addFormData.password || 'TempPass123!',
      };

      // Add company_id if specified
      if (addFormData.company_id) {
        payload.company_id = parseInt(addFormData.company_id);
      }

      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('User created successfully. Default password: TempPass123!');
      setIsAddDialogOpen(false);
      resetAddForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      username: '',
      email: '',
      role: '',
      company_id: '',
      password: '',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage portal users and permissions</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="pam-assignments">PAM Assignments ({pams.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Photo</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.photo_url ? (
                              <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-500 text-sm">{user.username?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{user.username}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-sm">
                          {user.phone_number || <span className="text-red-500">Not set</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'Portal Administrator' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Partner Account Manager' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'Partner SPOC Admin' ? 'bg-green-100 text-green-800' :
                            user.role === 'Revenue Reviewer' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.company_name || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePhotoClick(user)}
                              title="Upload Photo"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            
                            {isPortalAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(user)}
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {(isPortalAdmin || (isPAM && user.role !== 'Portal Administrator')) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePasswordChange(user)}
                                title="Change Password"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {isPortalAdmin && user.id !== currentUser?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(user.id)}
                                title="Delete User"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pam-assignments">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Partner Account Manager Assignments</h2>
                <p className="text-gray-600">Assign companies to PAMs for management</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">PAM Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Assigned Companies</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pamAssignments.map((assignment) => (
                        <tr key={assignment.pam_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{assignment.pam_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{assignment.pam_email}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {assignment.assigned_companies.length === 0 ? (
                                <span className="text-gray-500 text-sm">No companies assigned</span>
                              ) : (
                                assignment.assigned_companies.map((company: any) => (
                                  <span key={company.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {company.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isPortalAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const pam = pams.find(p => p.id === assignment.pam_id);
                                  if (pam) handlePamAssignClick(pam);
                                }}
                              >
                                <UsersIcon className="w-4 h-4 mr-1" />
                                Manage
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetAddForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add_username">Username *</Label>
                <Input
                  id="add_username"
                  value={addFormData.username}
                  onChange={(e) => setAddFormData({...addFormData, username: e.target.value})}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_email">Email *</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add_role">Role *</Label>
                <select
                  id="add_role"
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({...addFormData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Portal Administrator">Portal Administrator</option>
                  <option value="Partner Account Manager">Partner Account Manager</option>
                  <option value="Partner SPOC Admin">Partner SPOC Admin</option>
                  <option value="Partner Team Member">Partner Team Member</option>
                  <option value="View only users">View Only User</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_company">Company</Label>
                <select
                  id="add_company"
                  value={addFormData.company_id}
                  onChange={(e) => setAddFormData({...addFormData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Company (Optional)</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id.toString()}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add_password">Password</Label>
              <Input
                id="add_password"
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
                placeholder="Leave blank for default: TempPass123!"
              />
              <p className="text-sm text-gray-500">Default password: TempPass123! (User will be required to change on first login)</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password for {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User - {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username *</Label>
                <Input
                  id="edit_username"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone Number *</Label>
                <Input
                  id="edit_phone"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_company">Company *</Label>
                <select
                  id="edit_company"
                  value={editFormData.company_id}
                  onChange={(e) => setEditFormData({...editFormData, company_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id.toString()}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo for {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePhotoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo URL *</Label>
              <Input
                id="photo_url"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload Photo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
