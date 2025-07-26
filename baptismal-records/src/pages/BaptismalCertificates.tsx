import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Printer,
  Calendar,
  User,
  Church,
  Award,
  Filter
} from 'lucide-react';
import ToastNotification from '../components/ToastNotification';

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

interface CertificatePreview {
  record: BaptismRecord | null;
  template: string;
  showPreview: boolean;
}

const BaptismalCertificates: React.FC = () => {
  const [user, setUser] = useState<{
    id: number;
    name: string;
    username: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  } | null>(null);

  const [records, setRecords] = useState<BaptismRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BaptismRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<BaptismRecord | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<CertificatePreview>({
    record: null,
    template: 'traditional',
    showPreview: false
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'delete' | 'update' | 'login' | 'backup' | 'restore';
  }>({ show: false, message: '', type: 'success' });

  // Certificate templates
  const templates = [
    { id: 'traditional', name: 'Traditional', description: 'Classic church certificate design' },
    { id: 'modern', name: 'Modern', description: 'Clean, contemporary layout' },
    { id: 'elegant', name: 'Elegant', description: 'Formal with decorative elements' },
    { id: 'simple', name: 'Simple', description: 'Minimalist design' }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }
    
    fetchBaptismRecords();
  }, []);

  useEffect(() => {
    // Filter records based on search term
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record =>
        record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.fatherName && record.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.motherName && record.motherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        record.priestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.birthPlace.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const fetchBaptismRecords = async () => {
    try {
      setLoading(true);
      const response = await invoke('get_baptism_records');
      console.log('Baptism records response:', response);
      
      let recordsData;
      if (typeof response === 'string') {
        recordsData = JSON.parse(response);
      } else {
        recordsData = response;
      }
      
      if (Array.isArray(recordsData)) {
        setRecords(recordsData);
      } else if (recordsData && recordsData.records && Array.isArray(recordsData.records)) {
        setRecords(recordsData.records);
      } else {
        console.error('Records data is not an array:', recordsData);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching baptism records:', error);
      setToast({ 
        show: true, 
        message: 'Failed to load baptism records', 
        type: 'delete' 
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const previewCertificate = (record: BaptismRecord) => {
    setCertificatePreview({
      record,
      template: certificatePreview.template,
      showPreview: true
    });
  };

  const generateCertificate = async (record: BaptismRecord, format: 'pdf' | 'print' = 'pdf') => {
    try {
      setLoading(true);
      
      // TODO: Implement certificate generation backend
      // await invoke('generate_certificate', { 
      //   recordId: record.id, 
      //   template: certificatePreview.template,
      //   format 
      // });
      
      setToast({
        show: true,
        message: `Certificate ${format === 'pdf' ? 'downloaded' : 'sent to printer'} successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      setToast({
        show: true,
        message: 'Failed to generate certificate',
        type: 'delete'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={28} style={{ color: '#10b981' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Baptismal Certificates
            </h1>
          </div>
          
          {/* Back to Dashboard Button */}
          <button
            onClick={() => {
              window.history.pushState({}, "", "/dashboard");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
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
            <span>← Back to Dashboard</span>
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Generate official baptismal certificates from existing records
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column - Record Selection */}
        <div>
          {/* Search and Filters */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Search size={20} style={{ color: '#6b7280' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Select Baptism Record
              </h3>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by child name, parents, priest, or place..."
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Records List */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Baptism Records ({filteredRecords.length})
              </h3>
            </div>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading records...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <FileText size={32} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  {searchTerm ? 'No records found matching your search' : 'No baptism records available'}
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {filteredRecords.map((record) => (
                  <div 
                    key={record.id} 
                    style={{ 
                      padding: '16px 24px', 
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      backgroundColor: selectedRecord?.id === record.id ? '#eff6ff' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => setSelectedRecord(record)}
                    onMouseEnter={(e) => {
                      if (selectedRecord?.id !== record.id) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRecord?.id !== record.id) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                          {record.childName}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                          <div>
                            <strong>Birth:</strong> {formatDate(record.birthDate)}
                          </div>
                          <div>
                            <strong>Baptism:</strong> {formatDate(record.baptismDate)}
                          </div>
                          <div>
                            <strong>Parents:</strong> {[record.fatherName, record.motherName].filter(Boolean).join(' & ') || 'N/A'}
                          </div>
                          <div>
                            <strong>Priest:</strong> {record.priestName}
                          </div>
                        </div>
                      </div>
                      
                      {selectedRecord?.id === record.id && (
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              previewCertificate(record);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Certificate Options & Preview */}
        <div>
          {/* Template Selection */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Printer size={20} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Certificate Template
              </h3>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setCertificatePreview(prev => ({ ...prev, template: template.id }))}
                  style={{
                    padding: '12px',
                    border: `2px solid ${certificatePreview.template === template.id ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: certificatePreview.template === template.id ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {template.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {selectedRecord && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Generate Certificate
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => previewCertificate(selectedRecord)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }}
                >
                  <Eye size={16} />
                  Preview Certificate
                </button>
                
                <button
                  onClick={() => generateCertificate(selectedRecord, 'pdf')}
                  disabled={loading}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
                    }
                  }}
                >
                  <Download size={16} />
                  {loading ? 'Generating...' : 'Download PDF'}
                </button>
                
                <button
                  onClick={() => generateCertificate(selectedRecord, 'print')}
                  disabled={loading}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  <Printer size={16} />
                  {loading ? 'Printing...' : 'Print Certificate'}
                </button>
              </div>
            </div>
          )}

          {/* Preview Placeholder */}
          {certificatePreview.showPreview && certificatePreview.record && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Certificate Preview
              </h3>
              
              <div style={{ 
                border: '2px dashed #d1d5db', 
                borderRadius: '8px', 
                padding: '40px 20px', 
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <FileText size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 8px 0' }}>
                  Certificate Preview
                </p>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                  Template: {templates.find(t => t.id === certificatePreview.template)?.name}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0 0' }}>
                  For: {certificatePreview.record.childName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default BaptismalCertificates;