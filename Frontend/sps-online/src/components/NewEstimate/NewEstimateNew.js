// ApplicationConnectionDetails.js (NewEstimateNew.js)

import React, { useState, useEffect } from "react";
import { api } from '../../api';

const ApplicationConnectionDetails = ({ onFetchComplete, setFormData }) => {

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [estimatedTotalCost, setEstimatedTotalCost] = useState(0);

  const [formState, setFormState] = useState({
    estimateNumber: "",
    applicantName: "",
    applicationDate: "",
    nationalIdNumber: "",
    neighborsAccountNumber: "",
    address: "",
    telNumber: "",
    phase: "",
    tariffCategory: "",
    connectionType: "",
    tariff: "",
  });

  // Fetch applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/application/recent");
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  // 🔥 Fetch cost items + calculate totals
  const handleFetchClick = async () => {
    if (!selectedApplication) return;

    try {
      const res = await api.get("/cost/by-application", {
        params: { applicationNo: selectedApplication }
      });

      // ✅ Add hardcoded amount (for now)
      const itemsWithAmount = res.data.map((item) => {
        let amount;

        if (typeof item.amount === "string" && item.amount.includes("/")) {
          const [a, b] = item.amount.split("/");
          amount = Number(a) / Number(b);
        } else {
          amount = Number(item.amount);
        }

        return {
          ...item,
          amount: amount
        };
        });

      // ✅ Group & sum by parentKey
      const parentTotals = itemsWithAmount.reduce((acc, item) => {
        const key = item.parentKey;

        if (!acc[key]) {
          acc[key] = 0;
        }

        acc[key] += item.amount;
        return acc;
      }, {});

      // ✅ Calculate Estimated Total Cost
      const total = Object.values(parentTotals)
        .reduce((sum, value) => sum + value, 0);

      setEstimatedTotalCost(total);

      // ✅ Fetch estimation data (left column)
    const deptId = selectedApplication.split("/")[0];
    const estRes = await api.get("/spserest/estimation", {
      params: { applicationNo: selectedApplication, deptId: deptId },
    });
    const estimationData = estRes.data[0] || {};


      // ✅ Send to parent if needed
      setFormData(prev => ({
        ...prev,
        costItems: itemsWithAmount,
        parentTotals,
        estimatedTotalCost: total,
        estimationData
      }));

      console.log("Parent Totals:", parentTotals);
      console.log("Estimated Total Cost:", total);

    } catch (err) {
      console.error("Error fetching application details:", err);
    }
  };

  // Styles
  const fieldStyle = { display: "flex", alignItems: "center", marginBottom: "8px" };
  const labelStyle = { width: "140px", fontWeight: 500, fontSize: "12px", flexShrink: 0 };
  const inputStyle = { flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #d1d5db", background: "#f9fafb", color: "#374151" };
  const buttonStyle = { padding: "4px 12px", fontSize: "12px", borderRadius: "4px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", marginLeft: "10px" };

  return (
    <div style={{
      background: "#fff",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      fontSize: "12px",
      maxWidth: "750px",
      margin: "0 auto"
    }}>

      <h3 style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#111827",
        marginBottom: "12px"
      }}>
        Application Connection Details
      </h3>

      {/* Dropdown + Fetch */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginBottom: "15px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={labelStyle}>Application No:</label>

          <select
            value={selectedApplication}
            onChange={(e) => setSelectedApplication(e.target.value)}
            style={{ ...inputStyle, background: "#fff", cursor: "pointer" }}
          >
            <option value="">Select Application</option>
            {applications.map((app, index) => (
              <option key={index} value={app}>{app}</option>
            ))}
          </select>

          <button style={buttonStyle} onClick={handleFetchClick}>
            Find
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px"
      }}>

        {/* Left column */}
        <div>
          {[
            { label: "Applicant Name:", value: formState.applicantName },
            { label: "Application Date:", value: formState.applicationDate },
            { label: "NIC/Passport No:", value: formState.nationalIdNumber },
            { label: "Neighbours Acc. No:", value: formState.neighborsAccountNumber },
            { label: "Address:", value: formState.address },
            { label: "Tele. Nos:", value: formState.telNumber },
          ].map((field, idx) => (
            <div key={idx} style={fieldStyle}>
              <label style={labelStyle}>{field.label}</label>
              <input type="text" value={field.value} readOnly style={inputStyle} />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div>
          {[
            { label: "Phase:", value: formState.phase },
            { label: "Tariff Category:", value: formState.tariffCategory },
            { label: "Connection Type:", value: formState.connectionType },
            { label: "Tariff:", value: formState.tariff },
          ].map((field, idx) => (
            <div key={idx} style={fieldStyle}>
              <label style={labelStyle}>{field.label}</label>
              <input type="text" value={field.value} readOnly style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 Estimated Total Cost Display */}
      {estimatedTotalCost > 0 && (
        <div style={{
          marginTop: "20px",
          padding: "10px",
          background: "#f3f4f6",
          borderRadius: "6px",
          fontWeight: "600",
          fontSize: "14px",
          textAlign: "right"
        }}>
          {/* Estimated Total Cost: Rs. {estimatedTotalCost.toLocaleString()} */}
        </div>
      )}

    </div>
  );
};

export default ApplicationConnectionDetails;