import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';

export default function Payouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
    loadSummary();
  }, []);

  const loadPayouts = async () => {
    try {
      const response = await apiRequest<any[]>('/payouts');
      setPayouts(response);
    } catch (error: any) {
      toast.error('Failed to load payouts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await apiRequest<any[]>('/payouts/summary');
      setSummary(response);
    } catch (error: any) {
      console.error('Failed to load summary');
    }
  };

  const calculatePayouts = async () => {
    try {
      await apiRequest('/payouts/calculate', { method: 'POST', body: JSON.stringify({}) });
      toast.success('Payouts calculated successfully');
      loadPayouts();
      loadSummary();
    } catch (error: any) {
      toast.error('Failed to calculate payouts');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading payouts...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
            <p className="text-gray-600 mt-1">
              Track payout progress based on open deals (20% of deal value)
            </p>
          </div>
          <Button onClick={calculatePayouts} className="gap-2">
            <Calculator className="w-4 h-4" />
            Calculate Payouts
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payout Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.reduce((sum, s) => sum + s.payout_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deals Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.reduce((sum, s) => sum + s.total_deals_value, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payout Progress Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payout Progress</h2>
          
          {summary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No payout data available. Click "Calculate Payouts" to generate current period payouts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">PAM</th>
                    <th className="text-right py-3 px-4">Deals Count</th>
                    <th className="text-right py-3 px-4">Total Deals Value</th>
                    <th className="text-right py-3 px-4">Payout (20%)</th>
                    <th className="text-center py-3 px-4">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.company_name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.pam_name}</td>
                      <td className="py-3 px-4 text-right">{item.deals_count}</td>
                      <td className="py-3 px-4 text-right">
                        ${item.total_deals_value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${item.payout_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (item.payout_amount / 10000) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((item.payout_amount / 10000) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Historical Payouts */}
        {payouts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historical Payouts</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-right py-3 px-4">Deals Value</th>
                    <th className="text-right py-3 px-4">Payout Amount</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{payout.company_name}</td>
                      <td className="py-3 px-4">{payout.user_name}</td>
                      <td className="py-3 px-4 text-right">
                        ${payout.total_deals_value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${payout.calculated_payout.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          payout.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payout.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

