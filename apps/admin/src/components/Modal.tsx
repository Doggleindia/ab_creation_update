import React from 'react';
import { FiX } from 'react-icons/fi';
import { renderIcon } from '../utils/iconRenderer';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'success' | 'error';
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h2 className={`text-lg font-bold ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{title}</h2>}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {renderIcon(FiX, { size: 20 })}
          </button>
        </div>
        <div className="p-4">
          {message ? (
            <p className={`text-sm ${type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
              {message}
            </p>
          ) : (
            children
          )}
        </div>
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

export {};
