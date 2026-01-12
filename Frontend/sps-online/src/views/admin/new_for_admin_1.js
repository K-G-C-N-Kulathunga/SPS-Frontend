import React, { useState, useMemo } from "react";

const MenuTaskManagement_1 = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedFuncToAdd, setSelectedFuncToAdd] = useState("");

  const options = [
    { label: "Customer", value: 1 },
    { label: "ES", value: 2 },
    { label: "DEO", value: 3 },
  ];

  // All available functionalities (hard coded)
  const allFunctionalities = [
    "Update Profile",
    "Add Inquiry",
    "View Orders",
    "Manage Users",
    "View Dashboard",
  ];

  // Initial functionalities for each role (hard coded)
  const [roleFunctionalities, setRoleFunctionalities] = useState({
    1: ["Update Profile", "Add Inquiry"], // Customer
    2: ["View Dashboard"],               // ES
    3: ["View Orders"],                  // DEO
  });

  const handleRoleChange = (event) => {
    const value = event.target.value;
    setSelectedRole(value ? Number(value) : null);
    setSelectedFuncToAdd("");
  };

  const handleAdd = () => {
    if (!selectedRole || !selectedFuncToAdd) return;

    setRoleFunctionalities((prev) => {
      const currentList = prev[selectedRole] || [];
      if (currentList.includes(selectedFuncToAdd)) return prev;

      return {
        ...prev,
        [selectedRole]: [...currentList, selectedFuncToAdd],
      };
    });

    setSelectedFuncToAdd("");
  };

  const handleDelete = (func) => {
    if (!selectedRole) return;

    setRoleFunctionalities((prev) => {
      const currentList = prev[selectedRole] || [];
      return {
        ...prev,
        [selectedRole]: currentList.filter((f) => f !== func),
      };
    });
  };

  const currentRoleFunctions = useMemo(
    () => (selectedRole ? roleFunctionalities[selectedRole] || [] : []),
    [roleFunctionalities, selectedRole]
  );

  const availableFunctionsToAdd = useMemo(
    () => allFunctionalities.filter((f) => !currentRoleFunctions.includes(f)),
    [allFunctionalities, currentRoleFunctions]
  );

  const currentRoleLabel = useMemo(
    () => options.find((o) => o.value === selectedRole)?.label || "",
    [options, selectedRole]
  );

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-md p-6">
        <h3 className="text-xl font-semibold text-center mb-4">
          Role Functionalities Manager
        </h3>

        {/* Select Role */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Role
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          onChange={handleRoleChange}
          defaultValue=""
        >
          <option value="">-- Select Role --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {selectedRole && (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Selected Role:{" "}
              <span className="font-semibold text-gray-900">
                {currentRoleLabel}
              </span>
            </p>

            {/* Current Functionalities */}
            <h4 className="text-sm font-semibold text-gray-800 mt-4 mb-2">
              Current Functionalities
            </h4>

            {currentRoleFunctions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No functionalities assigned.
              </p>
            ) : (
              <ul className="space-y-2">
                {currentRoleFunctions.map((func) => (
                  <li
                    key={func}
                    className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2 text-sm"
                  >
                    <span>{func}</span>
                    <button
                      className="text-xs px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                      onClick={() => handleDelete(func)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Functionality */}
            <h4 className="text-sm font-semibold text-gray-800 mt-6 mb-2">
              Add Functionality
            </h4>
            <div className="flex gap-2">
              <select
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFuncToAdd}
                onChange={(e) => setSelectedFuncToAdd(e.target.value)}
              >
                <option value="">-- Select Functionality --</option>
                {availableFunctionsToAdd.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <button
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={handleAdd}
                disabled={!selectedFuncToAdd}
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuTaskManagement_1;
