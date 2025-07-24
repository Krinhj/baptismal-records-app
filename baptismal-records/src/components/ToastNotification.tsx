import React from "react";
import { Users, Trash2, Edit2 } from "lucide-react";

interface ToastNotificationProps {
  message: string;
  type: "success" | "delete" | "update";
  onDismiss: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onDismiss,
}) => {
  const isDelete = type === "delete";
  const isUpdate = type === "update";
  const Icon = isDelete ? Trash2 : isUpdate ? Edit2 : Users;
  const iconColor = isDelete ? "text-red-500" : isUpdate ? "text-blue-500" : "text-green-500";
  const progressColor = isDelete ? "bg-red-500" : isUpdate ? "bg-blue-500" : "bg-green-500";
  const title = isDelete ? "Record Deleted" : isUpdate ? "Record Updated" : "Record Created";

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
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#4b5563';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#9ca3af';
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