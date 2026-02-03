import React, { useState } from "react";

const Sketch1 = () => {
  const [formData, setFormData] = useState({
    // Left Side
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

    // Right Side
    fixedCost: "",
    variableCost: "",
    subTotal: "",
    materialCost: "",
    labourCost: "",
    overheadCost: "",
    transportCost: "",
    conversionCost: "",
    syaCost: "",
    mvNetworkDevCost: "",
    totalCostNBT: "",
    nbt: "",
    totalCostSSCL: "",
    sscl: "",
    totalCostVAT: "",
    vatAmount: "",
    securityDeposit: "",
    addSecurityDeposit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fieldStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  };
  const labelStyle = {
    width: "200px",
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
  const containerStyle = {
    background: "#ffffffff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontSize: "12px",
    maxWidth: "1200px",
    margin: "15px auto",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  };

  // Label mapping
  const labelMap = {
    // Left
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

    // Right
    fixedCost: "Fixed Cost",
    variableCost: "Variable Cost",
    subTotal: "Sub Total",
    materialCost: "Material Cost",
    labourCost: "Labour Cost",
    overheadCost: "Overhead Cost",
    transportCost: "Transport Cost",
    conversionCost: "Conversion Cost",
    syaCost: "SYA Cost",
    mvNetworkDevCost: "MV Network Dev Cost",
    totalCostNBT: "Total Cost for NBT",
    nbt: "Nation Building Tax (NBT)",
    totalCostSSCL: "Total Cost for SSCL",
    sscl: "SSCL",
    totalCostVAT: "Total Cost for VAT",
    vatAmount: "VAT Amount",
    securityDeposit: "Security Deposit",
    addSecurityDeposit: "Add Security Deposit",
  };

  // Fields in order
  const leftFields = [
    "categoryCode",
    "totalLineLength",
    "conductorType",
    "conductorLength",
    "serviceLength",
    "lengthInsidePremises",
    "conversion1P3P",
    "conversion2P3P",
    "secondCircuitLength",
    "secondCircuitConductorType",
    "wiringType",
    "loopService",
    "cableType",
    "spans",
    "noPoles",
    "noStays",
    "noStruts",
  ];

  const rightFields = [
    "fixedCost",
    "variableCost",
    "subTotal",
    "materialCost",
    "labourCost",
    "overheadCost",
    "transportCost",
    "conversionCost",
    "syaCost",
    "mvNetworkDevCost",
    "totalCostNBT",
    "nbt",
    "totalCostSSCL",
    "sscl",
    "totalCostVAT",
    "vatAmount",
    "securityDeposit",
    "addSecurityDeposit",
  ];

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {/* Left column */}
        <div>
          {leftFields.map((key) => (
            <div style={fieldStyle} key={key}>
              <label style={labelStyle}>{labelMap[key]}:</label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div>
          {rightFields.map((key) => (
            <div style={fieldStyle} key={key}>
              <label style={labelStyle}>{labelMap[key]}:</label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sketch1;
