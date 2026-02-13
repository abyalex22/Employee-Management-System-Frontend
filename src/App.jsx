import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  if (!user && page === "login")
    return <Login onLogin={setUser} onRegister={() => setPage("register")} />;

  if (!user && page === "register")
    return <Register onBack={() => setPage("login")} />;

  if (user.role === "Admin")
    return <AdminDashboard user={user} onLogout={() => setUser(null)} />;

  return <EmployeeDashboard user={user} onLogout={() => setUser(null)} />;
}
