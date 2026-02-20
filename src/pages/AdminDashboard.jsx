import { useEffect, useState } from "react";
import { getAllEmployees, updateEmployee } from "../api/api";
import { Pencil, Users } from "lucide-react";

export default function AdminDashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 5;

  /* ================= LOAD EMPLOYEES ================= */
  useEffect(() => {
    loadEmployees(1, "");
  }, []);

  const loadEmployees = async (pageNumber = page, search = "") => {
    const result = await getAllEmployees(
      pageNumber,
      pageSize,
      search?.trim() || ""
    );
    setEmployees(result.data);
    setTotalCount(result.totalCount);
    setPage(pageNumber);
  };

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (emp) => {
    const newStatus = emp.status === "Active" ? "Inactive" : "Active";

    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === emp.employeeId
          ? { ...e, status: newStatus }
          : e
      )
    );

    try {
      await updateEmployee(emp.employeeId, {
        name: emp.name,
        designation: emp.designation,
        address: emp.address,
        department: emp.department,
        joiningDate: emp.joiningDate,
        skillSet: emp.skillSet,
        role: emp.role || "Employee",
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEdit = (emp) => {
    setSelected(emp);
    setForm({
      name: emp.name || "",
      designation: emp.designation || "",
      address: emp.address || "",
      department: emp.department || "",
      joiningDate: emp.joiningDate
        ? emp.joiningDate.substring(0, 10)
        : "",
      skillSet: emp.skillSet || "",
      role: emp.role || "",
      status: emp.status || "",
    });
  };

  /* ================= SAVE CHANGES ================= */
  const saveChanges = async () => {
    if (!selected) return;

    try {
      await updateEmployee(selected.employeeId, {
        ...form,
        modifiedBy: user.username,
      });

      setEmployees((prev) =>
        prev.map((e) =>
          e.employeeId === selected.employeeId
            ? { ...e, ...form }
            : e
        )
      );

      setSelected(null);
      setShowSuccess(true);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= TOP BAR ================= */}
      <div className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        <h1 className="text-lg font-semibold">
          Employee Management System
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-600">Administrator</span>
          <button
            onClick={onLogout}
            className="text-gray-700 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="max-w-6xl mx-auto mt-10">
        <input
          type="text"
          placeholder="Search by Employee ID, Name, Designation"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              loadEmployees(1, searchTerm);
            }
          }}
          className="w-full border px-4 py-3 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ================= GRID CARD ================= */}
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow p-8">

        <div className="flex items-center gap-2 mb-6">
          <Users size={18} />
          <h2 className="text-lg font-semibold">Employees</h2>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {totalCount}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Designation</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Joining Date</th>
                <th className="py-3 px-4 text-left">Skill Set</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeId} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{emp.employeeId}</td>
                  <td className="py-3 px-4 font-medium">{emp.name}</td>
                  <td className="py-3 px-4">{emp.designation || "-"}</td>
                  <td className="py-3 px-4">{emp.address || "-"}</td>
                  <td className="py-3 px-4">{emp.department || "-"}</td>
                  <td className="py-3 px-4">
                    {emp.joiningDate
                      ? new Date(emp.joiningDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4">{emp.skillSet || "-"}</td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        emp.status === "Active"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex justify-center items-center gap-5">
                      <button
                        onClick={() => openEdit(emp)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => toggleStatus(emp)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                          emp.status === "Active"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                            emp.status === "Active"
                              ? "translate-x-5"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => loadEmployees(page - 1, searchTerm)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(totalCount / pageSize)}
          </span>

          <button
            disabled={page >= Math.ceil(totalCount / pageSize)}
            onClick={() => loadEmployees(page + 1, searchTerm)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= EDIT MODAL (NO PHOTO) ================= */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl px-5 py-4">

            <h3 className="text-base font-semibold mb-1">
              Edit Employee
            </h3>
            <p className="text-gray-500 text-xs mb-3">
              Update employee details below.
            </p>

            {/* Compact Form Layout */}
            <div className="space-y-2">

              <Input label="Name" value={form.name}
                onChange={(v)=>setForm({...form,name:v})} />

              <Input label="Designation" value={form.designation}
                onChange={(v)=>setForm({...form,designation:v})} />

              <Input label="Department" value={form.department}
                onChange={(v)=>setForm({...form,department:v})} />

              <Input label="Joining Date" type="date"
                value={form.joiningDate}
                onChange={(v)=>setForm({...form,joiningDate:v})} />

              <Input label="Address" value={form.address}
                onChange={(v)=>setForm({...form,address:v})} />

              <Input label="Skill Set" value={form.skillSet}
                onChange={(v)=>setForm({...form,skillSet:v})} />

              {/* Role and Status retained for backend compatibility */}
              <Input label="Role" value={form.role}
                onChange={(v)=>setForm({...form,role:v})} />

              <div>
                <label className="block text-xs font-medium mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e)=>setForm({...form,status:e.target.value})}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={()=>setSelected(null)}
                className="px-4 py-1.5 border rounded-lg text-gray-600 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={saveChanges}
                className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= SUCCESS POPUP ================= */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 text-white w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Employee Updated Successfully
            </h2>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 font-medium"
            >
              Go back to dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= REUSABLE INPUT ================= */
function Input({ label, value, onChange, type="text" }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
