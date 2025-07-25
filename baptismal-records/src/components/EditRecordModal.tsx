import React, { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, User, MapPin, Church, ChevronDown, UserPlus } from "lucide-react";
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

interface ParishStaff {
  id: number;
  name: string;
  title: string | null;
  role: string | null;
  active: boolean;
}

// Helper function to format dates for HTML date inputs
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  
  // If it's already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // If it's an ISO string, convert to YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  // Convert to YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

  // Parish Staff dropdown states
  const [parishStaff, setParishStaff] = useState<ParishStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<ParishStaff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newPriestName, setNewPriestName] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load parish staff when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchParishStaff();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowAddNew(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter staff based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStaff(parishStaff);
    } else {
      const filtered = parishStaff.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.title && staff.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, parishStaff]);

  // Populate form when record changes - FIXED TO FORMAT DATES
  useEffect(() => {
    if (record) {
      setFormData({
        childName: record.childName || "",
        fatherName: record.fatherName || "",
        motherName: record.motherName || "",
        birthDate: formatDateForInput(record.birthDate), // Format the date properly
        birthPlace: record.birthPlace || "",
        baptismDate: formatDateForInput(record.baptismDate), // Format the date properly
        priestName: record.priestName || "",
      });
      setErrors({});
    }
  }, [record]);

  const fetchParishStaff = async () => {
    try {
      setStaffLoading(true);
      const response = await invoke('get_parish_staff');
      const result = JSON.parse(response as string);
      
      if (result.success) {
        // Only show active staff members
        const activeStaff = result.staff.filter((staff: ParishStaff) => staff.active);
        setParishStaff(activeStaff);
        setFilteredStaff(activeStaff);
      } else {
        console.error("Failed to fetch parish staff:", result.error);
      }
    } catch (error) {
      console.error("Error fetching parish staff:", error);
    } finally {
      setStaffLoading(false);
    }
  };

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

  const handlePriestSelect = (staffMember: ParishStaff) => {
    const displayName = staffMember.title 
      ? `${staffMember.title} ${staffMember.name}`
      : staffMember.name;
      
    setFormData(prev => ({
      ...prev,
      priestName: displayName
    }));
    
    setIsDropdownOpen(false);
    setSearchTerm("");
    setShowAddNew(false);
    
    // Clear priest name error if it exists
    if (errors.priestName) {
      setErrors(prev => ({
        ...prev,
        priestName: ""
      }));
    }
  };

  const handleAddNewPriest = () => {
    if (newPriestName.trim()) {
      setFormData(prev => ({
        ...prev,
        priestName: newPriestName.trim()
      }));
      
      setIsDropdownOpen(false);
      setShowAddNew(false);
      setNewPriestName("");
      setSearchTerm("");
      
      // Clear priest name error if it exists
      if (errors.priestName) {
        setErrors(prev => ({
          ...prev,
          priestName: ""
        }));
      }
    }
  };

  const formatStaffDisplay = (staff: ParishStaff) => {
    if (staff.title) {
      return `${staff.title} ${staff.name}`;
    }
    return staff.name;
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

    // Get current user from localStorage (same way as Dashboard)
    const userData = localStorage.getItem("user");
    if (!userData) {
      setErrors({ submit: 'User session expired. Please log in again.' });
      return;
    }

    let currentUser;
    try {
      currentUser = JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setErrors({ submit: 'Invalid user session. Please log in again.' });
      return;
    }

    setLoading(true);

    try {
      const response = await invoke('update_baptism_record', {
        recordId: record.id,
        updatedData: {  // Changed to camelCase
          child_name: formData.childName.trim(),
          father_name: formData.fatherName.trim() || null,
          mother_name: formData.motherName.trim() || null,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace.trim(),
          baptism_date: formData.baptismDate,
          priest_name: formData.priestName.trim(),
        },
        updatedBy: currentUser.id  // Changed to camelCase
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
      setSearchTerm("");
      setNewPriestName("");
      setShowAddNew(false);
      setIsDropdownOpen(false);
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

              {/* Priest Name - Updated to use dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Church className="w-4 h-4 inline mr-2" />
                  Priest Name *
                </label>
                
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={staffLoading || loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between ${
                    errors.priestName ? "border-red-500" : "border-gray-300"
                  } ${staffLoading || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}`}
                >
                  <span className={formData.priestName ? "text-gray-900" : "text-gray-500"}>
                    {staffLoading 
                      ? "Loading parish staff..." 
                      : formData.priestName || "Select a priest"
                    }
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && !staffLoading && !loading && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search parish staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Staff List */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredStaff.length > 0 ? (
                        filteredStaff.map((staff) => (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => handlePriestSelect(staff)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {formatStaffDisplay(staff)}
                            </div>
                            {staff.role && (
                              <div className="text-xs text-gray-500 mt-1">{staff.role}</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {searchTerm ? "No staff found matching your search" : "No parish staff available"}
                        </div>
                      )}
                    </div>

                    {/* Add New Option */}
                    <div className="border-t border-gray-200 bg-gray-50">
                      {!showAddNew ? (
                        <button
                          type="button"
                          onClick={() => setShowAddNew(true)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center space-x-2 text-blue-600 transition-colors duration-150"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add new priest</span>
                        </button>
                      ) : (
                        <div className="p-3">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Enter priest name"
                              value={newPriestName}
                              onChange={(e) => setNewPriestName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddNewPriest();
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleAddNewPriest}
                              disabled={!newPriestName.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-150"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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