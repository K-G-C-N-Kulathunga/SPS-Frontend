import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { FaSignOutAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import ceb from "../../assets/img/ceb.png";
import { resolveAdminRoute } from "routes/adminRoutes";

export default function Sidebar() {
  const { mainMenus,menusLoading, logout, menuTasks, fetchTasksForMenu } = useUser();
  const history = useHistory();
    const [expandedMenu, setExpandedMenu] = useState(null);

        // Resolve the target route using the page column supplied by the backend task metadata.
        const getTaskPath = (menu, task) => {
            const backendPage = (task.page || '').trim();

            if (backendPage) {
                const resolved = resolveAdminRoute(backendPage);
                if (resolved) {
                    return resolved;
                }
            }

            return resolveAdminRoute(`/admin/${menu.menuCode}/${task.activityCode}`) || `/admin/${menu.menuCode}/${task.activityCode}`;
        };

    // Get userId from localStorage/sessionStorage
    const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    const userId = user.userId;


    const handleMenuClick = (menuCode) => {
        if (expandedMenu === menuCode) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(menuCode);
            if (!menuTasks[menuCode]) {
                fetchTasksForMenu(userId, menuCode);
            }
        }
    };


  const handleLogout = () => {
    logout();
    history.push("/auth/login");
  };

  return (
      <div>
          <nav
              className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden rounded-lg flex flex-wrap items-center justify-between relative md:w-64 z-10 py-6 px-6 shadow-2xl border-r"
              style={{ backgroundColor: "white" }}
          >
              <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
                  {/* Brand: SPS + CEB Logo */}
                  <Link
                      className="md:block md:pb-2 inline-block p-4 px-0 transition duration-300 ease-in-out transform hover:scale-105"
                      to="/"
                  >
        <span
            className="flex flex-col items-center gap-2"
            style={{ textAlign: "center" }}
        >
          <img
              src={ceb}
              alt="CEB Logo"
              style={{ marginBottom: "8px", height: "50px", width: "50px" }}
          />
          <h3
              style={{
                  color: "#b33333",
                  fontWeight: "bold",
                  fontSize: "1rem",
              }}
          >
            Service Provisionig System
          </h3>
        </span>
                  </Link>

                  {/* Navigation */}
                  <div className="md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded">
                      <ul className="md:flex-col md:min-w-full flex flex-col list-none space-y-1">
                          {menusLoading ? (
                              <li className="text-blueGray-400 px-4 py-2">Loading menus...</li>
                          ) : mainMenus && mainMenus.length > 0 ? (
                              mainMenus.map((menu) => (
                                  <li key={menu.menuCode} className="mb-2">
                                      <div
                                          className="flex items-center justify-between py-2 px-4 rounded hover:bg-blueGray-700 transition cursor-pointer"
                                          onClick={() => handleMenuClick(menu.menuCode)}
                                      >
                                          <span>{menu.displayName}</span>
                                          {expandedMenu === menu.menuCode ? <FaChevronUp /> : <FaChevronDown />}
                                      </div>
                                      {/* Show tasks if this menu is expanded */}
                                      {expandedMenu === menu.menuCode && (
                                          <ul className="ml-4 mt-1">
                                              {menuTasks[menu.menuCode] && menuTasks[menu.menuCode].length > 0 ? (
                                                  menuTasks[menu.menuCode].map((task) => (
                                                      <li key={task.activityCode} className="py-1 px-2 hover:bg-blueGray-100 rounded">
                                                          {(() => {
                                                              const rawPath = getTaskPath(menu, task) || "";
                                                              const lowerMenu = (menu.displayName || "").toLowerCase();
                                                              const lowerTask = (task.activityName || "").toLowerCase();

                                                              // Default destination
                                                              let to = rawPath;

                                                              // For Service Estimate menu, force single page route and pass mode via query
                                                              const isServiceEstimate = lowerMenu.includes("service") && lowerMenu.includes("estimate");
                                                              if (isServiceEstimate) {
                                                                  if (lowerTask.includes("add")) {
                                                                      to = { pathname: "/admin/service-estimation/details", search: "?mode=ADD" };
                                                                  } else if (lowerTask.includes("modify") || lowerTask.includes("edit") || lowerTask.includes("update")) {
                                                                      to = { pathname: "/admin/service-estimation/details", search: "?mode=MODIFY" };
                                                                  } else if (lowerTask.includes("delete") || lowerTask.includes("remove")) {
                                                                      to = { pathname: "/admin/service-estimation/details", search: "?mode=DELETE" };
                                                                  } else if (lowerTask.includes("view") || lowerTask.includes("read") || lowerTask.includes("print")) {
                                                                      to = { pathname: "/admin/service-estimation/details", search: "?mode=VIEW" };
                                                                  }
                                                              }

                                                              return (
                                                                  <Link to={to}>
                                                                      {task.activityName}
                                                                  </Link>
                                                              );
                                                          })()}
                                                      </li>
                                                  ))
                                              ) : (
                                                  <li className="text-blueGray-400 px-2 py-1">No tasks</li>
                                              )}
                                          </ul>
                                      )}
                                  </li>
                              ))
                          ) : (
                              <li className="text-blueGray-400 px-4 py-2">No menus available</li>
                          )}
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