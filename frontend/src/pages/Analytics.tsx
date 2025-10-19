import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dealsAPI, companiesAPI } from '@/lib/api';
import { Filter, TrendingUp, DollarSign, Briefcase } from 'lucide-react';

export default function Analytics() {
  const [deals, setDeals] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dealsData, companiesData] = await Promise.all([
        dealsAPI.getAll(),
        companiesAPI.getAll(),
      ]);
      setDeals(dealsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeals = filterCompanyId
    ? deals.filter(d => d.partner_company_id === parseInt(filterCompanyId))
    : deals;

  const stats = {
    totalDeals: filteredDeals.length,
    wonDeals: filteredDeals.filter(d => d.status === 'Won').length,
    totalRevenue: filteredDeals.reduce((sum, d) => sum + (d.revenue_arr_estimation || 0), 0),
    wonRevenue: filteredDeals
      .filter(d => d.status === 'Won')
      .reduce((sum, d) => sum + (d.revenue_arr_estimation || 0), 0),
  };

  const dealsByStatus = filteredDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statCards = [
    {
      title: 'Total Deals',
      value: stats.totalDeals,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Won Deals',
      value: stats.wonDeals,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Won Revenue',
      value: `$${stats.wonRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Performance insights and metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCompanyId}
              onChange={(e) => setFilterCompanyId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Deals by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Deals by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dealsByStatus).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{status}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${((count as number) / stats.totalDeals) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(dealsByStatus).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No deals data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Partner Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Partner Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies
                .filter(c => !filterCompanyId || c.id === parseInt(filterCompanyId))
                .map(company => {
                  const companyDeals = deals.filter(d => d.partner_company_id === company.id);
                  const companyRevenue = companyDeals.reduce(
                    (sum, d) => sum + (d.revenue_arr_estimation || 0),
                    0
                  );
                  
                  return (
                    <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{company.name}</h4>
                        <p className="text-sm text-gray-500">
                          {companyDeals.length} deals • ${companyRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {company.partner_stage || 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {companies.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No companies data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

