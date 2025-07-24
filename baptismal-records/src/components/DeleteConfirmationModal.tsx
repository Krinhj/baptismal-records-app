import React from "react";
import { Trash2 } from "lucide-react";

interface BaptismRecord {
  id: number;
  childName: string;
  fatherName: string | null;
  motherName: string | null;
  birthDate: string;
  birthPlace: string;
  baptismDate: string;
  priestName: string;
  createdAt: string;
  updatedAt: string;
}

interface ParishStaff {
  id: number;
  name: string;
  title: string | null;
  role: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  record: BaptismRecord | ParishStaff | null;
  recordType: "baptism" | "staff";
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  record,
  recordType,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatParents = (fatherName: string | null, motherName: string | null) => {
    const parents = [fatherName, motherName].filter(Boolean);
    return parents.length > 0 ? parents.join(" and ") : "Not provided";
  };

  const renderBaptismRecord = (baptismRecord: BaptismRecord) => (
    <>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete this baptismal record? This action cannot be undone.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Child:</span>
          <span className="text-gray-900">{baptismRecord.childName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Baptism Date:</span>
          <span className="text-gray-900">{formatDate(baptismRecord.baptismDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Priest:</span>
          <span className="text-gray-900">{baptismRecord.priestName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Parents:</span>
          <span className="text-gray-900">{formatParents(baptismRecord.fatherName, baptismRecord.motherName)}</span>
        </div>
      </div>
    </>
  );

  const renderParishStaff = (staffMember: ParishStaff) => (
    <>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete this parish staff member?
      </p>
      <p className="text-sm text-amber-600 mb-4">
        <strong>Note:</strong> If this person is referenced in baptism records, they will be deactivated instead of deleted to maintain data integrity.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Name:</span>
          <span className="text-gray-900">{staffMember.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Title:</span>
          <span className="text-gray-900">{staffMember.title || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Role:</span>
          <span className="text-gray-900">{staffMember.role || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Status:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            staffMember.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {staffMember.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </>
  );

  const getTitle = () => {
    return recordType === "baptism" ? "Delete Baptismal Record" : "Delete Parish Staff Member";
  };

  const getButtonText = () => {
    return recordType === "baptism" ? "Delete Record" : "Delete Staff Member";
  };

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
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getTitle()}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {recordType === "baptism" 
              ? renderBaptismRecord(record as BaptismRecord)
              : renderParishStaff(record as ParishStaff)
            }
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>{getButtonText()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;