import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("bp_token") || null);
  const [role, setRole] = useState(localStorage.getItem("bp_role") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("bp_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("bp_token", token);
    else localStorage.removeItem("bp_token");
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem("bp_role", role);
    else localStorage.removeItem("bp_role");
  }, [role]);

  useEffect(() => {
    if (user) localStorage.setItem("bp_user", JSON.stringify(user));
    else localStorage.removeItem("bp_user");
  }, [user]);

  function loginCustomer(newToken, newUser) {
    setToken(newToken);
    setRole("customer");
    setUser(newUser);
  }

  function loginAdmin(newToken) {
    setToken(newToken);
    setRole("admin");
    setUser(null);
  }

  function logout() {
    setToken(null);
    setRole(null);
    setUser(null);
  }

  async function authFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    return res;
  }

  return (
    <AuthContext.Provider
      value={{ token, role, user, loginCustomer, loginAdmin, logout, authFetch, API_BASE }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// This hook must remain colocated with AuthContext because this file owns the
// context instance shared by AuthProvider and its consumers.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
