import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { FaAngleDown, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

export default function Sidebar() {
  const { userRole, logout } = useUser();
  const history = useHistory();

  // State to manage dropdowns and sub-dropdowns
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (path) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  
  const sidebarItems = {
    ES: [
      {
        path: "/admin/costestimation",
        label: "Application",
        subItems: [
          {
            path: "/admin/costestimation/sub-item-1",
            label: "New Application",
            subItems: [
              {
                path: "/admin/costestimation/sub-item-1/a",
                label: "New Connection",
              },
              {
                path: "/admin/costestimation/sub-item-1/b",
                label: "Cost Recovery",
              },
              {
                path: "/admin/costestimation/sub-item-1/c",
                label: "Manage Jobs",
              },
            ],
          },
          {
            path: "/admin/costestimation/sub-item-2",
            label: "NewConnection",
            subItems: [
              {
                path: "/admin/costestimation/sub-item-2/a",
                label: "New Connection",
              },
              {
                path: "/admin/costestimation/sub-item-2/b",
                label: "Cost Recovery",
              },
            ],
          },
        ],
      },
      {
        path: "/admin/check",
        label: "Estimation",
        subItems: [
          {
            path: "/admin/check/sub-item-1",
            label: "New",
            subItems: [
              { path: "/admin/check/sub-item-1", label: "New Connection" },
              { path: "/admin/check/sub-item-2", label: "Cost Recovery" },
              { path: "/admin/check/sub-item-2", label: "clossed Job" },

            ],
          },
          { path: "/admin/check/sub-item-2", label: "Modify" },
        ],
      },
      {
        path: "/admin/closed-job",
        label: "Closed Job",
        subItems: [
          { path: "/admin/closed-job/sub-item-1", label: "Sub Item 1" },
          { path: "/admin/closed-job/sub-item-2", label: "Sub Item 2" },
        ],
      },
    ],
    DEO: [
      {
        path: "/admin/costestimation",
        label: "Estimation Form",
        subItems: [
          { path: "/admin/costestimation/sub-item-1", label: "Sub Item 1" },
          { path: "/admin/costestimation/sub-item-2", label: "Sub Item 2" },
        ],
      },
      {
        path: "/admin/check",
        label: "Check and Signed",
        subItems: [
          { path: "/admin/check/sub-item-1", label: "Sub Item 1" },
          { path: "/admin/check/sub-item-2", label: "Sub Item 2" },
        ],
      },
    ],
  };

  const itemsToDisplay = userRole ? sidebarItems[userRole] : [];

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const renderDropdown = (item) => {
    const isOpen = openDropdowns[item.path];

    return (
      <li className="mb-2" key={item.path}>
        <button
          onClick={() => toggleDropdown(item.path)}
          className="text-base py-2 px-3 font-medium flex items-center w-full text-left bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200 ease-in-out"
        >
          <span>{item.label}</span>
          <FaAngleDown
            className={`ml-auto text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && item.subItems && (
          <ul className="pl-4 mt-1 border-l-2 border-gray-100">
            {item.subItems.map((subItem) => (
              <li key={subItem.path} className="my-1">
                {subItem.subItems ? (
                  renderDropdown(subItem)
                ) : (
                  <Link
                    to={subItem.path}
                    className="text-sm py-2 px-3 flex items-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200 ease-in-out"
                  >
                    <FaChevronRight className="text-xs text-gray-400 mr-2" />
                    {subItem.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div>
    <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden rounded-lg flex flex-wrap items-center justify-between relative md:w-64 z-10 py-6 px-6 shadow-2xl border-r" style={{backgroundColor:'white'}}>
      <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
        {/* Brand */}
        <Link
          className="md:block md:pb-2 inline-block  text-3xl uppercase font-bold p-4 px-0 transition duration-300 ease-in-out transform hover:scale-105"
          to="/"
        >
          <span className="flex items-center gap-2">
            <h3
              style={{
                color: "#7C0A02",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              SPS
            </h3>
          </span>
        </Link>

        {/* User role badge
        {userRole && (
          <div className="bg-gray-100 text-gray-600 text-xs font-medium py-1 px-3 rounded-full mb-6 mt-2">
            Role: {userRole}
          </div>
        )} */}

        {/* Navigation */}
        <div className="md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded">
          <h6 className="md:min-w-full text-gray-400 text-xs uppercase font-bold block mb-4 border-b border-gray-100 pb-2">
            Navigation
          </h6>
          <ul className="md:flex-col md:min-w-full flex flex-col list-none space-y-1">
            {itemsToDisplay.map((item) => renderDropdown(item))}
          </ul>

          <div className="md:flex md:flex-col md:items-stretch mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="text-sm py-3 px-4 font-medium flex items-center text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition duration-200 ease-in-out"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    </div>
  );
}
