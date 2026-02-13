import { useState } from "react";
import { registerEmployee } from "../api/api";

export default function Register({ onBack }) {
  const [form, setForm] = useState({
    name: "",
    designation: "",
    address: "",
    department: "",
    joiningDate: "",
    skillSet: "",
    username: "",
    password: "",
    profilePhoto: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsernameExists, setShowUsernameExists] = useState(false);

  // Convert image to Base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setForm((prev) => ({
        ...prev,
        profilePhoto: base64String,
      }));
    };

    reader.readAsDataURL(file);
  };

  const submit = async () => {
    try {
      setLoading(true);
      setValidationErrors({});

      await registerEmployee({
        ...form,
        joiningDate: form.joiningDate ? form.joiningDate : null,
        role: "Employee",
        createdBy: "admin",
      });

      setShowSuccess(true);
    } catch (err) {
      if (err.status === 409) {
        setShowUsernameExists(true);
      }
      else if (err.status === 400) {
        try {
          const parsed = JSON.parse(err.message);

          if (parsed.errors) {
            const convertedErrors = {};

            // Convert backend PascalCase keys to lowercase
            Object.keys(parsed.errors).forEach((key) => {
              const lowerKey =
                key.charAt(0).toLowerCase() + key.slice(1);
              convertedErrors[lowerKey] = parsed.errors[key];
            });

            setValidationErrors(convertedErrors);
          }
        } catch {
          console.error("Invalid error format", err);
        }
      }
      else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Inline error renderer
  const renderError = (field) =>
    validationErrors[field] && (
      <p className="text-red-500 text-xs mt-1 mb-2">
        {validationErrors[field][0]}
      </p>
    );

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // Clear field error while typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[420px] bg-white p-8 rounded-2xl shadow-lg">
  <h2 className="text-xl font-semibold text-center mb-6">
    Create Account
  </h2>

  {/* Form Fields Container with Proper Vertical Spacing */}
  <div className="space-y-4">

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Full Name"
      value={form.name}
      onChange={(e) => handleChange("name", e.target.value)}
    />
    {renderError("name")}

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Designation"
      value={form.designation}
      onChange={(e) => handleChange("designation", e.target.value)}
    />
    {renderError("designation")}

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Department"
      value={form.department}
      onChange={(e) => handleChange("department", e.target.value)}
    />
    {renderError("department")}

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Address"
      value={form.address}
      onChange={(e) => handleChange("address", e.target.value)}
    />

    <input
      type="date"
      className="w-full border rounded-md px-3 py-2"
      value={form.joiningDate}
      onChange={(e) =>
        handleChange("joiningDate", e.target.value)
      }
    />
    {renderError("joiningDate")}

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Skillset (C#, SQL, React)"
      value={form.skillSet}
      onChange={(e) => handleChange("skillSet", e.target.value)}
    />
    {renderError("skillSet")}

    <input
      className="w-full border rounded-md px-3 py-2"
      placeholder="Username"
      value={form.username}
      onChange={(e) => handleChange("username", e.target.value)}
    />
    {renderError("username")}

    <input
      type="password"
      className="w-full border rounded-md px-3 py-2"
      placeholder="Password"
      value={form.password}
      onChange={(e) => handleChange("password", e.target.value)}
    />
    {renderError("password")}

  </div>

  {/* Profile Photo Section */}
  <div className="mt-6">
    <label className="block text-sm text-gray-600 mb-2">
      Upload Profile Photo
    </label>

    <input
      type="file"
      accept="image/*"
      onChange={handlePhotoUpload}
      className="w-full text-sm"
    />

    {form.profilePhoto && (
      <img
        src={`data:image/jpeg;base64,${form.profilePhoto}`}
        alt="Preview"
        className="mt-3 w-20 h-20 rounded-xl object-cover border"
      />
    )}
  </div>

  <button
    onClick={submit}
    disabled={loading}
    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mt-6"
  >
    {loading ? "Registering..." : "Register"}
  </button>

  <p
    onClick={onBack}
    className="text-center mt-4 text-blue-600 cursor-pointer hover:underline"
  >
    Already have an account? Sign in
  </p>
</div>


      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl p-8 text-center text-white">
            <h3 className="text-xl font-semibold mb-2">
              Registration Success
            </h3>
            <button
              onClick={() => {
                setShowSuccess(false);
                onBack();
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}

      {/* USERNAME EXISTS MODAL */}
      {showUsernameExists && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-900 text-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              Username Already Exists
            </h3>
            <button
              onClick={() => setShowUsernameExists(false)}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
