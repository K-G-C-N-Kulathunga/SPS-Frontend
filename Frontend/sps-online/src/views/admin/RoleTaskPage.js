// src/views/admin/DeptTaskAssignPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "api";

function toErrorText(e) {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  if (d?.detail) return d.detail;
  if (d?.error) return d.error;
  return e?.message || "Server error";
}



/* ============================
   API HELPERS
   ============================ */

async function fetchDepartments() {
  const res = await api.get("/dept-types");
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchUsers() {
  const res = await api.get("/users");
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchMenus() {
  const res = await api.get("/main-menus");
  return Array.isArray(res.data) ? res.data : [];
}

// dept -> menuCodes
async function fetchDeptMenuCodes(deptTypeCode) {
  const res = await api.get(`/dept-type-menus/dept/${encodeURIComponent(deptTypeCode)}/menu-codes`);
  return Array.isArray(res.data) ? res.data : [];
}

// bulk save dept menus
async function saveDeptMenus(deptTypeCode, menuCodes) {
  await api.put(`/dept-type-menus/dept/${encodeURIComponent(deptTypeCode)}`, { menuCodes });
}

// dept+user -> menus/tasks tree
async function fetchDeptUserTree(deptTypeCode, userId) {
  const res = await api.get(
    `/dept-task-assign/dept/${encodeURIComponent(deptTypeCode)}/user/${encodeURIComponent(userId)}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

// save assignments
async function saveDeptUserAssignments(userId, payload) {
  await api.put(`/dept-task-assign/user/${encodeURIComponent(userId)}`, payload);
}

async function createDepartment(payload) {
  const res = await api.post("/dept-types", payload);
  return res.data;
}

async function createUser(payload) {
  const res = await api.post("/users", payload);
  return res.data;
}

/* ============================
   PAGE
   ============================ */

const DeptTaskAssignPage = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [allMenus, setAllMenus] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Dept menu assignment
  const [deptMenuKeys, setDeptMenuKeys] = useState(new Set());
  const [deptMenusDirty, setDeptMenusDirty] = useState(false);

  // Tree for tasks
  const [tree, setTree] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [tasksDirty, setTasksDirty] = useState(false);

  const [loading, setLoading] = useState({
    init: false,
    deptMenus: false,
    tree: false,
    savingDeptMenus: false,
    savingTasks: false,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ deptTypeCode: "", name: "" });
  const [deptMsg, setDeptMsg] = useState("");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ userId: "", name: "" });
  const [userMsg, setUserMsg] = useState("");

  const sortedAllMenus = useMemo(() => {
    return [...allMenus].sort((a, b) => {
      const oa = Number.isFinite(a.orderKey) ? a.orderKey : Number.MAX_SAFE_INTEGER;
      const ob = Number.isFinite(b.orderKey) ? b.orderKey : Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return String(a.displayName || "").localeCompare(String(b.displayName || ""));
    });
  }, [allMenus]);

  const sortedTreeMenus = useMemo(() => {
    return [...tree].sort((a, b) => {
      const oa = Number.isFinite(a.orderKey) ? a.orderKey : Number.MAX_SAFE_INTEGER;
      const ob = Number.isFinite(b.orderKey) ? b.orderKey : Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return String(a.displayName || "").localeCompare(String(b.displayName || ""));
    });
  }, [tree]);

  /* -----------------------------
   * Initial load
   * --------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading((p) => ({ ...p, init: true }));
        setError("");
        setMessage("");

        const [d, u, m] = await Promise.all([
          fetchDepartments(),
          fetchUsers(),
          fetchMenus(),
        ]);

        if (cancelled) return;

        setDepartments(d);
        setUsers(u);
        setAllMenus(m);

        setSelectedDept((cur) => cur || (d?.[0]?.deptTypeCode ?? ""));
        setSelectedUser((cur) => cur || (u?.[0]?.userId ?? ""));
      } catch (e) {
        if (!cancelled) setError(e?.response?.data || e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading((p) => ({ ...p, init: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------
   * Load dept menu codes when dept changes
   * --------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedDept) {
        setDeptMenuKeys(new Set());
        setDeptMenusDirty(false);
        return;
      }

      try {
        setLoading((p) => ({ ...p, deptMenus: true }));
        setError("");
        setMessage("");

        const codes = await fetchDeptMenuCodes(selectedDept);
        if (cancelled) return;

        setDeptMenuKeys(new Set((codes || []).map(String)));
        setDeptMenusDirty(false);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data || e?.message || "Failed to load dept menus");
      } finally {
        if (!cancelled) setLoading((p) => ({ ...p, deptMenus: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDept]);

  /* -----------------------------
   * Load tree when dept+user changes
   * --------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedDept || !selectedUser) {
        setTree([]);
        setSelectedKeys(new Set());
        setTasksDirty(false);
        return;
      }

      try {
        setLoading((p) => ({ ...p, tree: true }));
        setError("");
        setMessage("");

        const data = await fetchDeptUserTree(selectedDept, selectedUser);
        if (cancelled) return;

        setTree(data);

        const next = new Set();
        for (const m of data) {
          for (const t of m.tasks || []) {
            if (t.assigned) next.add(`${m.menuCode}::${t.activityCode}`);
          }
        }
        setSelectedKeys(next);
        setTasksDirty(false);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data || e?.message || "Failed to load tasks");
      } finally {
        if (!cancelled) setLoading((p) => ({ ...p, tree: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDept, selectedUser]);

  /* -----------------------------
   * Dept menu checkbox toggle
   * --------------------------- */
  const toggleDeptMenu = (menuCode) => {
    setDeptMenuKeys((prev) => {
      const next = new Set(prev);
      if (next.has(menuCode)) next.delete(menuCode);
      else next.add(menuCode);
      return next;
    });
    setDeptMenusDirty(true);
  };

  const handleSaveDeptMenus = async () => {
    if (!selectedDept) return;

    const ok = typeof window !== "undefined"
      ? window.confirm("Save Department Menus?")
      : true;
    if (!ok) return;

    try {
      setLoading((p) => ({ ...p, savingDeptMenus: true }));
      setError("");
      setMessage("");

      const menuCodes = Array.from(deptMenuKeys);
      await saveDeptMenus(selectedDept, menuCodes);

      setDeptMenusDirty(false);
      setMessage("Department menus saved.");
      setTimeout(() => setMessage(""), 1500);

      // Refresh tree because menus changed
      if (selectedUser) {
        const data = await fetchDeptUserTree(selectedDept, selectedUser);
        setTree(data);
        const next = new Set();
        for (const m of data) {
          for (const t of m.tasks || []) {
            if (t.assigned) next.add(`${m.menuCode}::${t.activityCode}`);
          }
        }
        setSelectedKeys(next);
        setTasksDirty(false);
      }
    } catch (e) {
      setError(toErrorText(e) || "Save dept menus failed");
      console.log("saveDeptMenus error:", e?.response?.status, e?.response?.data);
    } finally {
      setLoading((p) => ({ ...p, savingDeptMenus: false }));
    }
  };

  /* -----------------------------
   * Task checkbox toggle (no API)
   * --------------------------- */
  const toggleTask = (menuCode, activityCode) => {
    const key = `${menuCode}::${activityCode}`;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setTasksDirty(true);
  };

  /* -----------------------------
   * Save tasks (only on button)
   * --------------------------- */
  const handleSaveTasks = async () => {
    if (!selectedDept || !selectedUser) return;

    const ok = typeof window !== "undefined"
      ? window.confirm("Save Task Assignments?")
      : true;
    if (!ok) return;

    const items = Array.from(selectedKeys).map((k) => {
      const [menuCode, activityCode] = k.split("::");
      return { menuCode, activityCode };
    });

    try {
      setLoading((p) => ({ ...p, savingTasks: true }));
      setError("");
      setMessage("");

      await saveDeptUserAssignments(selectedUser, {
        userId: selectedUser,
        deptTypeCode: selectedDept,
        items,
      });

      setTasksDirty(false);
      setMessage("Tasks saved.");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      setError(e?.response?.data || e?.message || "Save failed");
    } finally {
      setLoading((p) => ({ ...p, savingTasks: false }));
    }
  };

  /* -----------------------------
   * Create dept/user
   * --------------------------- */
  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptMsg("");

    const deptTypeCode = deptForm.deptTypeCode.trim();
    const name = deptForm.name.trim();

    if (!deptTypeCode || !name) {
      setDeptMsg("Dept code and name required");
      return;
    }

    try {
      const created = await createDepartment({ deptTypeCode, name });
      setDepartments((prev) =>
        [...prev, created].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      );
      setSelectedDept(created.deptTypeCode);
      setDeptForm({ deptTypeCode: "", name: "" });
      setIsDeptModalOpen(false);
    } catch (e2) {
      setDeptMsg(e2?.response?.data || e2?.message || "Create failed");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg("");

    const userId = userForm.userId.trim();
    const name = userForm.name.trim();

    if (!userId || !name) {
      setUserMsg("User ID and name required");
      return;
    }

    try {
      const created = await createUser({ userId, name });
      setUsers((prev) =>
        [...prev, created].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      );
      setSelectedUser(created.userId);
      setUserForm({ userId: "", name: "" });
      setIsUserModalOpen(false);
    } catch (e2) {
      setUserMsg(e2?.response?.data || e2?.message || "Create failed");
    }
  };

  /* -----------------------------
   * Render
   * --------------------------- */
  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">Dept Task Assignment</h1>
              <p className="mt-2 text-sm text-blueGray-500">Select dept + user, assign menus + tasks, then Save.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Dept
              </button>

              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create User
              </button>

              <button
                type="button"
                onClick={handleSaveDeptMenus}
                disabled={!selectedDept || loading.savingDeptMenus || !deptMenusDirty}
                className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading.savingDeptMenus ? "Saving..." : "Save Dept Menus"}
              </button>

              <button
                type="button"
                onClick={handleSaveTasks}
                disabled={!selectedDept || !selectedUser || loading.savingTasks || !tasksDirty}
                className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading.savingTasks ? "Saving..." : "Save Tasks"}
              </button>
            </div>
          </header>

          <div className="px-4 py-4 bg-blueGray-50 space-y-6">
            {error && <div className="p-3 rounded bg-red-50 text-[12px] text-red-600">{String(error)}</div>}
            {message && <div className="p-2 rounded bg-emerald-50 text-[12px] text-emerald-700">{message}</div>}

            <section className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-blueGray-700 mb-3">Select Department</h2>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 w-full max-w-md border rounded bg-white text-blueGray-700"
                disabled={loading.init}
              >
                <option value="">-- Select Dept --</option>
                {departments.map((d) => (
                  <option key={d.deptTypeCode} value={d.deptTypeCode}>
                    {d.name} ({d.deptTypeCode})
                  </option>
                ))}
              </select>
            </section>

            {/* ✅ NEW: Department Menus assignment */}
            <section className="bg-white border rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-blueGray-700">Department Menus</h2>
                <span className="text-xs text-blueGray-500">
                  {loading.deptMenus ? "Loading..." : `${deptMenuKeys.size} selected`}
                </span>
              </div>

              {!selectedDept && (
                <div className="p-3 rounded bg-blue-50 text-sm text-blue-600">
                  Select a department to assign menus.
                </div>
              )}

              {selectedDept && (
                <div className="border border-blueGray-100 rounded-lg divide-y">
                  {sortedAllMenus.map((m) => {
                    const checked = deptMenuKeys.has(m.menuCode);
                    return (
                      <label key={m.menuCode} className="flex items-center gap-2 px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDeptMenu(m.menuCode)}
                          disabled={loading.deptMenus || loading.savingDeptMenus}
                          className="h-4 w-4"
                        />
                        <div className="flex flex-col">
                          <span className="text-blueGray-700 text-[13px]">
                            {m.displayName} <span className="text-[11px] text-blueGray-400">({m.menuCode})</span>
                          </span>
                          {m.description && (
                            <span className="text-[11px] text-blueGray-400">{m.description}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-blueGray-700 mb-3">Select User</h2>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-2 w-full max-w-md border rounded bg-white text-blueGray-700"
                disabled={loading.init}
              >
                <option value="">-- Select User --</option>
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.userId})
                  </option>
                ))}
              </select>
            </section>

            <section className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-blueGray-700 mb-3">Menus & Tasks</h2>

              {(!selectedDept || !selectedUser) && (
                <div className="p-3 rounded bg-blue-50 text-sm text-blue-600">
                  Select both department and user.
                </div>
              )}

              {selectedDept && selectedUser && (
                <div className="border border-blueGray-100 rounded-lg">
                  {loading.tree && <div className="p-3 text-sm text-blueGray-400">Loading...</div>}

                  {!loading.tree && sortedTreeMenus.length === 0 && (
                    <div className="p-3 text-sm text-blueGray-400">
                      No menus found for this department. (Assign menus above then Save Dept Menus)
                    </div>
                  )}

                  {sortedTreeMenus.map((menu) => (
                    <div key={menu.menuCode} className="border-b last:border-b-0">
                      <div className="px-3 py-2 bg-slate-50">
                        <p className="text-sm font-semibold text-blueGray-700">
                          {menu.displayName}{" "}
                          <span className="text-xs text-blueGray-400">{menu.menuCode}</span>
                        </p>
                      </div>

                      {(menu.tasks || []).map((task) => {
                        const key = `${menu.menuCode}::${task.activityCode}`;
                        const checked = selectedKeys.has(key);
                        return (
                          <label key={key} className="flex items-center gap-2 px-3 py-2 text-sm border-t">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={loading.savingTasks}
                              onChange={() => toggleTask(menu.menuCode, task.activityCode)}
                              className="h-4 w-4"
                            />
                            <div className="flex flex-col">
                              <span className="text-blueGray-700 text-[13px]">
                                {task.activityName || task.activityCode}
                              </span>
                              <span className="text-[11px] text-blueGray-400">
                                {task.activityCode} {task.page ? `— ${task.page}` : ""}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Create Dept Modal */}
      {isDeptModalOpen && (
        <>
          <div
            onClick={() => setIsDeptModalOpen(false)}
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
              maxWidth: "640px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Create Department</h2>
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <form className="space-y-4" onSubmit={handleCreateDept}>
                <label className="block text-sm font-medium text-blueGray-600">
                  Dept Code *
                  <input
                    value={deptForm.deptTypeCode}
                    onChange={(e) => setDeptForm((p) => ({ ...p, deptTypeCode: e.target.value }))}
                    className="mt-1 px-3 py-2 w-full border rounded-md"
                  />
                </label>

                <label className="block text-sm font-medium text-blueGray-600">
                  Name *
                  <input
                    value={deptForm.name}
                    onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 px-3 py-2 w-full border rounded-md"
                  />
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                    Create
                  </button>
                  {deptMsg && <span className="text-xs text-red-600">{deptMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Create User Modal */}
      {isUserModalOpen && (
        <>
          <div
            onClick={() => setIsUserModalOpen(false)}
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
              maxWidth: "640px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Create User</h2>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <label className="block text-sm font-medium text-blueGray-600">
                  User ID *
                  <input
                    value={userForm.userId}
                    onChange={(e) => setUserForm((p) => ({ ...p, userId: e.target.value }))}
                    className="mt-1 px-3 py-2 w-full border rounded-md"
                  />
                </label>

                <label className="block text-sm font-medium text-blueGray-600">
                  Name *
                  <input
                    value={userForm.name}
                    onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 px-3 py-2 w-full border rounded-md"
                  />
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                    Create
                  </button>
                  {userMsg && <span className="text-xs text-red-600">{userMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeptTaskAssignPage;
