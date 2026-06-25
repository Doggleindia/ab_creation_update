import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { Contact } from '../../types/models';
import Pagination from '../Pagination';

interface ContactTableProps {
  contacts: Contact[];
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onView,
  onEdit,
  onDelete
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? contacts.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedContacts = useMemo(() => contacts.slice(startIndex, endIndex), [contacts, startIndex, endIndex]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-[#E8E6E3] text-[#B87D4C]';
      case 'reviewed':
        return 'bg-[#E8E6E3] text-[#B87D4C]';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-base">No contact messages found</p>
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedContacts.map((contact) => (
              <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-600">{contact.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 max-w-xs truncate">{contact.subject}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                    {contact.status ? contact.status.charAt(0).toUpperCase() + contact.status.slice(1) : 'New'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">{contact.createdAt}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(contact)}
                        className="p-2 hover:bg-[#F5F1EA] text-[#B87D4C] rounded-lg transition-colors"
                        title="View details"
                      >
                        {renderIcon(FiEye, { size: 18 })}
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(contact)}
                        className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        {renderIcon(FiEdit2, { size: 18 })}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(contact._id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {renderIcon(FiTrash2, { size: 18 })}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={contacts.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="contacts"
      />
    </div>
  );
};

export default ContactTable;
