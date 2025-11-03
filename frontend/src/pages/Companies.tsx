import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { companiesAPI, usersAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [pams, setPams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company_type: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    spoc_name: '',
    spoc_email: '',
    spoc_phone: '',
    country: '',
    serving_regions: '',
    partner_stage: '',
    published_on_website: false,
    tags: '',
    assigned_pam_id: '',
  });

  useEffect(() => {
    loadCompanies();
    loadPAMs();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (error: any) {
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPAMs = async () => {
    try {
      const users = await usersAPI.getAll();
      setPams(users.filter(u => u.role === 'Partner Account Manager'));
    } catch (error) {
      console.error('Failed to load PAMs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        assigned_pam_id: formData.assigned_pam_id ? parseInt(formData.assigned_pam_id) : null,
      };

      if (editingCompany) {
        await companiesAPI.update(editingCompany.id, payload);
        toast.success('Company updated successfully');
      } else {
        await companiesAPI.create(payload);
        toast.success('Company created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company');
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      company_type: company.company_type || '',
      website: company.website || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || '',
      logo_url: company.logo_url || '',
      spoc_name: company.spoc_name || '',
      spoc_email: company.spoc_email || '',
      spoc_phone: company.spoc_phone || '',
      country: company.country || '',
      serving_regions: company.serving_regions || '',
      partner_stage: company.partner_stage || '',
      published_on_website: company.published_on_website || false,
      tags: Array.isArray(company.tags) ? company.tags.join(', ') : (company.tags || ''),
      assigned_pam_id: company.assigned_pam_id?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      await companiesAPI.delete(id);
      toast.success('Company deleted successfully');
      loadCompanies();
    } catch (error: any) {
      toast.error('Failed to delete company');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_type: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      logo_url: '',
      spoc_name: '',
      spoc_email: '',
      spoc_phone: '',
      country: '',
      serving_regions: '',
      partner_stage: '',
      published_on_website: false,
      tags: '',
      assigned_pam_id: '',
    });
    setEditingCompany(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Company Management</h1>
            <p className="text-gray-600">Manage partner companies and their information</p>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {company.logo_url && (
                        <img src={company.logo_url} alt={company.name} className="w-12 h-12 object-contain rounded" />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          company.published_on_website ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.published_on_website ? 'PUBLISHED' : 'UNPUBLISHED'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div><strong>Type:</strong> {company.company_type}</div>
                      <div><strong>Stage:</strong> {company.partner_stage}</div>
                      <div><strong>Email:</strong> {company.contact_email}</div>
                      <div><strong>Phone:</strong> {company.contact_phone}</div>
                      <div><strong>SPOC:</strong> {company.spoc_name}</div>
                      <div><strong>Country:</strong> {company.country}</div>
                      <div className="col-span-2"><strong>PAM:</strong> {company.pam_name || 'Unassigned'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(company)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(company.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompany ? 'Edit Company' : 'Create New Company'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select
                    value={formData.company_type}
                    onValueChange={(value) => setFormData({...formData, company_type: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Partner">Partner</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="spoc_name">SPOC Name *</Label>
                  <Input
                    id="spoc_name"
                    value={formData.spoc_name}
                    onChange={(e) => setFormData({...formData, spoc_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="spoc_email">SPOC Email *</Label>
                  <Input
                    id="spoc_email"
                    type="email"
                    value={formData.spoc_email}
                    onChange={(e) => setFormData({...formData, spoc_email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="spoc_phone">SPOC Phone</Label>
                  <Input
                    id="spoc_phone"
                    value={formData.spoc_phone}
                    onChange={(e) => setFormData({...formData, spoc_phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="serving_regions">Serving Regions *</Label>
                  <Input
                    id="serving_regions"
                    value={formData.serving_regions}
                    onChange={(e) => setFormData({...formData, serving_regions: e.target.value})}
                    placeholder="e.g., MENA, Europe"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="partner_stage">Partner Stage *</Label>
                <Select
                  value={formData.partner_stage}
                  onValueChange={(value) => setFormData({...formData, partner_stage: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Implementing">Implementing</SelectItem>
                    <SelectItem value="Reseller">Reseller</SelectItem>
                    <SelectItem value="Strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_pam_id">Assigned PAM</Label>
                <Select
                  value={formData.assigned_pam_id}
                  onValueChange={(value) => setFormData({...formData, assigned_pam_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PAM" />
                  </SelectTrigger>
                  <SelectContent>
                    {pams.map((pam) => (
                      <SelectItem key={pam.id} value={pam.id.toString()}>
                        {pam.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="Active, Aligned, Premium"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published_on_website"
                  checked={formData.published_on_website}
                  onCheckedChange={(checked) => setFormData({...formData, published_on_website: checked as boolean})}
                />
                <Label htmlFor="published_on_website" className="cursor-pointer">
                  Published on Website
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Update Company' : 'Create Company'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
