// src/views/admin/RoleTaskPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "api";

/* ============================
   API HELPERS (Backend)
   ============================ */

// 1) Roles list (UserCategory)
async function fetchRoles() {
  const res = await api.get("task-user-categories"); // change if your endpoint differs
  const rows = Array.isArray(res.data) ? res.data : [];

  const mapped = rows
    .map((r) => ({
      id: r.userRoleCode ?? r.userId ?? r.id ?? "",
      name: r.userRoleName ?? r.userName ?? r.name ?? r.userRoleCode ?? "",
    }))
    .filter((x) => x.id);

  // ✅ distinct by id
  const map = new Map();
  for (const r of mapped) {
    if (!map.has(r.id)) map.set(r.id, r);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}


// 2) Menus
async function fetchMenus() {
  const res = await api.get("/main-menus");
  return res.data || [];
}

// 3) Tasks
async function fetchAllTasks() {
  const res = await api.get("/tasks");
  return res.data || [];
}

// group tasks by menuCode
function groupTasksByMenu(tasks = []) {
  const arr = Array.isArray(tasks) ? tasks : [];
  return arr.reduce((acc, t) => {
    const key = t.menuCode || "";
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
}

// 4) Role -> task mappings (TaskUserCategory)
async function fetchRoleAssignments(roleCode) {
  // controller we suggested: /api/task-user-categories/user/{roleCode}
  const res = await api.get(`/task-user-categories/user/${encodeURIComponent(roleCode)}`);
  return res.data || []; // array of {userRoleCode, menuCode, activityCode}
}

// 5) Create mapping (assign)
async function createAssignment(payload) {
  // POST /task-user-categories
  const res = await api.post("/task-user-categories", payload);
  return res.data;
}

// 6) Delete mapping (unassign)
async function deleteAssignment({ userRoleCode, menuCode, activityCode }) {
  // DELETE /task-user-categories?userRoleCode=...&menuCode=...&activityCode=...
  await api.delete("/task-user-categories", {
    params: { userRoleCode, menuCode, activityCode },
  });
}

/* ============================
   PAGE
   ============================ */

const RoleTaskPage = () => {
  const [roles, setRoles] = useState([]); // [{id,name}]
  const [selectedRole, setSelectedRole] = useState(""); // roleCode

  const [menus, setMenus] = useState([]);
  const [tasksByMenu, setTasksByMenu] = useState({}); // { menuCode: [task...] }

  // assignments for selected role as Set of "menuCode::activityCode"
  const [assignedKeys, setAssignedKeys] = useState(new Set());

  const [loading, setLoading] = useState({
    roles: false,
    menus: false,
    tasks: false,
    assignments: false,
    saving: false,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Sort menus by orderKey then displayName
  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => {
      const orderA = Number.isFinite(a.orderKey) ? a.orderKey : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.orderKey) ? b.orderKey : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.displayName || "").localeCompare(String(b.displayName || ""));
    });
  }, [menus]);

  /* -----------------------------
   * Initial load: roles, menus, tasks
   * --------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        setMessage("");
        setLoading((p) => ({ ...p, roles: true, menus: true, tasks: true }));

        const [r, m, t] = await Promise.all([
          fetchRoles(),
          fetchMenus(),
          fetchAllTasks(),
        ]);

        if (cancelled) return;

        setRoles(r);
        setMenus(m);
        setTasksByMenu(groupTasksByMenu(t));

        // choose first role by default
        setSelectedRole((cur) => cur || (r?.[0]?.id ?? ""));
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data || e?.message || "Failed to load initial data");
        }
      } finally {
        if (!cancelled) {
          setLoading((p) => ({ ...p, roles: false, menus: false, tasks: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------
   * Load assignments when role changes
   * --------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedRole) {
        setAssignedKeys(new Set());
        return;
      }

      try {
        setError("");
        setMessage("");
        setLoading((p) => ({ ...p, assignments: true }));

        const rows = await fetchRoleAssignments(selectedRole);
        if (cancelled) return;

        const next = new Set(
          (rows || []).map((x) => `${x.menuCode}::${x.activityCode}`)
        );
        setAssignedKeys(next);
      } catch (e) {
        if (!cancelled) {
          setAssignedKeys(new Set());
          setError(e?.response?.data || e?.message || "Failed to load role assignments");
        }
      } finally {
        if (!cancelled) {
          setLoading((p) => ({ ...p, assignments: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRole]);

  /* -----------------------------
   * UI Handlers
   * --------------------------- */

  const handleSelectRole = (roleCode) => {
    setSelectedRole(roleCode);
    setMessage("");
  };

  const handleToggle = async (menuCode, activityCode) => {
    if (!selectedRole) return;

    const key = `${menuCode}::${activityCode}`;
    const isChecked = assignedKeys.has(key);

    // optimistic UI
    const next = new Set(assignedKeys);
    if (isChecked) next.delete(key);
    else next.add(key);
    setAssignedKeys(next);

    try {
      setError("");
      setLoading((p) => ({ ...p, saving: true }));

      if (isChecked) {
        // delete mapping
        await deleteAssignment({
          userRoleCode: selectedRole,
          menuCode,
          activityCode,
        });
      } else {
        // create mapping
        await createAssignment({
          userRoleCode: selectedRole,
          menuCode,
          activityCode,
        });
      }

      setMessage("Saved");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      // rollback UI on failure
      const rollback = new Set(assignedKeys);
      setAssignedKeys(rollback);

      setError(e?.response?.data || e?.message || "Save failed");
    } finally {
      setLoading((p) => ({ ...p, saving: false }));
    }
  };

  const handleSelectAll = async () => {
    if (!selectedRole) return;

    // Build all task keys from tasksByMenu
    const allKeys = Object.entries(tasksByMenu).flatMap(([menuCode, tasks]) =>
      (tasks || []).map((t) => `${menuCode}::${t.activityCode}`)
    );

    // Only assign missing keys
    const missing = allKeys.filter((k) => !assignedKeys.has(k));
    if (missing.length === 0) return;

    // optimistic
    const next = new Set(assignedKeys);
    missing.forEach((k) => next.add(k));
    setAssignedKeys(next);

    try {
      setError("");
      setLoading((p) => ({ ...p, saving: true }));

      // create one-by-one (simple)
      // (If you want bulk endpoint, we can optimize this)
      for (const k of missing) {
        const [menuCode, activityCode] = k.split("::");
        await createAssignment({ userRoleCode: selectedRole, menuCode, activityCode });
      }

      setMessage("Saved (Select All)");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      // rollback by re-fetching assignments
      try {
        const rows = await fetchRoleAssignments(selectedRole);
        const rollback = new Set((rows || []).map((x) => `${x.menuCode}::${x.activityCode}`));
        setAssignedKeys(rollback);
      } catch {}
      setError(e?.response?.data || e?.message || "Select All failed");
    } finally {
      setLoading((p) => ({ ...p, saving: false }));
    }
  };

  const handleClearAll = async () => {
    if (!selectedRole) return;

    const current = Array.from(assignedKeys);
    if (current.length === 0) return;

    // optimistic
    setAssignedKeys(new Set());

    try {
      setError("");
      setLoading((p) => ({ ...p, saving: true }));

      for (const k of current) {
        const [menuCode, activityCode] = k.split("::");
        await deleteAssignment({ userRoleCode: selectedRole, menuCode, activityCode });
      }

      setMessage("Saved (Clear All)");
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      // rollback by re-fetch
      try {
        const rows = await fetchRoleAssignments(selectedRole);
        const rollback = new Set((rows || []).map((x) => `${x.menuCode}::${x.activityCode}`));
        setAssignedKeys(rollback);
      } catch {}
      setError(e?.response?.data || e?.message || "Clear All failed");
    } finally {
      setLoading((p) => ({ ...p, saving: false }));
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
              <h1 className="text-2xl font-semibold text-blueGray-700">Role Task Assignment</h1>
              <p className="mt-2 text-sm text-blueGray-500">
                Select a role and assign tasks (saved in DB).
              </p>
            </div>

            <div className="text-xs text-blueGray-500 text-right">
              <div>Roles: <span className="font-semibold">{roles.length}</span></div>
              <div>Saving: <span className="font-semibold">{loading.saving ? "Yes" : "No"}</span></div>
            </div>
          </header>

          <div className="px-4 py-4 bg-blueGray-50 space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-50 text-[12px] text-red-600">
                {String(error)}
              </div>
            )}

            {message && (
              <div className="p-2 rounded bg-emerald-50 text-[12px] text-emerald-700">
                {message}
              </div>
            )}

            {/* Role selector */}
            <section className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-blueGray-700 mb-3">Select Role</h2>

              <select
                value={selectedRole}
                onChange={(e) => handleSelectRole(e.target.value)}
                className="px-3 py-2 w-full max-w-md border rounded bg-white text-blueGray-700"
                disabled={loading.roles}
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>

              {(loading.roles || loading.assignments) && (
                <p className="mt-2 text-[12px] text-blueGray-400">
                  {loading.roles ? "Loading roles..." : "Loading assignments..."}
                </p>
              )}
            </section>

            {/* Assign tasks */}
            <section className="bg-white border rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-blueGray-700">Assign Tasks</h2>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={!selectedRole || loading.saving}
                    className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={!selectedRole || loading.saving}
                    className="px-3 py-1 text-xs font-semibold rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {!selectedRole && (
                <div className="p-3 rounded bg-blue-50 text-sm text-blue-600">
                  Select a role to manage task assignments.
                </div>
              )}

              {selectedRole && (
                <div className="border border-blueGray-100 rounded-lg">
                  {sortedMenus.length === 0 && (
                    <div className="p-3 text-sm text-blueGray-400">
                      No menus found.
                    </div>
                  )}

                  {sortedMenus.map((menu) => {
                    const tasks = tasksByMenu[menu.menuCode] || [];
                    return (
                      <div key={menu.menuCode} className="border-b last:border-b-0">
                        <div className="px-3 py-2 bg-slate-50">
                          <p className="text-sm font-semibold text-blueGray-700">
                            {menu.displayName}{" "}
                            <span className="text-xs text-blueGray-400">
                              {menu.menuCode}
                            </span>
                          </p>
                        </div>

                        {tasks.length === 0 && (
                          <div className="p-3 text-sm text-blueGray-400">
                            No tasks under this menu.
                          </div>
                        )}

                        {tasks.map((task) => {
                          const key = `${menu.menuCode}::${task.activityCode}`;
                          const checked = assignedKeys.has(key);
                          return (
                            <label
                              key={key}
                              className="flex items-center justify-between px-3 py-2 text-sm border-t"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={loading.saving}
                                  onChange={() => handleToggle(menu.menuCode, task.activityCode)}
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
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleTaskPage;
