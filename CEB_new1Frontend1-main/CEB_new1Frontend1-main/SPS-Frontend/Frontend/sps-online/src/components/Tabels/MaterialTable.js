import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const MaterialTable = ({
  deptId,
  connectionType,
  wiringType,
  phase,
  applicationNo,
  onCostChange,
}) => {
  // eslint-disable-next-line no-unused-vars
  const [defaultMaterials, setDefaultMaterials] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showMaterialTable, setShowMaterialTable] = useState(false);
  const [clickedMaterials, setClickedMaterials] = useState({}); // Track clicked materials

  useEffect(() => {
    if (!deptId || !connectionType || !wiringType || !phase) return;

    const fetchMaterials = async () => {
      try {
        const [defaultRes, availableRes] = await Promise.all([
          fetch(
            `http://localhost:8082/api/getDetails?deptId=${deptId}&connectionType=${connectionType}&wiringType=${wiringType}&phase=${phase}`
          ).then((res) => res.json()),
          fetch(
            `http://localhost:8082/api/getAvailableDetails?deptId=${deptId}&connectionType=${connectionType}&wiringType=${wiringType}&phase=${phase}`
          ).then((res) => res.json()),
        ]);

        setDefaultMaterials(defaultRes);
        setSelectedMaterials(defaultRes);
        setAvailableMaterials(availableRes);

        const initialQuantities = {};
        defaultRes.forEach((material) => {
          initialQuantities[material.materialCode] = 0; // Default quantity to 0
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchMaterials();
  }, [deptId, connectionType, wiringType, phase]);

  const calculateTotalMaterialCost = () => {
    const totalCost = selectedMaterials.reduce((total, material) => {
      return (
        total + material.unitPrice * (quantities[material.materialCode] || 0)
      );
    }, 0);

    onCostChange(totalCost);
    return totalCost;
  };

  const addMaterialToTable = (material) => {
    if (
      !selectedMaterials.some((m) => m.materialCode === material.materialCode)
    ) {
      setSelectedMaterials((prev) => [...prev, material]);
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [material.materialCode]: 0,
      }));
    }
  };

  const removeMaterialFromTable = (materialCode) => {
    setSelectedMaterials((prev) =>
      prev.filter((m) => m.materialCode !== materialCode)
    );
    setQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      delete updatedQuantities[materialCode];
      return updatedQuantities;
    });
  };

  const handleQuantityChange = (materialCode, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [materialCode]: value > 0 ? value : 0,
    }));
  };

  const handleAddButtonClick = (materialCode) => {
    setClickedMaterials((prevClicked) => ({
      ...prevClicked,
      [materialCode]: !prevClicked[materialCode], // Toggle click state
    }));
  };
  const stylling = {
    tableHeader: {
      backgroundColor: "#F3F4F6",
      fontWeight: "600",
      color: "#374151",
    },
    tableRow: {
      borderBottom: "1px solid #E5E7EB",
      transition: "background-color 0.2s",
      hover: {
        backgroundColor: "#F9FAFB",
      },
      fontSize: "11PX",
      textAlign: "center",
    },
    addButton: {
      padding: "2px 10px",
      borderRadius: "6px",
      fontWeight: "500",
      transition: "all 0.3s ease",
    },
    removeButton: {
      backgroundColor: "#EF4444",
      color: "white",
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      hover: {
        backgroundColor: "#DC2626",
      },
    },
  };
  return (
    <div style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={() => setShowMaterialTable(!showMaterialTable)}
          style={{
            padding: "8px 16px",
            backgroundColor: "blue",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showMaterialTable ? "Close Material Table" : "Open Material Table"}
        </button>
      </div>

      {showMaterialTable && (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 5px #ccc",
          }}
        >
          <h3 style={{ fontSize: "16px", paddingBottom: "2px" }}>
            Available Material Table
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "10px",
            }}
          >
            <thead>
              <tr style={stylling.tableHeader}>
                <th>Name</th>
                <th>Unit Price</th>
                <th>UOM</th>
                <th>Material Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableMaterials.map((material) => (
                <tr key={material.materialCode} style={stylling.tableRow}>
                  <td>{material.materialName}</td>
                  <td>{material.unitPrice}</td>
                  <td>{material.majorUOM}</td>
                  <td>{material.materialCode}</td>
                  <td>
                    <button
                      onClick={() => {
                        addMaterialToTable(material);
                        handleAddButtonClick(material.materialCode);
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: clickedMaterials[material.materialCode]
                          ? "white"
                          : "green",
                        color: clickedMaterials[material.materialCode]
                          ? "green"
                          : "white",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      disabled={selectedMaterials.some(
                        (m) => m.materialCode === material.materialCode
                      )}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 0px 5px #ccc",
        }}
      >
        <h3 style={{ fontSize: "16px", paddingBottom: "2px" }}>
          Selected Material Table
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={stylling.tableHeader}>
              <th>Name</th>
              <th>Unit Price</th>
              <th>UOM</th>
              <th>Material Code</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedMaterials.map((material) => (
              <tr key={material.materialCode} style={stylling.tableRow}>
                <td style={{ textAlign: "left" }}>{material.materialName}</td>
                <td>{material.unitPrice}</td>
                <td>{material.majorUOM}</td>
                <td>{material.materialCode}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={quantities[material.materialCode] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        material.materialCode,
                        Number(e.target.value)
                      )
                    }
                    style={{
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      width: "60px",
                    }}
                  />
                </td>
                <td>
                  Rs.{" "}
                  {material.unitPrice *
                    (quantities[material.materialCode] || 0)}
                  .00
                </td>
                <td>
                  <button
                    onClick={() =>
                      removeMaterialFromTable(material.materialCode)
                    }
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            marginTop: "1rem",
            marginBottom: "15px",
          }}
        >
          Total Material Cost: Rs. {calculateTotalMaterialCost()}
        </h3>
      </div>
    </div>
  );
};

MaterialTable.propTypes = {
  applicationNo: PropTypes.string.isRequired,
  deptId: PropTypes.string.isRequired,
  connectionType: PropTypes.string.isRequired,
  wiringType: PropTypes.string.isRequired,
  phase: PropTypes.string.isRequired,
  onCostChange: PropTypes.func.isRequired,
};

export default MaterialTable;
