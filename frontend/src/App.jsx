import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import Logo from "./assets/logo.svg";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { TransactionsProvider } from "./context/TransactionsContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const { token, logout, displayName, role } = useAuth();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);
  const linkBase = "px-3 py-2 rounded-md transition-colors";
  return (
    <div className="max-w-6xl mx-auto px-6">
      <nav className="flex justify-between items-center mb-10 h-20 mt-4 px-6 rounded-xl backdrop-blur bg-white/30 border border-white/40 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group" title="Dashboard">
            <img
              src={Logo}
              alt="ExpenseWise"
              className="w-14 h-14 drop-shadow"
            />
          </Link>
          {token && (
            <ul className="flex gap-2 text-sm font-medium">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700"
                    }`
                  }
                >
                  Profile
                </NavLink>
              </li>
              {role === 'Administrator' && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `${linkBase} ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDark((d) => !d)}
            className="text-sm font-medium px-3 py-2 rounded-md border border-transparent hover:border-blue-400 transition-colors flex items-center gap-1"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>
          {token && displayName && (
            <Link
              to="/profile"
              className="hidden sm:inline text-sm font-semibold px-2 py-1 rounded-md text-gray-700 dark:text-slate-200 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700"
            >
              {displayName}
            </Link>
          )}
          {token ? (
            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </TransactionsProvider>
    </AuthProvider>
  );
}
