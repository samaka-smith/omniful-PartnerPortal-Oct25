import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { targetsAPI, usersAPI, companiesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Target as TargetIcon } from 'lucide-react';

export default function Targets() {
  const [targets, setTargets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    target_type: 'PAM',
    target_entity_id: '',
    target_metric: 'revenue',
    target_value: '',
    target_period: 'monthly',
  });

  useEffect(() => {
    loadTargets();
    loadUsers();
    loadCompanies();
  }, []);

  const loadTargets = async () => {
    try {
      const data = await targetsAPI.getAll();
      setTargets(data);
    } catch (error: any) {
      toast.error('Failed to load targets');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      // Filter for PAMs and SPOCs
      setUsers(data.filter(u => 
        u.role === 'Partner Account Manager' || u.role === 'Partner SPOC Admin'
      ));
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        target_type: formData.target_type,
        target_entity_id: parseInt(formData.target_entity_id),
        target_metric: formData.target_metric,
        target_value: parseFloat(formData.target_value),
        target_period: formData.target_period,
      };

      await targetsAPI.create(payload);
      toast.success('Target created successfully');
      
      setIsDialogOpen(false);
      resetForm();
      loadTargets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create target');
    }
  };

  const resetForm = () => {
    setFormData({
      target_type: 'PAM',
      target_entity_id: '',
      target_metric: 'revenue',
      target_value: '',
      target_period: 'monthly',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Targets Management</h1>
            <p className="text-gray-500 mt-1">Set and track revenue targets for PAMs and SPOCs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Set Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set New Target</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_type">Target Type *</Label>
                  <select
                    id="target_type"
                    value={formData.target_type}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value, target_entity_id: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="PAM">PAM (Partner Account Manager)</option>
                    <option value="Company">Company</option>
                    <option value="SPOC">SPOC (Partner SPOC Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_entity_id">
                    {formData.target_type === 'PAM' ? 'Select PAM' : 
                     formData.target_type === 'Company' ? 'Select Company' : 'Select SPOC'} *
                  </Label>
                  <select
                    id="target_entity_id"
                    value={formData.target_entity_id}
                    onChange={(e) => setFormData({ ...formData, target_entity_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select {formData.target_type}</option>
                    {formData.target_type === 'Company' ? 
                      companies.map(company => (
                        <option key={company.id} value={company.id.toString()}>
                          {company.name}
                        </option>
                      )) :
                      users.filter(u => 
                        formData.target_type === 'PAM' ? u.role === 'Partner Account Manager' : u.role === 'Partner SPOC Admin'
                      ).map(user => (
                        <option key={user.id} value={user.id.toString()}>
                          {user.username}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_metric">Target Metric *</Label>
                  <select
                    id="target_metric"
                    value={formData.target_metric}
                    onChange={(e) => setFormData({ ...formData, target_metric: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="revenue">Revenue (ARR)</option>
                    <option value="deals_count">Number of Deals</option>
                    <option value="won_deals">Won Deals Count</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value *</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder={formData.target_metric === 'revenue' ? 'Enter amount in USD' : 'Enter number of deals'}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_period">Target Period *</Label>
                  <select
                    id="target_period"
                    value={formData.target_period}
                    onChange={(e) => setFormData({ ...formData, target_period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Set Target</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Targets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <Card className="p-8 text-center text-gray-500">Loading...</Card>
          ) : targets.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No targets set yet</Card>
          ) : (
            targets.map((target) => (
              <Card key={target.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <TargetIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{target.user_name || 'User'}</h3>
                    <p className="text-sm text-gray-500">{target.company_name || 'Company'}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Target:</span>{' '}
                        <span className="font-medium">${target.revenue_goal?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Period:</span>{' '}
                        <span className="font-medium">{target.time_period} {target.year}</span>
                      </div>
                      {target.achieved !== undefined && (
                        <div>
                          <span className="text-gray-500">Achieved:</span>{' '}
                          <span className="font-medium">${target.achieved?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

