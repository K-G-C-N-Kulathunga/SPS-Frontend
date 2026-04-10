const SESSION_KEY = "cebSession";
const USER_KEY = "user";

function parseJSON(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function normalizeSession(data) {
  if (!data || !data.userId) return null;
  return {
    userId: data.userId,
    userLevel: data.userLevel || "",
    costCenter: data.costCenter || data.rptUser || data.deptId || "",
    expiresAt: data.expiresAt,
  };
}

export function getSession() {
  const session = parseJSON(sessionStorage.getItem(SESSION_KEY));
  if (!session) return null;
  if (session.expiresAt && Date.now() > session.expiresAt) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
  return normalizeSession(session);
}

export function getActiveSession() {
  const timedSession = getSession();
  if (timedSession) return timedSession;

  const storedUser =
    parseJSON(localStorage.getItem(USER_KEY)) ||
    parseJSON(sessionStorage.getItem(USER_KEY));

  return normalizeSession(storedUser);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_KEY);
}