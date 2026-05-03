import { createContext, useState, useEffect, useContext } from 'react';
import { apiAuth } from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          // Fetch full user profile
          const { data } = await apiAuth.getProfile();
          data.id = data._id;
          setUser(data);
        } catch (err) {
          // Invalid token, logout
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);


  const login = async (credentials) => {
    try {
      const { data } = await apiAuth.login(credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      data.user.id = data.user._id || data.user.id;
      data.user.id = data.user._id || data.user.id;
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (credentials) => {
    try {
      const { data } = await apiAuth.register(credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
