// AuthContext.js
import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext({ group_name: '', username: '', isAdmin: false,hasLogin: false } );

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};
