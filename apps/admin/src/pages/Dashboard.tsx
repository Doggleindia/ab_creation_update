import React from 'react';
import { renderIcon } from '../utils/iconRenderer';
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiDownload,
  FiHeart
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats: StatCard[] = [
    {
      label: 'Total Revenue',
      value: '$24,563',
      change: '+12.5%',
      icon: renderIcon(FiDollarSign, { size: 24 }),
      color: 'from-[#CBAA75] to-[#B87D4C]'
    },
    {
      label: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      icon: renderIcon(FiShoppingCart, { size: 24 }),
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Total Users',
      value: '892',
      change: '+15.3%',
      icon: renderIcon(FiUsers, { size: 24 }),
      color: 'from-[#CBAA75] to-pink-500'
    },
    {
      label: 'Growth Rate',
      value: '23.5%',
      change: '+4.1%',
      icon: renderIcon(FiTrendingUp, { size: 24 }),
      color: 'from-[#CBAA75] to-red-500'
    }
  ];

  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 12000, orders: 450 },
    { month: 'Feb', revenue: 15000, orders: 520 },
    { month: 'Mar', revenue: 13500, orders: 480 },
    { month: 'Apr', revenue: 18000, orders: 620 },
    { month: 'May', revenue: 22000, orders: 750 },
    { month: 'Jun', revenue: 24563, orders: 834 }
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', amount: '$1,299', status: 'Completed', date: '2025-01-19' },
    { id: '#12344', customer: 'Jane Smith', amount: '$899', status: 'Pending', date: '2025-01-18' },
    { id: '#12343', customer: 'Mike Johnson', amount: '$2,499', status: 'Completed', date: '2025-01-17' },
    { id: '#12342', customer: 'Sarah Williams', amount: '$599', status: 'Processing', date: '2025-01-16' },
    { id: '#12341', customer: 'Tom Brown', amount: '$1,699', status: 'Completed', date: '2025-01-15' }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h2>
          <p className="text-gray-600 mt-1">Here's your business performance overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                  <select className="px-3 py-1 border border-slate-200 rounded-lg text-sm bg-white">
                    <option>Last 6 months</option>
                    <option>Last Year</option>
                  </select>
                </div>

                <div className="flex items-end justify-around h-64 gap-2">
                  {chartData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full h-48 bg-slate-100 rounded-t-lg overflow-hidden group">
                        <div
                          className="w-full bg-gradient-to-t from-[#CBAA75] to-[#B87D4C] rounded-t-lg transition-all hover:from-[#CBAA75] hover:to-[#B87D4C] cursor-pointer"
                          style={{
                            height: `${(data.revenue / maxRevenue) * 100}%`
                          }}
                        >
                          <div className="h-full flex items-end justify-center pb-2 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            ${data.revenue / 1000}k
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-600">{data.month}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-sm text-gray-600">Average Revenue</p>
                    <p className="text-lg font-bold text-gray-900">$17,510</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-lg font-bold text-gray-900">3,654</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F5F1EA] to-[#F5F1EA] rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Conversion Rate</p>
                      <p className="text-lg font-bold text-gray-900">3.24%</p>
                    </div>
                    <span className="text-green-500">{renderIcon(FiTrendingUp, { size: 24 })}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Avg Order Value</p>
                      <p className="text-lg font-bold text-gray-900">$127.50</p>
                    </div>
                    <span className="text-green-500">{renderIcon(FiDollarSign, { size: 24 })}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F5F1EA] to-pink-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Customer Satisfaction</p>
                      <p className="text-lg font-bold text-gray-900">4.8/5.0</p>
                    </div>
                    <span className="text-red-500">{renderIcon(FiHeart, { size: 24 })}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F5F1EA] to-red-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Return Rate</p>
                      <p className="text-lg font-bold text-gray-900">2.15%</p>
                    </div>
                    <span className="text-[#B87D4C]">{renderIcon(FiClock, { size: 24 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button className="flex items-center gap-2 px-4 py-2 text-[#B87D4C] hover:bg-[#F5F1EA] rounded-lg transition-colors">
                  {renderIcon(FiDownload, { size: 16 })}
                  <span className="text-sm font-medium">Export</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-[#E8E6E3] text-[#B87D4C]'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
    </Layout>
  );
};

export default Dashboard;