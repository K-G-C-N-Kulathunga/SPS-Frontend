import React, { useMemo, useState } from "react";
import "./sketch2.css";

const Sketch2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Sample master list (your real list can come from DB/API)
  const resources = [
    { code: "B0210", name: "BRACKETS D - G.I. - W/O INSULATORS & BOLTS 110 X 92MM", uom: "NO.", price: 129.0 },
    { code: "B0740", name: "BOLTS NUTS - G.I. 50 X 16 MM", uom: "NO.", price: 83.0 },
    { code: "B0745", name: "BOLTS NUTS G.I. 120 X 16 MM", uom: "NO.", price: 116.0 },
    { code: "B0755", name: "BOLTS NUTS G.I. 200 X 16 MM", uom: "NO.", price: 206.0 },
    { code: "C0110", name: "INSULATOR - LT 90 X 75MM", uom: "NO.", price: 60.0 },
    { code: "D0610", name: "WIRE BINDING, ALUMINIUM (NO.11) 3MM", uom: "KG.", price: 1105.0 },
    { code: "D1055", name: "CLAMP CRIMP - SERVICE CONNECTION H TYPE AL/AL 7/3,40TO7/1,35-7/1,70", uom: "NO.", price: 140.0 },
    { code: "D1290", name: "CONNECTOR PIERCING FOR ABC 35 - 70/6 - 35 SQMM", uom: "NO.", price: 212.0 },
    { code: "K0110", name: "METERS - KWH SINGLE PHASE 230V 10 - 40(A)", uom: "NO.", price: 2770.0 },
    { code: "L0305", name: "CABLE - ALU.PVC INSULATED - H.S. DUPLEX (7/1.35) 10SQMM ONE CORE INSULATED OTHER CORE BARE", uom: "MTR.", price: 106.0 },
  ];

  const filteredResources = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const toggleSelection = (res) => {
    const exists = selectedResources.find((r) => r.code === res.code);
    if (exists) {
      setSelectedResources((prev) => prev.filter((r) => r.code !== res.code));
    } else {
      setSelectedResources((prev) => [...prev, res]);
    }
  };

  const removeSelected = (code) => {
    setSelectedResources((prev) => prev.filter((r) => r.code !== code));
  };

  // Add selected items to table with extra columns like the screenshot
  const addToTable = () => {
    if (selectedResources.length === 0) return;

    const rows = selectedResources.map((r) => ({
      ...r,
      resType: "MAT-COST",
      resCat: "1",
      estQty: "", // editable
      cebQty: "", // editable
      customerQty: "", // editable
      checked: false, // checkbox for removing
    }));

    setTableData((prev) => [...prev, ...rows]);
    setSelectedResources([]);
    setSearchTerm("");
    setIsModalOpen(false);
  };

  const setRow = (index, patch) => {
    setTableData((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeCheckedResources = () => {
    setTableData((prev) => prev.filter((r) => !r.checked));
  };

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totals = useMemo(() => {
    let estTotal = 0;
    let cebTotal = 0;
    let custTotal = 0;

    tableData.forEach((r) => {
      const price = toNum(r.price);
      estTotal += price * toNum(r.estQty);
      cebTotal += price * toNum(r.cebQty);
      custTotal += price * toNum(r.customerQty);
    });

    return { estTotal, cebTotal, custTotal };
  }, [tableData]);

  return (
    <div
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: "12px",
        maxWidth: "1200px",
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

      {/* Table (matches screenshot columns) */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#b9d7ea",
            textAlign: "center",
            border: "1px solid #2f4f5f",
          }}
        >
          <thead>
            <tr>
              <th className="th-style" style={{ width: 30 }}></th>
              <th className="th-style">Res. Code</th>
              <th className="th-style">Res. Type</th>
              <th className="th-style">Res. Cat</th>
              <th className="th-style" style={{ textAlign: "left" }}>
                Res. Name
              </th>
              <th className="th-style">UOM</th>
              <th className="th-style">Unit Price</th>
              <th className="th-style">Est. Qty.</th>
              <th className="th-style">Est. Cost</th>
              <th className="th-style">Qty (CEB Fund)</th>
              <th className="th-style">Cost (CEB Fund)</th>
              <th className="th-style">Customer Qty.</th>
              <th className="th-style">Customer Cost</th>
            </tr>
          </thead>

          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td className="td-style" colSpan={13}>
                  No materials added yet
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => {
                const unitPrice = toNum(item.price);
                const estQty = toNum(item.estQty);
                const cebQty = toNum(item.cebQty);
                const customerQty = toNum(item.customerQty);

                const estCost = unitPrice * estQty;
                const cebCost = unitPrice * cebQty;
                const customerCost = unitPrice * customerQty;

                return (
                  <tr key={`${item.code}-${index}`}>
                    {/* checkbox column */}
                    <td className="td-style">
                      <input
                        type="checkbox"
                        checked={!!item.checked}
                        onChange={(e) => setRow(index, { checked: e.target.checked })}
                      />
                    </td>

                    <td className="td-style">{item.code}</td>
                    <td className="td-style">{item.resType}</td>
                    <td className="td-style">{item.resCat}</td>

                    <td className="td-style" style={{ textAlign: "left" }}>
                      {item.name}
                    </td>

                    <td className="td-style">{item.uom}</td>

                    <td className="td-style" style={{ textAlign: "right" }}>
                      {unitPrice.toFixed(2)}
                    </td>

                    <td className="td-style">
                      <input
                        type="number"
                        style={{ width: 90 }}
                        value={item.estQty}
                        onChange={(e) => setRow(index, { estQty: e.target.value })}
                      />
                    </td>

                    <td className="td-style" style={{ textAlign: "right" }}>
                      {estCost.toFixed(2)}
                    </td>

                    <td className="td-style">
                      <input
                        type="number"
                        style={{ width: 90 }}
                        value={item.cebQty}
                        onChange={(e) => setRow(index, { cebQty: e.target.value })}
                      />
                    </td>

                    <td className="td-style" style={{ textAlign: "right" }}>
                      {cebCost.toFixed(2)}
                    </td>

                    <td className="td-style">
                      <input
                        type="number"
                        style={{ width: 90 }}
                        value={item.customerQty}
                        onChange={(e) => setRow(index, { customerQty: e.target.value })}
                      />
                    </td>

                    <td className="td-style" style={{ textAlign: "right" }}>
                      {customerCost.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Totals row like screenshot */}
            {tableData.length > 0 && (
              <tr>
                <td className="td-style" colSpan={8} style={{ textAlign: "right", fontWeight: 700 }}>
                  Total Cost
                </td>
                <td className="td-style" style={{ textAlign: "right", fontWeight: 700 }}>
                  {totals.estTotal.toFixed(2)}
                </td>
                <td className="td-style"></td>
                <td className="td-style" style={{ textAlign: "right", fontWeight: 700 }}>
                  {totals.cebTotal.toFixed(2)}
                </td>
                <td className="td-style"></td>
                <td className="td-style" style={{ textAlign: "right", fontWeight: 700 }}>
                  {totals.custTotal.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Remove checked resources (like screenshot link) */}
      {tableData.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span
            onClick={removeCheckedResources}
            style={{
              color: "#1d4ed8",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Remove Checked Resources
          </span>
        </div>
      )}

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
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>
              Add Material
            </h3>

            {/* Search */}
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
            <div style={{ maxHeight: "500px", overflowY: "auto", marginBottom: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th className="list-th">Select</th>
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
                        <td className="list-td">
                          <input type="checkbox" checked={!!isSelected} readOnly />
                        </td>
                        <td className="list-td">{res.code}</td>
                        <td className="list-td">{res.name}</td>
                        <td className="list-td">{res.uom}</td>
                        <td className="list-td">{Number(res.price).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Materials */}
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
                      <strong>{res.code}:</strong> {res.name} ({res.uom}) -{" "}
                      {Number(res.price).toFixed(2)}
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

            {/* Modal action buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn-style"
                style={{ backgroundColor: "#6b7280" }}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-style" disabled={selectedResources.length === 0} onClick={addToTable}>
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
