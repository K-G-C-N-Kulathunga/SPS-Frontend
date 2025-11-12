import React, { useState } from "react";
import "./sketch2.css";

const Sketch2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState([]);
  const [tableData, setTableData] = useState([]);

  const resources = [
    { code: "R001", name: "Cement", uom: "Bag", price: 350 },
    { code: "R002", name: "Steel Rod", uom: "Kg", price: 60 },
    { code: "R003", name: "Sand", uom: "Cubic Ft", price: 45 },
    { code: "R004", name: "Bricks", uom: "Piece", price: 12 },
    { code: "R005", name: "Gravel", uom: "Cubic Ft", price: 50 },
    { code: "R006", name: "Timber Plank", uom: "Foot", price: 120 },
    { code: "R007", name: "Glass Sheet", uom: "Sq Ft", price: 250 },
    { code: "R008", name: "Paint", uom: "Litre", price: 800 },
    { code: "R009", name: "Tiles", uom: "Sq Ft", price: 95 },
    { code: "R010", name: "PVC Pipe", uom: "Meter", price: 150 },
    { code: "R011", name: "Nails", uom: "Kg", price: 200 },
    { code: "R012", name: "Wire", uom: "Meter", price: 35 },
    { code: "R013", name: "Concrete Block", uom: "Piece", price: 55 },
    { code: "R014", name: "Plywood Sheet", uom: "Sq Ft", price: 90 },
    { code: "R015", name: "Roof Sheet", uom: "Meter", price: 480 },
    { code: "R016", name: "Door Frame", uom: "Piece", price: 2500 },
    { code: "R017", name: "Window Frame", uom: "Piece", price: 1800 },
    { code: "R018", name: "Plaster", uom: "Bag", price: 400 },
    { code: "R019", name: "Waterproofing Compound", uom: "Kg", price: 750 },
    { code: "R020", name: "Electrical Switch", uom: "Piece", price: 150 }
  ];

  const filteredResources = resources.filter(
    (res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (res) => {
    if (selectedResources.find((r) => r.code === res.code)) {
      setSelectedResources(selectedResources.filter((r) => r.code !== res.code));
    } else {
      setSelectedResources([...selectedResources, res]);
    }
  };

  const removeSelected = (code) => {
    setSelectedResources(selectedResources.filter((r) => r.code !== code));
  };

  const addToTable = () => {
    if (selectedResources.length > 0) {
      setTableData([...tableData, ...selectedResources]);
      setSelectedResources([]);
      setSearchTerm("");
      setIsModalOpen(false);
    }
  };

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
          Material Cost
        </h3>
        <button className="btn-style" onClick={() => setIsModalOpen(true)}>
          Add Material
        </button>
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
              <th className="th-style">Resource Code</th>
              <th className="th-style">Resource Name</th>
              <th className="th-style">UOM</th>
              <th className="th-style">Unit Price</th>
              <th className="th-style">Rebate Qty.</th>
              <th className="th-style">Rebate Cost</th>
              <th className="th-style">Re-usable Qty.</th>
              <th className="th-style">Re-usable Cost</th>
              <th className="th-style">Off charge Qty.</th>
              <th className="th-style">Off charge Cost</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td className="td-style" colSpan={10}>
                  No materials added yet
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr key={index}>
                  <td className="td-style">{item.code}</td>
                  <td className="td-style">{item.name}</td>
                  <td className="td-style">{item.uom}</td>
                  <td className="td-style">{item.price}</td>
                  <td className="td-style"></td>
                  <td className="td-style"></td>
                  <td className="td-style"></td>
                  <td className="td-style"></td>
                  <td className="td-style"></td>
                  <td className="td-style"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="overlay-style"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(4px)",
            zIndex: 50,
          }}
        >
          <div className="modal-style" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}
            >
              Add Material
            </h3>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />

            {/* Resource List */}
            <div
  style={{
    maxHeight: "500px",
    overflowY: "auto",
    marginBottom: "15px",
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px",
    }}
  >
    <thead>
      <tr>
        <th className="list-th">Select</th> {/* ✅ New Checkbox Column */}
        <th className="list-th">Mat Code</th>
        <th className="list-th">Mat Name</th>
        <th className="list-th">UOM</th>
        <th className="list-th">Unit Price</th>
      </tr>
    </thead>
    <tbody>
      {filteredResources.map((res) => {
        const isSelected = selectedResources.find((r) => r.code === res.code);
        return (
          <tr
            key={res.code}
            className={isSelected ? "selected-row" : ""}
            style={{ cursor: "pointer" }}
            onClick={() => toggleSelection(res)}
          >
            {/* ✅ Checkbox Column */}
            <td className="list-td">
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
              />
            </td>
            <td className="list-td">{res.code}</td>
            <td className="list-td">{res.name}</td>
            <td className="list-td">{res.uom}</td>
            <td className="list-td">{res.price}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

            {/* Selected Material Details with remove option */}
            {/* Selected Material Details with clear section */}
            {selectedResources.length > 0 && (
              <div
                className="selected-details"
                style={{
                  marginTop: "15px",
                  border: "1px solid #2563eb",
                  borderRadius: "6px",
                  padding: "10px",
                  backgroundColor: "#f0f9ff",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#1e3a8a",
                    borderBottom: "1px solid #93c5fd",
                    paddingBottom: "4px",
                  }}
                >
                  Selected Materials ({selectedResources.length})
                </h4>

                {selectedResources.map((res) => (
                  <div
                    key={res.code}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 0",
                      borderBottom: "1px dashed #cbd5e1",
                    }}
                  >
                    <span>
                      <strong>{res.code}:</strong> {res.name} ({res.uom}) - {res.price}
                    </span>
                    <button
                      onClick={() => removeSelected(res.code)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "black",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}


            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                className="btn-style"
                style={{ backgroundColor: "#6b7280" }}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-style"
                disabled={selectedResources.length === 0}
                onClick={addToTable}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sketch2;
