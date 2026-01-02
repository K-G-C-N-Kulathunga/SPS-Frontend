// TaskPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// ✅ Example API helpers (replace with your axios calls)
async function fetchMenuCodesFromApi() {
  try {
    const res = await api.get("/tasks");
    console.log("status:", res.status);
    console.log("data sample:", res.data?.[0]);
    const codes = [...new Set((res.data || []).map((t) => t.menuCode).filter(Boolean))].sort();
    return codes;
  } catch (e) {
    console.log("axios error:", e?.response?.status, e?.response?.data);
    throw new Error("Failed to load menus");
  }
}

async function fetchTasksByMenuCode(menuCode) {
  const res = await api.get("/tasks");
  return (res.data || []).filter((t) => t.menuCode === menuCode);
}

const emptyTask = {
  menuCode: "",
  activityName: "",
  activityCode: "",
  page: "",
};

const TaskPage = () => {
  const query = useQuery();
  const initialMenuCode = query.get("menuCode") || "";

  const [menuCodes, setMenuCodes] = useState([]);
  const [selectedMenuCode, setSelectedMenuCode] = useState(initialMenuCode);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");

  // ✅ Create/Edit/Delete states (added)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [taskForm, setTaskForm] = useState(emptyTask);
  const [taskMessage, setTaskMessage] = useState("");

  const [editForm, setEditForm] = useState(emptyTask);
  const [editMessage, setEditMessage] = useState("");

  // ✅ 1) Load menu codes from backend
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingMenus(true);
        setError("");

        const codes = await fetchMenuCodesFromApi();
        if (cancelled) return;

        const sorted = (codes || []).slice().sort();
        setMenuCodes(sorted);

        // pick initial selection
        setSelectedMenuCode((current) => {
          if (current && sorted.includes(current)) return current;
          if (initialMenuCode && sorted.includes(initialMenuCode)) return initialMenuCode;
          return sorted[0] || "";
        });
      } catch (e) {
        if (!cancelled) {
          setMenuCodes([]);
          setSelectedMenuCode("");
          setSelectedTasks([]);
          setError(e?.message || "Failed to load menu codes");
        }
      } finally {
        if (!cancelled) setLoadingMenus(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialMenuCode]);

  // ✅ 2) When menu changes, fetch tasks for that menu only
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedMenuCode) {
        setSelectedTasks([]);
        return;
      }

      try {
        setLoadingTasks(true);
        setError("");

        const tasks = await fetchTasksByMenuCode(selectedMenuCode);
        if (cancelled) return;

        setSelectedTasks(tasks || []);
      } catch (e) {
        if (!cancelled) {
          setSelectedTasks([]);
          setError(e?.message || "Failed to load tasks");
        }
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMenuCode]);

  const handleSelectMenu = (menuCode) => {
    setSelectedMenuCode(menuCode);
  };

  // -----------------------------
  // ✅ Create Task (added)
  // -----------------------------
  const openCreateModal = () => {
    setTaskMessage("");
    setTaskForm({
      ...emptyTask,
      menuCode: selectedMenuCode || "",
    });
    setIsCreateOpen(true);
  };

  const handleTaskChange = ({ target }) => {
    const { name, value } = target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
    setTaskMessage("");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setTaskMessage("");

    const menuCode = (taskForm.menuCode || selectedMenuCode || "").trim();
    const activityName = taskForm.activityName.trim();
    const activityCode = taskForm.activityCode.trim();

    if (!menuCode) {
      setTaskMessage("Menu code is required.");
      return;
    }
    if (!activityName || !activityCode) {
      setTaskMessage("Activity name and activity code are required.");
      return;
    }

    const duplicate = selectedTasks.some(
      (t) => (t.activityCode || "").toUpperCase() === activityCode.toUpperCase()
    );
    if (duplicate) {
      setTaskMessage(`Task ${activityCode} already exists.`);
      return;
    }

    const payload = {
      menuCode,
      activityName,
      activityCode,
      page: taskForm.page.trim(),
    };

    try {
      // ✅ If your backend supports create:
      // await api.post("/tasks", payload);

      // Optimistic UI (keep your existing fetch behavior untouched)
      setSelectedTasks((prev) => [...prev, payload]);

      setTaskForm({ ...emptyTask, menuCode });
      setTaskMessage(`Draft task ${activityCode} added.`);
      setIsCreateOpen(false);
    } catch (err) {
      setTaskMessage(err?.response?.data?.message || err.message || "Failed to create task");
    }
  };

  // -----------------------------
  // ✅ Edit Task (added)
  // -----------------------------
  const openEditModal = (task) => {
    setEditMessage("");
    setEditForm({
      menuCode: task.menuCode || selectedMenuCode || "",
      activityName: task.activityName || "",
      activityCode: task.activityCode || "",
      page: task.page || "",
      _originalActivityCode: task.activityCode || "",
    });
    setIsEditOpen(true);
  };

  const handleEditChange = ({ target }) => {
    const { name, value } = target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditMessage("");
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setEditMessage("");

    const menuCode = (editForm.menuCode || selectedMenuCode || "").trim();
    const activityName = editForm.activityName.trim();
    const activityCode = editForm.activityCode.trim();

    if (!menuCode) {
      setEditMessage("Menu code is required.");
      return;
    }
    if (!activityName || !activityCode) {
      setEditMessage("Activity name and activity code are required.");
      return;
    }

    // If you allow editing activityCode, ensure no duplicates besides itself.
    const duplicate = selectedTasks.some(
      (t) =>
        (t.activityCode || "").toUpperCase() === activityCode.toUpperCase() &&
        (t.activityCode || "") !== (editForm._originalActivityCode || "")
    );
    if (duplicate) {
      setEditMessage(`Task ${activityCode} already exists.`);
      return;
    }

    const payload = {
      menuCode,
      activityName,
      activityCode,
      page: (editForm.page || "").trim(),
    };

    try {
      // ✅ If your backend supports update (example):
      // await api.put(`/tasks/${encodeURIComponent(editForm._originalActivityCode)}`, payload);

      setSelectedTasks((prev) =>
        prev.map((t) => {
          const key = t.activityCode || t.activityName;
          if (key !== editForm._originalActivityCode && t.activityCode !== editForm._originalActivityCode)
            return t;

          // safer match by originalActivityCode if present
          if ((t.activityCode || "") !== (editForm._originalActivityCode || "")) return t;

          return { ...t, ...payload };
        })
      );

      setIsEditOpen(false);
      setEditMessage("");
    } catch (err) {
      setEditMessage(err?.response?.data?.message || err.message || "Failed to update task");
    }
  };

  // -----------------------------
  // ✅ Delete Task (added)
  // -----------------------------
  const handleDeleteTask = async (task) => {
    const code = task.activityCode || "";
    const ok =
      typeof window !== "undefined"
        ? window.confirm(`Delete task ${code || task.activityName}?`)
        : true;
    if (!ok) return;

    try {
      // ✅ If your backend supports delete (example):
      // await api.delete(`/tasks/${encodeURIComponent(code)}`);

      setSelectedTasks((prev) =>
        prev.filter((t) => (t.activityCode || t.activityName) !== (task.activityCode || task.activityName))
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete task");
    }
  };

  // (kept) derived count
  const taskCount = useMemo(() => selectedTasks.length, [selectedTasks]);

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">Task Composer</h1>
              <p className="mt-2 text-sm text-blueGray-500">Select a menuCode and view its tasks.</p>
            </div>

            <div className="text-xs text-blueGray-500 text-right">
              <div>
                Menus Loaded: <span className="font-semibold">{menuCodes.length}</span>
              </div>
            </div>
          </header>

          <div className="px-1 py-1 space-y-10 bg-blueGray-50">
            <section className="flex flex-col items-center gap-6">
              <article className="bg-white border rounded-lg shadow-sm p-6 w-full max-w-2xl">
                <h2 className="text-lg font-semibold text-blueGray-700 mb-2">Select Menu</h2>

                {error && (
                  <div className="mb-3 p-2 rounded bg-red-50 text-[12px] text-red-600">{error}</div>
                )}

                <label className="block text-sm mb-4">
                  <span className="text-blueGray-500">Select Menu Code</span>
                  <select
                    value={selectedMenuCode}
                    onChange={(e) => handleSelectMenu(e.target.value)}
                    className="mt-1 px-3 py-2 w-full border rounded bg-white text-blueGray-700"
                    disabled={loadingMenus}
                  >
                    <option value="">-- Select Menu --</option>
                    {menuCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </label>

                {loadingMenus && <div className="text-[11px] text-blueGray-400">Loading menus...</div>}
              </article>

              <article className="bg-white border rounded-lg shadow-sm p-4 w-full max-w-2xl text-[12px]">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[14px] font-semibold text-blueGray-700">Tasks</h2>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-blueGray-400">
                      {loadingTasks ? "Loading..." : `${taskCount} items`}
                    </span>

                    <button
                      type="button"
                      onClick={openCreateModal}
                      disabled={!selectedMenuCode}
                      className={`text-[11px] px-2 py-1 rounded font-semibold ${
                        selectedMenuCode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blueGray-100 text-blueGray-400 cursor-not-allowed"
                      }`}
                    >
                      Create
                    </button>
                  </div>
                </div>

                {!selectedMenuCode && (
                  <div className="p-2 mb-2 rounded bg-blue-50 text-[11px] text-blue-600">
                    Choose a menu code to view its tasks.
                  </div>
                )}

                <div className="border border-blueGray-100 rounded divide-y">
                  {selectedMenuCode &&
                    !loadingTasks &&
                    selectedTasks.map((task) => (
                      <div key={task.activityCode || task.activityName} className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[12px] font-semibold text-blueGray-700">
                              {task.activityName}
                            </p>
                            <p className="text-[10px] text-blueGray-400">{task.activityCode}</p>
                            {task.page && (
                              <p className="mt-1 text-[10px] text-blueGray-500 break-all">{task.page}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(task)}
                              className="bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task)}
                              className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {selectedMenuCode && loadingTasks && (
                    <div className="p-3 text-[11px] text-blueGray-400">Loading tasks...</div>
                  )}
                </div>
              </article>
            </section>
          </div>
        </div>
      </div>

      {/* ✅ CREATE TASK POPUP MODAL (added) */}
      {isCreateOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsCreateOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              zIndex: 9998,
            }}
          />

          {/* Centered modal */}
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
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Create Task</h2>

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs text-blueGray-400 mb-4">
                Create a task under the selected menu.
              </p>

              <form className="space-y-4" onSubmit={handleAddTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-blueGray-600">
                    Menu Code *
                    <input
                      type="text"
                      name="menuCode"
                      value={taskForm.menuCode}
                      onChange={handleTaskChange}
                      readOnly
                      className="mt-1 px-3 py-2 w-full border rounded-md bg-blueGray-50 cursor-not-allowed"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600">
                    Activity Code *
                    <input
                      type="text"
                      name="activityCode"
                      value={taskForm.activityCode}
                      onChange={handleTaskChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      placeholder="e.g. USER_CREATE"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
                    Activity Name *
                    <input
                      type="text"
                      name="activityName"
                      value={taskForm.activityName}
                      onChange={handleTaskChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      placeholder="e.g. Create User"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
                    Page (optional)
                    <input
                      type="text"
                      name="page"
                      value={taskForm.page}
                      onChange={handleTaskChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      placeholder="/admin/users/create"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    Add Task
                  </button>

                  {taskMessage && <span className="text-xs text-blueGray-500">{taskMessage}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ✅ EDIT TASK POPUP MODAL (added) */}
      {isEditOpen && (
        <>
          <div
            onClick={() => setIsEditOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              zIndex: 9998,
            }}
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
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
              <h2 className="text-lg font-bold text-blueGray-700">Edit Task</h2>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs text-blueGray-400 mb-4">Update task metadata.</p>

              <form className="space-y-4" onSubmit={handleUpdateTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-blueGray-600">
                    Menu Code *
                    <input
                      type="text"
                      name="menuCode"
                      value={editForm.menuCode}
                      readOnly
                      className="mt-1 px-3 py-2 w-full border rounded-md bg-blueGray-50 cursor-not-allowed"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600">
                    Activity Code *
                    <input
                      type="text"
                      name="activityCode"
                      value={editForm.activityCode}
                      readOnly
                      className="mt-1 px-3 py-2 w-full border rounded-md bg-blueGray-50 cursor-not-allowed"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
                    Activity Name *
                    <input
                      type="text"
                      name="activityName"
                      value={editForm.activityName}
                      onChange={handleEditChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </label>

                  <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
                    Page (optional)
                    <input
                      type="text"
                      name="page"
                      value={editForm.page}
                      onChange={handleEditChange}
                      className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    Update Task
                  </button>

                  {editMessage && <span className="text-xs text-blueGray-500">{editMessage}</span>}
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskPage;
