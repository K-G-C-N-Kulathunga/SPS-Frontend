// MenuPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { api } from "api";


import {
  STORAGE_KEYS,
  emptyMenu,
  sanitizeCode,
  sanitizeOrder,
} from "./menuTaskConfig";

// Helper: fetch menus from API and map to local shape
async function fetchMenusFromApi() {
  const res = await api.get("/main-menus");
  const data = res.data || [];
  return Array.isArray(data)
    ? data.map((m) => ({
        menuCode: m.menuCode ?? "",
        displayName: m.displayName ?? "",
        description: m.description ?? "",
        orderKey:
          m.orderKey === null || typeof m.orderKey === "undefined" || m.orderKey === ""
            ? null
            : Number(m.orderKey),
        source: "api",
      }))
    : [];
}

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [menuForm, setMenuForm] = useState(emptyMenu);
  const [menuMessage, setMenuMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false); // ✅ modal open/close
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyMenu);
  const [editMessage, setEditMessage] = useState("");

  const history = useHistory();

  const handleGoToTaskPage = (menuCode) => {
    history.push(`/admin/task_page?menuCode=${encodeURIComponent(menuCode)}`);
  };

  // Prefer API data; fall back to localStorage only if API returns no menus.
  const [loadingMenus, setLoadingMenus] = useState(false);
const [menuError, setMenuError] = useState("");

useEffect(() => {
  const fetchMenus = async () => {
    setLoadingMenus(true);
    setMenuError("");

    try {
      // ✅ same pattern as ServiceEstimateDetails
      const res = await api.get("/main-menus"); 
      // If your backend is exactly "/api/main-menus" and api already has baseURL "/api",
      // then "/main-menus" is correct.
      // If api baseURL is NOT "/api", then use "/api/main-menus" instead.

      const data = res.data || [];
      setMenus(
        Array.isArray(data)
          ? data.map((m) => ({
              menuCode: m.menuCode ?? "",
              displayName: m.displayName ?? "",
              description: m.description ?? "",
              orderKey:
                m.orderKey === null || typeof m.orderKey === "undefined" || m.orderKey === ""
                  ? null
                  : Number(m.orderKey),
              source: "api",
            }))
          : []
      );
    } catch (err) {
      console.error("Error fetching menus:", err);
      setMenuError(
        err?.response?.status === 401
          ? "Unauthorized (please login)"
          : err?.response?.data?.message || err.message || "Failed to load menus"
      );
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  fetchMenus();
}, []);


  // NOTE: Autosave disabled. Menus will be persisted only when the
  // user clicks the explicit Save button (`handleSaveMenus`). This
  // prevents accidental writes while editing drafts.

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

  const handleAddMenu = async (event) => {
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
      setMenuMessage(`Menu ${code} already exists.`);
      return;
    }

    const payload = {
      menuCode: code,
      displayName: label,
      description: menuForm.description.trim(),
      orderKey: menuForm.orderKey ? Number(menuForm.orderKey) : null,
    };

    try {
      setLoadingMenus(true);
      // send to backend
      await api.post("/main-menus", payload);

      // refresh menus from server
      const apiMenus = await fetchMenusFromApi();
      setMenus(apiMenus);

      setMenuForm(emptyMenu);
      setMenuMessage(`Menu ${code} created.`);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Error creating menu:", err);
      setMenuMessage(err?.response?.data?.message || err.message || "Failed to create menu");
    } finally {
      setLoadingMenus(false);
    }
  };

  const handleRemoveMenu = (menuCode) => {
    setMenus((prev) => prev.filter((menu) => menu.menuCode !== menuCode));
    setMenuMessage(`Removed draft menu ${menuCode}.`);
  };

  // const handleResetToDefaults = () => {
  //   const ok =
  //     typeof window !== "undefined"
  //       ? window.confirm("Reset menus to default seed values?")
  //       : true;
  //   if (!ok) return;
  //   // re-fetch from API (no hardcoded seed)
  //   (async () => {
  //     try {
  //       const apiMenus = await fetchMenusFromApi();
  //       if (Array.isArray(apiMenus) && apiMenus.length > 0) setMenus(apiMenus);
  //     } catch (e) {
  //       // if API fails, clear menus
  //       setMenus([]);
  //     }
  //   })();
  //   setMenuForm(emptyMenu);
  //   setMenuMessage("Reset to default menus.");
  // };

  const handleSaveMenus = () => {
    const ok = typeof window !== "undefined" ? window.confirm("Save menus to localStorage?") : true;
    if (!ok) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
      }
      setMenuMessage("Menus saved.");
      setTimeout(() => setMenuMessage(""), 3000);
    } catch (e) {
      setMenuMessage("Save failed");
      setTimeout(() => setMenuMessage(""), 3000);
    }
  };

  const draftMenuCount = menus.filter((m) => m.source === "draft").length;

  const openEditModal = (menu) => {
  setEditMessage("");
  setEditForm({
    menuCode: menu.menuCode || "",
    displayName: menu.displayName || "",
    description: menu.description || "",
    orderKey:
      menu.orderKey === null || typeof menu.orderKey === "undefined"
        ? ""
        : String(menu.orderKey),
  });
  setIsEditOpen(true);
};

const handleEditChange = ({ target }) => {
  const { name, value } = target;

  const nextValue =
    name === "menuCode"
      ? sanitizeCode(value).slice(0, 20) // you can also disable editing menuCode if you prefer
      : name === "orderKey"
      ? sanitizeOrder(value)
      : value;

  setEditForm((prev) => ({ ...prev, [name]: nextValue }));
  setEditMessage("");
};

const handleUpdateMenu = async (e) => {
  e.preventDefault();
  setEditMessage("");

  const code = editForm.menuCode.trim();
  const label = editForm.displayName.trim();

  if (!code || !label) {
    setEditMessage("Menu code and display name are required.");
    return;
  }

  const payload = {
    menuCode: code,
    displayName: label,
    description: editForm.description.trim(),
    orderKey: editForm.orderKey ? Number(editForm.orderKey) : null,
  };

  try {
    setLoadingMenus(true);
    await api.put(`/main-menus/${encodeURIComponent(code)}`, payload);

    const apiMenus = await fetchMenusFromApi();
    setMenus(apiMenus);

    setIsEditOpen(false);
    setEditMessage(`Menu ${code} updated.`);
  } catch (err) {
    console.error("Error updating menu:", err);
    setEditMessage(err?.response?.data?.message || err.message || "Failed to update menu");
  } finally {
    setLoadingMenus(false);
  }
};

const handleDeleteMenu = async (menuCode) => {
  const ok = typeof window !== "undefined" ? window.confirm(`Delete menu ${menuCode}?`) : true;
  if (!ok) return;

  try {
    setLoadingMenus(true);
    await api.delete(`/main-menus/${encodeURIComponent(menuCode)}`);

    const apiMenus = await fetchMenusFromApi();
    setMenus(apiMenus);
    setMenuMessage(`Menu ${menuCode} deleted.`);
  } catch (err) {
    console.error("Error deleting menu:", err);
    setMenuMessage(err?.response?.data?.message || err.message || "Failed to delete menu");
  } finally {
    setLoadingMenus(false);
  }
};

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-blueGray-100 shadow-xl rounded-xl overflow-hidden">
          {/* HEADER */}
          <header className="px-8 py-6 border-b bg-blueGray-50 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-blueGray-700">
                Main Menu
              </h1>
              <p className="mt-2 text-sm text-blueGray-500">
                Define main sidebar menus here. Tasks are managed on a separate
                page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-blueGray-500 text-right">
                <div>
                  Draft Menus:{" "}
                  <span className="font-semibold">{draftMenuCount}</span>
                </div>
                <div>
                  Total Menus:{" "}
                  <span className="font-semibold">{menus.length}</span>
                </div>
              </div>

              {/* Reset */}
              {/* <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Reset to defaults
              </button> */}

              <button
                type="button"
                onClick={handleSaveMenus}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>

              {/* ✅ Create - opens modal */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </header>

          {/* BODY */}
          <div className="px-8 py-8 space-y-8 bg-blueGray-50">
            {/* Menu Library */}
            <section className="bg-white border rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blueGray-500 uppercase tracking-wide">
                  Menu Library
                </h3>
                <span className="text-xs text-blueGray-400">
                  {sortedMenus.length} total
                </span>
              </div>

              <div className="border border-blueGray-100 rounded-lg divide-y">
                {sortedMenus.length === 0 && (
                  <div className="p-4 text-sm text-blueGray-400">
                    No menus configured yet.
                  </div>
                )}

                        {sortedMenus.map((menu) => {
  const isDraft = menu.source === "draft";
  return (
    <div key={menu.menuCode} className="px-2 py-1 bg-white">
      <div className="flex items-center justify-between p-0.5">
        
        {/* Left Section */}
                <div className="flex flex-col p-0">
                  <p
                    className="text-[11px] font-semibold text-blueGray-700 cursor-pointer hover:underline"
                    onClick={() => handleGoToTaskPage(menu.menuCode)}
                  >
                    {menu.displayName}
                  </p>

                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-blueGray-400">
                      {menu.menuCode}
                    </p>
                    {menu.description && (
                      <p className="text-[10px] text-blueGray-400">{menu.description}</p>
                    )}
                  </div>
                </div>

        {/* Right side actions */}
          <div className="flex items-center gap-1">
          {menu.orderKey != null && (
            <span className="text-[10px] text-blueGray-400">
              #{menu.orderKey}
            </span>
          )}

          <button
            type="button"
            onClick={() => openEditModal(menu)}
            className="bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded hover:bg-blue-600"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDeleteMenu(menu.menuCode)}
            className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* {isDraft && (
        <div className="text-right mt-1">
          <button
            type="button"
            onClick={() => handleRemoveMenu(menu.menuCode)}
            className="text-[10px] text-red-500 hover:text-red-600"
          >
            Remove draft
          </button>
        </div>
      )} */}
    </div>
  );
})}

              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CREATE MENU POPUP MODAL */}
{/* CREATE MENU POPUP MODAL */}
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
        border: "1px solid #E2E8F0", // light border (blueGray-100-ish)
      }}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-blueGray-50 border-b">
        <h2 className="text-lg font-bold text-blueGray-700">Create Menu</h2>

        <button
          type="button"
          onClick={() => setIsCreateOpen(false)}
          className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
        >
          &times;
        </button>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-5">
        <p className="text-xs text-blueGray-400 mb-4">
          Step 1: define menu metadata. Order controls sidebar sorting.
        </p>

        <form className="space-y-4" onSubmit={handleAddMenu}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-blueGray-600">
              Menu Code *
              <input
                type="text"
                name="menuCode"
                value={menuForm.menuCode}
                onChange={handleMenuChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="e.g. ADMIN"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600">
              Display Name *
              <input
                type="text"
                name="displayName"
                value={menuForm.displayName}
                onChange={handleMenuChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Administration"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
              Description
              <textarea
                name="description"
                rows={2}
                value={menuForm.description}
                onChange={handleMenuChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Describe what appears under this menu"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600">
              Order
              <input
                type="text"
                name="orderKey"
                value={menuForm.orderKey}
                onChange={handleMenuChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="1"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              Add Menu 
            </button>

            {menuMessage && (
              <span className="text-xs text-blueGray-500">
                {menuMessage}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  </>
)}
{/* END MODAL */}
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
        <h2 className="text-lg font-bold text-blueGray-700">Edit Menu</h2>

        <button
          type="button"
          onClick={() => setIsEditOpen(false)}
          className="text-blueGray-400 hover:text-blueGray-600 text-xl font-bold"
        >
          &times;
        </button>
      </div>

      <div className="px-6 py-5">
        <p className="text-xs text-blueGray-400 mb-4">
          Update menu metadata. Order controls sidebar sorting.
        </p>

        <form className="space-y-4" onSubmit={handleUpdateMenu}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-blueGray-600">
              Menu Code *
              <input
                type="text"
                name="menuCode"
                value={editForm.menuCode}
                onChange={handleEditChange}
                readOnly // ✅ recommended
                className="mt-1 px-3 py-2 w-full border rounded-md bg-blueGray-50 cursor-not-allowed"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600">
              Display Name *
              <input
                type="text"
                name="displayName"
                value={editForm.displayName}
                onChange={handleEditChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600 md:col-span-2">
              Description
              <textarea
                name="description"
                rows={2}
                value={editForm.description}
                onChange={handleEditChange}
                className="mt-1 px-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </label>

            <label className="block text-sm font-medium text-blueGray-600">
              Order
              <input
                type="text"
                name="orderKey"
                value={editForm.orderKey}
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
              Update Menu
            </button>

            {editMessage && (
              <span className="text-xs text-blueGray-500">{editMessage}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  </>
)}




    </div>
  );
};

export default MenuPage;
