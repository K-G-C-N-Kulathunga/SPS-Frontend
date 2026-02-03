// Sketch2.js
import React from "react";

const Sketch3 = () => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: "12px",
        maxWidth: "1000px",
        margin: "20px auto",
      }}
    >
      {/* Title */}
      {/* <h3
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        Labor Cost
      </h3> */}

      {/* Title & Button Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          Labor Cost
        </h3>

        {/* Add Material Cost Button */}
        {/* <button
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
          }}
          onClick={() => alert("Add Labor Cost clicked!")}
        >
          Add Labor Cost
        </button> */}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#dbeef4",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Resource Code</th>
              <th style={thStyle}>Resource Name</th>
              <th style={thStyle}>UOM</th>
              <th style={thStyle}>Unit Price</th>
              <th style={thStyle}>Rebate Qty.</th>
              <th style={thStyle}>Rebate Cost</th>
              <th style={thStyle}>Re-usable Qty.</th>
              <th style={thStyle}>Re-usable Cost</th>
              <th style={thStyle}>Off charge Qty.</th>
              <th style={thStyle}>Off charge Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles for table cells
const thStyle = {
  border: "1px solid #000",
  padding: "6px",
  fontWeight: "600",
  fontSize: "12px",
  backgroundColor: "#dbeef4",
};

const tdStyle = {
  border: "1px solid #000",
  padding: "6px",
  fontSize: "12px",
  backgroundColor: "#fff",
};

export default Sketch3;
