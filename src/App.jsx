import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (u) => {
    setUser(u);
    if (u?.role === "Admin") navigate("/admin", { replace: true });
    else navigate("/employee", { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    // remove local token if stored
    try { window.localStorage.removeItem("token"); } catch {}
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === "Admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/employee" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={handleLogin} onRegister={() => navigate('/register')} />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Register onBack={() => navigate('/login')} />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth user={user}>
            <RequireRole user={user} role="Admin">
              <AdminDashboard user={user} onLogout={handleLogout} />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/employee"
        element={
          <RequireAuth user={user}>
            <EmployeeDashboard user={user} onLogout={handleLogout} />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
