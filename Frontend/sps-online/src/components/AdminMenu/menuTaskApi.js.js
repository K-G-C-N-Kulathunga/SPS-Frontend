// menuTaskApi.js
import { api } from "api";

// Menus (optional, if you still have menu page)
export async function fetchMenusFromApi() {
  const res = await api.get("/main-menus");
  return res.data || [];
}

// Tasks: backend returns [{menuCode, activityCode, activityName, page}, ...]
export async function fetchAllTasksFromApi() {
  const res = await api.get("/tasks");
  return res.data || [];
}

// Optional: tasks by menu
export async function fetchTasksByMenuFromApi(menuCode) {
  const res = await api.get(`/tasks/menu/${encodeURIComponent(menuCode)}`);
  return res.data || [];
}

// Convert flat list -> { [menuCode]: Task[] }
export function groupTasksByMenu(tasks = []) {
  return (Array.isArray(tasks) ? tasks : []).reduce((acc, t) => {
    const key = t.menuCode ?? "";
    if (!key) return acc;

    if (!acc[key]) acc[key] = [];
    acc[key].push({
      menuCode: key,
      activityCode: t.activityCode ?? "",
      activityName: t.activityName ?? "",
      page: t.page ?? "",
      source: "api",
    });
    return acc;
  }, {});
}
