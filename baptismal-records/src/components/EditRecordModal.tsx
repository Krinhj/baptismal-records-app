import React, { useState, useEffect } from "react";
import { X, Save, Calendar, User, MapPin, Church } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

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

interface EditRecordModalProps {
  isOpen: boolean;
  record: BaptismRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  record,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    childName: "",
    fatherName: "",
    motherName: "",
    birthDate: "",
    birthPlace: "",
    baptismDate: "",
    priestName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        childName: record.childName || "",
        fatherName: record.fatherName || "",
        motherName: record.motherName || "",
        birthDate: record.birthDate || "",
        birthPlace: record.birthPlace || "",
        baptismDate: record.baptismDate || "",
        priestName: record.priestName || "",
      });
      setErrors({});
    }
  }, [record]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.childName.trim()) {
      newErrors.childName = "Child name is required";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }
    if (!formData.birthPlace.trim()) {
      newErrors.birthPlace = "Birth place is required";
    }
    if (!formData.baptismDate) {
      newErrors.baptismDate = "Baptism date is required";
    }
    if (!formData.priestName.trim()) {
      newErrors.priestName = "Priest name is required";
    }

    // Validate that baptism date is after birth date
    if (formData.birthDate && formData.baptismDate) {
      const birthDate = new Date(formData.birthDate);
      const baptismDate = new Date(formData.baptismDate);
      if (baptismDate < birthDate) {
        newErrors.baptismDate = "Baptism date must be after birth date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !record) {
      return;
    }

    setLoading(true);

    try {
      const response = await invoke('update_baptism_record', {
        recordId: record.id,
        updatedData: {
          child_name: formData.childName.trim(),
          father_name: formData.fatherName.trim() || null,
          mother_name: formData.motherName.trim() || null,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace.trim(),
          baptism_date: formData.baptismDate,
          priest_name: formData.priestName.trim(),
        }
      });

      const result = JSON.parse(response as string);

      if (result.success) {
        console.log("✅ Record updated successfully:", result.record);
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Failed to update record");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to update record"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        childName: "",
        fatherName: "",
        motherName: "",
        birthDate: "",
        birthPlace: "",
        baptismDate: "",
        priestName: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Baptismal Record
                </h2>
                <p className="text-sm text-gray-500">
                  Update the baptismal record information
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  (e.target as HTMLButtonElement).style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLButtonElement).style.color = '#6b7280';
                }
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Child Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Child's Full Name *
                </label>
                <input
                  type="text"
                  name="childName"
                  value={formData.childName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.childName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter child's full name"
                />
                {errors.childName && (
                  <p className="mt-1 text-sm text-red-600">{errors.childName}</p>
                )}
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father's name"
                />
              </div>

              {/* Mother Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mother's name"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                )}
              </div>

              {/* Birth Place */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Birth Place *
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.birthPlace ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter birth place"
                />
                {errors.birthPlace && (
                  <p className="mt-1 text-sm text-red-600">{errors.birthPlace}</p>
                )}
              </div>

              {/* Baptism Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Baptism Date *
                </label>
                <input
                  type="date"
                  name="baptismDate"
                  value={formData.baptismDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.baptismDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.baptismDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.baptismDate}</p>
                )}
              </div>

              {/* Priest Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Church className="w-4 h-4 inline mr-2" />
                  Priest Name *
                </label>
                <input
                  type="text"
                  name="priestName"
                  value={formData.priestName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.priestName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter priest's name"
                />
                {errors.priestName && (
                  <p className="mt-1 text-sm text-red-600">{errors.priestName}</p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Record</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading spinner animation */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
          }} />
        </div>
      </div>
    </div>
  );
};

export default EditRecordModal;