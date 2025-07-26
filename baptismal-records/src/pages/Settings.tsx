import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Settings as SettingsIcon, 
  User, 
  Database, 
  Bell, 
  Shield, 
  Globe,
  Download,
  Key,
  Clock,
  FileText,
  Monitor,
  Printer,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import ToastNotification from '../components/ToastNotification';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  compactView: boolean;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  recordsPerPage: number;
  defaultSortOrder: 'newest' | 'oldest' | 'alphabetical';
  enableDesktopNotifications: boolean;
  notifyOnNewRecord: boolean;
  backupReminders: boolean;
}

const Settings: React.FC = () => {
  const [user, setUser] = useState<{
    id: number;
    name: string;
    username: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  } | null>(null);

  const [activeTab, setActiveTab] = useState('preferences');
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    compactView: false,
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    recordsPerPage: 25,
    defaultSortOrder: 'newest',
    enableDesktopNotifications: true,
    notifyOnNewRecord: true,
    backupReminders: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'delete' | 'update' | 'login' | 'backup' | 'restore';
  }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement getSettings backend command
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement saveSettings backend command
      
      setToast({
        show: true,
        message: 'Settings saved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'preferences', label: 'User Preferences', icon: User, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    { id: 'system', label: 'System Behavior', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'security', label: 'Security & Access', icon: Shield, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'backup', label: 'Backup & Maintenance', icon: Database, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'certificates', label: 'Certificate Generation', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'advanced', label: 'Advanced/Debug', icon: Key, roles: ['SUPER_ADMIN'] },
  ];

  const visibleTabs = tabs.filter(tab => user && tab.roles.includes(user.role));

  const renderUserPreferences = () => (
    <div style={{ maxWidth: '1200px' }}>
      {/* Display Settings */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '32px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Monitor size={24} style={{ color: '#3b82f6' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Display Settings</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Theme Preference
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark' | 'system'})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="system">Follow System Settings</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              Choose how the application appears
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Table Display
            </label>
            <div style={{ 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              padding: '16px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="compactView"
                  checked={settings.compactView}
                  onChange={(e) => setSettings({...settings, compactView: e.target.checked})}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    marginRight: '12px',
                    accentColor: '#3b82f6'
                  }}
                />
                <div>
                  <label htmlFor="compactView" style={{ 
                    fontSize: '14px', 
                    color: '#374151', 
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '2px'
                  }}>
                    Enable compact view for tables
                  </label>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    Show more records in less space
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '32px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Globe size={24} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Language & Region</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Application Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="pt">Portuguese (Português)</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              Interface language
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (Europe)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              How dates are displayed
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Time Format
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour (Military)</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              Clock format preference
            </p>
          </div>
        </div>
      </div>

      {/* Table Settings */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '32px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '24px', height: '24px', color: '#8b5cf6' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Table Display Preferences</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Records Per Page
            </label>
            <select
              value={settings.recordsPerPage}
              onChange={(e) => setSettings({...settings, recordsPerPage: Number(e.target.value)})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value={10}>10 records per page</option>
              <option value={25}>25 records per page</option>
              <option value={50}>50 records per page</option>
              <option value={100}>100 records per page</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              How many records to show at once
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
              Default Sort Order
            </label>
            <select
              value={settings.defaultSortOrder}
              onChange={(e) => setSettings({...settings, defaultSortOrder: e.target.value as 'newest' | 'oldest' | 'alphabetical'})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="newest">Newest Records First</option>
              <option value="oldest">Oldest Records First</option>
              <option value="alphabetical">Alphabetical by Name</option>
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0 0' }}>
              How records are sorted by default
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '32px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Bell size={24} style={{ color: '#f59e0b' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Notification Preferences</h3>
        </div>
        
        <div style={{ maxWidth: '800px' }}>
          <div style={{ 
            border: '1px solid #d1d5db', 
            borderRadius: '12px', 
            padding: '20px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="enableDesktopNotifications"
                checked={settings.enableDesktopNotifications}
                onChange={(e) => setSettings({...settings, enableDesktopNotifications: e.target.checked})}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  marginTop: '2px',
                  accentColor: '#3b82f6'
                }}
              />
              <div style={{ flex: 1 }}>
                <label htmlFor="enableDesktopNotifications" style={{ 
                  display: 'block',
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  marginBottom: '6px'
                }}>
                  Enable Desktop Notifications
                </label>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                  Allow the application to send desktop notifications for important events and updates. This helps you stay informed about new records and system activities.
                </p>
              </div>
            </div>
            
            {settings.enableDesktopNotifications && (
              <div style={{ 
                marginLeft: '36px', 
                paddingLeft: '20px',
                borderLeft: '3px solid #3b82f6',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="notifyOnNewRecord"
                    checked={settings.notifyOnNewRecord}
                    onChange={(e) => setSettings({...settings, notifyOnNewRecord: e.target.checked})}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      marginTop: '2px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="notifyOnNewRecord" style={{ 
                      display: 'block',
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      marginBottom: '4px'
                    }}>
                      New Baptismal Records
                    </label>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                      Get notified when a new baptismal record is added to the system
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="backupReminders"
                    checked={settings.backupReminders}
                    onChange={(e) => setSettings({...settings, backupReminders: e.target.checked})}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      marginTop: '2px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="backupReminders" style={{ 
                      display: 'block',
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      marginBottom: '4px'
                    }}>
                      Backup Reminders
                    </label>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                      Remind me to create regular backups of the database to prevent data loss
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences': 
        return renderUserPreferences();
      default: 
        return (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '8px' }}>Under Construction</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              This tab is being developed. More settings coming soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingsIcon size={28} style={{ color: '#6366f1' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Settings
            </h1>
          </div>
          
          {/* Back to Dashboard Button - Right side like AuditLogs */}
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
          Manage your application preferences and configuration
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 24px',
                    backgroundColor: activeTab === tab.id ? '#f8fafc' : 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
                      (e.target as HTMLButtonElement).style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLButtonElement).style.color = '#6b7280';
                    }
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Clock size={32} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading settings...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          backgroundColor: '#f9fafb', 
          padding: '16px 32px', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px' 
        }}>
          <button
            onClick={loadSettings}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                (e.target as HTMLButtonElement).style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                (e.target as HTMLButtonElement).style.borderColor = '#d1d5db';
              }
            }}
          >
            Reset Changes
          </button>
          <button
            onClick={saveSettings}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                (e.target as HTMLButtonElement).style.borderColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                (e.target as HTMLButtonElement).style.borderColor = '#3b82f6';
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
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

export default Settings;