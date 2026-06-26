import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import OrdersTable from '../components/Tables/OrdersTable';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { apiService } from '../utils/api';
import { dummyOrders } from '../utils/dummyData';
import { Order, OrderStatus } from '../types/models';

// Map a real backend order onto the admin table's display shape.
const mapOrderStatus = (s?: string): OrderStatus => {
  switch (s) {
    case 'shipped': return 'Shipping';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'processing':
    case 'pending':
    default: return 'Processing';
  }
};

const mapOrder = (o: any): Order => ({
  id: o._id,
  orderNumber: o.orderId,
  customerName: o.userId?.name || o.guestName || 'Guest',
  customerEmail: o.userId?.email || o.guestEmail || '—',
  items: [
    {
      id: o._id,
      productType: (o.productId?.title || o.productType || 'Product') as any,
      printingType: (o.productType === 'bulk' ? 'Bulk' : 'Ready') as any,
      quantity: o.quantity ?? 1,
      price: o.totalAmount ?? 0,
    },
  ],
  totalAmount: o.totalAmount ?? 0,
  status: mapOrderStatus(o.orderStatus),
  paymentStatus: o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'failed' ? 'Failed' : 'Pending',
  createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
  estimatedDelivery: '',
});

type FilterStatus = OrderStatus | 'All';

const Orders: React.FC = () => {
  // Starts with demo data, then replaced by live orders when available.
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  useEffect(() => {
    let active = true;
    apiService
      .getAdminOrders()
      .then((res) => {
        const real = (res?.data || []).map(mapOrder);
        // Only swap in live data if there's actually some — otherwise keep the demo rows.
        if (active && real.length > 0) setOrders(real);
      })
      .catch(() => {
        /* keep demo data on error */
      });
    return () => {
      active = false;
    };
  }, []);

  const orderStatuses: FilterStatus[] = ['All', 'Paid', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];

  const getStatusStats = (status: OrderStatus) => {
    return orders.filter(o => o.status === status).length;
  };

  const handleView = (order: Order) => setViewOrder(order);

  // No dedicated edit form yet — open the same detail view.
  const handleEdit = (order: Order) => setViewOrder(order);

  const handleDelete = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  // Search across order number / customer name / email (status tabs handled in the table)
  const visibleOrders = orders.filter((o) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
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
                  ? 'bg-[#171717] text-white'
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
          <p className="text-2xl font-bold text-[#B87D4C] mt-1">{getStatusStats('Processing')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm font-medium">Shipping</p>
          <p className="text-2xl font-bold text-[#B87D4C] mt-1">{getStatusStats('Shipping')}</p>
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
        orders={visibleOrders}
        filterStatus={filterStatus}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Order ${viewOrder.orderNumber}` : 'Order'}
        type="success"
      >
        {viewOrder && (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-right">{viewOrder.customerName}</span>
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-right">{viewOrder.customerEmail}</span>
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-right">{viewOrder.status}</span>
              <span className="text-gray-500">Payment</span>
              <span className="font-medium text-right">{viewOrder.paymentStatus}</span>
              <span className="text-gray-500">Placed</span>
              <span className="font-medium text-right">{viewOrder.createdAt}</span>
              {viewOrder.trackingNumber && (
                <>
                  <span className="text-gray-500">Tracking</span>
                  <span className="font-medium text-right">{viewOrder.trackingNumber}</span>
                </>
              )}
            </div>
            <div className="border-t pt-3">
              <p className="font-semibold text-gray-800 mb-2">Items</p>
              <ul className="space-y-1">
                {viewOrder.items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.productType} · {it.printingType} × {it.quantity}</span>
                    <span className="font-medium">₹{it.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{viewOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Orders;
