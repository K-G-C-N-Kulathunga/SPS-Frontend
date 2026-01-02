import React, { useEffect, useState } from "react";

const STORAGE_KEY = "DEPARTMENTS_LIST";

const emptyDept = {
  id: "",
  code: "",
  name: "",
  description: "",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyDept);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setDepartments(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = (next) => {
    setDepartments(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch (e) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleOpenCreate = () => {
    setForm({ ...emptyDept, id: `dept_${Date.now()}` });
    setIsCreateOpen(true);
  };

  const handleCreate = (ev) => {
    ev.preventDefault();
    const code = (form.code || "").trim();
    const name = (form.name || "").trim();
    if (!code || !name) return;
    // avoid duplicates by code
    if (departments.some((d) => d.code.toLowerCase() === code.toLowerCase())) return;
    const next = [...departments, { ...form, code, name }];
    persist(next);
    setIsCreateOpen(false);
    setSelectedId(form.id);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleRemove = (id) => {
    const next = departments.filter((d) => d.id !== id);
    persist(next);
    if (selectedId === id) setSelectedId("");
  };

  const selected = departments.find((d) => d.id === selectedId);

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">Departments</h1>
              <p className="mt-2 text-sm text-blueGray-500">Create and manage departments.</p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Department
              </button>
            </div>
          </header>

          <div className="px-8 py-8 bg-blueGray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-3">Department List</h3>
                <div className="border border-blueGray-100 rounded divide-y max-h-96 overflow-auto">
                  {departments.length === 0 && (
                    <div className="p-3 text-sm text-blueGray-400">No departments yet.</div>
                  )}
                  {departments.map((d) => (
                    <div
                      key={d.id}
                      className={`px-3 py-2 flex items-center justify-between cursor-pointer ${selectedId === d.id ? "bg-slate-50" : ""}`}
                      onClick={() => handleSelect(d.id)}
                    >
                      <div>
                        <p className="text-blueGray-700 font-semibold">{d.name}</p>
                        <p className="text-xs text-blueGray-400">{d.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleRemove(d.id); }} className="px-2 py-1 text-xs rounded bg-red-100 text-red-600"></button>
                      </div>
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
                    <p className="text-xs text-blueGray-400 mb-2">{selected.code}</p>
                    <p className="text-sm text-blueGray-600">{selected.description || "No description provided."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <>
          <div
            onClick={() => setIsCreateOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 9998 }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: 12, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)", border: "1px solid #E2E8F0" }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Create Department</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold">&times;</button>
            </div>

            <div className="px-6 py-5">
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Code *
                    <input name="code" value={form.code} onChange={handleChange} className="mt-1 px-3 py-2 w-full border rounded-md" placeholder="e.g. FIN" />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600">
                    Department Name *
                    <input name="name" value={form.name} onChange={handleChange} className="mt-1 px-3 py-2 w-full border rounded-md" placeholder="Finance" />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
                    Description
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 px-3 py-2 w-full border rounded-md" placeholder="Optional description" />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Add Department</button>
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2 bg-white border rounded-lg text-sm">Cancel</button>
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
