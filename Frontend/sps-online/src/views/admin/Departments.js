import React, { useEffect, useMemo, useState } from "react";
import { api } from "api";

const emptyDept = {
  deptTypeCode: "",
  name: "",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [loading, setLoading] = useState(false);

  // create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyDept);
  const [createMsg, setCreateMsg] = useState("");

  // edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyDept);
  const [editMsg, setEditMsg] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* ============================
     API HELPERS (adjust URLs if needed)
     ============================ */
  const apiGetDepartments = async () => {
    const res = await api.get("/dept-types");
    return Array.isArray(res.data) ? res.data : [];
  };

  const apiCreateDepartment = async (payload) => {
    const res = await api.post("/dept-types", payload);
    return res.data;
  };

  const apiUpdateDepartment = async (deptTypeCode, payload) => {
    const res = await api.put(`/dept-types/${encodeURIComponent(deptTypeCode)}`, payload);
    return res.data;
  };

  const apiDeleteDepartment = async (deptTypeCode) => {
    await api.delete(`/dept-types/${encodeURIComponent(deptTypeCode)}`);
  };

  /* ============================
     Load Departments
     ============================ */
  const loadDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await apiGetDepartments();

      // normalize keys (supports different backend field names)
      const mapped = rows
        .map((d) => ({
          deptTypeCode: d.deptTypeCode ?? d.code ?? d.id ?? "",
          name: d.name ?? "",
        }))
        .filter((d) => d.deptTypeCode);

      mapped.sort((a, b) => String(a.name).localeCompare(String(b.name)));

      setDepartments(mapped);

      // keep selection valid
      setSelectedCode((cur) => {
        if (cur && mapped.some((x) => x.deptTypeCode === cur)) return cur;
        return mapped[0]?.deptTypeCode ?? "";
      });
    } catch (e) {
      setDepartments([]);
      setSelectedCode("");
      setError(e?.response?.data?.message || e?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => {
    return departments.find((d) => d.deptTypeCode === selectedCode) || null;
  }, [departments, selectedCode]);

  /* ============================
     Create
     ============================ */
  const openCreate = () => {
    setCreateMsg("");
    setCreateForm(emptyDept);
    setIsCreateOpen(true);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    setCreateMsg("");
    setError("");
    setMessage("");

    const deptTypeCode = (createForm.deptTypeCode || "").trim();
    const name = (createForm.name || "").trim();

    if (!deptTypeCode || !name) {
      setCreateMsg("Department code and name are required.");
      return;
    }

    try {
      await apiCreateDepartment({ deptTypeCode, name });
      setIsCreateOpen(false);
      setMessage("Department created.");
      await loadDepartments();
      setSelectedCode(deptTypeCode);
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      setCreateMsg(e?.response?.data?.message || e?.message || "Create failed");
    }
  };

  /* ============================
     Edit
     ============================ */
  const openEdit = () => {
    if (!selected) return;
    setEditMsg("");
    setEditForm({
      deptTypeCode: selected.deptTypeCode,
      name: selected.name,
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditMsg("");
    setError("");
    setMessage("");

    const deptTypeCode = (editForm.deptTypeCode || "").trim();
    const name = (editForm.name || "").trim();

    if (!deptTypeCode || !name) {
      setEditMsg("Name is required.");
      return;
    }

    try {
      await apiUpdateDepartment(deptTypeCode, { name });
      setIsEditOpen(false);
      setMessage("Department updated.");
      await loadDepartments();
      setSelectedCode(deptTypeCode);
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      setEditMsg(err?.response?.data?.message || err?.message || "Update failed");
    }
  };

  /* ============================
     Delete
     ============================ */
  const handleRemove = async (deptTypeCode) => {
    const ok = typeof window !== "undefined" ? window.confirm(`Delete department ${deptTypeCode}?`) : true;
    if (!ok) return;

    setError("");
    setMessage("");

    try {
      await apiDeleteDepartment(deptTypeCode);
      setMessage("Department deleted.");
      await loadDepartments();
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Delete failed (maybe mapped to menus?)");
    }
  };

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">Departments</h1>
              <p className="mt-2 text-sm text-blueGray-500">Create and manage departments (DB).</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDepartments}
                className="px-3 py-2 text-xs font-semibold text-blueGray-700 bg-white border rounded-lg hover:bg-blueGray-50"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Department
              </button>

              <button
                type="button"
                onClick={openEdit}
                disabled={!selected}
                className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Edit
              </button>
            </div>
          </header>

          <div className="px-8 py-4 bg-blueGray-50 space-y-3">
            {error && <div className="p-3 rounded bg-red-50 text-[12px] text-red-600">{String(error)}</div>}
            {message && <div className="p-2 rounded bg-emerald-50 text-[12px] text-emerald-700">{message}</div>}
          </div>

          <div className="px-8 py-8 bg-blueGray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-3">
                  Department List
                </h3>

                <div className="border border-blueGray-100 rounded divide-y max-h-96 overflow-auto">
                  {departments.length === 0 && (
                    <div className="p-3 text-sm text-blueGray-400">
                      {loading ? "Loading..." : "No departments yet."}
                    </div>
                  )}

                  {departments.map((d) => (
                    <div
                      key={d.deptTypeCode}
                      className={`px-3 py-2 flex items-center justify-between cursor-pointer ${
                        selectedCode === d.deptTypeCode ? "bg-slate-50" : ""
                      }`}
                      onClick={() => setSelectedCode(d.deptTypeCode)}
                    >
                      <div>
                        <p className="text-blueGray-700 font-semibold">{d.name}</p>
                        <p className="text-xs text-blueGray-400">{d.deptTypeCode}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(d.deptTypeCode);
                        }}
                        className="px-2 py-1 text-[11px] rounded bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-3">Details</h3>

                {!selected && (
                  <div className="p-6 text-sm text-blueGray-400">Select a department to view details.</div>
                )}

                {selected && (
                  <div className="p-4">
                    <p className="text-lg font-semibold text-blueGray-700">{selected.name}</p>
                    <p className="text-xs text-blueGray-400 mb-2">{selected.deptTypeCode}</p>

                    <p className="text-sm text-blueGray-600">
                     
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <>
          <div
            onClick={() => setIsCreateOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9998 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Create Department</h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Code *
                    <input
                      name="deptTypeCode"
                      value={createForm.deptTypeCode}
                      onChange={handleCreateChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md"
                      placeholder="e.g. FIN"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Name *
                    <input
                      name="name"
                      value={createForm.name}
                      onChange={handleCreateChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md"
                      placeholder="Finance"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Add Department
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2 bg-white border rounded-lg text-sm"
                  >
                    Cancel
                  </button>

                  {createMsg && <span className="text-xs text-red-600">{createMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <>
          <div
            onClick={() => setIsEditOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9998 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Edit Department</h2>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <form className="space-y-4" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Code
                    <input
                      name="deptTypeCode"
                      value={editForm.deptTypeCode}
                      readOnly
                      className="mt-1 px-3 py-2 w-full border rounded-md bg-blueGray-50 cursor-not-allowed"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Name *
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-5 py-2 bg-white border rounded-lg text-sm"
                  >
                    Cancel
                  </button>

                  {editMsg && <span className="text-xs text-red-600">{editMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Departments;
