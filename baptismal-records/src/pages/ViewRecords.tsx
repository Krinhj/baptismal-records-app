import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Edit2, Trash2, Users, Calendar, MapPin } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import AddRecordModal from "../components/AddRecordModal";
import EditRecordModal from "../components/EditRecordModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import ToastNotification from "../components/ToastNotification";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

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

export default function ViewRecords() {
  const [records, setRecords] = useState<BaptismRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BaptismRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [updateToast, setUpdateToast] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; record: BaptismRecord | null }>({
    isOpen: false,
    record: null
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: BaptismRecord | null }>({
    isOpen: false,
    record: null
  });

  useEffect(() => {
    // Get current user data from localStorage (following Dashboard pattern)
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }

    fetchRecords();
  }, []);

  useEffect(() => {
    // Filter records based on search term
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record => {
        const searchLower = searchTerm.toLowerCase();
        const parents = [record.fatherName, record.motherName].filter(Boolean).join(" and ");
        
        return (
          record.childName.toLowerCase().includes(searchLower) ||
          record.priestName.toLowerCase().includes(searchLower) ||
          parents.toLowerCase().includes(searchLower) ||
          record.birthPlace.toLowerCase().includes(searchLower) ||
          formatDate(record.baptismDate).toLowerCase().includes(searchLower) ||
          formatDate(record.birthDate).toLowerCase().includes(searchLower)
        );
      });
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invoke('get_baptism_records');
      const result = JSON.parse(response as string);
      
      if (result.success) {
        setRecords(result.records);
        console.log(`✅ Loaded ${result.count} records from database`);
      } else {
        throw new Error(result.error || "Failed to fetch records");
      }
      
    } catch (err) {
      console.error("Error fetching records:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (record: BaptismRecord) => {
    setEditModal({ isOpen: true, record });
  };

  const handleDelete = async (record: BaptismRecord) => {
    if (!currentUser) {
      alert("User session not found. Please log in again.");
      return;
    }

    if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN") {
      alert("Access denied. Only administrators can delete records.");
      return;
    }

    // Open the delete confirmation modal
    setDeleteModal({ isOpen: true, record });
  };

  const confirmDelete = async () => {
    if (!deleteModal.record || !currentUser) return;

    try {
      const response = await invoke('delete_baptism_record', {
        recordId: deleteModal.record.id,
        deletedBy: currentUser.id
      });

      const result = JSON.parse(response as string);

      if (result.success) {
        setRecords(prev => prev.filter(r => r.id !== deleteModal.record!.id));
        setDeleteToast(`Record for ${deleteModal.record.childName} deleted successfully`);
        setTimeout(() => {
          setDeleteToast(null);
        }, 4000);
        console.log("✅ Record deleted:", result.deletedRecord);
      } else {
        throw new Error(result.error || "Failed to delete record");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete record";
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteModal({ isOpen: false, record: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, record: null });
  };

  const handleBackToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRecordSuccess = () => {
    setSuccessToast("Baptismal record created successfully!");
    fetchRecords();
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleEditSuccess = () => {
    setUpdateToast("Baptismal record updated successfully!");
    fetchRecords();
    setTimeout(() => {
      setUpdateToast(null);
    }, 4000);
  };

  const dismissSuccessToast = () => {
    setSuccessToast(null);
  };

  const dismissDeleteToast = () => {
    setDeleteToast(null);
  };

  const dismissUpdateToast = () => {
    setUpdateToast(null);
  };

  const handleAddNewRecord = () => {
    setIsModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModal({ isOpen: false, record: null });
  };

  // Check if current user can delete records (INSIDE component, after all state and functions)
  const canDelete = currentUser && (currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading records...</p>
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
            {/* Left side - Title and subtitle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Baptismal Records</h1>
                <p className="text-sm text-gray-500">Manage church baptismal records</p>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddNewRecord}
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
                <span>Add New Record</span>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Records</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, date, or priest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">Error loading records</div>
              <div className="text-gray-500 text-sm">{error}</div>
              <button
                onClick={fetchRecords}
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
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                  <p className="text-gray-500">No records match your search criteria.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first baptismal record.</p>
                  <button
                    onClick={handleAddNewRecord}
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
                    <span>Add First Record</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Full Name</div>
                  <div className="col-span-2">Baptism Date</div>
                  <div className="col-span-2">Priest Name</div>
                  <div className="col-span-3">Parents</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Full Name */}
                      <div className="col-span-3">
                        <div className="font-medium text-gray-900">{record.childName}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {record.birthPlace}
                        </div>
                      </div>

                      {/* Baptism Date */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">{formatDate(record.baptismDate)}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Born: {formatDate(record.birthDate)}
                        </div>
                      </div>

                      {/* Priest Name */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">{record.priestName}</div>
                      </div>

                      {/* Parents */}
                      <div className="col-span-3">
                        <div className="text-sm text-gray-900">{formatParents(record.fatherName, record.motherName)}</div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            title="Edit Record"
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
                          
                          {/* Only show delete button for SUPER_ADMIN and ADMIN - hide completely for USER */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(record)}
                              title="Delete Record"
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {filteredRecords.length} of {records.length} records
                  {searchTerm && ` (filtered)`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        isOpen={editModal.isOpen}
        record={editModal.record}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        record={deleteModal.record}
        recordType="baptism"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleRecordSuccess}
      />

      {/* Toast Notifications */}
      {deleteToast && (
        <ToastNotification
          message={deleteToast}
          type="delete"
          onDismiss={dismissDeleteToast}
        />
      )}

      {updateToast && (
        <ToastNotification
          message={updateToast}
          type="update"
          onDismiss={dismissUpdateToast}
        />
      )}

      {successToast && (
        <ToastNotification
          message={successToast}
          type="success"
          onDismiss={dismissSuccessToast}
        />
      )}

      {/* Inline styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progressBar {
            from { width: 100%; }
            to { width: 0%; }
          }
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  );
}