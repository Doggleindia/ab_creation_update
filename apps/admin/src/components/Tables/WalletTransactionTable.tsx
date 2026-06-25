import React, { useMemo, useState } from 'react';
import { FiArrowUpCircle, FiArrowDownCircle, FiRotateCcw } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { WalletTransaction } from '../../types/models';
import Pagination from '../Pagination';

interface WalletTransactionTableProps {
  transactions: WalletTransaction[];
}

const WalletTransactionTable: React.FC<WalletTransactionTableProps> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? transactions.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedTransactions = useMemo(() => transactions.slice(startIndex, endIndex), [transactions, startIndex, endIndex]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Credit':
        return renderIcon(FiArrowDownCircle, { size: 18, color: '#10B981' });
      case 'Debit':
        return renderIcon(FiArrowUpCircle, { size: 18, color: '#EF4444' });
      case 'Refund':
        return renderIcon(FiRotateCcw, { size: 18, color: '#F59E0B' });
      case 'Withdrawal':
        return renderIcon(FiArrowUpCircle, { size: 18, color: '#B87D4C' });
      default:
        return renderIcon(FiArrowDownCircle, { size: 18, color: '#6B7280' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Credit':
        return 'bg-green-100 text-green-800';
      case 'Debit':
        return 'bg-red-100 text-red-800';
      case 'Refund':
        return 'bg-amber-100 text-amber-800';
      case 'Withdrawal':
        return 'bg-[#E8E6E3] text-[#B87D4C]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Failed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'Credit':
      case 'Refund':
        return 'text-green-600 font-semibold';
      case 'Debit':
      case 'Withdrawal':
        return 'text-red-600 font-semibold';
      default:
        return 'text-gray-900 font-semibold';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-base">No transactions found</p>
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.userName}</p>
                    <p className="text-xs text-gray-500">{transaction.userId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-gray-700">{transaction.description}</p>
                    {transaction.reference && (
                      <p className="text-xs text-gray-500 mt-1">Ref: {transaction.reference}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className={`text-sm ${getAmountColor(transaction.type)}`}>
                    {transaction.type === 'Debit' || transaction.type === 'Withdrawal' ? '-' : '+'}
                    ${transaction.amount.toLocaleString()}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">{transaction.createdAt}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={transactions.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="transactions"
      />
    </div>
  );
};

export default WalletTransactionTable;
