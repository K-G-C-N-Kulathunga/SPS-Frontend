import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "components/Headers/Header.js";

const NewEstimate = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(Array(7).fill(false));
  const [formData, setFormData] = useState({
    connectionDetails: {},
    sketch1: {},
    sketch2: {},
    sketch3: [],
    sketch4: [],
    sketch5: [],
  });

  const topRef = useRef(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9090/sps/api/applications/connection-details/all"
        );
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  const handleFetchClick = async () => {
    if (!selectedApplication) return;
    const selected = applications.find(
      (app) => app.applicationNo === selectedApplication
    );
    if (!selected) return;

    try {
      const res = await axios.get(
        "http://localhost:9090/sps/api/applications/connection-details/details",
        {
          params: {
            applicationNo: selected.applicationNo,
            deptId: selected.deptId,
          },
        }
      );
      const data = res.data;
      setFormData((prev) => ({
        ...prev,
        connectionDetails: {
          estimateNumber: data.applicationNo || "",
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
      }));
    } catch (err) {
      console.error("Error fetching application details:", err);
    }
  };

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
    setFormData((prev) => ({
      ...prev,
      sketch2: { ...prev.sketch2, [name]: value },
    }));
  };
  const handleSketch3Change = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newSketch3 = [...prev.sketch3];
      newSketch3[index] = { ...newSketch3[index], [name]: value };
      return { ...prev, sketch3: newSketch3 };
    });
  };
  const handleSketch4Change = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newSketch4 = [...prev.sketch4];
      newSketch4[index] = { ...newSketch4[index], [name]: value };
      return { ...prev, sketch4: newSketch4 };
    });
  };
  const handleSketch5Change = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newSketch5 = [...prev.sketch5];
      newSketch5[index] = { ...newSketch5[index], [name]: value };
      return { ...prev, sketch5: newSketch5 };
    });
  };

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

  const labelMap = {
    distanceToServicePoint: "Distance to Service",
    sinNumber: "SIN Code",
    numberOfRanges: "Number of Ranges",
    businessType: "Business Type",
    poleNumber: "Pole Number",
    phase: "Phase",
    categoryCode: "Category Code",
    totalLineLength: "Total Line Length",
    conductorType: "Conductor Type",
    serviceLength: "Service Length",
    lengthInsidePremises: "Length Inside Premises",
    conversion1P3P: "Conversion 1P to 3P",
    conversion2P3P: "Conversion 2P to 3P",
    secondCircuitLength: "Second Circuit Length",
    secondCircuitConductorType: "Second Circuit Conductor Type",
    wiringType: "Wiring Type",
    loopService: "Loop Service",
    cableType: "Cable Type",
    noPoles: "Number of Poles",
    noStays: "Number of Stays",
    noStruts: "Number of Struts",
    resourceCode: "Resource Code",
    resourceName: "Resource Name",
    uom: "UOM",
    unitPrice: "Unit Price",
    rebateQty: "Rebate Qty",
    rebateCost: "Rebate Cost",
    reUsableQty: "Re-usable Qty",
    reUsableCost: "Re-usable Cost",
    offChargeQty: "Off-charge Qty",
    offChargeCost: "Off-charge Cost",
  };

  const tabs = [
    {
      name: "Application Connection Details",
      content: (
        <div style={containerStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
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
              <button style={buttonStyle} onClick={handleFetchClick}>
                Find
              </button>
            </div>
          </div>
          <div style={gridStyle}>
            <div>
              {[
                { label: "Customer Name:", name: "applicantName" },
                { label: "Application Date:", name: "applicationDate" },
                { label: "ID Number:", name: "nationalIdNumber" },
                { label: "Neighbours Acc. No:", name: "neighborsAccountNumber" },
                { label: "Address:", name: "address" },
                { label: "Tele. Nos:", name: "telNumber" },
              ].map((field) => (
                <div key={field.name} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData.connectionDetails[field.name] || ""}
                    onChange={handleConnectionChange}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div>
              {[
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
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "New Standard Estimation",
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
            {Object.keys(formData.sketch1).length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch1: {
                  distanceToServicePoint: "",
                  sinNumber: "",
                  numberOfRanges: "",
                  businessType: "",
                  poleNumber: "",
                  phase: "",
                  categoryCode: "",
                  totalLineLength: "",
                  conductorType: "",
                  serviceLength: "",
                  lengthInsidePremises: "",
                  conversion1P3P: "",
                  conversion2P3P: "",
                  secondCircuitLength: "",
                  secondCircuitConductorType: "",
                  wiringType: "",
                  loopService: "",
                  cableType: "",
                  noPoles: "",
                  noStays: "",
                  noStruts: "",
                },
              }))}
            {Object.keys(formData.sketch1).map((key) => (
              <div style={fieldStyle} key={key}>
                <label style={labelStyle}>{labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                {key === "phase" || key === "wiringType" || key === "loopService" || key === "cableType" ? (
                  <select
                    name={key}
                    value={formData.sketch1[key] || ""}
                    onChange={handleSketch1Change}
                    style={inputStyle}
                  >
                    <option value={formData.sketch1[key] || ""}>{formData.sketch1[key] || ""}</option>
                    {(key === "wiringType" || key === "loopService" || key === "cableType") && (
                      <option value="">Select {labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim()}</option>
                    )}
                    {key === "phase" && (
                      <>
                        <option value="Single">Single</option>
                        <option value="Three">Three</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData.sketch1[key] || ""}
                    onChange={handleSketch1Change}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Material Cost",
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
            {Object.keys(formData.sketch2).length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch2: {
                  distanceToServicePoint: "",
                  sinNumber: "",
                  numberOfRanges: "",
                  businessType: "",
                  poleNumber: "",
                  phase: "",
                },
              }))}
            {Object.keys(formData.sketch2).map((key) => (
              <div style={fieldStyle} key={key}>
                <label style={labelStyle}>{labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                {key === "phase" ? (
                  <select
                    name={key}
                    value={formData.sketch2[key] || ""}
                    onChange={handleSketch2Change}
                    style={inputStyle}
                  >
                    <option value="">Select Phase</option>
                    <option value="Single">Single</option>
                    <option value="Three">Three</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData.sketch2[key] || ""}
                    onChange={handleSketch2Change}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Labor Cost",
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
            {formData.sketch3.length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch3: [
                  {
                    resourceCode: "",
                    resourceName: "",
                    uom: "",
                    unitPrice: "",
                    rebateQty: "",
                    rebateCost: "",
                    reUsableQty: "",
                    reUsableCost: "",
                    offChargeQty: "",
                    offChargeCost: "",
                  },
                ],
              }))}
            {formData.sketch3.map((row, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px", marginBottom: "10px" }}>
                {[
                  { name: "resourceCode", label: "Resource Code" },
                  { name: "resourceName", label: "Resource Name" },
                  { name: "uom", label: "UOM" },
                  { name: "unitPrice", label: "Unit Price" },
                  { name: "rebateQty", label: "Rebate Qty" },
                  { name: "rebateCost", label: "Rebate Cost" },
                  { name: "reUsableQty", label: "Re-usable Qty" },
                  { name: "reUsableCost", label: "Re-usable Cost" },
                  { name: "offChargeQty", label: "Off-charge Qty" },
                  { name: "offChargeCost", label: "Off-charge Cost" },
                ].map((field) => (
                  <div key={field.name} style={fieldStyle}>
                    <label style={labelStyle}>{field.label}:</label>
                    <input
                      type="text"
                      name={field.name}
                      value={row[field.name] || ""}
                      onChange={(e) => handleSketch3Change(e, index)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Sketch 4",
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
            Resource Details
          </h3>
          <div style={gridStyle}>
            {formData.sketch4.length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch4: [
                  {
                    resourceCode: "",
                    resourceName: "",
                    uom: "",
                    unitPrice: "",
                    rebateQty: "",
                    rebateCost: "",
                    reUsableQty: "",
                    reUsableCost: "",
                    offChargeQty: "",
                    offChargeCost: "",
                  },
                ],
              }))}
            {formData.sketch4.map((row, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px", marginBottom: "10px" }}>
                {[
                  { name: "resourceCode", label: "Resource Code" },
                  { name: "resourceName", label: "Resource Name" },
                  { name: "uom", label: "UOM" },
                  { name: "unitPrice", label: "Unit Price" },
                  { name: "rebateQty", label: "Rebate Qty" },
                  { name: "rebateCost", label: "Rebate Cost" },
                  { name: "reUsableQty", label: "Re-usable Qty" },
                  { name: "reUsableCost", label: "Re-usable Cost" },
                  { name: "offChargeQty", label: "Off-charge Qty" },
                  { name: "offChargeCost", label: "Off-charge Cost" },
                ].map((field) => (
                  <div key={field.name} style={fieldStyle}>
                    <label style={labelStyle}>{field.label}:</label>
                    <input
                      type="text"
                      name={field.name}
                      value={row[field.name] || ""}
                      onChange={(e) => handleSketch4Change(e, index)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Sketch 5",
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
            Resource Details
          </h3>
          <div style={gridStyle}>
            {formData.sketch5.length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch5: [
                  {
                    resourceCode: "",
                    resourceName: "",
                    uom: "",
                    unitPrice: "",
                    rebateQty: "",
                    rebateCost: "",
                    reUsableQty: "",
                    reUsableCost: "",
                    offChargeQty: "",
                    offChargeCost: "",
                  },
                ],
              }))}
            {formData.sketch5.map((row, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px", marginBottom: "10px" }}>
                {[
                  { name: "resourceCode", label: "Resource Code" },
                  { name: "resourceName", label: "Resource Name" },
                  { name: "uom", label: "UOM" },
                  { name: "unitPrice", label: "Unit Price" },
                  { name: "rebateQty", label: "Rebate Qty" },
                  { name: "rebateCost", label: "Rebate Cost" },
                  { name: "reUsableQty", label: "Re-usable Qty" },
                  { name: "reUsableCost", label: "Re-usable Cost" },
                  { name: "offChargeQty", label: "Off-charge Qty" },
                  { name: "offChargeCost", label: "Off-charge Cost" },
                ].map((field) => (
                  <div key={field.name} style={fieldStyle}>
                    <label style={labelStyle}>{field.label}:</label>
                    <input
                      type="text"
                      name={field.name}
                      value={row[field.name] || ""}
                      onChange={(e) => handleSketch5Change(e, index)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Rebat Items",
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
            Rebate Items
          </h3>
          <div style={gridStyle}>
            {formData.sketch3.length === 0 &&
              setFormData((prev) => ({
                ...prev,
                sketch3: [
                  {
                    resourceCode: "",
                    resourceName: "",
                    uom: "",
                    unitPrice: "",
                    rebateQty: "",
                    rebateCost: "",
                    reUsableQty: "",
                    reUsableCost: "",
                    offChargeQty: "",
                    offChargeCost: "",
                  },
                ],
              }))}
            {formData.sketch3.map((row, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px", marginBottom: "10px" }}>
                {[
                  { name: "resourceCode", label: "Resource Code" },
                  { name: "resourceName", label: "Resource Name" },
                  { name: "uom", label: "UOM" },
                  { name: "unitPrice", label: "Unit Price" },
                  { name: "rebateQty", label: "Rebate Qty" },
                  { name: "rebateCost", label: "Rebate Cost" },
                  { name: "reUsableQty", label: "Re-usable Qty" },
                  { name: "reUsableCost", label: "Re-usable Cost" },
                  { name: "offChargeQty", label: "Off-charge Qty" },
                  { name: "offChargeCost", label: "Off-charge Cost" },
                ].map((field) => (
                  <div key={field.name} style={fieldStyle}>
                    <label style={labelStyle}>{field.label}:</label>
                    <input
                      type="text"
                      name={field.name}
                      value={row[field.name] || ""}
                      onChange={(e) => handleSketch3Change(e, index)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

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
  const handleSave = () => {
    console.log("Saving form data:", formData);
    alert("Service estimate details saved successfully!");
  };
  const scrollToTop = () => {
    if (topRef.current)
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => scrollToTop(), [activeTab]);

  return (
    <div className="app-container">
      <div ref={topRef} />
      <Header />
      <div className="main-content">
        <div className="form-container">
          <div className="flex flex-col min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-6xl mx-auto px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
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

export default NewEstimate;