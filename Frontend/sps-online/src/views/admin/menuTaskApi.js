// menuTaskApi.js
export async function fetchAllTasksFromApi() {
  try {
    console.log("[API] Calling GET /api/tasks");

    const res = await fetch("/api/tasks", {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[API] Response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("[API] /api/tasks error body:", text);
      throw new Error(`GET /api/tasks failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("[API] /api/tasks response data:", data);

    return data; // expect array
  } catch (err) {
    console.error("[API] fetchAllTasksFromApi failed:", err);
    throw err;
  }
}

export function groupTasksByMenu(tasks = []) {
  console.log("[GROUP] Raw tasks passed to groupTasksByMenu:", tasks);

  if (!Array.isArray(tasks)) {
    console.error("[GROUP] Expected array, got:", typeof tasks);
    return {};
  }

  const grouped = tasks.reduce((acc, t) => {
    console.log("[GROUP] Processing task:", t);

    const menuCode = t.menuCode; // 🔴 important
    if (!menuCode) {
      console.warn("[GROUP] task missing menuCode:", t);
      return acc;
    }

    if (!acc[menuCode]) acc[menuCode] = [];
    acc[menuCode].push({
      menuCode,
      activityCode: t.activityCode,
      activityName: t.activityName,
      page: t.page,
      source: "api",
    });
    return acc;
  }, {});

  console.log("[GROUP] Grouped result:", grouped);
  return grouped;
}
