import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) return;
    
    try {
       const sessionUser = JSON.parse(userInfoString);
       const config = { headers: { Authorization: `Bearer ${sessionUser.token}` } };
       const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, config);
       const updatedUser = { ...data, token: sessionUser.token };
       setUser(updatedUser);
       localStorage.setItem('userInfo', JSON.stringify(updatedUser));
       return updatedUser;
    } catch(error) {
       console.error("Failed to fetch custom profile", error);
    }
  };

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      throw error.response && error.response.data.message ? error.response.data.message : error.message;
    }
  };

  const register = async (name, email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      throw error.response && error.response.data.message ? error.response.data.message : error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, fetchProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
