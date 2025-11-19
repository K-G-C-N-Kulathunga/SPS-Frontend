// JavaScript
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [mainMenus, setMainMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [menuTasks, setMenuTasks] = useState({});

  // Fetch menus when the provider mounts — read user from localStorage or sessionStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;

      if (user && user.userId) {
        setUserRole(user.userLevel);
        setMenusLoading(true);

        // Use the running backend to fetch menus for the stored user
        fetch(`http://localhost:9090/sps/api/login/main-menus?userId=${user.userId}`)
          .then(res => res.json())
          .then(data => {
            setMainMenus(Array.isArray(data) ? data : []);
          })
          .catch(() => setMainMenus([]))
          .finally(() => setMenusLoading(false));
      } else {
        setMainMenus([]);
      }
    } catch (e) {
      console.error('Failed to initialize user context from storage', e);
      setMainMenus([]);
    }
  }, []);

  const logout = () => {
    setUserRole(null);
    setMainMenus([]);
    // Clear from both storages to be safe
    try {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } catch (e) {
      /* ignore */
    }
  };

  // Fetch tasks for a menu
  const fetchTasksForMenu = async (userId, menuCode) => {
    if (!userId || !menuCode) return;
    try {
      const res = await fetch(`http://localhost:9090/sps/api/login/menu-tasks?userId=${userId}&menuCode=${menuCode}`);
      const data = await res.json();
      setMenuTasks(prev => ({ ...prev, [menuCode]: data }));
    } catch {
      setMenuTasks(prev => ({ ...prev, [menuCode]: [] }));
    }
  };


  return (
      <UserContext.Provider value={{
        userRole, setUserRole, mainMenus, setMainMenus, menusLoading, logout,
        menuTasks, fetchTasksForMenu
      }}>
        {children}
      </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);