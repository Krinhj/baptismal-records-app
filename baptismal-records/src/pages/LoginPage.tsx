import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BookOpen, User, Lock, LogIn } from "lucide-react";

interface LoginForm {
  username: string;  // Changed from email
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    username: "",  // Changed from email  
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await invoke("login_user", {
        username: formData.username.trim(),  // Changed from email
        password: formData.password,
      });

      // Parse the user data from the response
      const userData = JSON.parse(response as string);
      
      // Store session data
      localStorage.setItem("session", "active");
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set flag to indicate this is a fresh login (for toast notification)
      sessionStorage.setItem("justLoggedIn", "true");
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
      
    } catch (err) {
      setError(err as string || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Baptismal Records Manager
          </h1>
          <p className="text-gray-600">
            Sign in to manage church records
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? '0.5' : '1',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              outline: 'none', // Remove browser focus outline
              boxShadow: 'none' // Remove any box shadow
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                // Target the button element specifically
                const button = e.currentTarget;
                button.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                // Target the button element specifically
                const button = e.currentTarget;
                button.style.backgroundColor = '#2563eb';
              }
            }}
            onFocus={(e) => {
              if (!isLoading) {
                // Custom focus style instead of browser default
                const button = e.currentTarget;
                button.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
              }
            }}
            onBlur={(e) => {
              // Remove focus style
              const button = e.currentTarget;
              button.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Church Management System
          </p>
        </div>
      </div>
    </div>
  );
}