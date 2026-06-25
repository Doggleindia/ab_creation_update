import React, { useState } from 'react';
import { renderIcon } from '../utils/iconRenderer';
import {
  FiX,
  FiBriefcase,
  FiDollarSign,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiPlus,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiHome
} from 'react-icons/fi';
import Layout from '../components/Layout';
import WalletTransactionTable from '../components/Tables/WalletTransactionTable';
import { dummyWallet } from '../utils/dummyData';
import { WalletAccount } from '../types/models';

interface AddFundsFormData {
  amount: string;
  bankAccount: string;
  accountHolder: string;
  description: string;
}

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletAccount>(dummyWallet);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddFundsFormData>({
    amount: '',
    bankAccount: '',
    accountHolder: '',
    description: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.bankAccount || !formData.accountHolder) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');

    setTimeout(() => {
      const newTransaction = {
        id: `txn-${Date.now()}`,
        userId: 'admin-001',
        userName: 'Admin Account',
        type: 'Credit' as const,
        status: 'Pending' as const,
        amount: parseFloat(formData.amount),
        description: `Bank transfer - ${formData.description || 'Added funds to wallet'}`,
        createdAt: new Date().toISOString().split('T')[0],
        reference: `BANK-${Date.now()}`
      };

      setWallet(prev => ({
        ...prev,
        totalCredit: prev.totalCredit + parseFloat(formData.amount),
        currentBalance: prev.currentBalance + parseFloat(formData.amount),
        transactions: [newTransaction, ...prev.transactions],
        lastUpdated: new Date().toISOString().split('T')[0]
      }));

      setSubmitStatus('success');
      setFormData({ amount: '', bankAccount: '', accountHolder: '', description: '' });

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
      }, 2000);
    }, 1500);
  };

  const creditPercentage = (wallet.totalCredit / (wallet.totalCredit + wallet.totalDebit)) * 100;
  const debitPercentage = (wallet.totalDebit / (wallet.totalCredit + wallet.totalDebit)) * 100;

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] rounded-lg">
              {renderIcon(FiBriefcase, { size: 32, color: 'white' })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Wallet</h1>
              <p className="text-gray-500 mt-1">Manage your account balance and transactions</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-semibold"
          >
            {renderIcon(FiPlus, { size: 20 })}
            Add Funds
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#B87D4C]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-600 font-semibold uppercase mb-0.5">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-[#B87D4C]">
                  ${wallet.currentBalance.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Updated: {wallet.lastUpdated}
                </p>
              </div>
              <div className="p-2 bg-[#E8E6E3] rounded-full">
                {renderIcon(FiBriefcase, { size: 22, color: "#B87D4C" })}
              </div>
            </div>
          </div>

          {/* Total Credits */}
          <div className="bg-gradient-to-br from-[#F5F1EA] to-[#F5F1EA] rounded-md shadow-sm p-4 border-l-2 border-[#B87D4C]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-600 font-semibold uppercase mb-0.5">
                  Total Credits
                </p>
                <p className="text-2xl font-bold text-[#B87D4C]">
                  ${wallet.totalCredit.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {wallet.transactions.filter(t => t.type === "Credit").length} txns
                </p>
              </div>
              <div className="p-2 bg-[#E8E6E3] rounded-full">
                {renderIcon(FiArrowDownCircle, { size: 22, color: "#B87D4C" })}
              </div>
            </div>
          </div>

          {/* Total Debits */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-md shadow-sm p-4 border-l-2 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-600 font-semibold uppercase mb-0.5">
                  Total Debits
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${wallet.totalDebit.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {wallet.transactions.filter(t => t.type === "Debit").length} txns
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                {renderIcon(FiArrowUpCircle, { size: 22, color: "#EF4444" })}
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Wallet Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Credits</span>
                <span className="font-semibold text-[#B87D4C]">
                  ${wallet.totalCredit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Debits</span>
                <span className="font-semibold text-red-600">
                  -${wallet.totalDebit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between bg-[#F5F1EA] p-2 rounded border border-[#E8E6E3] text-sm">
                <span className="font-semibold">Net Balance</span>
                <span className="font-bold text-[#B87D4C]">
                  ${wallet.currentBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Balance Distribution
            </h3>

            <div className="space-y-4">
              {/* Credit */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Credits</span>
                  <span className="font-semibold">
                    {creditPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-[#B87D4C] rounded-full"
                    style={{ width: `${creditPercentage}%` }}
                  />
                </div>
              </div>

              {/* Debit */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Debits</span>
                  <span className="font-semibold">
                    {debitPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${debitPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Recent Transactions
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Wallet activity history
          </p>
          <WalletTransactionTable transactions={wallet.transactions} />
        </div>

      </div>

      {/* Add Funds Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#CBAA75] to-[#B87D4C] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {renderIcon(FiPlus, { size: 24, color: 'white' })}
                Add Funds to Wallet
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmitStatus('idle');
                  setFormData({ amount: '', bankAccount: '', accountHolder: '', description: '' });
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                {renderIcon(FiX, { size: 24, color: 'white' })}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    {renderIcon(FiCheckCircle, { size: 32, color: '#10B981' })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Processing</h3>
                  <p className="text-gray-600">Your bank transfer has been initiated successfully. Funds will be credited to your wallet within 1-2 business days.</p>
                </div>
              ) : submitStatus === 'error' && (formData.amount === '' || formData.bankAccount === '' || formData.accountHolder === '') ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    {renderIcon(FiAlertCircle, { size: 32, color: '#EF4444' })}
                  </div>
                  <p className="text-red-600 font-semibold">Please fill in all required fields</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {renderIcon(FiDollarSign, { size: 16 })} Amount to Add
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
                        step="100"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Bank Account Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {renderIcon(FiHome, { size: 16 })} Select Bank Account
                    </label>
                    <select
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
                      required
                    >
                      <option value="">-- Choose Bank Account --</option>
                      <option value="acc-1">Chase Bank - 1234</option>
                      <option value="acc-2">Bank of America - 5678</option>
                      <option value="acc-3">Wells Fargo - 9012</option>
                      <option value="acc-4">Add New Account</option>
                    </select>
                  </div>

                  {/* Account Holder */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {renderIcon(FiCreditCard, { size: 16 })} Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      placeholder="Enter account holder name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter transaction description or notes"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Transaction Summary</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Amount to transfer:</span>
                      <span className="text-lg font-bold text-[#B87D4C]">
                        ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Info Message */}
                  <div className="bg-[#F5F1EA] border border-[#E8E6E3] rounded-lg p-4">
                    <p className="text-xs text-[#B87D4C]">
                      <strong>Note:</strong> Bank transfers typically process within 1-2 business days. You will receive a confirmation email once the transaction is complete.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {submitStatus !== 'success' && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmitStatus('idle');
                    setFormData({ amount: '', bankAccount: '', accountHolder: '', description: '' });
                  }}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitStatus === 'loading'}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#171717] rounded-lg hover:bg-[#B87D4C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitStatus === 'loading' ? 'Processing...' : 'Transfer Funds'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WalletPage;
