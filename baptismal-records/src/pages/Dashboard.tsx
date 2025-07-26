import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  PlusCircle,
  Database,
  Users,
  RotateCcw,
  LogOut,
  CheckCircle,
  X,
  AlertCircle,
  Settings,
} from "lucide-react";
import AddRecordModal from "../components/AddRecordModal";
import ToastNotification from "../components/ToastNotification"; // ADD THIS IMPORT

// Define the User type for type safety
interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

const CARDS = [
  { 
    title: "View Records", 
    subtitle: "Browse and manage all baptismal records",
    icon: <BookOpen size={32} className="text-blue-500" />, 
    path: "/view-records",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
    action: "navigate",
    roles: ["SUPER_ADMIN", "ADMIN", "USER"]
  },
  { 
    title: "Add New Record", 
    subtitle: "Create a new baptismal record entry",
    icon: <PlusCircle size={32} className="text-green-500" />, 
    path: "/add-record",
    bgColor: "bg-green-50",
    iconBg: "bg-green-100",
    action: "modal",
    roles: ["SUPER_ADMIN", "ADMIN", "USER"]
  },
  { 
    title: "Manage Parish Staff", 
    subtitle: "Add and manage priests, deacons, and staff",
    icon: <Users size={32} className="text-orange-500" />, 
    path: "/manage-parish-staff",
    bgColor: "bg-orange-50",
    iconBg: "bg-orange-100",
    action: "navigate",
    roles: ["SUPER_ADMIN"]
  },
  { 
    title: "System Audit Logs",
    subtitle: "Debug feature - Monitor all system activities",
    icon: <AlertCircle size={32} className="text-red-500" />, 
    path: "/audit-logs",
    bgColor: "bg-red-50",
    iconBg: "bg-red-100",
    action: "navigate",
    roles: ["SUPER_ADMIN"]
  },
  { 
    title: "Backup and Restore", 
    subtitle: "Create backups and restore your records",
    icon: <Database size={32} className="text-purple-500" />, 
    path: "/backup",
    bgColor: "bg-purple-50",
    iconBg: "bg-purple-100",
    action: "navigate",
    roles: ["SUPER_ADMIN", "ADMIN"]
  },
  {
    title: "Settings",
    subtitle: "Configure App",
    icon: <Settings size={32} className="text-white" />,
    path: "/settings",
    bgColor: "bg-gray-200",
    iconBg: "bg-gray-400",
    action: "navigate",
    roles: ["SUPER_ADMIN", "ADMIN"]
  }
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginToast, setShowLoginToast] = useState<string | null>(null); // CHANGED: Use string like other toasts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Remove the useRef - we don't need manual timer management anymore

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        
        // Only show login toast if this is a fresh login (not navigation)
        const isFromLogin = sessionStorage.getItem("justLoggedIn");
        if (isFromLogin) {
          setShowLoginToast(`Welcome back, ${parsedUser.name}!`); // CHANGED: Set message like other toasts
          sessionStorage.removeItem("justLoggedIn"); // Remove flag after showing toast
          
          // Add the setTimeout like in ViewRecords.tsx
          setTimeout(() => {
            setShowLoginToast(null);
          }, 4000);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Redirect to login if user data is corrupted
        logout();
      }
    } else {
      // No user data found, redirect to login
      logout();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const dismissLoginToast = () => {
    setShowLoginToast(null);
  };

  const dismissSuccessToast = () => {
    setSuccessToast(null);
  };

  const handleCardClick = (card: typeof CARDS[0]) => {
    if (card.action === "modal" && card.title === "Add New Record") {
      setIsModalOpen(true);
    } else {
      // Use pushState for SPA navigation instead of full page reload
      window.history.pushState({}, "", card.path);
      // Trigger a re-render by dispatching a popstate event
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRecordSuccess = () => {
    setSuccessToast("Baptismal record created successfully!");
    
    // Add the setTimeout like in ViewRecords.tsx
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Show loading state while user data is being loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Format role display
  const formatRole = (role: string) => {
    // Keep SUPER_ADMIN as is, format others normally
    if (role === "SUPER_ADMIN") {
      return "SUPER_ADMIN";
    }
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Get role styling
  const getRoleStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200";
      case 'admin':
        return "bg-red-100 text-red-800 border border-red-200";
      case 'user':
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Baptismal Records Manager
                </h1>
                <p className="text-sm text-gray-500">Church Management System</p>
              </div>
            </div>

            {/* Right side - User info and Logout */}
            <div className="flex items-center space-x-4">
              {/* User Info Display */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 !text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  color: '#4b5563 !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  gap: '0.5rem !important',
                  padding: '0.5rem 1rem !important',
                  borderRadius: '0.5rem !important',
                  fontSize: '0.875rem !important',
                  fontWeight: '500 !important',
                  cursor: 'pointer !important',
                  transition: 'all 0.2s ease-in-out !important'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.setProperty('background-color', '#f3f4f6', 'important');
                  (e.target as HTMLButtonElement).style.setProperty('color', '#111827', 'important');
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.setProperty('background-color', 'transparent', 'important');
                  (e.target as HTMLButtonElement).style.setProperty('color', '#4b5563', 'important');
                }}
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Your role:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleStyles(user.role)}`}>
              {formatRole(user.role)}
            </span>
          </div>
        </div>

        {/* Cards Grid - WITH ROLE-BASED FILTERING */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.filter(card => card.roles.includes(user.role)).map((card) => (
            <div
              key={card.path}
              onClick={() => handleCardClick(card)}
              className={`${card.bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 ${card.iconBg} rounded-2xl mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleRecordSuccess}
      />

      {/* Login Success Toast - Now using ToastNotification with login type */}
      {showLoginToast && (
        <ToastNotification
          message={showLoginToast}
          type="login"
          onDismiss={dismissLoginToast}
        />
      )}

      {/* Record Creation Success Toast */}
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