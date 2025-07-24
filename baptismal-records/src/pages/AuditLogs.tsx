import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import { Search, Filter, Eye, AlertCircle, Clock, FileText, ArrowLeft } from 'lucide-react';
import ToastNotification from '../components/ToastNotification';

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  tableName: string;
  recordId: number | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  createdAt: string;
  performer: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
}

interface FilterState {
  userId: string;
  action: string;
  tableName: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [users, setUsers] = useState<Array<{id: number; name: string; username: string}>>([]);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'update' | 'delete'} | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    userId: '',
    action: '',
    tableName: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const tables = ['BaptismRecord', 'ParishStaff', 'User'];

  useEffect(() => {
    fetchAuditLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await invoke('get_audit_logs');
      console.log('Audit logs response:', response); // Debug log
      
      // Parse the response if it's a string
      let logsData;
      if (typeof response === 'string') {
        logsData = JSON.parse(response);
      } else {
        logsData = response;
      }
      
      // Ensure we have an array
      if (Array.isArray(logsData)) {
        setLogs(logsData);
      } else if (logsData && logsData.logs && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs);
      } else {
        console.error('Logs data is not an array:', logsData);
        setLogs([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setToast({ message: 'Failed to load audit logs', type: 'delete' });
      setLogs([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await invoke('get_all_users');
      console.log('Users response:', response); // Debug log
      
      // Parse the response if it's a string
      let userData;
      if (typeof response === 'string') {
        userData = JSON.parse(response);
      } else {
        userData = response;
      }
      
      // Ensure we have an array
      if (Array.isArray(userData)) {
        setUsers(userData);
      } else if (userData && userData.users && Array.isArray(userData.users)) {
        setUsers(userData.users);
      } else {
        console.error('Users data is not an array:', userData);
        setUsers([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array as fallback
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId.toString() === filters.userId);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.tableName) {
      filtered = filtered.filter(log => log.tableName === filters.tableName);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.createdAt) <= endDate);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.performer.name.toLowerCase().includes(searchLower) ||
        log.performer.username.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.tableName.toLowerCase().includes(searchLower) ||
        (log.notes && log.notes.toLowerCase().includes(searchLower)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(searchLower))
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      tableName: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const handleBackToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'CREATE': 
        return { color: '#16a34a', backgroundColor: '#f0fdf4' };
      case 'UPDATE': 
        return { color: '#2563eb', backgroundColor: '#eff6ff' };
      case 'DELETE': 
        return { color: '#dc2626', backgroundColor: '#fef2f2' };
      case 'LOGIN': 
        return { color: '#9333ea', backgroundColor: '#faf5ff' };
      case 'LOGOUT': 
        return { color: '#4b5563', backgroundColor: '#f9fafb' };
      default: 
        return { color: '#4b5563', backgroundColor: '#f9fafb' };
    }
  };

  const formatJsonValues = (jsonString: string | null) => {
    if (!jsonString) return 'N/A';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AlertCircle size={28} style={{ color: '#ef4444' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            System Audit Logs
          </h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Debug feature for SUPER_ADMIN - Monitor all system activities and user actions
        </p>

            <div className="flex items-center space-x-3">
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

      {/* Filters Section */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Filter size={20} style={{ color: '#6b7280' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Filters</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Search
            </label>
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
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search logs..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              User
            </label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id.toString()}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Table Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Table
            </label>
            <select
              value={filters.tableName}
              onChange={(e) => handleFilterChange('tableName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Tables</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredLogs.length} of {logs.length} audit logs
          </span>
        </div>
        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Audit Logs Table */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Clock size={32} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No audit logs found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    Timestamp
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    User
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    Action
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    Table
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    Record ID
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    IP Address
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actionStyles = getActionStyles(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{log.performer.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>@{log.performer.username}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...actionStyles
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                        {log.tableName}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                        {log.recordId || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => viewLogDetails(log)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Audit Log Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Timestamp
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    User
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {selectedLog.performer.name} (@{selectedLog.performer.username})
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Action
                  </label>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getActionStyles(selectedLog.action)
                  }}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Table
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {selectedLog.tableName}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Record ID
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {selectedLog.recordId || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    IP Address
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {selectedLog.ipAddress || 'N/A'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    User Agent
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, wordBreak: 'break-all' }}>
                    {selectedLog.userAgent || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedLog.notes && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Notes
                  </label>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {selectedLog.notes}
                  </p>
                </div>
              )}

              {(selectedLog.oldValues || selectedLog.newValues) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Old Values
                    </label>
                    <pre style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      margin: 0
                    }}>
                      {formatJsonValues(selectedLog.oldValues)}
                    </pre>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      New Values
                    </label>
                    <pre style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      margin: 0
                    }}>
                      {formatJsonValues(selectedLog.newValues)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AuditLogs;