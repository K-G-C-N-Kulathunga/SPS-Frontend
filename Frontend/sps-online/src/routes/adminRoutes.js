import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import ServiceEstimateDetails from "components/estimate forms/serviceestimatedetails.js";
import Tables from "views/admin/Tables.js";
import CostEstimation from "views/admin/CostEstimation";
import SchedulerPage from "views/admin/SchedulerPage";
import NewEstimatePage from "views/admin/NewEstimatePage";
import NewPIVPage from "views/admin/NewPIVPage";
import Form from "views/admin/FormPage.js";

const normalizeKey = (value = "") =>
  value
    .replace(/\\/g, "/")
    .replace(/\s+/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const adminRoutes = [
  {
    path: "/admin/dashboard",
    component: Dashboard,
    name: "Dashboard",
    aliases: ["home", "main-dashboard"],
  },
  {
    path: "/admin/maps",
    component: Maps,
    name: "Maps",
    aliases: ["map", "mapview"],
  },
  {
    path: "/admin/settings",
    component: Settings,
    name: "Settings",
    aliases: ["preferences", "profile-settings"],
  },
  {
    path: "/admin/service-estimation/details",
    component: ServiceEstimateDetails,
    name: "ServiceEstimateDetails",
    aliases: [
      "service-estimation",
      "serviceestimate",
      "service-estimation-details",
      "serviceestimatedetails",
    ],
  },
  {
    path: "/admin/service-estimation/add",
    component: ServiceEstimateDetails,
    name: "ServiceEstimateAdd",
    aliases: [
      "add",
      "service estimate add",
      "service-estimation-add",
      "serviceestimateadd",
      "service-estimation/new",
      "service-estimation/create",
      "serviceestimatedetails-add",
    ],
  },
  {
    path: "/admin/service-estimation/modify",
    component: ServiceEstimateDetails,
    name: "ServiceEstimateModify",
    aliases: [
      "modify",
      "service estimate modify",
      "service-estimation-modify",
      "serviceestimatemodify",
      "service-estimation/update",
      "serviceestimatedetails-modify",
    ],
  },
  {
    path: "/admin/service-estimation/view",
    component: ServiceEstimateDetails,
    name: "ServiceEstimateView",
    aliases: [
      "view",
      "service estimate view",
      "service-estimation-view",
      "serviceestimateview",
      "service-estimation/print",
      "serviceestimatedetails-view",
    ],
  },
  {
    path: "/admin/tables",
    component: Tables,
    name: "Tables",
    aliases: ["table", "datatable"],
  },
  {
    path: "/admin/costestimation/sub-item-2/a",
    component: CostEstimation,
    name: "CostEstimation",
    aliases: ["cost-estimation", "costestimation", "costestimation-sub-item-2"],
  },
  {
    path: "/admin/scheduler",
    component: SchedulerPage,
    name: "Scheduler",
    aliases: ["calendar", "schedule", "schedulerpage"],
  },
  {
    path: "/admin/NewEstimate",
    component: NewEstimatePage,
    name: "NewEstimate",
    aliases: ["newestimatepage", "new-estimate", "estimate"],
  },
  {
    path: "/admin/piv",
    component: NewPIVPage,
    name: "NewPIV",
    aliases: [
      "piv",
      "pivgenerate",
      "addpiv",
      "piv-in",
      "pivgenerate-task",
      "newpivpage",
      "new-piv",
      "pivnew",
    ],
  },
  {
    path: "/admin/form",
    component: Form,
    name: "Form",
    aliases: ["applicationform", "customerform", "formpage"],
  },
];

adminRoutes.forEach((route) => {
  const normalizedPath = normalizeKey(route.path);
  const normalizedWithoutSlash = normalizeKey(route.path.replace(/^\/+/, ""));
  const normalizedAdminless = normalizeKey(route.path.replace(/^\/?admin\/?/i, ""));
  const normalizedName = normalizeKey(route.name);
  const aliasKeys = (route.aliases || []).map((alias) => normalizeKey(alias));

  route._keys = new Set(
    [
      normalizedPath,
      normalizedWithoutSlash,
      normalizedAdminless,
      normalizedName,
      ...aliasKeys,
    ].filter(Boolean)
  );
});

const routeLookup = adminRoutes.reduce((acc, route) => {
  acc[route.path.toLowerCase()] = route.path;
  return acc;
}, {});

export const resolveAdminRoute = (rawValue) => {
  const value = (rawValue || "").trim();
  if (!value) return null;

  const httpMatch = value.match(/^(https?:)?\/\//i);
  if (httpMatch) {
    return value;
  }

  const sanitized = value.replace(/\\/g, "/");

  if (sanitized.startsWith("/")) {
    const lowerPath = sanitized.toLowerCase();
    if (routeLookup[lowerPath]) {
      return routeLookup[lowerPath];
    }
    return sanitized;
  }

  const normalizedValue = normalizeKey(sanitized);

  const matched = adminRoutes.find((route) =>
    route._keys.has(normalizedValue)
  );
  if (matched) {
    return matched.path;
  }

  const assumed = `/admin/${sanitized.replace(/^\/+/, "")}`;
  const assumedNormalized = normalizeKey(assumed);
  const assumedMatch = adminRoutes.find((route) =>
    route._keys.has(assumedNormalized)
  );
  if (assumedMatch) {
    return assumedMatch.path;
  }

  return assumed;
};

export default adminRoutes;