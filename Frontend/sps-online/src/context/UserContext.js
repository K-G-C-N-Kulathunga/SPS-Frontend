// JavaScript
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [mainMenus, setMainMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [menuTasks, setMenuTasks] = useState({});

  // Fetch menus when user info changes
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.userId) {
      setUserRole(user.userLevel);
      setMenusLoading(true);
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
  }, []);

  const logout = () => {
    setUserRole(null);
    setMainMenus([]);
    localStorage.removeItem('user');
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