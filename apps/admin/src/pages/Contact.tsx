import React, { useState, useEffect } from 'react';
import { renderIcon } from '../utils/iconRenderer';
import {
  FiX,
  FiMessageSquare,
  FiMail,
  FiUser,
  FiCalendar
} from 'react-icons/fi';
import Layout from '../components/Layout';
import ContactTable from '../components/Tables/ContactTable';
import { apiService } from '../utils/api';
import { Contact } from '../types/models';

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await apiService.getAllContactsAdmin();
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact message?');
    if (confirmed) {
      try {
        await apiService.deleteContactAdmin(contactId);
        setContacts(contacts.filter(c => c._id !== contactId));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
      }
    }
  };

  const handleStatusChange = async (contactId: string, newStatus: 'new' | 'reviewed' | 'resolved') => {
    try {
      await apiService.updateContactStatusAdmin(contactId, newStatus);
      setContacts(contacts.map(c =>
        c._id === contactId ? { ...c, status: newStatus } : c
      ));
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Failed to update contact status');
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              {renderIcon(FiMessageSquare, { size: 24, color: 'white' })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
              <p className="text-gray-500 mt-1">Manage and respond to customer inquiries</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">New Messages</p>
            <p className="text-2xl font-bold text-blue-600">{contacts.filter(c => c.status === 'new').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Under Review</p>
            <p className="text-2xl font-bold text-purple-600">{contacts.filter(c => c.status === 'reviewed').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{contacts.filter(c => c.status === 'resolved').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="mb-6">
          <ContactTable
            contacts={contacts}
            onView={handleViewContact}
            onDelete={handleDeleteContact}
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {renderIcon(FiMessageSquare, { size: 24, color: 'white' })}
                Message Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                {renderIcon(FiX, { size: 24, color: 'white' })}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Status</span>
                <div className="flex gap-2">
                  {(['new', 'reviewed', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedContact._id, status)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        selectedContact.status === status
                          ? getStatusBadgeColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {renderIcon(FiUser, { size: 20, color: '#3B82F6' })}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedContact.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {renderIcon(FiMail, { size: 20, color: '#3B82F6' })}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedContact.email}</p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {renderIcon(FiCalendar, { size: 20, color: '#A855F7' })}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Date Submitted</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedContact.createdAt}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Subject</p>
                <p className="text-sm text-gray-900 font-semibold">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div className="pb-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Message</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDeleteContact(selectedContact._id);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ContactPage;
