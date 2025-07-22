import React from "react";
import {
  BookOpen,
  PlusCircle,
  Users,
  Settings as Cog,
  LogOut,
} from "lucide-react";

const CARDS = [
  { title: "Add New Record",    icon: <PlusCircle size={24} className="text-green-600" />, path: "/add-record" },
  { title: "View Records",      icon: <BookOpen    size={24} className="text-blue-600"  />, path: "/view-records" },
  { title: "Manage Users",      icon: <Users       size={24} className="text-purple-600"/>, path: "/manage-users" },
  { title: "Settings",          icon: <Cog         size={24} className="text-pink-600"  />, path: "/settings" },
];

export default function Dashboard() {
  const logout = () => {
    localStorage.removeItem("session");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold text-gray-800">
            Parish Admin Dashboard
          </h1>
          <button
            onClick={logout}
            className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ title, icon, path }) => (
            <div
              key={path}
              onClick={() => (window.location.href = path)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md p-6 flex flex-col items-start transition cursor-pointer"
            >
              <div className="p-3 bg-gray-50 rounded-full mb-4">
                {icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {title}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}