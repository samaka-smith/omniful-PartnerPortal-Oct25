import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsAPI, dealsAPI, companiesAPI, usersAPI, getCurrentUser } from '@/lib/api';
import { Building2, Users, Briefcase, DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    inProgressDeals: 0,
    openDeals: 0,
    totalRevenue: 0,
    wonRevenue: 0,
    expectedRevenue: 0,
  });
  
  const [companyPerformance, setCompanyPerformance] = useState<any[]>([]);
  const [dealsByStatus, setDealsByStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [companies, users, deals] = await Promise.all([
        companiesAPI.getAll(),
        usersAPI.getAll(),
        dealsAPI.getAll(),
      ]);

      // Filter data based on role
      let filteredDeals = deals;
      let filteredCompanies = companies;
      
      if (userRole === 'Partner Account Manager') {
        // PAM sees only their assigned companies
        const pamCompanies = companies.filter(c => c.pam_id === currentUser?.id);
        filteredCompanies = pamCompanies;
        filteredDeals = deals.filter(d => pamCompanies.some(c => c.id === d.company_id));
      } else if (userRole === 'Partner SPOC Admin') {
        // Partner SPOC Admin sees only their company
        const userCompany = companies.find(c => c.id === currentUser?.company_id);
        filteredCompanies = userCompany ? [userCompany] : [];
        filteredDeals = deals.filter(d => d.company_id === currentUser?.company_id);
      }

      // Calculate stats
      const wonDeals = filteredDeals.filter(d => d.status === 'Won');
      const lostDeals = filteredDeals.filter(d => d.status === 'Lost');
      const inProgressDeals = filteredDeals.filter(d => d.status === 'In Progress');
      const openDeals = filteredDeals.filter(d => d.status === 'Open');
      
      const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.revenue_arr || 0), 0);
      const expectedRevenue = [...inProgressDeals, ...openDeals].reduce((sum, d) => sum + (d.revenue_arr || 0), 0);
      const totalRevenue = filteredDeals
        .filter(d => d.status !== 'Lost')
        .reduce((sum, d) => sum + (d.revenue_arr || 0), 0);

      setStats({
        totalCompanies: filteredCompanies.length,
        totalUsers: users.length,
        totalDeals: filteredDeals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        inProgressDeals: inProgressDeals.length,
        openDeals: openDeals.length,
        totalRevenue,
        wonRevenue,
        expectedRevenue,
      });

      // Company performance data
      const performance = filteredCompanies.map(company => {
        const companyDeals = filteredDeals.filter(d => d.company_id === company.id);
        const companyWonDeals = companyDeals.filter(d => d.status === 'Won');
        const companyRevenue = companyDeals
          .filter(d => d.status !== 'Lost')
          .reduce((sum, d) => sum + (d.revenue_arr || 0), 0);
        
        return {
          id: company.id,
          name: company.name,
          deals: companyDeals.length,
          wonDeals: companyWonDeals.length,
          revenue: companyRevenue,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setCompanyPerformance(performance);

      // Deals by status
      setDealsByStatus({
        Won: wonDeals.length,
        'In Progress': inProgressDeals.length,
        Open: openDeals.length,
        Lost: lostDeals.length,
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Portal Admin View
  if (userRole === 'Portal Administrator') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Complete overview of partner activities and performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Companies" value={stats.totalCompanies} icon={Building2} color="blue" />
            <StatCard title="Total Deals" value={stats.totalDeals} icon={Briefcase} color="purple" />
            <StatCard title="Won Deals" value={stats.wonDeals} icon={TrendingUp} color="green" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="orange" />
          </div>

          {/* Deals Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Deals by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.wonDeals}</div>
                  <div className="text-sm text-gray-600">Won</div>
                  <div className="text-xs text-gray-500">${stats.wonRevenue.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgressDeals}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.openDeals}</div>
                  <div className="text-sm text-gray-600">Open</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.lostDeals}</div>
                  <div className="text-sm text-gray-600">Lost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Won Revenue</span>
                    <span className="text-lg font-bold text-green-600">${stats.wonRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Expected Revenue</span>
                    <span className="text-lg font-bold text-blue-600">${stats.expectedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Win Rate</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold">{stats.wonDeals}</div>
                      <div className="text-xs text-gray-600">Won</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xl font-bold">{stats.totalDeals}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyPerformance.slice(0, 5).map((company, index) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.deals} deals • {company.wonDeals} won</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">${company.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // PAM View
  if (userRole === 'Partner Account Manager') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-500 mt-1">Performance of your assigned companies</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="My Companies" value={stats.totalCompanies} icon={Building2} color="blue" />
            <StatCard title="Total Deals" value={stats.totalDeals} icon={Briefcase} color="purple" />
            <StatCard title="Won Deals" value={stats.wonDeals} icon={TrendingUp} color="green" />
            <StatCard title="Portfolio Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="orange" />
          </div>

          {/* Performance vs Target */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${stats.wonRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Won Revenue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">${stats.expectedRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Expected Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.wonDeals}/{stats.totalDeals}</div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Company Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyPerformance.map((company) => (
                  <div key={company.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${company.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold">{company.deals}</div>
                        <div className="text-xs text-gray-600">Total Deals</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold text-green-600">{company.wonDeals}</div>
                        <div className="text-xs text-gray-600">Won</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-bold text-blue-600">
                          {company.deals > 0 ? Math.round((company.wonDeals / company.deals) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Partner SPOC Admin View
  if (userRole === 'Partner SPOC Admin') {
    // Calculate average for comparison (without showing other company names)
    const avgRevenue = companyPerformance.length > 0 
      ? companyPerformance.reduce((sum, c) => sum + c.revenue, 0) / companyPerformance.length 
      : 0;
    const avgDeals = companyPerformance.length > 0
      ? companyPerformance.reduce((sum, c) => sum + c.deals, 0) / companyPerformance.length
      : 0;
    const myCompany = companyPerformance[0] || { revenue: 0, deals: 0, wonDeals: 0 };

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-500 mt-1">Your company's performance overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Deals" value={stats.totalDeals} icon={Briefcase} color="purple" />
            <StatCard title="Won Deals" value={stats.wonDeals} icon={TrendingUp} color="green" />
            <StatCard title="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="orange" />
            <StatCard 
              title="Win Rate" 
              value={`${stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0}%`} 
              icon={Target} 
              color="blue" 
            />
          </div>

          {/* Performance vs Average */}
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Network Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Your Company</div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="text-xl font-bold text-blue-600">${myCompany.revenue.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <div className="text-xs text-gray-600">Deals</div>
                      <div className="text-xl font-bold text-purple-600">{myCompany.deals}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Won Deals</div>
                      <div className="text-xl font-bold text-green-600">{myCompany.wonDeals}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Network Average</div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="text-xl font-bold text-gray-700">${avgRevenue.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Deals</div>
                      <div className="text-xl font-bold text-gray-700">{Math.round(avgDeals)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Comparison</div>
                      <div className={`text-xl font-bold ${myCompany.revenue > avgRevenue ? 'text-green-600' : 'text-orange-600'}`}>
                        {myCompany.revenue > avgRevenue ? 'Above' : 'Below'} Avg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals Status */}
          <Card>
            <CardHeader>
              <CardTitle>Deals Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.wonDeals}</div>
                  <div className="text-sm text-gray-600">Won</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgressDeals}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.openDeals}</div>
                  <div className="text-sm text-gray-600">Open</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.lostDeals}</div>
                  <div className="text-sm text-gray-600">Lost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Default view for other roles
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to the Partner Portal</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-gray-600">
              <AlertCircle className="w-5 h-5" />
              <span>Dashboard access is limited for your role. Contact your administrator for more information.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Reusable StatCard component
function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50' },
    green: { text: 'text-green-600', bg: 'bg-green-50' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
