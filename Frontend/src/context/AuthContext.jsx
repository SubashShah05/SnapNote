import { createContext, useState, useEffect } from "react";
import BACKEND_URL from "../api/url";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = () => {
      const userInfo = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");
      if (userInfo && token) {
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const register = async (name, email, password) => {
    try {
      const { data } = await BACKEND_URL.post("/auth/register", { name, email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await BACKEND_URL.post("/auth/login", { email, password });
      
      localStorage.setItem("userInfo", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email
      }));
      localStorage.setItem("token", data.token);
      
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Invalid credentials" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};