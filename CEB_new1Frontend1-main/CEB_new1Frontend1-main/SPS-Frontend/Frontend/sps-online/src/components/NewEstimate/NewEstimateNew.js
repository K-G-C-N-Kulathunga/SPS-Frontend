// ApplicationConnectionDetails.js
import React, { useState, useEffect } from "react";
import { api } from '../../api'; // Adjust the path as necessary

const ApplicationConnectionDetails = () => {
  const [applications, setApplications] = useState([]); // List of {applicationNo, deptId}
  const [selectedApplication, setSelectedApplication] = useState("");
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

  // Fetch all applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get(
          "/applications/connection-details/all"
        );
        setApplications(res.data); // [{ applicationNo, deptId }]
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  // Fetch details when "Fetch" button is clicked
  const handleFetchClick = async () => {
    if (!selectedApplication) return;

    // Extract applicationNo and deptId
    const selected = applications.find(
      (app) => app.applicationNo === selectedApplication
    );
    if (!selected) return;

    try {
      const res = await api.get(
        "/applications/connection-details/details",
        {
          params: {
            applicationNo: selected.applicationNo,
            deptId: selected.deptId,
          },
        }
      );
      const data = res.data;
      setFormState({
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
      });
    } catch (err) {
      console.error("Error fetching application details:", err);
    }
  };

  // Styles
  const fieldStyle = { display: "flex", alignItems: "center", marginBottom: "8px" };
  const labelStyle = { width: "140px", fontWeight: 500, color: "#374151", fontSize: "12px", flexShrink: 0 };
  const inputStyle = { flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #d1d5db", background: "#f9fafb", color: "#374151" };
  const buttonStyle = { padding: "4px 12px", fontSize: "12px", borderRadius: "4px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", marginLeft: "10px" };

  return (
    <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "12px", maxWidth: "750px", margin: "0 auto" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>Application Connection Details</h3>

      {/* Dropdown + Fetch button */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
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
            Fetch
          </button>
        </div>
      </div>

      {/* Two-column layout for details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
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
    </div>
  );
};

export default ApplicationConnectionDetails;
