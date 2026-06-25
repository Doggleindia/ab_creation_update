import React, { useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import OrdersTable from '../components/Tables/OrdersTable';
import { renderIcon } from '../utils/iconRenderer';
import { dummyOrders } from '../utils/dummyData';
import { Order, OrderStatus } from '../types/models';

type FilterStatus = OrderStatus | 'All';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const orderStatuses: FilterStatus[] = ['All', 'Paid', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];

  const getStatusStats = (status: OrderStatus) => {
    return orders.filter(o => o.status === status).length;
  };

  const handleView = (order: Order) => {
    console.log('View order:', order);
    // TODO: Implement order details modal
  };

  const handleEdit = (order: Order) => {
    console.log('Edit order:', order);
    // TODO: Implement edit order modal
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {renderIcon(FiPlus, { size: 20 })}
          <span>New Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {orderStatuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
              {status !== 'All' && (
                <span className="ml-2 font-semibold">({getStatusStats(status as OrderStatus)})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Paid Orders</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{getStatusStats('Paid')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Processing</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{getStatusStats('Processing')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Shipping</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{getStatusStats('Shipping')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Delivered</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {getStatusStats('Delivered')}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        filterStatus={filterStatus}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      </div>
    </Layout>
  );
};

export default Orders;
