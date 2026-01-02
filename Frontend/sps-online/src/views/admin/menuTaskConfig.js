// menuTaskConfig.js

// NOTE: Hardcoded seed menus/tasks removed — menus and tasks are fetched from
// the backend API. Any local demo pages may still define their own seeds.

export const emptyMenu = {
  menuCode: "",
  displayName: "",
  description: "",
  orderKey: "",
};

export const emptyTask = {
  activityCode: "",
  activityName: "",
  page: "",
  orderKey: "",
};

export const STORAGE_KEYS = {
  MENUS: "menuTaskBuilder.menus",
  TASKS: "menuTaskBuilder.tasksByMenu",
};

// API base (can be overridden with REACT_APP_API_BASE)
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9090/sps/api";

/**
 * Fetch menus from backend API. Returns empty array on error.
 * Expected API: GET `${API_BASE}/main-menus` returning an array of menus.
 */
export async function fetchMenusFromApi() {
  // Use the canonical main-menus endpoint only.
  const url = `${API_BASE}/main-menus`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
    if (!arr) return [];

    return arr
      .map((m) => ({
        menuCode: m.menuCode || m.code || m.menu_code || m.code1 || "",
        displayName: m.displayName || m.display_name || m.name || m.display || "",
        description: m.description || m.desc || "",
        orderKey: Number(m.orderKey ?? m.order_key ?? m.order ?? 0) || 0,
        source: "api",
      }))
      .sort((a, b) => (a.orderKey || 0) - (b.orderKey || 0));
  } catch (err) {
    return [];
  }
}

/**
 * Fetch tasks for a given menuCode. Tries several likely endpoints then returns
 * an empty array if none are found.
 */
export async function fetchTasksByMenu(menuCode = "") {
  if (!menuCode) return [];
  const tryUrls = [
    `${API_BASE}/main-menus/${encodeURIComponent(menuCode)}/tasks`,
    `${API_BASE}/main-menus/tasks?menuCode=${encodeURIComponent(menuCode)}`,
    `${API_BASE}/tasks?menuCode=${encodeURIComponent(menuCode)}`,
  ];

  for (const url of tryUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
      if (!arr) continue;

      return arr.map((t) => ({
        activityCode: t.activityCode || t.code || t.activity_code || "",
        activityName: t.activityName || t.name || t.activity_name || "",
        page: t.page || t.path || t.url || "",
        orderKey: Number(t.orderKey ?? t.order_key ?? t.order ?? 0) || 0,
      }));
    } catch (err) {
      // try next URL
    }
  }

  // fallback: no tasks available for this menu
  return [];
}

/**
 * Convenience: fetch all menus and their tasks concurrently.
 */
export async function fetchAllMenusAndTasks() {
  const menus = await fetchMenusFromApi();
  const tasksByMenu = {};
  await Promise.all(
    menus.map(async (m) => {
      tasksByMenu[m.menuCode] = await fetchTasksByMenu(m.menuCode);
    })
  );
  return { menus, tasksByMenu };
}

export const sanitizeCode = (value = "") =>
  value.replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();

export const sanitizeOrder = (value = "") =>
  value.replace(/[^0-9]/g, "").slice(0, 4);

// menuTaskConfig.js (add near your other exports)

// Department list
export const DEPT_TYPES = [
  { code: "DEPOT", name: "CSC" },
  { code: "PROVINCIAL", name: "PROVINCIAL" },
  { code: "AREA", name: "AREA" },
  { code: "COM", name: "COMMERCIAL" },
];

// Roles per department
// 👉 Replace role names with the exact ones from your screenshot
export const DEPT_ROLES = {
  DEPOT: ["DEPOT_MANAGER", "DEPOT_STAFF"],
  PROVINCIAL: ["PROV_DIR", "PROV_OFFICER"],
  AREA: ["AREA_MANAGER", "AREA_USER"],
  COM: ["COM_MANAGER", "COM_USER"],
};

// ✅ NEW: menus visible per department
export const DEPT_MENU_ASSIGNMENTS = {
  DEPOT: ["NCS", "NCA", "NCD"],
  PROVINCIAL: ["NCN", "NCP", "CCM"],
  AREA: ["NCO", "NCB", "NCC"],
  COM: ["NCA", "NCB", "NCP", "CCM"],
};

// localStorage key for role-task mapping
export const ROLE_TASKS_STORAGE_KEY = "ROLE_TASKS_BY_DEPT_ROLE";
