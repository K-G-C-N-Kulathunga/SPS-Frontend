import React, { useState, useEffect, useRef } from "react";

const Sketch1 = ({ formData }) => {
  const costItems = formData.costItems || [];

  // ---------- Left State ----------
  const [formDataLeft, setFormDataLeft] = useState({
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

  // ---------- Hardcoded base amounts (NO EST_TOTAL here) ----------
  const hardcodedAmounts = {
    FC: 1000.0,
    VC: 500.0,
    ST: 1500.0,
    MC: 300.0,
    LC: 400.0, 
    OC: 200.0,
    TC: 100.0,
    CC: 250.0,
    SYA_COST: 75.0,
    MV_NETWORK: 600.0,
  };

  const [costValues, setCostValues] = useState({});
  const prevCodesRef = useRef("");

  // ---------- Initialize cost values ----------
  useEffect(() => {
    const currentCodes = costItems
      .map(item => item.costItemCode)
      .sort()
      .join(",");

    if (prevCodesRef.current !== currentCodes) {

      const initial = {};

      costItems.forEach(item => {
        // If EST_TOTAL → initialize 0
        if (item.costItemCode === "EST_TOTAL") {
          initial[item.costItemCode] = 0;
        } else {
          initial[item.costItemCode] =
            hardcodedAmounts[item.costItemCode] || 0;
        }
      });

      setCostValues(initial);
      prevCodesRef.current = currentCodes;
    }
  }, [costItems]);

 // ---------- 🔥 Calculate Estimated Total ONLY for parentKey = 8 ----------
useEffect(() => {
  if (costItems.length === 0) return;

  let total = 0;

  costItems.forEach(item => {

    // Skip EST_TOTAL itself
    if (item.costItemCode === "EST_TOTAL") return;

    // ✅ ONLY add if parentKey is 8
    if (item.parentKey === 11) {
      total += costValues[item.costItemCode] || 0;
    }

  });

  // Prevent infinite loop
  if (costValues["EST_TOTAL"] !== total) {
    setCostValues(prev => ({
      ...prev,
      EST_TOTAL: total
    }));
  }

}, [costValues, costItems]);

  // ---------- Left Input Handler ----------
  const handleLeftChange = (e) => {
    const { name, value } = e.target;
    setFormDataLeft(prev => ({ ...prev, [name]: value }));
  };

  // ---------- Styles ----------
  const fieldStyle = { display: "flex", alignItems: "center", marginBottom: "8px" };
  const labelStyle = { width: "200px", fontWeight: 500, fontSize: "12px", flexShrink: 0 };
  const inputStyle = { flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #d1d5db", background: "#fff", color: "#374151" };
  const containerStyle = { background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "12px", maxWidth: "1200px", margin: "15px auto" };
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

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>

        {/* LEFT COLUMN */}
        <div>
          {Object.keys(leftLabelMap).map((key) => (
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

        {/* RIGHT COLUMN – COST ITEMS */}
        <div>
          {costItems.filter(item => item.isActive === 1).map((item) => (
            <div style={fieldStyle} key={item.costItemCode}>
              <label style={labelStyle}>{item.description}:</label>
              <input
                type="text"
                value={
                  costValues[item.costItemCode] !== undefined
                    ? costValues[item.costItemCode].toFixed(2)
                    : ""
                }
                style={inputStyle}
                readOnly
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