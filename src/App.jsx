import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

/* ===== AUTH GUARD ===== */
function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ===== ROLE GUARD ===== */
function RequireRole({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

/* ===== JWT EXPIRY CHECKER ===== */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}


export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /* ===== RESTORE LOGIN ON PAGE REFRESH ===== */
useEffect(() => {
  if (window.location.pathname === "/login") return;
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const employeeId = localStorage.getItem("employeeId");

    if (token && role && employeeId) {

      /* check expiry */
      if (isTokenExpired(token)) {
        localStorage.clear();
        return;
      }

      setUser({
        token,
        role,
        employeeId,
      });
    }
  } catch (err) {
    console.error("Error restoring user session:", err);
  }
}, []);

/* ===== LIVE TOKEN EXPIRY WATCHER ===== */
useEffect(() => {
  const interval = setInterval(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  }, 5000); // check every 5 seconds

  return () => clearInterval(interval);
}, [user]);


  /* ===== LOGIN HANDLER ===== */
  const handleLogin = (u) => {
    setUser(u);

    /* store session */
    localStorage.setItem("token", u.token);
    localStorage.setItem("role", u.role);
    localStorage.setItem("employeeId", u.employeeId);

    if (u?.role === "Admin")
      navigate("/admin", { replace: true });
    else
      navigate("/employee", { replace: true });
  };

  /* ===== LOGOUT HANDLER ===== */
  const handleLogout = () => {
    setUser(null);

    /* clear session */
    localStorage.clear();

    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === "Admin"
              ? <Navigate to="/admin" replace />
              : <Navigate to="/employee" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <Login onLogin={handleLogin} onRegister={() => navigate("/register")} />
        }
      />

      <Route
        path="/register"
        element={
          user
            ? <Navigate to="/" replace />
            : <Register onBack={() => navigate("/login")} />
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
