import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Map paths to breadcrumb names
  const breadcrumbMap = {
    "/admin/scheduler": ["Calendar", "View Calendar"],
    "/admin/costestimation": ["Application", "Cost Estimation"],
    "/admin/form": ["Application", "New Application"],
    "/admin/service-estimation/details": ["Service Estimation", "Service Estimate Details"],
    "/admin/NewEstimate": ["Estimation", "New", "Estimate"],

  };

  const pathNames = breadcrumbMap[location.pathname] || [];

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="bg-yellow-100 shadow-md border-b border-gray-300 py-4 px-6 flex items-center justify-between relative"
      style={{ top: 0, zIndex: 10, height: "100px" }}
    >
      {/* Absolute Top-Right Date/Time */}
      {/* <span
        className="text-sm text-gray-700 absolute top-0 right-0 mt-1 mr-4 whitespace-nowrap"
      >
        {currentTime.toLocaleString()}
      </span> */}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
        {pathNames.length > 0
          ? pathNames.map((name, index) => (
              <span key={index} className="flex items-center">
                {name}
                {index < pathNames.length - 1 && (
                  <span className="mx-2 text-gray-500">{">"}</span>
                )}
              </span>
            ))
          : "Dashboard"}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 px-3 py-2 rounded text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
        />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button className="flex items-center gap-1 px-3 py-2 rounded hover:bg-yellow-200 transition">
            <span>User Name</span>
          </button>
        </div>
        <div className="relative">
          <button className="flex items-center gap-1 px-3 py-2 rounded hover:bg-yellow-200 transition">
            <span>Department ID</span>
          </button>
        </div>
      </div>
    </header>
  );
}
