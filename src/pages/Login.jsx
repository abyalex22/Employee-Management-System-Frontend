import { useState } from "react";
import { login } from "../api/api";

export default function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [inactivePopup, setInactivePopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

 const submit = async () => {
  try {
    setLoading(true);

    // ✅ CLEAR OLD SESSION FIRST
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
    localStorage.clear();


    const data = await login(form);

    // Block inactive users
    if (data?.status === "Inactive") {
      setInactivePopup(true);
      return;
    }

    // store JWT token
    localStorage.setItem("token", data.token);

    // store user object
    localStorage.setItem("user", JSON.stringify(data));

    onLogin({ ...data, username: form.username });

  } catch (err) {
    const message = err.message?.toLowerCase() || "";

    if (message.includes("inactive")) {
      setInactivePopup(true);
    } else {
      setErrorMessage(err.message || "Login failed");
      setErrorPopup(true);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-96 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Sign in</h2>
        <p className="text-center text-gray-500 mb-6">
          Employee Management System
        </p>

        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          placeholder="Username"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full border rounded-md px-3 py-2 mb-6"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p
          onClick={onRegister}
          className="text-center mt-4 text-blue-600 cursor-pointer hover:underline"
        >
          Register
        </p>
      </div>

      {/* ===== INACTIVE USER MODAL ===== */}
      {inactivePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-600 text-3xl font-bold">!</span>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Access Restricted
            </h3>

            <p className="text-gray-600 mb-6">
              You are marked as inactive. Please contact the administrator.
            </p>

            <button
              onClick={() => setInactivePopup(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ===== GENERAL ERROR MODAL ===== */}
      {errorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-600 text-3xl font-bold">!</span>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Login Failed
            </h3>

            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>

            <button
              onClick={() => setErrorPopup(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
