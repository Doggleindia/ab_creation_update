import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { Order, OrderStatus } from '../../types/models';
import Pagination from '../Pagination';

interface OrdersTableProps {
  orders: Order[];
  filterStatus?: OrderStatus | 'All';
  onView?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  filterStatus = 'All',
  onView,
  onEdit,
  onDelete
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter orders
  const filteredOrders =
    filterStatus && filterStatus !== 'All'
      ? orders.filter(order => order.status === filterStatus)
      : orders;

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? filteredOrders.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedOrders = useMemo(() => filteredOrders.slice(startIndex, endIndex), [filteredOrders, startIndex, endIndex]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-[#E8E6E3] text-[#B87D4C]';
      case 'Shipping':
        return 'bg-[#E8E6E3] text-[#B87D4C]';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-base">
          {filterStatus && filterStatus !== 'All'
            ? `No ${filterStatus.toLowerCase()} orders found`
            : 'No orders found'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {order.items.map((item, idx) => (
                      <p key={idx}>
                        {item.quantity}x {item.productType} ({item.printingType})
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-semibold text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-600">{order.createdAt}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView && onView(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View order details"
                    >
                      {renderIcon(FiEye, { size: 18 })}
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(order)}
                      className="p-2 text-[#B87D4C] hover:bg-[#F5F1EA] rounded-lg transition-colors"
                      title="Edit order"
                    >
                      {renderIcon(FiEdit2, { size: 18 })}
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(order.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete order"
                    >
                      {renderIcon(FiTrash2, { size: 18 })}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={filteredOrders.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="orders"
      />
    </div>
  );
};

export default OrdersTable;
