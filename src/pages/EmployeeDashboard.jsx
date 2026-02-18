import { useEffect, useState } from "react";
import {
  getEmployeeById,
  updateEmployee,
  updateEmployeePhoto,
} from "../api/api";
import {
  Pencil,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
} from "lucide-react";

export default function EmployeeDashboard({ user, onLogout }) {
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInactivePopup, setShowInactivePopup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getEmployeeById(user.employeeId);
    setEmployee(data);

    if (data.status === "Inactive") {
      setShowInactivePopup(true);
    }
  };

  const openEdit = () => {
    setForm({
      name: employee.name || "",
      designation: employee.designation || "",
      address: employee.address || "",
      department: employee.department || "",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",
      skillSet: employee.skillSet || "",
    });
    setShowEdit(true);
  };

  const saveChanges = async () => {
    try {
      console.log("saveChanges: submitting", { employeeId: employee.employeeId, form });

      await updateEmployee("self", {
        ...form,
        role: employee.role,
        status: employee.status,
        modifiedBy: user.username,
      });

      console.log("saveChanges: update succeeded");

      // show success first so it's visible even if edit modal closes
      setShowSuccess(true);
      // ensure modal is visible on screen
      try { window.scrollTo(0, 0); } catch {}

      // close the edit modal after showing success
      setShowEdit(false);

      // auto-hide success after 3s to help visual confirmation
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("saveChanges failed:", err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      await updateEmployeePhoto(employee.employeeId, base64);

      setEmployee((prev) => ({
        ...prev,
        profilePhoto: base64,
      }));
    };

    reader.readAsDataURL(file);
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        <h1 className="text-lg font-semibold">
          Employee Management System
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-600">Employee</span>
          <button
            onClick={onLogout}
            className="text-gray-700 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ===== PROFILE CARD ===== */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="h-24 bg-gradient-to-r from-teal-500 to-blue-600"></div>

          <div className="relative px-8 pb-8">

            {/* profile image */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-200">
                {employee.profilePhoto ? (
                  <img
                    src={`data:image/jpeg;base64,${employee.profilePhoto}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-20">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  {employee.name}
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {employee.status}
                  </span>
                </h2>

                <p className="text-gray-600 mt-1 text-sm">
                  {employee.designation} · {employee.department}
                </p>
              </div>

              <button
                onClick={openEdit}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>

            <hr className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoBox title="DESIGNATION" value={employee.designation} icon={<Briefcase size={16} />} />
              <InfoBox title="DEPARTMENT" value={employee.department} icon={<Building2 size={16} />} />
              <InfoBox
                title="JOINING DATE"
                value={
                  employee.joiningDate
                    ? new Date(employee.joiningDate).toLocaleDateString()
                    : "-"
                }
                icon={<Calendar size={16} />}
              />
              <InfoBox title="ADDRESS" value={employee.address} icon={<MapPin size={16} />} />
            </div>

            <hr className="my-6" />

            <div>
              <h3 className="text-gray-600 font-semibold tracking-wide mb-3 text-sm">
                SKILL SET
              </h3>

              <div className="flex flex-wrap gap-2">
                {employee.skillSet
                  ? employee.skillSet.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs"
                      >
                        {skill.trim()}
                      </span>
                    ))
                  : "-"}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40" style={{ zIndex: 9999 }}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl px-5 py-4" style={{ zIndex: 10000 }}>

            <h3 className="text-base font-semibold mb-1">
              Edit Profile
            </h3>
            <p className="text-gray-500 text-xs mb-3">
              Update employee details below.
            </p>

            <div className="flex flex-col items-center mb-3">
              <label className="cursor-pointer">
                <div className="w-20 h-20 rounded-xl overflow-hidden border shadow-sm bg-gray-200">
                  {employee.profilePhoto ? (
                    <img
                      src={`data:image/jpeg;base64,${employee.profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Click photo to change
              </p>
            </div>

            <div className="space-y-2">
              <Input label="Name" value={form.name} onChange={(v)=>setForm({...form,name:v})} />
              <Input label="Designation" value={form.designation} onChange={(v)=>setForm({...form,designation:v})} />
              <Input label="Department" value={form.department} onChange={(v)=>setForm({...form,department:v})} />
              <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(v)=>setForm({...form,joiningDate:v})} />
              <Input label="Address" value={form.address} onChange={(v)=>setForm({...form,address:v})} />
              <Input label="Skill Set" value={form.skillSet} onChange={(v)=>setForm({...form,skillSet:v})} />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-1.5 border rounded-lg text-gray-600 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={saveChanges}
                className="px-5 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUCCESS & INACTIVE POPUPS*/}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 9999 }}>
          <div className="bg-slate-900 text-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl" style={{ zIndex: 10000 }}>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-green-400 text-3xl">✓</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Details Updated Successfully
            </h3>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {showInactivePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-900 text-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              You are marked as Inactive
            </h3>
            <p className="text-gray-300 mb-6">
              Please contact the administrator.
            </p>
            <button
              onClick={() => setShowInactivePopup(false)}
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

function InfoBox({ title, value, icon }) {
  return (
    <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
      <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="font-semibold text-sm">{value || "-"}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type="text" }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
