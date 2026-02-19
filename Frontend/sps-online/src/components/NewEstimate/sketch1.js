import React, { useState, useEffect, useRef } from "react";

const Sketch1 = ({ formData, setFormData }) => {
  const costItems = formData.costItems || []; // ✅ get from formData

  const [formDataLeft, setFormDataLeft] = useState({
    // Left side fields (unchanged)
    categoryCode: "",
    totalLineLength: "",
    conductorType: "",
    conductorLength: "",
    serviceLength: "",
    lengthInsidePremises: "",
    conversion1P3P: "",
    conversion2P3P: "",
    secondCircuitLength: "",
    secondCircuitConductorType: "",
    wiringType: "",
    loopService: "",
    cableType: "",
    spans: "",
    noPoles: "",
    noStays: "",
    noStruts: "",
  });

  const [costValues, setCostValues] = useState({});
  const prevCodesRef = useRef("");

  // Re-initialize costValues when costItems change
  useEffect(() => {
    const currentCodes = costItems.map(item => item.costItemCode).sort().join(',');
    if (prevCodesRef.current !== currentCodes) {
      const initial = {};
      costItems.forEach(item => {
        initial[item.costItemCode] = "";
      });
      setCostValues(initial);
      prevCodesRef.current = currentCodes;
    }
  }, [costItems]);

  const handleLeftChange = (e) => {
    const { name, value } = e.target;
    setFormDataLeft(prev => ({ ...prev, [name]: value }));
  };

  const handleCostChange = (code, value) => {
    setCostValues(prev => ({ ...prev, [code]: value }));
  };

  // Styles (uncharted, keep as before)
  const fieldStyle = { display: "flex", alignItems: "center", marginBottom: "8px" };
  const labelStyle = { width: "200px", fontWeight: 500, fontSize: "12px", flexShrink: 0 };
  const inputStyle = { flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #d1d5db", background: "#fff", color: "#374151" };
  const containerStyle = { background: "#ffffffff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "12px", maxWidth: "1200px", margin: "15px auto" };
  const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" };

  const leftLabelMap = {
    categoryCode: "Category Code",
    totalLineLength: "Total Line Length (m)",
    conductorType: "Conductor Type",
    conductorLength: "Conductor Length (m)",
    serviceLength: "Service Length (m)",
    lengthInsidePremises: "Length Inside Premises (m)",
    conversion1P3P: "1P-3P Conv. Len. Inside Premises (m)",
    conversion2P3P: "2P-3P Conv. Len. Inside Premises (m)",
    secondCircuitLength: "Second Circuit Length (m)",
    secondCircuitConductorType: "Second Circuit Conductor Type",
    wiringType: "Wiring Type",
    loopService: "Is Loop Service?",
    cableType: "Cable Type",
    spans: "Spans",
    noPoles: "No. Poles",
    noStays: "No. Stays",
    noStruts: "No. Struts",
  };

  const leftFields = [
    "categoryCode", "totalLineLength", "conductorType", "conductorLength",
    "serviceLength", "lengthInsidePremises", "conversion1P3P", "conversion2P3P",
    "secondCircuitLength", "secondCircuitConductorType", "wiringType",
    "loopService", "cableType", "spans", "noPoles", "noStays", "noStruts",
  ];

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {/* Left column (hardcoded) */}
        <div>
          {leftFields.map((key) => (
            <div style={fieldStyle} key={key}>
              <label style={labelStyle}>{leftLabelMap[key]}:</label>
              <input
                type="text"
                name={key}
                value={formDataLeft[key]}
                onChange={handleLeftChange}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Right column (dynamic from costItems) */}
        <div>
          {costItems.map((item) => (
            <div style={fieldStyle} key={item.costItemCode}>
              <label style={labelStyle}>{item.description}:</label>
              <input
                type="text"
                value={costValues[item.costItemCode] || ""}
                onChange={(e) => handleCostChange(item.costItemCode, e.target.value)}
                style={inputStyle}
                // placeholder="Enter amount"
              />
            </div>
          ))}
          {costItems.length === 0 && (
            <div style={{ color: "#999", textAlign: "center", padding: "20px" }}>
              No cost items loaded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sketch1;