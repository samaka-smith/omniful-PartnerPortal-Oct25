import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { Edit, Archive, FileText, Upload, Plus } from 'lucide-react';

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [archivedDeals, setArchivedDeals] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [dealNotes, setDealNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  
  const currentUser = getCurrentUser();

  const [editFormData, setEditFormData] = useState({
    status: '',
    customer_company_name: '',
    customer_spoc: '',
    customer_email: '',
    revenue_arr_estimation: '',
    comments: '',
  });

  const [addFormData, setAddFormData] = useState({
    partner_company_id: '',
    customer_company_name: '',
    customer_spoc: '',
    customer_company_url: '',
    customer_email: '',
    customer_spoc_email: '',
    customer_spoc_phone: '',
    revenue_arr_estimation: '',
    status: 'Open',
    comments: '',
  });

  const [noteText, setNoteText] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    loadDeals();
    loadArchivedDeals();
    loadCompanies();
  }, []);

  const loadDeals = async () => {
    try {
      const response = await apiRequest<any[]>('/deals');
      setDeals(response.filter(d => !d.archived));
    } catch (error: any) {
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchivedDeals = async () => {
    try {
      const response = await apiRequest<any[]>('/deals/archived');
      setArchivedDeals(response);
    } catch (error: any) {
      console.error('Failed to load archived deals');
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

  const loadDealNotes = async (dealId: number) => {
    try {
      const response = await apiRequest<any[]>(`/deals/${dealId}/notes`);
      setDealNotes(response);
    } catch (error: any) {
      toast.error('Failed to load notes');
    }
  };

  const handleEditClick = (deal: any) => {
    setSelectedDeal(deal);
    setEditFormData({
      status: deal.status || '',
      customer_company_name: deal.customer_company_name || '',
      customer_spoc: deal.customer_spoc || '',
      customer_email: deal.customer_spoc_email || '',
      revenue_arr_estimation: deal.revenue_arr_estimation || '',
      comments: deal.comments || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/deals/${selectedDeal.id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });

      // If status changed, add a note
      if (editFormData.status !== selectedDeal.status) {
        await apiRequest(`/deals/${selectedDeal.id}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note_text: `Status changed from ${selectedDeal.status} to ${editFormData.status}`,
            note_type: 'status_change',
            old_status: selectedDeal.status,
            new_status: editFormData.status,
          }),
        });
      }

      toast.success('Deal updated successfully');
      setIsEditDialogOpen(false);
      loadDeals();
      loadArchivedDeals();
    } catch (error: any) {
      toast.error('Failed to update deal');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        customer_company_name: addFormData.customer_company_name,
        customer_spoc: addFormData.customer_spoc,
        customer_company_url: addFormData.customer_company_url,
        customer_spoc_email: addFormData.customer_spoc_email,
        customer_spoc_phone: addFormData.customer_spoc_phone,
        revenue_arr_estimation: parseFloat(addFormData.revenue_arr_estimation) || 0,
        status: addFormData.status,
        comments: addFormData.comments,
      };

      // Add partner_company_id if user is admin or PAM
      if (currentUser?.role === 'Portal Administrator' || currentUser?.role === 'Partner Account Manager') {
        if (!addFormData.partner_company_id) {
          toast.error('Please select a partner company');
          return;
        }
        payload.partner_company_id = parseInt(addFormData.partner_company_id);
      }

      await apiRequest('/deals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Deal created successfully');
      setIsAddDialogOpen(false);
      resetAddForm();
      loadDeals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create deal');
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      partner_company_id: '',
      customer_company_name: '',
      customer_spoc: '',
      customer_company_url: '',
      customer_email: '',
      customer_spoc_email: '',
      customer_spoc_phone: '',
      revenue_arr_estimation: '',
      status: 'Open',
      comments: '',
    });
  };

  const handleArchive = async (dealId: number) => {
    if (!confirm('Are you sure you want to archive this deal?')) return;
    
    try {
      await apiRequest(`/deals/${dealId}/archive`, {
        method: 'POST',
      });
      toast.success('Deal archived successfully');
      loadDeals();
      loadArchivedDeals();
    } catch (error: any) {
      toast.error('Failed to archive deal');
    }
  };

  const handleUnarchive = async (dealId: number) => {
    try {
      await apiRequest(`/deals/${dealId}/unarchive`, {
        method: 'POST',
      });
      toast.success('Deal unarchived successfully');
      loadDeals();
      loadArchivedDeals();
    } catch (error: any) {
      toast.error('Failed to unarchive deal');
    }
  };

  const handleNotesClick = (deal: any) => {
    setSelectedDeal(deal);
    loadDealNotes(deal.id);
    setIsNotesDialogOpen(true);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await apiRequest(`/deals/${selectedDeal.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          note_text: noteText,
          note_type: 'general',
        }),
      });
      toast.success('Note added successfully');
      setNoteText('');
      loadDealNotes(selectedDeal.id);
    } catch (error: any) {
      toast.error('Failed to add note');
    }
  };

  const handleProofClick = (deal: any) => {
    setSelectedDeal(deal);
    setProofUrl(deal.proof_of_engagement || '');
    setIsProofDialogOpen(true);
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/deals/${selectedDeal.id}/proof`, {
        method: 'POST',
        body: JSON.stringify({ proof_url: proofUrl }),
      });
      toast.success('Proof of engagement uploaded successfully');
      setIsProofDialogOpen(false);
      loadDeals();
    } catch (error: any) {
      toast.error('Failed to upload proof');
    }
  };

  const filteredDeals = selectedCompany === 'all' 
    ? deals 
    : deals.filter(d => d.partner_company_id === parseInt(selectedCompany));

  const filteredArchivedDeals = selectedCompany === 'all'
    ? archivedDeals
    : archivedDeals.filter(d => d.partner_company_id === parseInt(selectedCompany));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading deals...</div>
        </div>
      </DashboardLayout>
    );
  }

  const DealTable = ({ deals, isArchived = false }: { deals: any[], isArchived?: boolean }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Partner</th>
            <th className="text-left py-3 px-4">Customer</th>
            <th className="text-left py-3 px-4">SPOC</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-right py-3 px-4">Revenue (ARR)</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No {isArchived ? 'archived ' : ''}deals found
              </td>
            </tr>
          ) : (
            deals.map((deal) => (
              <tr key={deal.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{deal.partner_company_name}</td>
                <td className="py-3 px-4">{deal.customer_company_name}</td>
                <td className="py-3 px-4">{deal.customer_spoc}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{deal.customer_spoc_email}</td>
                <td className="py-3 px-4 text-right font-semibold">
                  ${deal.revenue_arr_estimation?.toLocaleString() || '0'}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    deal.status === 'Won' ? 'bg-green-100 text-green-800' :
                    deal.status === 'Lost' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {deal.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(deal)}
                      title="Edit Deal"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNotesClick(deal)}
                      title="View Notes"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleProofClick(deal)}
                      title="Upload Proof"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    {!isArchived && (currentUser?.role === 'Portal Administrator' || currentUser?.role === 'Partner Account Manager') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchive(deal.id)}
                        title="Archive Deal"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    {isArchived && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnarchive(deal.id)}
                        title="Unarchive Deal"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
            <p className="text-gray-600 mt-1">Manage partner deals and referrals</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Deal
            </Button>
          </div>
        </div>

        {/* Tabs for Active/Archived */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Deals ({filteredDeals.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({filteredArchivedDeals.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <Card className="p-6">
              <DealTable deals={filteredDeals} />
            </Card>
          </TabsContent>
          
          <TabsContent value="archived">
            <Card className="p-6">
              <DealTable deals={filteredArchivedDeals} isArchived={true} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Deal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetAddForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {(currentUser?.role === 'Portal Administrator' || currentUser?.role === 'Partner Account Manager') && (
                <div className="space-y-2">
                  <Label htmlFor="add_partner_company_id">Partner Company *</Label>
                  <select
                    id="add_partner_company_id"
                    value={addFormData.partner_company_id}
                    onChange={(e) => setAddFormData({ ...addFormData, partner_company_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Partner Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="add_customer_company_name">Customer Company Name *</Label>
                <Input
                  id="add_customer_company_name"
                  value={addFormData.customer_company_name}
                  onChange={(e) => setAddFormData({ ...addFormData, customer_company_name: e.target.value })}
                  placeholder="Enter customer company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_customer_company_url">Customer Company URL</Label>
                <Input
                  id="add_customer_company_url"
                  type="url"
                  value={addFormData.customer_company_url}
                  onChange={(e) => setAddFormData({ ...addFormData, customer_company_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_customer_spoc">Customer SPOC *</Label>
                  <Input
                    id="add_customer_spoc"
                    value={addFormData.customer_spoc}
                    onChange={(e) => setAddFormData({ ...addFormData, customer_spoc: e.target.value })}
                    placeholder="Contact person name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add_customer_spoc_email">Customer SPOC Email *</Label>
                  <Input
                    id="add_customer_spoc_email"
                    type="email"
                    value={addFormData.customer_spoc_email}
                    onChange={(e) => setAddFormData({ ...addFormData, customer_spoc_email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_customer_spoc_phone">Customer SPOC Phone</Label>
                <Input
                  id="add_customer_spoc_phone"
                  type="tel"
                  value={addFormData.customer_spoc_phone}
                  onChange={(e) => setAddFormData({ ...addFormData, customer_spoc_phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_revenue_arr_estimation">Revenue (ARR) Estimation *</Label>
                <Input
                  id="add_revenue_arr_estimation"
                  type="number"
                  step="0.01"
                  value={addFormData.revenue_arr_estimation}
                  onChange={(e) => setAddFormData({ ...addFormData, revenue_arr_estimation: e.target.value })}
                  placeholder="Enter estimated annual recurring revenue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_status">Deal Status *</Label>
                <select
                  id="add_status"
                  value={addFormData.status}
                  onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_comments">Comments</Label>
                <Textarea
                  id="add_comments"
                  value={addFormData.comments}
                  onChange={(e) => setAddFormData({ ...addFormData, comments: e.target.value })}
                  placeholder="Additional notes or comments"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Deal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Deal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Deal Status *</Label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_company_name">Customer Company</Label>
                <Input
                  id="customer_company_name"
                  value={editFormData.customer_company_name}
                  onChange={(e) => setEditFormData({ ...editFormData, customer_company_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_spoc">Customer SPOC</Label>
                  <Input
                    id="customer_spoc"
                    value={editFormData.customer_spoc}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_spoc: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={editFormData.customer_email}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue_arr_estimation">Revenue (ARR) Estimation</Label>
                <Input
                  id="revenue_arr_estimation"
                  type="number"
                  step="0.01"
                  value={editFormData.revenue_arr_estimation}
                  onChange={(e) => setEditFormData({ ...editFormData, revenue_arr_estimation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Deal Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Add Note</Label>
                <Textarea
                  id="note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note here..."
                  rows={3}
                />
                <Button onClick={handleAddNote} className="w-full">
                  Add Note
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Previous Notes</h3>
                {dealNotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No notes yet</p>
                ) : (
                  dealNotes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{note.user_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{note.note_text}</p>
                      {note.note_type === 'status_change' && (
                        <div className="mt-2 text-sm text-blue-600">
                          Status changed: {note.old_status} → {note.new_status}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Proof of Engagement Dialog */}
        <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Proof of Engagement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof_url">Upload Proof (PDF or JPG URL)</Label>
                <Input
                  id="proof_url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Enter file URL (e.g., https://example.com/proof.pdf)"
                  required
                />
                <p className="text-sm text-gray-500">
                  Upload your file to a cloud storage service and paste the URL here
                </p>
              </div>

              {selectedDeal?.proof_of_engagement && (
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    Current proof: <a href={selectedDeal.proof_of_engagement} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsProofDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload Proof</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

