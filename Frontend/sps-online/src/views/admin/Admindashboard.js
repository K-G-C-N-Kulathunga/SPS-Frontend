// src/views/admin/Admindashboard_1.js
import React from "react";
import { Link } from "react-router-dom";

const Admindashboard = () => {
  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b bg-blueGray-50">
            <h1 className="text-2xl font-semibold text-blueGray-700">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-blueGray-500">
              Manage menus, tasks, and role permissions by department.
            </p>
          </header>

          <div className="px-8 py-8 bg-blueGray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Menu Page card */}
            <Link
              to="/admin/menu_page"
              className="block bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blueGray-700 mb-2">
                Main
              </h2>
              <p className="text-sm text-blueGray-500">
                Define sidebar menus (codes, display names, descriptions).
              </p>
            </Link>

            {/* Task Page card */}
            <Link
              to="/admin/task_page"
              className="block bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blueGray-700 mb-2">
                Task 
              </h2>
              <p className="text-sm text-blueGray-500">
                Attach tasks to menus and set their navigation targets.
              </p>
            </Link>

            {/* Department / Role tasks card */}
            <Link
              to="/admin/role_tasks"
              className="block bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blueGray-700 mb-2">
                Department Menu
              </h2>
              <p className="text-sm text-blueGray-500">
                Select a department and role, then assign menu tasks to that
                role.
              </p>
            </Link>

            {/* Departments - Creation card */}
            <Link
              to="/admin/departments"
              className="block bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blueGray-700 mb-2">
                Departments
              </h2>
              <p className="text-sm text-blueGray-500">
                Create and manage departments. Click to open department
                management and create new departments.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
