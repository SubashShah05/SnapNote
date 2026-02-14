import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // Store registered users

  const register = (name, email, password) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    // Create new user but DON'T login automatically
    const newUser = { id: Date.now(), name, email, password };
    setUsers([...users, newUser]);
    
    return { success: true }; // Just return success, don't set user
  };

  const login = (email, password) => {
    // Find user
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser({ id: foundUser.id, name: foundUser.name, email: foundUser.email });
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};