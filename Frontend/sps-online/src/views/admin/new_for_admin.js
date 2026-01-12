import React, { useEffect, useMemo, useState } from "react";
import { fetchAllMenusAndTasks } from "./menuTaskConfig";

const emptyMenu = {
  menuCode: "",
  displayName: "",
  description: "",
  orderKey: "",
};

const emptyTask = {
  activityCode: "",
  activityName: "",
  page: "",
  orderKey: "",
};

const STORAGE_KEYS = {
  MENUS: "menuTaskBuilder.menus",
  TASKS: "menuTaskBuilder.tasksByMenu",
};

const sanitizeCode = (value = "") =>
  value.replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();

const sanitizeOrder = (value = "") =>
  value.replace(/[^0-9]/g, "").slice(0, 4);

const MenuTaskManagement = () => {
  const [menus, setMenus] = useState([]);
  const [tasksByMenu, setTasksByMenu] = useState({});

  const [menuForm, setMenuForm] = useState(emptyMenu);
  const [taskForm, setTaskForm] = useState(emptyTask);

  const [selectedMenuCode, setSelectedMenuCode] = useState("");

  const [menuMessage, setMenuMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [jsonPreview, setJsonPreview] = useState(null);

  // --------- Load from localStorage once (if data exists) ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedMenus = window.localStorage.getItem(STORAGE_KEYS.MENUS);
      const storedTasks = window.localStorage.getItem(STORAGE_KEYS.TASKS);

      if (storedMenus) {
        const parsedMenus = JSON.parse(storedMenus);
        if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
          setMenus(parsedMenus);
          if (!selectedMenuCode && parsedMenus[0]?.menuCode) {
            setSelectedMenuCode(parsedMenus[0].menuCode);
          }
        }
      }

      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (parsedTasks && typeof parsedTasks === "object") {
          setTasksByMenu(parsedTasks);
        }
      }
    } catch (error) {
      // if parse fails, just ignore and use seeds
      // console.error("Failed to load menu-task data:", error);
    }
  }, []); // run only once

  // Fetch from backend API and override localStorage values if available
  useEffect(() => {
    (async () => {
      try {
        const { menus: apiMenus, tasksByMenu: apiTasks } = await fetchAllMenusAndTasks();
        if (Array.isArray(apiMenus) && apiMenus.length > 0) {
          setMenus(apiMenus);
          setSelectedMenuCode((current) => {
            if (current && apiMenus.some((m) => m.menuCode === current)) return current;
            return apiMenus[0].menuCode;
          });
        }
        if (apiTasks && typeof apiTasks === "object") {
          setTasksByMenu(apiTasks);
        }
      } catch (e) {
        // ignore — keep localStorage or empty state
      }
    })();
  }, []);

  // --------- Persist to localStorage when menus or tasks change ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_KEYS.MENUS,
        JSON.stringify(menus)
      );
      window.localStorage.setItem(
        STORAGE_KEYS.TASKS,
        JSON.stringify(tasksByMenu)
      );
    } catch (error) {
      // console.error("Failed to save menu-task data:", error);
    }
  }, [menus, tasksByMenu]);

  // --------- Derived data ----------
  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => {
      const orderA =
        typeof a.orderKey === "number" && !Number.isNaN(a.orderKey)
          ? a.orderKey
          : Number.MAX_SAFE_INTEGER;
      const orderB =
        typeof b.orderKey === "number" && !Number.isNaN(b.orderKey)
          ? b.orderKey
          : Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [menus]);

  const selectedMenu =
    sortedMenus.find((menu) => menu.menuCode === selectedMenuCode) ?? null;

  const selectedTasks = selectedMenu
    ? tasksByMenu[selectedMenu.menuCode] ?? []
    : [];

  // Make sure we always have a selected menu if list not empty
  useEffect(() => {
    if (!selectedMenu && sortedMenus.length > 0) {
      setSelectedMenuCode(sortedMenus[0].menuCode);
    }
  }, [selectedMenu, sortedMenus]);

  // --------- Handlers: Menu ----------
  const handleMenuChange = ({ target }) => {
    const { name, value } = target;

    const nextValue =
      name === "menuCode"
        ? sanitizeCode(value).slice(0, 20)
        : name === "orderKey"
        ? sanitizeOrder(value)
        : value;

    setMenuForm((prev) => ({ ...prev, [name]: nextValue }));
    setMenuMessage("");
  };

  const handleAddMenu = (event) => {
    event.preventDefault();
    setMenuMessage("");

    const code = menuForm.menuCode.trim();
    const label = menuForm.displayName.trim();

    if (!code || !label) {
      setMenuMessage("Menu code and display name are required.");
      return;
    }

    const duplicate = menus.some(
      (menu) => menu.menuCode.toUpperCase() === code.toUpperCase()
    );

    if (duplicate) {
      setMenuMessage(`Menu , ${code} already exists.`);
      return;
    }

    const newMenu = {
      menuCode: code,
      displayName: label,
      description: menuForm.description.trim(),
      orderKey: menuForm.orderKey ? Number(menuForm.orderKey) : null,
      source: "draft",
    };

    setMenus((prev) => [...prev, newMenu]);
    setMenuForm(emptyMenu);
    setSelectedMenuCode(code);
    setMenuMessage(`Draft menu ${code} added.`);
  };

  const handleRemoveMenu = (menuCode) => {
    setMenus((prev) => prev.filter((menu) => menu.menuCode !== menuCode));
    setTasksByMenu((prev) => {
      const next = { ...prev };
      delete next[menuCode];
      return next;
    });
    setSelectedMenuCode((current) => (current === menuCode ? "" : current));
    setMenuMessage(`Removed draft menu ${menuCode}.`);
  };

  const handleSelectMenu = (menuCode) => {
    setSelectedMenuCode(menuCode);
    setTaskMessage("");
  };

  // --------- Handlers: Task ----------
  const handleTaskChange = ({ target }) => {
    const { name, value } = target;

    const nextValue =
      name === "activityCode"
        ? sanitizeCode(value).slice(0, 25)
        : name === "orderKey"
        ? sanitizeOrder(value)
        : value;

    setTaskForm((prev) => ({ ...prev, [name]: nextValue }));
    setTaskMessage("");
  };

  const handleAddTask = (event) => {
    event.preventDefault();
    setTaskMessage("");

    if (!selectedMenu) {
      setTaskMessage("Select a menu before adding tasks.");
      return;
    }

    const code = taskForm.activityCode.trim();
    const name = taskForm.activityName.trim();

    if (!code || !name) {
      setTaskMessage("Task code and name are required.");
      return;
    }

    const currentTasks = tasksByMenu[selectedMenu.menuCode] ?? [];
    const duplicate = currentTasks.some(
      (task) => task.activityCode.toUpperCase() === code.toUpperCase()
    );

    if (duplicate) {
      setTaskMessage(`Task ${code} already exists for ${selectedMenu.menuCode}.`);
      return;
    }

    const newTask = {
      activityCode: code,
      activityName: name,
      page: taskForm.page.trim(),
      orderKey: taskForm.orderKey ? Number(taskForm.orderKey) : null,
      source: "draft",
    };

    setTasksByMenu((prev) => ({
      ...prev,
      [selectedMenu.menuCode]: [...currentTasks, newTask],
    }));
    setTaskForm(emptyTask);
    setTaskMessage(`Draft task ${code} added to ${selectedMenu.menuCode}.`);
  };

  const handleRemoveTask = (menuCode, activityCode) => {
    setTasksByMenu((prev) => ({
      ...prev,
      [menuCode]: (prev[menuCode] ?? []).filter(
        (task) => task.activityCode !== activityCode
      ),
    }));
    setTaskMessage(`Removed draft task ${activityCode}.`);
  };

  // --------- Preview & Reset ----------
  const handleGeneratePreview = () => {
    const payload = {
      menus: sortedMenus.map((menu) => ({
        menuCode: menu.menuCode,
        displayName: menu.displayName,
        description: menu.description,
        orderKey: menu.orderKey,
        source: menu.source,
      })),
      tasksByMenu: Object.fromEntries(
        Object.entries(tasksByMenu).map(([menuCode, tasks]) => [
          menuCode,
          tasks.map((task) => ({
            activityCode: task.activityCode,
            activityName: task.activityName,
            page: task.page,
            orderKey: task.orderKey,
            source: task.source,
          })),
        ])
      ),
    };

    setJsonPreview(JSON.stringify(payload, null, 2));
  };

  const handleClearPreview = () => {
    setJsonPreview(null);
  };

  const handleResetToDefaults = () => {
    // simple safety confirm in browser
    // eslint-disable-next-line no-restricted-globals
    const ok = typeof window !== "undefined"
      ? window.confirm("Reset menus and tasks to default seed values?")
      : true;

    if (!ok) return;

    (async () => {
      try {
        const { menus: apiMenus, tasksByMenu: apiTasks } = await fetchAllMenusAndTasks();
        if (Array.isArray(apiMenus) && apiMenus.length > 0) {
          setMenus(apiMenus);
          setSelectedMenuCode(apiMenus[0].menuCode);
        } else {
          setMenus([]);
          setSelectedMenuCode("");
        }
        if (apiTasks && typeof apiTasks === "object") setTasksByMenu(apiTasks);
        else setTasksByMenu({});
      } catch (e) {
        setMenus([]);
        setTasksByMenu({});
        setSelectedMenuCode("");
      }
    })();

    setMenuForm(emptyMenu);
    setTaskForm(emptyTask);
    setMenuMessage("Reset to default menus and tasks.");
    setTaskMessage("");
    setJsonPreview(null);
  };

  const draftMenuCount = menus.filter((m) => m.source === "draft").length;
  const draftTaskCount = Object.values(tasksByMenu).reduce(
    (sum, tasks) => sum + tasks.filter((t) => t.source === "draft").length,
    0
  );

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          <header className="px-8 py-6 border-b border-blueGray-100 bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">
                Menu &amp; Task Composer
              </h1>
              <p className="mt-2 text-sm text-blueGray-500">
                Build sidebar entries visually. Everything stays in memory
                and local storage until you export it to scripts or backend services.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-blueGray-500 text-right">
                <div>
                  Draft Menus:{" "}
                  <span className="font-semibold">{draftMenuCount}</span>
                </div>
                <div>
                  Draft Tasks:{" "}
                  <span className="font-semibold">{draftTaskCount}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Reset to defaults
              </button>
            </div>
          </header>

          <div className="px-8 py-8 space-y-10 bg-blueGray-50">
            {/* Menus + Tasks */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Menu side */}
              <article className="bg-white border border-blueGray-100 rounded-lg shadow-sm p-6">
                <header className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-blueGray-700">
                      Create Menu
                    </h2>
                    <p className="text-xs text-blueGray-400">
                      Step 1: define menu metadata. Order controls sidebar sorting.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                    Step 1
                  </span>
                </header>

                <form className="space-y-4" onSubmit={handleAddMenu}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-sm">
                      <span className="text-blueGray-500">Menu Code *</span>
                      <input
                        type="text"
                        name="menuCode"
                        value={menuForm.menuCode}
                        onChange={handleMenuChange}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400"
                        placeholder="e.g. ADMIN"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="text-blueGray-500">Display Name *</span>
                      <input
                        type="text"
                        name="displayName"
                        value={menuForm.displayName}
                        onChange={handleMenuChange}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400"
                        placeholder="Administration"
                      />
                    </label>

                    <label className="block text-sm md:col-span-2">
                      <span className="text-blueGray-500">Description</span>
                      <textarea
                        name="description"
                        rows={2}
                        value={menuForm.description}
                        onChange={handleMenuChange}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400"
                        placeholder="Describe what appears under this menu"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="text-blueGray-500">Order (optional)</span>
                      <input
                        type="text"
                        name="orderKey"
                        value={menuForm.orderKey}
                        onChange={handleMenuChange}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400"
                        placeholder="1"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Add Menu Draft
                    </button>
                    {menuMessage && (
                      <span className="text-xs text-blueGray-500">
                        {menuMessage}
                      </span>
                    )}
                  </div>
                </form>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide">
                      Menu Library
                    </h3>
                    <span className="text-xs text-blueGray-400">
                      {sortedMenus.length} total
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-blueGray-100 rounded-lg divide-y">
                    {sortedMenus.length === 0 && (
                      <div className="p-4 text-sm text-blueGray-400">
                        No menus configured yet.
                      </div>
                    )}

                    {sortedMenus.map((menu) => {
                      const isSelected = menu.menuCode === selectedMenuCode;
                      const isDraft = menu.source === "draft";
                      return (
                        <button
                          type="button"
                          key={menu.menuCode}
                          onClick={() => handleSelectMenu(menu.menuCode)}
                          className={`w-full text-left px-4 py-3 transition focus:outline-none ${
                            isSelected
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : "hover:bg-blueGray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-blueGray-700">
                                {menu.displayName}
                              </p>
                              <p className="text-xs text-blueGray-400">
                                {menu.menuCode}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {menu.orderKey != null && (
                                <span className="text-xs text-blueGray-400">
                                  #{menu.orderKey}
                                </span>
                              )}
                              <span
                                className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${
                                  isDraft
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {menu.source}
                              </span>
                            </div>
                          </div>

                          {isDraft && (
                            <div className="mt-3 text-right">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveMenu(menu.menuCode);
                                }}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                Remove draft
                              </button>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>

              {/* Task side */}
              <article className="bg-white border border-blueGray-100 rounded-lg shadow-sm p-6">
                <header className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-blueGray-700">
                      Create Task
                    </h2>
                    <p className="text-xs text-blueGray-400">
                      Step 2: attach task entries to the selected menu and map their target pages.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                    Step 2
                  </span>
                </header>

                {!selectedMenu && (
                  <div className="p-4 mb-4 rounded-lg bg-blue-50 text-sm text-blue-600">
                    Choose a menu from the left before adding tasks.
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleAddTask}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-sm md:col-span-2">
                      <span className="text-blueGray-500">Selected Menu</span>
                      <input
                        type="text"
                        value={
                          selectedMenu
                            ? `${selectedMenu.displayName} (${selectedMenu.menuCode})`
                            : "Not selected"
                        }
                        readOnly
                        className="mt-1 px-3 py-2 w-full border rounded bg-blueGray-50 text-blueGray-400"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="text-blueGray-500">Task Code *</span>
                      <input
                        type="text"
                        name="activityCode"
                        value={taskForm.activityCode}
                        onChange={handleTaskChange}
                        disabled={!selectedMenu}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400 disabled:bg-blueGray-50 disabled:text-blueGray-300"
                        placeholder="e.g. TASK_CREATE"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="text-blueGray-500">Task Name *</span>
                      <input
                        type="text"
                        name="activityName"
                        value={taskForm.activityName}
                        onChange={handleTaskChange}
                        disabled={!selectedMenu}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400 disabled:bg-blueGray-50 disabled:text-blueGray-300"
                        placeholder="Create New Task"
                      />
                    </label>

                    <label className="block text-sm md:col-span-2">
                      <span className="text-blueGray-500">Target Page</span>
                      <input
                        type="text"
                        name="page"
                        value={taskForm.page}
                        onChange={handleTaskChange}
                        disabled={!selectedMenu}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400 disabled:bg-blueGray-50 disabled:text-blueGray-300"
                        placeholder="/admin/new-task"
                      />
                      <span className="text-[11px] text-blueGray-400">
                        Supports full URLs, absolute paths (e.g. /admin/reports) or
                        relative segments (e.g. admin/reports).
                      </span>
                    </label>

                    <label className="block text-sm">
                      <span className="text-blueGray-500">Order (optional)</span>
                      <input
                        type="text"
                        name="orderKey"
                        value={taskForm.orderKey}
                        onChange={handleTaskChange}
                        disabled={!selectedMenu}
                        className="mt-1 px-3 py-2 w-full border rounded focus:outline-none focus:ring focus:border-blue-400 disabled:bg-blueGray-50 disabled:text-blueGray-300"
                        placeholder="1"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!selectedMenu}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        selectedMenu
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-blueGray-200 text-blueGray-400 cursor-not-allowed"
                      }`}
                    >
                      Add Task Draft
                    </button>
                    {taskMessage && (
                      <span className="text-xs text-blueGray-500">
                        {taskMessage}
                      </span>
                    )}
                  </div>
                </form>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide">
                      Tasks for {selectedMenu ? selectedMenu.menuCode : "..."}
                    </h3>
                    <span className="text-xs text-blueGray-400">
                      {selectedTasks.length} items
                    </span>
                  </div>

                  <div className="border border-blueGray-100 rounded-lg divide-y max-h-60 overflow-y-auto">
                    {!selectedMenu && (
                      <div className="p-4 text-sm text-blueGray-400">
                        Select a menu to view tasks.
                      </div>
                    )}

                    {selectedMenu && selectedTasks.length === 0 && (
                      <div className="p-4 text-sm text-blueGray-400">
                        No tasks attached yet. Add tasks to describe navigation
                        within this menu.
                      </div>
                    )}

                    {selectedMenu &&
                      selectedTasks.map((task) => {
                        const isDraft = task.source === "draft";
                        return (
                          <div key={task.activityCode} className="p-4 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-blueGray-700">
                                  {task.activityName}
                                </p>
                                <p className="text-xs text-blueGray-400">
                                  {task.activityCode}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {task.orderKey != null && (
                                  <span className="text-xs text-blueGray-400">
                                    #{task.orderKey}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${
                                    isDraft
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {task.source}
                                </span>
                                {isDraft && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveTask(
                                        selectedMenu.menuCode,
                                        task.activityCode
                                      )
                                    }
                                    className="text-xs text-red-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            {task.page && (
                              <p className="mt-2 text-xs text-blueGray-500 break-all">
                                {task.page}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </article>
            </section>

            {/* Summary + JSON */}
            <section className="bg-white border border-blueGray-100 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-blueGray-700">
                    Draft Summary
                  </h2>
                  <p className="text-xs text-blueGray-400">
                    Use the preview to create SQL inserts or payloads for your backend later.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    Generate JSON Preview
                  </button>
                  {jsonPreview && (
                    <button
                      type="button"
                      onClick={handleClearPreview}
                      className="px-4 py-2 text-sm font-semibold text-blueGray-500 border border-blueGray-200 rounded-lg hover:bg-blueGray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-2">
                    Draft Menus
                  </h3>
                  <ul className="space-y-3">
                    {draftMenuCount === 0 && (
                      <li className="text-sm text-blueGray-400">
                        No draft menus yet.
                      </li>
                    )}
                    {menus
                      .filter((menu) => menu.source === "draft")
                      .map((menu) => (
                        <li
                          key={menu.menuCode}
                          className="text-sm text-blueGray-600"
                        >
                          <span className="font-semibold">
                            {menu.menuCode}
                          </span>{" "}
                          — {menu.displayName}
                          {menu.description && (
                            <span className="block text-xs text-blueGray-400">
                              {menu.description}
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-2">
                    Draft Tasks
                  </h3>
                  <div className="space-y-4">
                    {draftTaskCount === 0 && (
                      <p className="text-sm text-blueGray-400">
                        No draft tasks yet.
                      </p>
                    )}

                    {Object.entries(tasksByMenu)
                      .filter(([, tasks]) =>
                        tasks.some((task) => task.source === "draft")
                      )
                      .map(([menuCode, tasks]) => (
                        <div key={menuCode}>
                          <p className="text-sm font-semibold text-blueGray-600">
                            {menuCode}
                          </p>
                          <ul className="mt-1 space-y-2">
                            {tasks
                              .filter((task) => task.source === "draft")
                              .map((task) => (
                                <li
                                  key={task.activityCode}
                                  className="text-sm text-blueGray-500"
                                >
                                  <span className="font-semibold">
                                    {task.activityCode}
                                  </span>{" "}
                                  — {task.activityName}
                                  {task.page && (
                                    <span className="block text-xs text-blueGray-400">
                                      {task.page}
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {jsonPreview && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide mb-2">
                    JSON Preview
                  </h3>
                  <pre className="bg-blueGray-900 text-blueGray-100 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
{jsonPreview}
                  </pre>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTaskManagement;