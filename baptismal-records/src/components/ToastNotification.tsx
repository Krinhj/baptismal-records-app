import React from "react";
import { Users, Trash2, Edit2, CheckCircle, Database, Upload } from "lucide-react"; // ADD Database, Upload imports

interface ToastNotificationProps {
  message: string;
  type: "success" | "delete" | "update" | "login" | "backup" | "restore"; // ADD "backup" and "restore" types
  onDismiss: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onDismiss,
}) => {
  const isDelete = type === "delete";
  const isUpdate = type === "update";
  const isLogin = type === "login";
  const isBackup = type === "backup"; // ADD this line
  const isRestore = type === "restore"; // ADD this line
  
  // UPDATE the Icon logic to include backup and restore
  const Icon = isDelete ? Trash2 : 
               isUpdate ? Edit2 : 
               isLogin ? CheckCircle : 
               isBackup ? Database : 
               isRestore ? Upload : 
               Users;
  
  // UPDATE the iconColor logic to include backup and restore
  const iconColor = isDelete ? "text-red-500" : 
                    isUpdate ? "text-blue-500" : 
                    isLogin ? "text-green-500" : 
                    isBackup ? "text-purple-500" : 
                    isRestore ? "text-indigo-500" : 
                    "text-green-500";
  
  // UPDATE the progressColor logic to include backup and restore
  const progressColor = isDelete ? "bg-red-500" : 
                        isUpdate ? "bg-blue-500" : 
                        isLogin ? "bg-green-500" : 
                        isBackup ? "bg-purple-500" : 
                        isRestore ? "bg-indigo-500" : 
                        "bg-green-500";
  
  // UPDATE the title logic to include backup and restore
  const title = isDelete ? "Record Deleted" : 
                isUpdate ? "Record Updated" : 
                isLogin ? "Login Successful" : 
                isBackup ? "Backup Created" : 
                isRestore ? "Database Restored" : 
                "Record Created";

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm"
      style={{
        animation: 'slideInFromRight 0.3s ease-out',
        zIndex: 50
      }}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onDismiss}
              style={{
                backgroundColor: '#f3f4f6 !important',
                border: '1px solid #d1d5db !important',
                color: '#374151 !important',
                cursor: 'pointer !important',
                padding: '4px !important',
                borderRadius: '6px !important',
                transition: 'all 0.2s ease !important',
                display: 'flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                width: '28px !important',
                height: '28px !important',
                fontSize: '18px !important',
                fontWeight: 'bold !important',
                lineHeight: '1 !important',
                fontFamily: 'Arial, sans-serif !important'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.setProperty('background-color', '#e5e7eb', 'important');
                (e.target as HTMLButtonElement).style.setProperty('color', '#111827', 'important');
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.setProperty('background-color', '#f3f4f6', 'important');
                (e.target as HTMLButtonElement).style.setProperty('color', '#374151', 'important');
              }}
            >
              ×
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 bg-gray-200 rounded-full h-1">
          <div 
            className={`${progressColor} h-1 rounded-full`}
            style={{
              width: '100%',
              animation: 'progressBar 4s linear forwards'
            }}
          ></div>
        </div>
      </div>
      
      {/* Animation styles */}
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
};

export default ToastNotification;