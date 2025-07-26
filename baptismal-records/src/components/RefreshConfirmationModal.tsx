import React from 'react';
import { RefreshCw, CheckCircle, X, Database } from 'lucide-react';

interface RefreshConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RefreshConfirmationModal: React.FC<RefreshConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Database Restored</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              (e.target as HTMLButtonElement).style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#9ca3af';
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Import Successful!</h3>
              <p className="text-sm text-gray-600">Your database has been restored from the backup.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Refresh Required</span>
            </div>
            <p className="text-sm text-blue-700">
              To see the updated data throughout the application, we recommend refreshing the page.
            </p>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p><strong>What happens when you refresh:</strong></p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• All pages will show the restored data</li>
              <li>• Your current session will be maintained</li>
              <li>• Any unsaved changes will be lost</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={onConfirm}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              style={{ backgroundColor: '#2563EB' }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RefreshConfirmationModal;