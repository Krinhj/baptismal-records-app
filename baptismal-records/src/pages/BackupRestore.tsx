import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { documentDir } from '@tauri-apps/api/path';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  FileText,
  Calendar,
  HardDrive
} from 'lucide-react';
import ToastNotification from '../components/ToastNotification';
import RefreshConfirmationModal from '../components/RefreshConfirmationModal';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface BackupResult {
  success: boolean;
  message: string;
  recordCounts?: {
    baptismRecords: number;
    parishStaff: number;
    users: number;
    auditLogs: number;
  };
  importedCounts?: {
    baptismRecords: number;
    parishStaff: number;
    users: number;
    auditLogs: number;
  };
  error?: string;
}

export default function BackupRestore() {
  const [user, setUser] = useState<User | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'delete' | 'update' | 'login'; message: string } | null>(null);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [lastBackupResult, setLastBackupResult] = useState<BackupResult | null>(null);

  React.useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }
  }, []);

  const showToast = (type: 'success' | 'delete' | 'update' | 'login', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const goBack = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleBackup = async () => {
    if (!user) return;

    try {
      setIsBackingUp(true);
      
      // Generate default filename with current date
      const today = new Date().toISOString().split('T')[0];
      const defaultFilename = `baptism-records-backup-${today}.json`;
      
      // Open save dialog with just the default filename
      const backupPath = await save({
        title: 'Save Database Backup',
        defaultPath: defaultFilename,
        filters: [
          {
            name: 'JSON Backup Files',
            extensions: ['json']
          }
        ]
      });

      if (!backupPath) {
        setIsBackingUp(false);
        return; // User cancelled
      }

      console.log('Selected backup path:', backupPath);

      // Perform backup
      const result = await invoke<string>('backup_database', {
        backupPath,
        userId: user.id
      });

      const backupResult: BackupResult = JSON.parse(result);

      if (backupResult.success) {
        setLastBackupResult(backupResult);
        showToast('success', `Backup completed successfully! ${backupResult.recordCounts?.baptismRecords || 0} baptism records backed up.`);
      } else {
        showToast('update', backupResult.error || 'Backup failed');
      }

    } catch (error) {
      console.error('Backup error:', error);
      showToast('update', `Backup failed: ${error}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSelectImportFile = async () => {
    try {
      const selected = await open({
        title: 'Select Database Backup File',
        multiple: false,
        filters: [
          {
            name: 'JSON Backup Files',
            extensions: ['json']
          }
        ]
      });

      if (selected) {
        setSelectedImportFile(selected as string);
        setShowImportWarning(true);
      }
    } catch (error) {
      console.error('File selection error:', error);
      showToast('update', 'Failed to select file');
    }
  };

  const handleImport = async () => {
    if (!selectedImportFile || !user) return;

    try {
      setIsImporting(true);
      
      const result = await invoke<string>('import_database', {
        backupPath: selectedImportFile,
        userId: user.id
      });

      const importResult: BackupResult = JSON.parse(result);

      if (importResult.success) {
        showToast('success', `Import completed successfully! ${importResult.importedCounts?.baptismRecords || 0} baptism records imported.`);
        setShowImportWarning(false);
        setSelectedImportFile(null);
        
        // Show custom refresh modal instead of browser confirm
        setTimeout(() => {
          setShowRefreshModal(true);
        }, 2000);
      } else {
        showToast('update', importResult.error || 'Import failed');
      }

    } catch (error) {
      console.error('Import error:', error);
      showToast('update', `Import failed: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRefreshConfirm = () => {
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshModal(false);
  };

  const cancelImport = () => {
    setShowImportWarning(false);
    setSelectedImportFile(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease-in-out'
                }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Database Backup & Import</h1>
            </div>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Alert */}
        {!showImportWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
            </div>
            <p className="mt-2 text-sm text-amber-700">
              Always create regular backups of your database. The import function will replace all current data with the backup data.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backup Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Backup</h2>
                <p className="text-sm text-gray-600">Export all database records to a JSON file</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What will be backed up:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All baptismal records</li>
                  <li>• Parish staff information</li>
                  <li>• User accounts (without passwords)</li>
                  <li>• System audit logs</li>
                  <li>• Backup metadata and timestamps</li>
                </ul>
              </div>

              {lastBackupResult && lastBackupResult.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Last Backup Successful</span>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>Baptism Records: {lastBackupResult.recordCounts?.baptismRecords || 0}</div>
                    <div>Parish Staff: {lastBackupResult.recordCounts?.parishStaff || 0}</div>
                    <div>Users: {lastBackupResult.recordCounts?.users || 0}</div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ 
                  backgroundColor: isBackingUp ? '#9CA3AF' : '#16A34A',
                  cursor: isBackingUp ? 'not-allowed' : 'pointer'
                }}
              >
                {isBackingUp ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Backup...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Create Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!showImportWarning ? (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Import Backup</h2>
                    <p className="text-sm text-gray-600">Restore database from a backup file</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Warning</span>
                    </div>
                    <p className="text-xs text-red-700">
                      This will permanently replace all current data with the backup data. This action cannot be undone.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Before importing:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Create a current backup first</li>
                      <li>• Ensure the backup file is valid</li>
                      <li>• Close other applications using the database</li>
                      <li>• Verify you have the correct backup file</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleSelectImportFile}
                    disabled={isImporting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ 
                      backgroundColor: isImporting ? '#9CA3AF' : '#2563EB',
                      cursor: isImporting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Upload className="h-5 w-5" />
                    <span>Select Backup File</span>
                  </button>
                </div>
              </>
            ) : (
              /* Import Confirmation */
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-amber-600">
                  <AlertTriangle className="h-8 w-8" />
                  <h2 className="text-xl font-semibold">Confirm Import</h2>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-3">
                    <strong>FINAL WARNING:</strong> This action will permanently delete all current data and replace it with the backup data.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Selected file:</span>
                  </div>
                  <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1 break-all">
                    {selectedImportFile?.split('/').pop() || selectedImportFile?.split('\\').pop()}
                  </code>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={cancelImport}
                    disabled={isImporting}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    style={{ cursor: isImporting ? 'not-allowed' : 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: isImporting ? '#9CA3AF' : '#DC2626',
                      cursor: isImporting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Confirm Import</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-gray-600" />
            <span>Backup Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Format</h4>
              <ul className="space-y-1">
                <li>• JSON format for easy reading</li>
                <li>• Contains metadata and timestamps</li>
                <li>• Human-readable structure</li>
                <li>• Cross-platform compatible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
              <ul className="space-y-1">
                <li>• Create regular backups (weekly/monthly)</li>
                <li>• Store backups in multiple locations</li>
                <li>• Test restore process periodically</li>
                <li>• Keep backups secure and private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Refresh Confirmation Modal */}
      <RefreshConfirmationModal
        isOpen={showRefreshModal}
        onConfirm={handleRefreshConfirm}
        onCancel={handleRefreshCancel}
      />

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}