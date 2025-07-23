import React, { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  childName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  birthPlace: string;
  baptismDate: string;
  priestName: string;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    childName: "",
    fatherName: "",
    motherName: "",
    birthDate: "",
    birthPlace: "",
    baptismDate: "",
    priestName: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required fields
    if (!formData.childName.trim()) {
      newErrors.childName = "Child's name is required";
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

    // At least one parent is required
    if (!formData.fatherName.trim() && !formData.motherName.trim()) {
      newErrors.fatherName = "At least one parent name is required";
      newErrors.motherName = "At least one parent name is required";
    }

    // Date validation
    if (formData.birthDate && formData.baptismDate) {
      const birthDate = new Date(formData.birthDate);
      const baptismDate = new Date(formData.baptismDate);
      
      if (baptismDate < birthDate) {
        newErrors.baptismDate = "Baptism date cannot be before birth date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user for createdBy field
      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User not found");
      }
      
      const user = JSON.parse(userData);
      
      // Call the Tauri command
      const response = await invoke('create_baptism_record', {
        childName: formData.childName.trim(),
        fatherName: formData.fatherName.trim() || null,
        motherName: formData.motherName.trim() || null,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace.trim(),
        baptismDate: formData.baptismDate,
        priestName: formData.priestName.trim(),
        createdBy: user.id,
      });

      // Parse the response
      const result = JSON.parse(response as string);
      
      if (result.success) {
        // Reset form
        setFormData({
          childName: "",
          fatherName: "",
          motherName: "",
          birthDate: "",
          birthPlace: "",
          baptismDate: "",
          priestName: "",
        });
        
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Failed to create record");
      }
      
    } catch (error) {
      console.error("Error creating record:", error);
      // TODO: Show error toast with the actual error message
      alert(`Error: ${error instanceof Error ? error.message : "Failed to create record"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

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
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Baptismal Record
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Child Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Child Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Full Name *
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.childName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter child's full name"
                  />
                  {errors.childName && (
                    <p className="mt-1 text-sm text-red-600">{errors.childName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Place *
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthPlace ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter birth place"
                  />
                  {errors.birthPlace && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthPlace}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baptism Date *
                  </label>
                  <input
                    type="date"
                    name="baptismDate"
                    value={formData.baptismDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.baptismDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.baptismDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.baptismDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parents Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Parents Information
              </h3>
              <p className="text-sm text-gray-600">
                At least one parent name is required
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Full Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fatherName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter father's full name"
                  />
                  {errors.fatherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Full Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.motherName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter mother's full name"
                  />
                  {errors.motherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.motherName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Priest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Church Official
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Officiating Priest's Name *
                </label>
                <input
                  type="text"
                  name="priestName"
                  value={formData.priestName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.priestName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter priest's full name"
                />
                {errors.priestName && (
                  <p className="mt-1 text-sm text-red-600">{errors.priestName}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? '0.5' : '1'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#2563eb',
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
                  gap: '8px',
                  opacity: isSubmitting ? '0.5' : '1'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {isSubmitting ? (
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Inline styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default AddRecordModal;