import React, { createContext, useState, useContext } from 'react';

// 创建一个默认的 authData 对象
const defaultAuthData = {
  group_name: '',
  username: '',
  isAdmin: false,
  hasLogin: false,
};

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(defaultAuthData);

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};
