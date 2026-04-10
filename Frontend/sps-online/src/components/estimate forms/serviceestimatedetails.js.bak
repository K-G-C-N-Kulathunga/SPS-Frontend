import React, { useState, useEffect, useRef } from "react";
import Header from "components/Headers/Header.js";
import { api } from "api";
import { useLocation } from "react-router-dom";

const ServiceEstimateDetails = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(Array(5).fill(false));
  const [formData, setFormData] = useState({
    connectionDetails: {},
    sketch1: {},
    sketch2: {},
    sketch3: {},
    sketch4: {
      poles: [],
      struts: [],
      stays: [],
    },
  });

  // Modal state for poles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPoleData, setModalPoleData] = useState({
    Selectpole: "",
    poleType: "",
    connFrom: "",
    connTo: "",
    pointerType: "",
    qty: 1,
  });

  // Modal state for stays
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [modalStayData, setModalStayData] = useState({
    type: "",
    stayType: "",
    qty: 1,
  });

  const topRef = useRef(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  // Mode controlled by sidebar via query/state: 'ADD' | 'MODIFY' | 'VIEW'
  const location = useLocation();
  const stateMode = (location?.state?.serviceEstimateMode || "").toUpperCase();
  const searchParams = new URLSearchParams(location?.search || "");
  const queryMode = (searchParams.get("mode") || "").toUpperCase();
  const pathname = (location?.pathname || "").toLowerCase();
  const pathMode = pathname.includes("view")
    ? "VIEW"
    : pathname.includes("modify")
    ? "MODIFY"
    : pathname.includes("add")
    ? "ADD"
    : "";
  const normalizedMode = (stateMode || queryMode || pathMode || "ADD").toUpperCase();
  const mode = ["ADD", "MODIFY", "VIEW", "DELETE"].includes(normalizedMode) ? normalizedMode : "ADD";
  const isView = mode === "VIEW"; // DELETE has its own minimal UI
  const isDelete = mode === "DELETE";
  const [poleOptions, setPoleOptions] = useState([]); // State for pole data
  const [strutOptions, setStrutOptions] = useState([]); // State for strut data
  const [stayOptions, setStayOptions] = useState([]); // State for stay data

  // Fetch pole data from API
  useEffect(() => {
    const fetchPoleData = async () => {
      try {
        const deptId = "452.00";
        const res = await api.get("/applications/connection-details/spdppolm", {
          params: { deptId },
        });
        setPoleOptions(res.data || []);
        console.log("Pole data fetched successfully:", res.data);
      } catch (err) {
        console.error("Error fetching pole data:", err);
        setPoleOptions([]);
      }
    };
    fetchPoleData();
  }, []);

  // Fetch strut data from API
  useEffect(() => {
    const fetchStrutData = async () => {
      try {
        const res = await api.get("/applications/connection-details/spstrutm");
        setStrutOptions(res.data || []);
        console.log("Strut data fetched successfully:", res.data);
      } catch (err) {
        console.error("Error fetching strut data:", err);
        setStrutOptions([]);
      }
    };
    fetchStrutData();
  }, []);

  // Fetch stay data from API
  useEffect(() => {
    const fetchStayData = async () => {
      try {
        const deptId = "452.00";
        const res = await api.get("/applications/connection-details/spstaymt", {
          params: { deptId },
        });
        setStayOptions(res.data || []);
        console.log("Stay data fetched successfully:", res.data);
      } catch (err) {
        console.error("Error fetching stay data:", err);
        setStayOptions([]);
      }
    };
    fetchStayData();
  }, []);

  // Fetch filtered applications for Add/Modify mode
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (mode === "VIEW") {
          // In VIEW mode, user types application no; skip fetching lists
          setApplications([]);
          setSelectedApplication("");
          console.log("VIEW mode: skipping application list fetch");
          return;
        }
        const deptId = "452.00";
        const applicationType = "NC";
        const status = "A";
        // For ADD -> unused, for MODIFY/DELETE -> used
        const endpoint = mode === "ADD"
          ? "/applications/connection-details/application-nos/unused"
          : "/applications/connection-details/application-nos/used";

        const res = await api.get(endpoint, {
          params: { deptId, applicationType, status },
        });
        setApplications(res.data || []);
        setSelectedApplication("");
        console.log(`Applications (${mode}) fetched:`, res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setApplications([]);
      }
    };
    fetchApplications();
  }, [mode]);

  const handleFetchClick = async () => {
    if (!selectedApplication) return;
    const selected = mode === "VIEW"
      ? { applicationNo: selectedApplication, deptId: "452.00" }
      : applications.find((app) => app.applicationNo === selectedApplication);
    if (!selected) return;

    try {
      // Always load connection details
      const res = await api.get("/applications/connection-details/details", {
        params: { applicationNo: selected.applicationNo, deptId: selected.deptId },
      });
      const data = res.data;
      let nextForm = {
        connectionDetails: {
          applicationNo: data.applicationNo || selected.applicationNo || selectedApplication,
          deptId: selected.deptId || "",
          applicantName: data.applicantName || "",
          applicationDate: data.applicationDate || "",
          nationalIdNumber: data.nationalIdNumber || "",
          neighborsAccountNumber: data.neighborsAccountNumber || "",
          address: data.address || "",
          telNumber: data.telNumber || "",
          phase: data.phase || "",
          tariffCategory: data.tariffCategory || "",
          connectionType: data.connectionType || "",
          tariff: data.tariff || "",
        },
      };

      // In MODIFY or VIEW mode, also load previously saved estimation data
      if (mode === "MODIFY" || mode === "VIEW") {
        try {
          const estRes = await api.get("/applications/connection-details/service-estimate/sps-arest", {
            params: { applicationNo: selected.applicationNo, deptId: selected.deptId },
          });
          const est = estRes.data || {};
          nextForm = {
            ...nextForm,
            sketch1: {
              serviceLength: "", // not mapped back
              singleCircuitLength: "",
              conductorType: "ABC1",
              secondCircuitLength: String(est.secondCircuitLength ?? ""),
              secondCircuitConductorType: "ABC1",
              totalLineLength: est.totalLength ?? "",
              wiringType: est.wiringType ?? "",
              isLoopService: (est.loopCable === "Y" ? "Y" : est.loopCable === "N" ? "N" : "N"),
              newLengthWithinPremises: "",
              conversion1P3P: String(est.conversionLength ?? ""),
              conversion2P3P: String(est.conversionLength2p ?? ""),
              cableType: est.cableType ?? "",
            },
            sketch2: {
              distanceToServicePoint: String(est.distanceToSp ?? ""),
              sinNumber: est.sin ?? "",
              isSyaNeeded: (est.isSyaNeeded === "Y" ? "Y" : est.isSyaNeeded === "N" ? "N" : "Y"),
              businessType: est.businessType ?? "",
              numberOfRanges: String(est.noOfSpans ?? ""),
              isServiceConversion: est.isServiceConversion ?? "",
            },
            sketch3: {
              poleNumber: est.poleno ?? "",
              distanceFromSS: String(est.distanceFromSs ?? ""),
              substation: est.substation ?? "",
              transformerCapacity: est.transformerCapacity ?? "",
              transformerLoad: est.transformerLoad ?? "",
              transformerPeakLoad: est.transformerPeakLoad ?? "",
              feederControlType: est.feederControlType ?? "",
              phase: est.phase ?? "",
            },
          };

          // Also load saved Sketch4 lists (Poles/Struts/Stays)
          try {
            const [polesRes, strutsRes, staysRes] = await Promise.all([
              api.get("/applications/connection-details/service-estimate/sketch4/poles", {
                params: { applicationNo: selected.applicationNo, deptId: selected.deptId },
              }),
              api.get("/applications/connection-details/service-estimate/sketch4/struts", {
                params: { applicationNo: selected.applicationNo, deptId: selected.deptId },
              }),
              api.get("/applications/connection-details/service-estimate/sketch4/stays", {
                params: { applicationNo: selected.applicationNo, deptId: selected.deptId },
              }),
            ]);

            nextForm = {
              ...nextForm,
              sketch4: {
                poles: Array.isArray(polesRes.data) ? polesRes.data.map(p => ({
                  Selectpole: p.selectPole || "",
                  poleType: p.poleType || "",
                  connFrom: p.connFrom || "",
                  connTo: p.connTo || "",
                  pointerType: p.pointerType || "",
                  qty: Number(p.qty) || 0,
                })) : [],
                struts: Array.isArray(strutsRes.data) ? strutsRes.data.map(s => ({
                  type: s.type || "",
                  qty: Number(s.qty) || 0,
                })) : [],
                stays: Array.isArray(staysRes.data) ? staysRes.data.map(s => ({
                  type: s.type || "",
                  stayType: s.stayType || "",
                  qty: Number(s.qty) || 0,
                })) : [],
              },
            };
          } catch (sketch4Err) {
            console.warn("No saved Sketch4 lists found:", sketch4Err?.response?.data || sketch4Err.message);
          }
        } catch (e) {
          console.warn("No existing estimate to prefill:", e?.response?.data || e.message);
        }
      }

      setFormData((prev) => ({ ...prev, ...nextForm }));
    } catch (err) {
      console.error("Error fetching application details:", err);
    }
  };

  // Initialize form data
  useEffect(() => {
    if (Object.keys(formData.sketch1).length === 0) {
      setFormData((prev) => ({
        ...prev,
        sketch1: {
          serviceLength: "",
          singleCircuitLength: "",
          conductorType: "ABC1",
          secondCircuitLength: "",
          secondCircuitConductorType: "ABC1",
          totalLineLength: "",
          wiringType: "OH",
          isLoopService: "N",
          newLengthWithinPremises: "",
          conversion1P3P: "",
          conversion2P3P: "",
          cableType: "",
        },
      }));
    }

    if (Object.keys(formData.sketch2).length === 0) {
      setFormData((prev) => ({
        ...prev,
        sketch2: {
          distanceToServicePoint: "",
          sinNumber: "",
          isSyaNeeded: "Y",
          businessType: "",
          numberOfRanges: "",
          isServiceConversion: "0P_00A",
        },
      }));
    }

    if (Object.keys(formData.sketch3).length === 0) {
      setFormData((prev) => ({
        ...prev,
        sketch3: {
          poleNumber: "",
          distanceFromSS: "",
          substation: "",
          transformerCapacity: "",
          transformerLoad: "",
          transformerPeakLoad: "",
          feederControlType: "",
          phase: "",
        },
      }));
    }
  }, [formData.sketch1, formData.sketch2, formData.sketch3]);

  // Input change handlers for all sections
  const handleConnectionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      connectionDetails: { ...prev.connectionDetails, [name]: value },
    }));
  };
  const handleSketch1Change = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      sketch1: { ...prev.sketch1, [name]: value },
    }));
  };
  const handleSketch2Change = (e) => {
    const { name, value } = e.target;
    console.log("Sketch2 change:", name, value);
    setFormData((prev) => ({
      ...prev,
      sketch2: { ...prev.sketch2, [name]: value },
    }));
  };
  const handleSketch3Change = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      sketch3: { ...prev.sketch3, [name]: value },
    }));
  };

  // Modal handlers for Poles
  const openPoleModal = () => {
    setIsModalOpen(true);
    setModalPoleData({
      Selectpole: "",
      poleType: "",
      connFrom: "",
      connTo: "",
      pointerType: "",
      qty: 1,
    });
  };

  const closePoleModal = () => {
    setIsModalOpen(false);
  };

  const handleModalPoleChange = (e) => {
    const { name, value } = e.target;
    setModalPoleData((prev) => ({
      ...prev,
      [name]: name === "qty" ? parseInt(value) || 1 : value,
    }));
  };

  const handleAddPoleFromModal = () => {
    if (!modalPoleData.Selectpole || !modalPoleData.poleType) {
      alert("Please fill in at least Select Pole and Pole Type fields");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sketch4: {
        ...prev.sketch4,
        poles: [...prev.sketch4.poles, { ...modalPoleData }],
      },
    }));

    closePoleModal();
  };

  // Modal handlers for Stays
  const openStayModal = () => {
    setIsStayModalOpen(true);
    setModalStayData({
      type: "",
      stayType: "",
      qty: 1,
    });
  };

  const closeStayModal = () => {
    setIsStayModalOpen(false);
  };

  const handleModalStayChange = (e) => {
    const { name, value } = e.target;
    setModalStayData((prev) => ({
      ...prev,
      [name]: name === "qty" ? parseInt(value) || 1 : value,
    }));
  };

  const handleAddStayFromModal = () => {
    if (!modalStayData.type || !modalStayData.stayType) {
      alert("Please fill in at least Stay and Stay Type fields");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sketch4: {
        ...prev.sketch4,
        stays: [...prev.sketch4.stays, { ...modalStayData }],
      },
    }));

    closeStayModal();
  };

  // Sketch 4 handlers

  const handleRemovePole = (index) => {
    setFormData((prev) => {
      const updatedPoles = [...prev.sketch4.poles];
      updatedPoles.splice(index, 1);
      return {
        ...prev,
        sketch4: {
          ...prev.sketch4,
          poles: updatedPoles,
        },
      };
    });
  };

  const handleAddStrut = (strutType, qty) => {
    if (!strutType) {
      alert("Please select a Strut before adding.");
      return;
    }
    if (!qty || qty < 1) {
      alert("Please enter a valid quantity (minimum 1).");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      sketch4: {
        ...prev.sketch4,
        struts: [
          ...prev.sketch4.struts,
          { type: strutType, qty: parseInt(qty) },
        ],
      },
    }));
  };


  const handleRemoveStrut = (index) => {
    setFormData((prev) => {
      const updatedStruts = [...prev.sketch4.struts];
      updatedStruts.splice(index, 1);
      return {
        ...prev,
        sketch4: {
          ...prev.sketch4,
          struts: updatedStruts,
        },
      };
    });
  };

  const handleRemoveStay = (index) => {
    setFormData((prev) => {
      const updatedStays = [...prev.sketch4.stays];
      updatedStays.splice(index, 1);
      return {
        ...prev,
        sketch4: {
          ...prev.sketch4,
          stays: updatedStays,
        },
      };
    });
  };

  // Shared styles
  const fieldStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  };

  const labelStyle = {
    width: "160px",
    fontWeight: 500,
    color: "#374151",
    fontSize: "12px",
    flexShrink: 0,
  };
  const inputStyle = {
    flex: 1,
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  };
  const containerStyle = {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontSize: "12px",
    maxWidth: "750px",
    margin: "15px auto",
  };
  const buttonStyle = {
    padding: "4px 12px",
    fontSize: "12px",
    borderRadius: "4px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginLeft: "10px",
  };

  // Delete handler (placed before DELETE UI to satisfy lint)
  const handleDelete = async () => {
    try {
      const resolvedApplicationNo = (formData.connectionDetails.applicationNo || selectedApplication || "").toString().trim();
      const resolvedDeptId = (formData.connectionDetails.deptId || (applications.find(a => a.applicationNo === resolvedApplicationNo)?.deptId) || "452.00").toString().trim();

      if (!resolvedApplicationNo) {
        alert("Please select or enter an application number.");
        return;
      }

      const confirmed = window.confirm(`Delete service estimate for ${resolvedApplicationNo}? This will not delete the application.`);
      if (!confirmed) return;

      const resp = await api.delete(`/applications/connection-details/service-estimate`, {
        params: { applicationNo: resolvedApplicationNo, deptId: resolvedDeptId, confirm: true }
      });

      if (resp.status === 200) {
        alert("Service estimate deleted. The application will appear in Add mode.");
        setApplications((prev) => prev.filter((a) => a.applicationNo !== resolvedApplicationNo));
        setSelectedApplication("");
        setFormData({
          connectionDetails: {},
          sketch1: {},
          sketch2: {},
          sketch3: {},
          sketch4: { poles: [], struts: [], stays: [] }
        });
      }
    } catch (error) {
      console.error("Error deleting service estimate:", error);
      alert(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };


  // Scroll to top when tab changes (guarded for DELETE mode)
  const scrollToTop = () => {
    if (topRef.current)
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (isDelete) return;
    scrollToTop();
  }, [activeTab, isDelete]);

  // Minimal DELETE mode UI: only application selector and Delete button
  if (isDelete) {
    return (
      <div className="app-container">
        <Header />
        <div className="main-content">
          <div className="form-container">
            <div className="flex flex-col min-h-screen bg-gray-100 p-6">
              <div className="w-full max-w-3xl mx-auto px-4">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-4">
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", marginBottom: "12px" }}>
                    Delete Service Estimate
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={labelStyle}>Application No:</label>
                    <select
                      value={selectedApplication}
                      onChange={(e) => setSelectedApplication(e.target.value)}
                      style={{ ...inputStyle, background: "#fff", cursor: "pointer" }}
                    >
                      <option value="">Select Application</option>
                      {applications.map((app) => (
                        <option key={app.applicationNo} value={app.applicationNo}>
                          {app.applicationNo}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleDelete}
                      disabled={!selectedApplication}
                      style={{ ...buttonStyle, background: selectedApplication ? "#DC2626" : "#9CA3AF" }}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
                    Note: This removes only the service estimate data. The application remains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal styles
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflow: "auto",
  };

  // Helper function to get field labels
  const getFieldLabel = (key) => {
    const labels = {
      serviceLength: "Service Length",
      singleCircuitLength: "Single Circuit Length",
      conductorType: "Conductor Type",
      secondCircuitLength: "Second Circuit Length",
      secondCircuitConductorType: "Second Circuit Conductor Type",
      totalLineLength: "Total Line Length",
      wiringType: "Wiring Type",
      isLoopService: "Is Loop Service",
      newLengthWithinPremises: "New Length Within Premises",
      conversion1P3P: "Conversion 1P to 3P",
      conversion2P3P: "Conversion 2P to 3P",
      cableType: "Cable Type",
      distanceToServicePoint: "Distance to Service Point",
      sinNumber: "SIN Number",
      isSyaNeeded: "SYA Needed",
      businessType: "Business Type",
      numberOfRanges: "Number of Ranges",
      isServiceConversion: "Applicable Rate",
      poleNumber: "Pole Number",
      distanceFromSS: "Distance From SS",
      substation: "Substation",
      transformerCapacity: "Transformer Capacity",
      transformerLoad: "Transformer Load",
      transformerPeakLoad: "Transformer Peak Load",
      feederControlType: "Feeder Control Type",
      phase: "Phase",
    };
    return labels[key] || key;
  };

  // Tabs
  const tabs = [
    {
      name: "Application Connection Details",
      content: (
        <div style={containerStyle}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Application Connection Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <label style={labelStyle}>Application No:</label>
              {isView ? (
                <input
                  type="text"
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter Application No"
                />
              ) : (
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  style={{ ...inputStyle, background: "#fff", cursor: "pointer" }}
                >
                  <option value="">Select Application</option>
                  {applications.map((app) => (
                    <option key={app.applicationNo} value={app.applicationNo}>
                      {app.applicationNo}
                    </option>
                  ))}
                </select>
              )}
              <button
                style={buttonStyle}
                onClick={handleFetchClick}
                disabled={!selectedApplication}
              >
                Find
              </button>
            </div>
          </div>

          <div style={gridStyle}>
            <div>
              {[
                { label: "Applicant Name:", name: "applicantName" },
                { label: "Application Date:", name: "applicationDate" },
                { label: "NIC/Passport No:", name: "nationalIdNumber" },
                {
                  label: "Neighbours Acc. No:",
                  name: "neighborsAccountNumber",
                },
                { label: "Address:", name: "address" },
              ].map((field) => (
                <div key={field.name} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData.connectionDetails[field.name] || ""}
                    onChange={handleConnectionChange}
                    style={inputStyle}
                    disabled={isView}
                  />
                </div>
              ))}
            </div>
            <div>
              {[
                { label: "Tele. Nos:", name: "telNumber" },
                { label: "Phase:", name: "phase" },
                { label: "Tariff Category:", name: "tariffCategory" },
                { label: "Connection Type:", name: "connectionType" },
                { label: "Tariff:", name: "tariff" },
              ].map((field) => (
                <div key={field.name} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData.connectionDetails[field.name] || ""}
                    onChange={handleConnectionChange}
                    style={inputStyle}
                    disabled={isView}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Sketch1",
      content: (
        <div style={containerStyle}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Service Estimation
          </h3>
          <div style={gridStyle}>
            {Object.keys(formData.sketch1).map((key) => (
              <div style={fieldStyle} key={key}>
                <label style={labelStyle}>{getFieldLabel(key)}:</label>
                {key === "conductorType" ||
                key === "secondCircuitConductorType" ? (
                  <select
                    name={key}
                    value={formData.sketch1[key] || ""}
                    onChange={handleSketch1Change}
                    style={inputStyle}
                    disabled={isView}
                  >
                    <option value="">Select Conductor Type</option>
                    <option value="ABC1">ABC 3x95+70mm²</option>
                    <option value="ABC2">ABC 3x70+54.6mm²</option>
                    <option value="ABC5">ABC 50+54.6mm²</option>
                  </select>
                ) : key === "wiringType" ? (
                  <select
                    name={key}
                    value={formData.sketch1[key] || ""}
                    onChange={handleSketch1Change}
                    style={inputStyle}
                    disabled={isView}
                  >
                    <option value="">Select Wiring Type</option>
                    <option value="OH">Over Head</option>
                    <option value="UG">Under Ground</option>
                  </select>
                ) : key === "isLoopService" ? (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ marginRight: "8px", fontWeight: 400 }}>
                      <input
                        type="radio"
                        name="isLoopService"
                        value="Y"
                        checked={formData.sketch1[key] === "Y"}
                        onChange={handleSketch1Change}
                        style={{ marginRight: "4px" }}
                        disabled={isView}
                      />
                      Yes
                    </label>
                    <label style={{ fontWeight: 400 }}>
                      <input
                        type="radio"
                        name="isLoopService"
                        value="N"
                        checked={formData.sketch1[key] === "N"}
                        onChange={handleSketch1Change}
                        style={{ marginRight: "4px" }}
                        disabled={isView}
                      />
                      No
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData.sketch1[key] || ""}
                    onChange={handleSketch1Change}
                    style={inputStyle}
                    disabled={isView}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Sketch2",
      content: (
        <div style={containerStyle}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Service Details
          </h3>
          <div style={gridStyle}>
            {Object.keys(formData.sketch2).map((key) => (
              <div style={fieldStyle} key={key}>
                <label style={labelStyle}>{getFieldLabel(key)}:</label>
                {key === "isSyaNeeded" ? (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ marginRight: "8px", fontWeight: 400 }}>
                      <input
                        type="radio"
                        name="isSyaNeeded"
                        value="Y"
                        checked={formData.sketch2[key] === "Y"}
                        onChange={handleSketch2Change}
                        style={{ marginRight: "4px" }}
                        disabled={isView}
                      />
                      Yes
                    </label>
                    <label style={{ fontWeight: 400 }}>
                      <input
                        type="radio"
                        name="isSyaNeeded"
                        value="N"
                        checked={formData.sketch2[key] === "N"}
                        onChange={handleSketch2Change}
                        style={{ marginRight: "4px" }}
                        disabled={isView}
                      />
                      No
                    </label>
                  </div>
                ) : key === "isServiceConversion" ? (
                  <select
                    name={key}
                    value={formData.sketch2[key] || ""}
                    onChange={handleSketch2Change}
                    style={inputStyle}
                    disabled={isView}
                  >
                    <option value="">Select Applicable Rate</option>
                    <option value="0P_00A">As Customer</option>
                    <option value="3P-30A">3P-30A</option>
                    <option value="3P-60A">3P-60A</option>
                    <option value="3P-30C">3P-30 Con Rate</option>
                    <option value="3P-60C">3P-60 Con Rate</option>
                    <option value="30-60C">30-60 Con Rate</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData.sketch2[key] || ""}
                    onChange={handleSketch2Change}
                    style={inputStyle}
                    disabled={isView}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Sketch3",
      content: (
        <div style={containerStyle}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Transformer & Pole Details
          </h3>
          <div style={gridStyle}>
            {Object.keys(formData.sketch3).map((key) => (
              <div style={fieldStyle} key={key}>
                <label style={labelStyle}>{key}:</label>
                {key === "phase" ? (
                  <select
                    name={key}
                    value={formData.sketch3[key] || ""}
                    onChange={handleSketch3Change}
                    style={inputStyle}
                    disabled={isView}
                  >
                    <option value="">Select Phase</option>
                    <option value="Single">Single</option>
                    <option value="Three">Three</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData.sketch3[key] || ""}
                    onChange={handleSketch3Change}
                    style={inputStyle}
                    disabled={isView}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Sketch4",
      content: (
        <div style={containerStyle}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Poles, Struts & Stays Details
          </h3>

          {/* Poles Section */}
          <div
            style={{
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Poles
            </h4>

            {!isView && (
              <div style={{ marginBottom: "10px" }}>
                <button
                  onClick={openPoleModal}
                  style={{ ...buttonStyle, background: "#10B981" }}
                >
                  Add to Pole List
                </button>
              </div>
            )}

            {/* Poles Table */}
            {formData.sketch4.poles.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Select Pole
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Pole Type
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        From Conductor
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        To Conductor
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Pointer Type
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Qty
                      </th>
                      {!isView && (
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Action
                      </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sketch4.poles.map((pole, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.Selectpole}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.poleType}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.connFrom}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.connTo}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.pointerType}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {pole.qty}
                        </td>
                        {!isView && (
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          <button
                            onClick={() => handleRemovePole(index)}
                            style={{
                              ...buttonStyle,
                              background: "#ef4444",
                              marginLeft: "0",
                              padding: "2px 8px",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Struts Section */}
          <div
            style={{
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Struts
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>
                  Strut
                </label>
                <select
                  value={formData.strutInput || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      strutInput: e.target.value,
                    }))
                  }
                  style={inputStyle}
                  disabled={isView}
                >
                  <option value="">Select Strut</option>
                  {strutOptions.map((strut) => (
                    <option key={strut.matCd} value={strut.matCd}>
                      {strut.matCd}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>Qty</label>
                <input
                  type="number"
                  placeholder="Qty"
                  value={formData.strutQty || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      strutQty: e.target.value,
                    }))
                  }
                  style={inputStyle}
                  disabled={isView}
                  min="1"
                />
              </div>
            </div>

            {!isView && (
              <div style={{ marginBottom: "10px" }}>
                <button
                  onClick={() =>
                    handleAddStrut(formData.strutInput, formData.strutQty)
                  }
                  style={{ ...buttonStyle, background: "#10B981" }}
                >
                  Add to Strut List
                </button>
              </div>
            )}

            {/* Struts Table */}
            {formData.sketch4.struts.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Strut
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Qty
                      </th>
                      {!isView && (
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Action
                      </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sketch4.struts.map((strut, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {strut.type}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {strut.qty}
                        </td>
                        {!isView && (
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          <button
                            onClick={() => handleRemoveStrut(index)}
                            style={{
                              ...buttonStyle,
                              background: "#ef4444",
                              marginLeft: "0",
                              padding: "2px 8px",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stays Section */}
          <div
            style={{
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Stays
            </h4>

            {!isView && (
              <div style={{ marginBottom: "10px" }}>
                <button
                  onClick={openStayModal}
                  style={{ ...buttonStyle, background: "#10B981" }}
                >
                  Add to Stay List
                </button>
              </div>
            )}

            {/* Stays Table */}
            {formData.sketch4.stays.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Stay
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Stay Type
                      </th>
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Qty
                      </th>
                      {!isView && (
                      <th
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "6px",
                          textAlign: "left",
                        }}
                      >
                        Action
                      </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sketch4.stays.map((stay, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {stay.type}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {stay.stayType}
                        </td>
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          {stay.qty}
                        </td>
                        {!isView && (
                        <td
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px",
                          }}
                        >
                          <button
                            onClick={() => handleRemoveStay(index)}
                            style={{
                              ...buttonStyle,
                              background: "#ef4444",
                              marginLeft: "0",
                              padding: "2px 8px",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pole Modal */}
          {isModalOpen && !isView && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "16px",
                  }}
                >
                  Add Pole Information
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                  }}
                >
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Select Pole:</label>
                    <select
                      name="Selectpole"
                      value={modalPoleData.Selectpole}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                    >
                      <option value="">Select Pole</option>
                      {poleOptions.map((pole) => (
                        <option key={pole.matCd} value={pole.matCd}>
                          {pole.matCd}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Pole Type:</label>
                    <select
                      name="poleType"
                      value={modalPoleData.poleType}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                    >
                      <option value="">Select Type</option>
                      <option value="Terminal">Terminal</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Angle">Angle</option>
                      <option value="Tension">Tension</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>From Conductor:</label>
                    <input
                      type="text"
                      name="connFrom"
                      value={modalPoleData.connFrom}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                      placeholder="From Conductor"
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>To Conductor:</label>
                    <input
                      type="text"
                      name="connTo"
                      value={modalPoleData.connTo}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                      placeholder="To Conductor"
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Pointer Type:</label>
                    <select
                      name="pointerType"
                      value={modalPoleData.pointerType}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                    >
                      <option value="">Pointer Type</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Quantity:</label>
                    <input
                      type="number"
                      name="qty"
                      value={modalPoleData.qty}
                      onChange={handleModalPoleChange}
                      style={inputStyle}
                      min="1"
                      placeholder="Qty"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={closePoleModal}
                    style={{
                      ...buttonStyle,
                      background: "#6b7280",
                      marginLeft: "0",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPoleFromModal}
                    style={{
                      ...buttonStyle,
                      background: "#10B981",
                      marginLeft: "0",
                    }}
                  >
                    Add Pole
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stay Modal */}
          {isStayModalOpen && !isView && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "16px",
                  }}
                >
                  Add Stay Information
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                  }}
                >
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Select Stay:</label>
                    <select
                      name="type"
                      value={modalStayData.type}
                      onChange={handleModalStayChange}
                      style={inputStyle}
                    >
                      <option value="">Select Stay</option>
                      {stayOptions.map((stay) => (
                        <option key={stay.matCd} value={stay.matCd}>
                          {stay.matCd}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Stay Type:</label>
                    <select
                      name="stayType"
                      value={modalStayData.stayType}
                      onChange={handleModalStayChange}
                      style={inputStyle}
                    >
                      <option value="">Select Type</option>
                      <option value="Anchor">Anchor</option>
                      <option value="Deadman">Deadman</option>
                      <option value="Rock">Rock</option>
                      <option value="Concrete Block">Concrete Block</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Quantity:</label>
                    <input
                      type="number"
                      name="qty"
                      value={modalStayData.qty}
                      onChange={handleModalStayChange}
                      style={inputStyle}
                      min="1"
                      placeholder="Qty"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={closeStayModal}
                    style={{
                      ...buttonStyle,
                      background: "#6b7280",
                      marginLeft: "0",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStayFromModal}
                    style={{
                      ...buttonStyle,
                      background: "#10B981",
                      marginLeft: "0",
                    }}
                  >
                    Add Stay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Navigation
  const handleNext = () => {
    const newCompletedTabs = [...completedTabs];
    newCompletedTabs[activeTab] = true;
    setCompletedTabs(newCompletedTabs);
    if (activeTab < tabs.length - 1) setActiveTab(activeTab + 1);
    scrollToTop();
  };
  const handlePrev = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
    scrollToTop();
  };
  // Professional print using Jasper PDF streamed from backend, no new tab
  const handlePrint = async () => {
    try {
      const applicationNo = (formData.connectionDetails.applicationNo || selectedApplication || "").toString().trim();
      const deptId = (formData.connectionDetails.deptId || (applications.find(a => a.applicationNo === applicationNo)?.deptId) || "452.00").toString().trim();
      if (!applicationNo || !deptId) {
        alert("Please select an application number before printing.");
        return;
      }

      const resp = await api.get("/applications/connection-details/service-estimate/print", {
        params: { applicationNo, deptId },
        responseType: "blob",
      });

      const pdfBlob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);

      const cleanup = () => {
        try { document.body.removeChild(iframe); } catch (e) {}
        URL.revokeObjectURL(url);
      };

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(cleanup, 1500);
        }
      };

      // Fallback: if onload doesn't fire (rare), trigger print after a delay
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {}
      }, 2000);
    } catch (err) {
      console.error("Print failed:", err);
      alert(`Print failed: ${err.response?.data?.message || err.message}`);
    }
  };
  const handleSave = async () => {
    try {
      console.log("Saving form data:", formData);
      console.log("Sketch2 data:", formData.sketch2);
      console.log("isSyaNeeded value:", formData.sketch2.isSyaNeeded);

      console.log("applicationNo:", formData.connectionDetails.applicationNo);
      console.log("estimateNumber:", formData.connectionDetails.estimateNumber);

      // Normalize Sketch 4 for backend (handle Selectpole/selectPole and trim values)
      const normalizedSketch4 = {
        poles: (formData.sketch4.poles || []).map((p) => ({
          selectPole: (p.Selectpole ?? p.selectPole ?? "").toString().trim(),
          poleType: (p.poleType ?? "").toString().trim(),
          pointerType: (p.pointerType ?? "").toString().trim(),
          connFrom: (p.connFrom ?? "").toString().trim(),
          connTo: (p.connTo ?? "").toString().trim(),
          qty: Number(p.qty) || 0,
        })),
        struts: (formData.sketch4.struts || []).map((s) => ({
          type: (s.type ?? "").toString().trim(),
          qty: Number(s.qty) || 0,
        })),
        stays: (formData.sketch4.stays || []).map((s) => ({
          type: (s.type ?? "").toString().trim(),
          stayType: (s.stayType ?? "").toString().trim(),
          qty: Number(s.qty) || 0,
        })),
      };

      // Resolve identifiers even if user forgot to click Find
      const resolvedApplicationNo = (formData.connectionDetails.applicationNo || selectedApplication || "").toString().trim();
      const resolvedDeptId = (formData.connectionDetails.deptId || (applications.find(a => a.applicationNo === resolvedApplicationNo)?.deptId) || "452.00").toString().trim();

      // Prepare the data structure for backend
      const requestData = {
        connectionDetails: {
          applicationNo: resolvedApplicationNo,
          deptId: resolvedDeptId,
          phase: formData.connectionDetails.phase || "",
          businessType:
            formData.connectionDetails.businessType ||
            formData.sketch2.businessType ||
            "BT",
        },
        sketch1: {
          serviceLength: Number(formData.sketch1.serviceLength) || 0,
          singleCircuitLength:
            Number(formData.sketch1.singleCircuitLength) || 0,
          conductorType: formData.sketch1.conductorType || "ABC1",
          secondCircuitLength:
            Number(formData.sketch1.secondCircuitLength) || 0,
          secondCircuitConductorType:
            formData.sketch1.secondCircuitConductorType || "ABC1",
          totalLineLength: formData.sketch1.totalLineLength || "0",
          wireType: formData.sketch1.wiringType || "OH",
          loopService: formData.sketch1.isLoopService === "Y" ? "Yes" : "No",
          newLengthWithinPremises:
            Number(formData.sketch1.newLengthWithinPremises) || 0,
          conversion1P3P: Number(formData.sketch1.conversion1P3P) || 0,
          conversion2P3P: Number(formData.sketch1.conversion2P3P) || 0,
          cableType: formData.sketch1.cableType || "ABC",
        },
        sketch2: {
          distanceToServicePoint:
            Number(formData.sketch2.distanceToServicePoint) || 0,
          sinNumber: formData.sketch2.sinNumber || "",
          isSyaNeeded:
            formData.sketch2.isSyaNeeded === "Y" ||
            formData.sketch2.isSyaNeeded === "Yes"
              ? "Yes"
              : formData.sketch2.isSyaNeeded === "N" ||
                formData.sketch2.isSyaNeeded === "No"
              ? "No"
              : "Yes",
          businessType: formData.sketch2.businessType || "",
          numberOfRanges: Number(formData.sketch2.numberOfRanges) || 0,
          isServiceConversion: formData.sketch2.isServiceConversion || "",
        },
        sketch3: {
          poleNumber: formData.sketch3.poleNumber || "",
          distanceFromSS: Number(formData.sketch3.distanceFromSS) || 0,
          substation: formData.sketch3.substation || "",
          transformerCapacity: formData.sketch3.transformerCapacity || "",
          transformerLoad: formData.sketch3.transformerLoad || "",
          transformerPeakLoad: formData.sketch3.transformerPeakLoad || "",
          feederControlType: formData.sketch3.feederControlType || "",
          phase: formData.sketch3.phase || "",
        },
        sketch4: normalizedSketch4,
      };

      // Log data types for debugging
      console.log("Data type check:");
      console.log(
        "- serviceLength type:",
        typeof requestData.sketch1.serviceLength
      );
      console.log(
        "- singleCircuitLength type:",
        typeof requestData.sketch1.singleCircuitLength
      );
      console.log(
        "- isSyaNeeded type:",
        typeof requestData.sketch2.isSyaNeeded
      );
      console.log(
        "- numberOfRanges type:",
        typeof requestData.sketch2.numberOfRanges
      );

      // Log actual form data for debugging
      console.log("Actual form data:");
      console.log("- sketch1:", formData.sketch1);
      console.log("- sketch2:", formData.sketch2);
      console.log("- sketch3:", formData.sketch3);
      console.log("- sketch4:", formData.sketch4);

      // Send data to backend using configured API client
      const response = await api.post(
        "/applications/connection-details/service-estimate/save-from-frontend",
        { ...requestData, mode }
      );

      if (response.status === 200) {
        alert("Service estimate details saved successfully to both tables!");
        console.log("Backend response:", response.data);
        // After Add, remove the application from Add list
        if (mode === "ADD") {
          setApplications((prev) => prev.filter((a) => a.applicationNo !== resolvedApplicationNo));
          setSelectedApplication("");
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error response headers:", error.response?.headers);
      alert(
        `Error saving data: ${error.response?.data?.message || error.message}`
      );
    }
  };

  

  return (
    <div className="app-container">
      <div ref={topRef} />
      <Header />
      <div className="main-content">
        <div className="form-container">
          <div className="flex flex-col min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-6xl mx-auto px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
                {/* Stepper */}
                <div className="flex justify-between items-center mb-4 mt-4 relative w-full">
                  {tabs.map((tab, index) => (
                    <div
                      key={index}
                      className="relative flex-1 flex flex-col items-center"
                    >
                      <div
                        className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${
                          index === activeTab
                            ? "bg-red-400 text-white border-yellow-600"
                            : completedTabs[index]
                            ? "bg-green-500 text-white border-green-600"
                            : "border-gray-400 bg-white text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center">
                        {tab.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ml-0 p-0 bg-blueGray-100">
                  <div className="p-2 rounded w-full max-w-5xl">
                    {tabs[activeTab].content}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mb-1">
                  <div className="form-row-button">
                    {activeTab > 0 && (
                      <button
                        onClick={handlePrev}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Previous
                      </button>
                    )}
                    {activeTab < tabs.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Next
                      </button>
                    ) : isView ? (
                      <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Print
                      </button>
                    ) : mode === "DELETE" ? (
                      <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceEstimateDetails;
