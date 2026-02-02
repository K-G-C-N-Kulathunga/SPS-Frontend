import React, { useEffect, useState } from "react";
import MaterialTable from "../Tabels/MaterialTable";
import LabourTable from "../Tabels/LabourTable";

const EstimationForm = () => {
  const [applicationNo, setApplicationNo] = useState("");
  const [deptId, setDeptId] = useState("");
  const [phase, setPhase] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [wiringType, setWiringType] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMaterialTable, setShowMaterialTable] = useState(false);
  const [showLabourTable, setShowLabourTable] = useState(false);
  const [totalMaterialCost, setTotalMaterialCost] = useState(0);
  const [totalLabourCost, setTotalLabourCost] = useState(0);

  // State to hold quantities
  const [materialQuantities, setMaterialQuantities] = useState([]);
  const [labourQuantities, setLabourQuantities] = useState([]);

  const handleMaterialClick = () => {
    setShowMaterialTable((prev) => !prev);
  };

  const handleLabourClick = () => {
    setShowLabourTable((prev) => !prev);
  };

  const handleMaterialCostChange = (cost) => {
    setTotalMaterialCost(cost);
  };

  const handleLabourCostChange = (cost) => {
    setTotalLabourCost(cost);
  };

  const handleMaterialQuantityChange = (index, value) => {
    const newQuantities = [...materialQuantities];
    newQuantities[index] = value;
    setMaterialQuantities(newQuantities);
    // Recalculate total material cost
    const totalCost = newQuantities.reduce((total, qty, idx) => {
      return total + qty * (totalMaterialCost[idx]?.unitPrice || 0);
    }, 0);
    setTotalMaterialCost(totalCost);
  };

  const handleLabourQuantityChange = (index, value) => {
    const newQuantities = [...labourQuantities];
    newQuantities[index] = value;
    setLabourQuantities(newQuantities);
    // Recalculate total labour cost
    const totalCost = newQuantities.reduce((total, qty, idx) => {
      return total + qty * (totalLabourCost[idx]?.unitPrice || 0);
    }, 0);
    setTotalLabourCost(totalCost);
  };

  const handleSave = async () => {
    // Prepare the data for materials
    const pcestdttDTOs = materialQuantities.map((quantity, index) => {
      // eslint-disable-next-line no-undef
      const material = selectedMaterials[index]; 
      return {
        estimateNo: applicationNo,
        revNo: 1,
        deptId: deptId,
        resCd: material.materialCode,
        estimateQty: quantity,
        estimateCost: material.unitPrice * quantity,
      };
    });

    // Prepare the data for labours
    const spestlabDTOs = labourQuantities.map((quantity, index) => {
      // eslint-disable-next-line no-undef
      const labour = selectedLabours[index];
      return {
        estimateNo: applicationNo,
        deptId: deptId,
        labourCode: labour.labCode,
        activityDescription: labour.name,
        labourCost: labour.unitPrice * quantity,
      };
    });

    // Combine the data into a single object
    const dataToSubmit = {
      pcestdttDTOs,
      spestlabDTOs,
    };

    try {
      const response = await fetch("http://localhost:8082/api/spestlab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        alert("Data submitted successfully!");
      } else {
        alert("Error submitting data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (applicationNo.trim() !== "") {
      try {
        const response = await fetch(
          `http://localhost:8082/api/by-applicationNo?applicationNo=${applicationNo}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setDeptId(data.deptId || "");
        setPhase(data.phase || "");
        setWiringType(data.wiringType || "");
        setConnectionType(data.connectionType || "");
        setIsSubmitted(true);
      } catch (err) {
        console.error(err);
        setDeptId("");
        setPhase("");
        setWiringType("");
        setConnectionType("");
        setIsSubmitted(false); // Reset submitted state
      }
    }
  };

  // Debugging: Log total costs
  useEffect(() => {
    console.log("Total Material Cost:", totalMaterialCost);
    console.log("Total Labour Cost:", totalLabourCost);
  }, [totalMaterialCost, totalLabourCost]);

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
        Estimation Form
      </h3>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              Application No
            </label>
            <input
              type="text"
              placeholder="Enter Application No"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
              style={{
                marginTop: "4px",
                width: "100%",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              Connection Type
            </label>
            <input
              type="text"
              placeholder="Connection Type"
              value={connectionType}
              readOnly
              style={{
                marginTop: "4px",
                width: "100%",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#F7FAFC",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              Dept ID
            </label>
            <input
              type="text"
              placeholder="Dept ID"
              value={deptId}
              readOnly
              style={{
                marginTop: "4px",
                width: "100%",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#F7FAFC",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              Phase
            </label>
            <input
              type="text"
              placeholder="Phase"
              value={phase}
              readOnly
              style={{
                marginTop: "4px",
                width: "100%",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#F7FAFC",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            alignItems: "end",
          }}
        >
          <div style={{ flex: "1" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              Wiring Type
            </label>
            <input
              type="text"
              placeholder="Wiring Type"
              value={wiringType}
              readOnly
              style={{
                marginTop: "4px",
                width: "78%",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#F7FAFC",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#3182CE",
              color: "white",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              minWidth: "150px",
              width: "35%",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2B6CB0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3182CE")
            }
          >
            Submit
          </button>
        </div>
      </form>

      {isSubmitted && (
        <>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              color: "black",
              border: "2px solid #3182CE",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "150px",
              width: "20%",
              backgroundColor: "transparent",
              marginRight: "10px",
              marginBottom: "10px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#2B6CB0";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#3182CE";
            }}
            onClick={handleMaterialClick}
          >
            Material Details
          </button>

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              color: "black",
              border: "2px solid #3182CE",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "150px",
              width: "20%",
              backgroundColor: "transparent",
              marginBottom: "10px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#2B6CB0";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#3182CE";
            }}
            onClick={handleLabourClick}
          >
            Labour Details
          </button>

          {showMaterialTable && (
            <MaterialTable
              deptId={deptId}
              connectionType={connectionType}
              wiringType={wiringType}
              phase={phase}
              applicationNo={applicationNo}
              onCostChange={handleMaterialCostChange}
              quantities={materialQuantities}
              onQuantityChange={handleMaterialQuantityChange}
            />
          )}

          {showLabourTable && (
            <LabourTable
              deptId={deptId}
              applicationNo={applicationNo}
              onCostChange={handleLabourCostChange}
              quantities={labourQuantities} // Pass down quantities
              onQuantityChange={handleLabourQuantityChange} // Pass down handler
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "5px",
              paddingBottom: "10px",
              backgroundColor: "#ECECEC",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <div>
              {totalMaterialCost > 0 && (
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginTop: "1rem",
                  }}
                >
                  Total Material Cost: Rs.{totalMaterialCost}.00
                </h3>
              )}

              {totalLabourCost > 0 && (
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginTop: "1rem",
                  }}
                >
                  Total Labour Cost: Rs.{totalLabourCost}.00
                </h3>
              )}

              {totalLabourCost > 0 || totalMaterialCost > 0 ? (
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginTop: "1rem",
                  }}
                >
                  Total Estimated Cost: Rs.{totalLabourCost + totalMaterialCost}
                  .00
                </h3>
              ) : null}
            </div>

            <div style={{ justifyContent: "flex-end", marginTop: "auto"  }}>
              <button
                style={{
                  padding: "8px 16px",
                  fontSize: "1rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleSave}
              >
                Save Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EstimationForm;
