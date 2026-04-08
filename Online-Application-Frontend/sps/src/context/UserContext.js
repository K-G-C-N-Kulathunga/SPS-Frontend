import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setUserRole(user.userLevel);
    }
  }, []);

  const logout = () => {
    setUserRole(null);
    sessionStorage.removeItem('user'); 
  }

  return (
    <UserContext.Provider value={{ userRole, setUserRole, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser  = () => useContext(UserContext);