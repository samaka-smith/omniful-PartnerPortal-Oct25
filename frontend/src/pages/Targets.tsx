import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { Target, Edit, Trash2, Plus } from 'lucide-react';

export default function Targets() {
  const [targets, setTargets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  
  const currentUser = getCurrentUser();
  const isPortalAdmin = currentUser?.role === 'Portal Administrator';
  
  const [createFormData, setCreateFormData] = useState({
    target_type: '',
    target_entity_id: '',
    target_metric: '',
    target_value: '',
    target_period: '',
    description: '',
  });
  
  const [editFormData, setEditFormData] = useState({
    target_value: '',
    description: '',
  });

  useEffect(() => {
    loadTargets();
    loadUsers();
    loadCompanies();
  }, []);

  const loadTargets = async () => {
    try {
      const response = await apiRequest<any[]>('/targets');
      setTargets(response || []);
    } catch (error: any) {
      toast.error('Failed to load targets');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiRequest<any[]>('/users');
      setUsers(response || []);
    } catch (error: any) {
      console.error('Failed to load users');
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await apiRequest<any[]>('/companies');
      setCompanies(response || []);
    } catch (error: any) {
      console.error('Failed to load companies');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest('/targets', {
        method: 'POST',
        body: JSON.stringify({
          target_type: createFormData.target_type,
          target_entity_id: parseInt(createFormData.target_entity_id),
          target_metric: createFormData.target_metric,
          target_value: parseFloat(createFormData.target_value),
          target_period: createFormData.target_period,
          description: createFormData.description,
        }),
      });
      toast.success('Target created successfully');
      setIsCreateDialogOpen(false);
      resetCreateForm();
      loadTargets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create target');
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      target_type: '',
      target_entity_id: '',
      target_metric: '',
      target_value: '',
      target_period: '',
      description: '',
    });
  };

  const handleEditClick = (target: any) => {
    setSelectedTarget(target);
    setEditFormData({
      target_value: target.target_value?.toString() || '',
      description: target.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(`/targets/${selectedTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          target_value: parseFloat(editFormData.target_value),
          description: editFormData.description,
        }),
      });
      toast.success('Target updated successfully');
      setIsEditDialogOpen(false);
      loadTargets();
    } catch (error: any) {
      toast.error('Failed to update target');
    }
  };

  const handleDelete = async (targetId: number) => {
    if (!confirm('Are you sure you want to delete this target?')) return;
    
    try {
      await apiRequest(`/targets/${targetId}`, {
        method: 'DELETE',
      });
      toast.success('Target deleted successfully');
      loadTargets();
    } catch (error: any) {
      toast.error('Failed to delete target');
    }
  };

  const formatMetric = (metric: string) => {
    const metricMap: Record<string, string> = {
      'deals_won': 'Deals Won',
      'forecasted_revenue': 'Forecasted Revenue',
      'deals_opened': 'Deals Opened',
    };
    return metricMap[metric] || metric;
  };

  const formatPeriod = (period: string) => {
    const periodMap: Record<string, string> = {
      'Monthly': 'Monthly',
      'Quarterly': 'Quarterly',
      'Yearly': 'Yearly',
    };
    return periodMap[period] || period;
  };

  // Filter entities based on selected target type
  const getFilteredEntities = () => {
    if (createFormData.target_type === 'PAM') {
      return users.filter(u => u.role === 'Partner Account Manager');
    } else if (createFormData.target_type === 'Partner SPOC Admin') {
      return users.filter(u => u.role === 'Partner SPOC Admin');
    } else if (createFormData.target_type === 'Partner Company') {
      // Only companies with specific partner stages
      return companies.filter(c => 
        ['Registered', 'Implementing', 'Reseller', 'Strategic'].includes(c.partner_stage)
      );
    }
    return [];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading targets...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Targets</h1>
            <p className="text-gray-600 mt-1">Manage performance targets for PAMs, companies, and SPOCs</p>
          </div>
          {isPortalAdmin && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Target
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 col-span-full">
              No targets set yet
            </Card>
          ) : (
            targets.map((target) => (
              <Card key={target.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{target.target_entity_name}</div>
                        <div className="text-sm text-gray-500">{target.target_type}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(target)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {isPortalAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Metric:</span>
                      <span className="font-medium">{formatMetric(target.target_metric)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium text-blue-600">
                        {target.target_metric === 'forecasted_revenue' 
                          ? `$${target.target_value?.toLocaleString()}` 
                          : target.target_value}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium">{formatPeriod(target.target_period)}</span>
                    </div>
                  </div>
                  
                  {target.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{target.description}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Target Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Target</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_type">Target Type *</Label>
                <select
                  id="target_type"
                  value={createFormData.target_type}
                  onChange={(e) => setCreateFormData({...createFormData, target_type: e.target.value, target_entity_id: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select type</option>
                  <option value="PAM">PAM</option>
                  <option value="Partner SPOC Admin">Partner SPOC Admin</option>
                  <option value="Partner Company">Partner Company</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_entity_id">
                  {createFormData.target_type === 'Partner Company' ? 'Company' : 'User'} *
                </Label>
                <select
                  id="target_entity_id"
                  value={createFormData.target_entity_id}
                  onChange={(e) => setCreateFormData({...createFormData, target_entity_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!createFormData.target_type}
                >
                  <option value="">Select {createFormData.target_type === 'Partner Company' ? 'company' : 'user'}</option>
                  {getFilteredEntities().map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name || entity.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_metric">Target Metric *</Label>
                <select
                  id="target_metric"
                  value={createFormData.target_metric}
                  onChange={(e) => setCreateFormData({...createFormData, target_metric: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select metric</option>
                  <option value="deals_won">No. of Deals Won</option>
                  <option value="forecasted_revenue">Value of Forecasted Revenue</option>
                  <option value="deals_opened">No. of Deals Opened on Portal</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value *</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  value={createFormData.target_value}
                  onChange={(e) => setCreateFormData({...createFormData, target_value: e.target.value})}
                  placeholder={createFormData.target_metric === 'forecasted_revenue' ? '10000' : '10'}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_period">Target Period *</Label>
              <select
                id="target_period"
                value={createFormData.target_period}
                onChange={(e) => setCreateFormData({...createFormData, target_period: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select period</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                placeholder="Optional description or notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Target</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Target Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_target_value">Target Value *</Label>
              <Input
                id="edit_target_value"
                type="number"
                step="0.01"
                value={editFormData.target_value}
                onChange={(e) => setEditFormData({...editFormData, target_value: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Target</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
