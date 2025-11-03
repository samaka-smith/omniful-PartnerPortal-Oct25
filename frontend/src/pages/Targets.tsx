import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Target, Edit, Trash2 } from 'lucide-react';

export default function Targets() {
  const [targets, setTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    target_value: '',
    description: '',
  });

  useEffect(() => {
    loadTargets();
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
      'deals_count': 'Deals Count',
      'revenue': 'Revenue',
      'conversion_rate': 'Conversion Rate',
    };
    return metricMap[metric] || metric;
  };

  const formatPeriod = (period: string) => {
    const periodMap: Record<string, string> = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
    };
    return periodMap[period] || period;
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 col-span-full">
              No targets set yet
            </Card>
          ) : (
            targets.map((target) => (
              <Card key={target.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{target?.target_entity_name || 'N/A'}</h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {target?.target_type || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(target)}
                      title="Edit Target"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(target.id)}
                      title="Delete Target"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Metric</p>
                    <p className="font-medium">{formatMetric(target?.metric || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {target?.metric === 'revenue' ? `$${(target?.target_value || 0).toLocaleString()}` : (target?.target_value || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Period</p>
                    <p className="font-medium">{formatPeriod(target?.period || '')}</p>
                  </div>
                  {target?.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm">{target.description}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Target Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Target Type</Label>
              <Input value={selectedTarget?.target_type || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Entity</Label>
              <Input value={selectedTarget?.target_entity_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Metric</Label>
              <Input value={formatMetric(selectedTarget?.metric || '')} disabled />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Input value={formatPeriod(selectedTarget?.period || '')} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                value={editFormData.target_value}
                onChange={(e) => setEditFormData({...editFormData, target_value: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                rows={3}
              />
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
    </DashboardLayout>
  );
}
