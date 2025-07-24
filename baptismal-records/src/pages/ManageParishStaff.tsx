import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Users, Church, UserCheck } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import ToastNotification from "../components/ToastNotification";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
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

interface StaffModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  staff: ParishStaff | null;
}

export default function ManageParishStaff() {
  const [staff, setStaff] = useState<ParishStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState<ParishStaff[]>([]);
  
  // Modal states
  const [staffModal, setStaffModal] = useState<StaffModalState>({
    isOpen: false,
    mode: "create",
    staff: null
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; staff: ParishStaff | null }>({
    isOpen: false,
    staff: null
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    role: ""
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  
  // Toast states
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [updateToast, setUpdateToast] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  useEffect(() => {
    // Get current user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        if (parsedUser.role !== "SUPER_ADMIN") {
          // Redirect if not SUPER_ADMIN
          window.location.href = "/dashboard";
          return;
        }
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "/";
        return;
      }
    } else {
      window.location.href = "/";
      return;
    }

    fetchStaff();
  }, []);

  useEffect(() => {
    // Filter staff based on search term
    if (searchTerm.trim() === "") {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          (member.title && member.title.toLowerCase().includes(searchLower)) ||
          (member.role && member.role.toLowerCase().includes(searchLower))
        );
      });
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invoke('get_parish_staff');
      const result = JSON.parse(response as string);
      
      if (result.success) {
        setStaff(result.staff);
        console.log(`✅ Loaded ${result.count} parish staff members`);
      } else {
        throw new Error(result.error || "Failed to fetch parish staff");
      }
      
    } catch (err) {
      console.error("Error fetching parish staff:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch parish staff");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleAddNew = () => {
    setStaffModal({
      isOpen: true,
      mode: "create",
      staff: null
    });
    setFormData({ name: "", title: "", role: "" });
    setFormErrors({});
  };

  const handleEdit = (staffMember: ParishStaff) => {
    setStaffModal({
      isOpen: true,
      mode: "edit",
      staff: staffMember
    });
    setFormData({
      name: staffMember.name,
      title: staffMember.title || "",
      role: staffMember.role || ""
    });
    setFormErrors({});
  };

  const handleDelete = (staffMember: ParishStaff) => {
    setDeleteModal({ isOpen: true, staff: staffMember });
  };

  const confirmDelete = async () => {
    if (!deleteModal.staff) return;

    try {
      const response = await invoke('delete_parish_staff', {
        staffId: deleteModal.staff.id
      });

      const result = JSON.parse(response as string);

      if (result.success) {
        await fetchStaff(); // Refresh the list
        setDeleteToast(result.message);
        setTimeout(() => setDeleteToast(null), 4000);
      } else {
        throw new Error(result.error || "Failed to delete staff member");
      }
    } catch (err) {
      console.error("Error deleting staff member:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Failed to delete staff member"}`);
    } finally {
      setDeleteModal({ isOpen: false, staff: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, staff: null });
  };

  const handleModalClose = () => {
    if (!formLoading) {
      setStaffModal({ isOpen: false, mode: "create", staff: null });
      setFormData({ name: "", title: "", role: "" });
      setFormErrors({});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      // Add null check for currentUser
      if (!currentUser) {
        console.error("User session expired");
        setFormErrors({
          submit: "User session expired. Please refresh the page."
        });
        return;
      }

      setFormLoading(true);

      try {
        let response;
        
        if (staffModal.mode === "create") {
          response = await invoke('create_parish_staff', {
            name: formData.name.trim(),
            title: formData.title.trim() || null,
            role: formData.role.trim() || null,
            created_by: currentUser.id  // Now TypeScript knows currentUser is not null
          });
        } else {
          response = await invoke('update_parish_staff', {
            staffId: staffModal.staff!.id,
            name: formData.name.trim(),
            title: formData.title.trim() || null,
            role: formData.role.trim() || null,
            updated_by: currentUser.id
          });
        }

        const result = JSON.parse(response as string);

        if (result.success) {
          await fetchStaff(); // Refresh the list
          handleModalClose();
          
          if (staffModal.mode === "create") {
            setSuccessToast(`"${formData.name.trim()}" added successfully!`);
            setTimeout(() => setSuccessToast(null), 4000);
          } else {
            setUpdateToast(`"${formData.name.trim()}" updated successfully!`);
            setTimeout(() => setUpdateToast(null), 4000);
          }
        } else {
          throw new Error(result.error || "Failed to save staff member");
        }
      } catch (err) {
        console.error("Error saving staff member:", err);
        setFormErrors({
          submit: err instanceof Error ? err.message : "Failed to save staff member"
        });
      } finally {
        setFormLoading(false);
      }
    };

  const formatTitle = (title: string | null) => {
    return title || "—";
  };

  const formatRole = (role: string | null) => {
    return role || "—";
  };

  // Toast dismiss functions
  const dismissSuccessToast = () => setSuccessToast(null);
  const dismissUpdateToast = () => setUpdateToast(null);
  const dismissDeleteToast = () => setDeleteToast(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parish staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Parish Staff</h1>
                <p className="text-sm text-gray-500">Add and manage priests, deacons, and staff</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddNew}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
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
                  (e.target as HTMLButtonElement).style.backgroundColor = '#15803d';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
              <button
                onClick={handleBackToDashboard}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  padding: '8px 16px',
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
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Staff</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, title, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">Error loading parish staff</div>
              <div className="text-gray-500 text-sm">{error}</div>
              <button
                onClick={fetchStaff}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '16px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
              >
                Try Again
              </button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                  <p className="text-gray-500">No staff members match your search criteria.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first parish staff member.</p>
                  <button
                    onClick={handleAddNew}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#15803d';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Staff Member</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Title</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredStaff.map((staffMember) => (
                  <div key={staffMember.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name */}
                      <div className="col-span-4">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mr-3">
                            <Church className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{staffMember.name}</div>
                            <div className="text-sm text-gray-500">
                              Added {new Date(staffMember.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">{formatTitle(staffMember.title)}</div>
                      </div>

                      {/* Role */}
                      <div className="col-span-3">
                        <div className="text-sm text-gray-900">{formatRole(staffMember.role)}</div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staffMember.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {staffMember.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(staffMember)}
                            title="Edit Staff Member"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#2563eb',
                              border: 'none',
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(staffMember)}
                            title="Delete Staff Member"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#dc2626',
                              border: 'none',
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {filteredStaff.length} of {staff.length} staff members
                  {searchTerm && ` (filtered)`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        record={deleteModal.staff}
        recordType="staff"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Add/Edit Staff Modal */}
      {staffModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 transition-opacity"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={handleModalClose}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {staffModal.mode === "create" ? "Add Staff Member" : "Edit Staff Member"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {staffModal.mode === "create" ? "Add a new parish staff member" : "Update staff member information"}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Fr., Rev., Deacon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Pastor, Associate Pastor, Parish Administrator"
                    />
                  </div>
                </div>

                {formErrors.submit && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{formErrors.submit}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={formLoading}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: formLoading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!formLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{
                      backgroundColor: formLoading ? '#9ca3af' : '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: formLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!formLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#c2410c';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c';
                      }
                    }}
                  >
                    {formLoading ? (
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
                        <span>{staffModal.mode === "create" ? "Adding..." : "Updating..."}</span>
                      </>
                    ) : (
                      <>
                        {staffModal.mode === "create" ? <Plus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        <span>{staffModal.mode === "create" ? "Add Staff Member" : "Update Staff Member"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {successToast && (
        <ToastNotification
          message={successToast}
          type="success"
          onDismiss={dismissSuccessToast}
        />
      )}

      {updateToast && (
        <ToastNotification
          message={updateToast}
          type="update"
          onDismiss={dismissUpdateToast}
        />
      )}

      {deleteToast && (
        <ToastNotification
          message={deleteToast}
          type="delete"
          onDismiss={dismissDeleteToast}
        />
      )}

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
  );
}