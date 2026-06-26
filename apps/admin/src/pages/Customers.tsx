import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import CustomersTable from '../components/Tables/CustomersTable';
import { renderIcon } from '../utils/iconRenderer';
import { User, WishlistAnalytics } from '../types/models';
import { apiService } from '../utils/api';

const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [wishlistAnalytics, setWishlistAnalytics] = useState<WishlistAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, analyticsResponse] = await Promise.all([
          apiService.getAllUsersAdmin(),
          apiService.getWishlistAnalytics()
        ]);
        setUsers(usersResponse.data.users);
        setWishlistAnalytics(analyticsResponse);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Implement edit modal
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u._id !== userId));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage and view customer information</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
          <input
            type="text"
              placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Wishlist Items</p>
          <p className="text-2xl font-bold text-[#B87D4C] mt-1">
              {wishlistAnalytics?.analytics.reduce((sum, item) => sum + item.wishlistCount, 0) || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Products in Wishlist</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
              {wishlistAnalytics?.analytics.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Most Popular Category</p>
            <p className="text-2xl font-bold text-[#B87D4C] mt-1">
              {wishlistAnalytics?.analytics.reduce((max, item) =>
                item.wishlistCount > max.wishlistCount ? item : max,
                wishlistAnalytics.analytics[0]
              )?.category || 'N/A'}
          </p>
        </div>
      </div>

        {/* Wishlist Analytics */}
        {wishlistAnalytics && wishlistAnalytics.analytics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Wishlist Analytics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Wishlist Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wishlistAnalytics.analytics.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{item.productTitle}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#E8E6E3] text-[#B87D4C]">
                          {item.wishlistCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
      <CustomersTable
          users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
          loading={loading}
          error={error}
      />
      </div>
    </Layout>
  );
};

export default Customers;
