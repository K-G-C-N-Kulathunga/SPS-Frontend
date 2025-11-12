// import React, { useEffect, useState, useMemo } from "react";
// import PropTypes from "prop-types";

// const LabourTable = ({
//   deptId,
//   applicationNo,
//   onCostChange,
//   quantities,
//   onQuantityChange,
// }) => {
//   const [labours, setLabours] = useState([]);
//   const [selectedLabours, setSelectedLabours] = useState([]);
//   const [showLabourTable, setShowLabourTable] = useState(false);
//   const [localQuantities, setLocalQuantities] = useState({});
//   const [addedLabours, setAddedLabours] = useState(new Set()); // Track added labours

//   useEffect(() => {
//     fetch(`http://localhost:8082/api/labours?deptId=${deptId}`)
//       .then((response) => response.json())
//       .then((data) => setLabours(data))
//       .catch((error) => console.error("Error fetching labours:", error));
//   }, [deptId]);

//   const addLabourToTable = (labour) => {
//     setSelectedLabours((prev) =>
//       prev.some((l) => l.labCode === labour.labCode) ? prev : [...prev, labour]
//     );
//     setAddedLabours((prev) => new Set(prev).add(labour.labCode)); // Add to the set of added labours
//   };

//   const removeLabourFromTable = (labCode) => {
//     setSelectedLabours((prev) =>
//       prev.filter((labour) => labour.labCode !== labCode)
//     );
//     setLocalQuantities((prev) => {
//       const updatedQuantities = { ...prev };
//       delete updatedQuantities[labCode];
//       return updatedQuantities;
//     });
//     setAddedLabours((prev) => {
//       const updatedAddedLabours = new Set(prev);
//       updatedAddedLabours.delete(labCode); // Remove from the set of added labours
//       return updatedAddedLabours;
//     });
//   };

//   const handleQuantityChange = (labCode, value) => {
//     setLocalQuantities((prev) => ({ ...prev, [labCode]: value }));
//     onQuantityChange(labCode, value); // Keep parent component updated
//   };

//   const calculateLabourCost = (unitPrice, quantity) => unitPrice * quantity;

//   const totalLabourCost = useMemo(() => {
//     return selectedLabours.reduce((total, labour) => {
//       return (
//         total +
//         calculateLabourCost(
//           labour.unitPrice,
//           localQuantities[labour.labCode] || 0
//         )
//       );
//     }, 0);
//   }, [selectedLabours, localQuantities]);

//   useEffect(() => {
//     onCostChange(totalLabourCost);
//   }, [totalLabourCost, onCostChange]);

//   return (
//     <div style={{ marginTop: "1.5rem" }}>
//       <button
//         onClick={() => setShowLabourTable(!showLabourTable)}
//         style={{
//           padding: "0.5rem 1rem",
//           backgroundColor: "#2563EB",
//           color: "white",
//           borderRadius: "0.375rem",
//           cursor: "pointer",
//           border: "none",
//         }}
//       >
//         {showLabourTable ? "Close Labour Table" : "Open Labour Table"}
//       </button>

//       {showLabourTable && (
//         <div
//           style={{
//             backgroundColor: "white",
//             borderRadius: "0.5rem",
//             boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//             padding: "1rem",
//             marginBottom: "1rem",
//           }}
//         >
//           <h3
//             style={{
//               fontSize: "1.125rem",
//               fontWeight: "600",
//               marginBottom: "0.5rem",
//             }}
//           >
//             Labour Table
//           </h3>
//           <table
//             style={{
//               width: "100%",
//               border: "1px solid #E5E7EB",
//               borderCollapse: "collapse",
//             }}
//           >
//             <thead>
//               <tr>
//                 <th>Labour Code</th>
//                 <th>Name</th>
//                 <th>Unit Price</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {labours.map((labour) => (
//                 <tr key={labour.labCode}>
//                   <td>{labour.labCode}</td>
//                   <td>{labour.name}</td>
//                   <td>{labour.unitPrice}</td>
//                   <td>
//                     <button
//                       onClick={() => addLabourToTable(labour)}
//                       style={{
//                         backgroundColor:
//                           addedLabours.has(labour.labCode) ? "white" : "#059669",
//                         color: addedLabours.has(labour.labCode) ? "green" : "white",
//                         borderRadius: "0.375rem",
//                         cursor: "pointer",
//                         padding: "4px",
//                         border: "none",
//                       }}
//                     >
//                       {addedLabours.has(labour.labCode) ? "Added" : "Add"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <h3
//         style={{ fontSize: "1.125rem", fontWeight: "600", marginTop: "1rem" }}
//       >
//         Selected Labours
//       </h3>
//       <table
//         style={{
//           width: "100%",
//           border: "1px solid #E5E7EB",
//           borderCollapse: "collapse",
//           marginTop: "0.5rem",
//         }}
//       >
//         <thead>
//           <tr>
//             <th>Labour Code</th>
//             <th>Labour Name</th>
//             <th>Unit Price</th>
//             <th>Labour Hours</th>
//             <th>Total Cost</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {selectedLabours.map((labour) => (
//             <tr key={labour.labCode}>
//               <td>{labour.labCode}</td>
//               <td>{labour.name}</td>
//               <td>{labour.unitPrice}</td>
//               <td>
//                 <input
//                   type="number"
//                   value={localQuantities[labour.labCode] || ""}
//                   onChange={(e) =>
//                     handleQuantityChange(labour.labCode, Number(e.target.value))
//                   }
//                 />
//               </td>
//               <td>
//                 {calculateLabourCost(
//                   labour.unitPrice,
//                   localQuantities[labour.labCode] || 0
//                 )}
//               </td>
//               <td>
//                 <button
//                   onClick={() => removeLabourFromTable(labour.labCode)}
//                   style={{
//                     backgroundColor: "#DC2626",
//                     color: "white",
//                     borderRadius: "0.375rem",
//                     cursor: "pointer",
//                     padding: "4px",
//                   }}
//                 >
//                   Remove
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <h3 style={{ fontSize: "1rem", fontWeight: "600", marginTop: "1rem" }}>
//         Total Labour Cost: Rs.{totalLabourCost}.00
//       </h3>
//     </div>
//   );
// };

// LabourTable.propTypes = {
//   applicationNo: PropTypes.string.isRequired,
//   deptId: PropTypes.string.isRequired,
//   quantities: PropTypes.object.isRequired,
//   onQuantityChange: PropTypes.func.isRequired,
//   onCostChange: PropTypes.func.isRequired,
// };

// export default LabourTable;
import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";

const LabourTable = ({
  deptId,
  applicationNo,
  onCostChange,
  quantities,
  onQuantityChange,
}) => {
  const [labours, setLabours] = useState([]);
  const [selectedLabours, setSelectedLabours] = useState([]);
  const [showLabourTable, setShowLabourTable] = useState(false);
  const [localQuantities, setLocalQuantities] = useState({});
  const [addedLabours, setAddedLabours] = useState(new Set());

  // Styles Object
  const styles = {
    container: {
      backgroundColor: "#f9fafb",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    },
    toggleButton: {
      padding: "10px 15px",
      backgroundColor: "#3B82F6",
      color: "white",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      hover: {
        backgroundColor: "#2563EB",
        transform: "scale(1.05)",
      },
    },
    table: {
      width: "100%",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
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
      fontSize:'11PX',
      textAlign:'center'
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
    input: {
      width: "80px",
      padding: "6px",
      border: "1px solid #D1D5DB",
      borderRadius: "6px",
      textAlign: "center",
    },
    totalCost: {
      backgroundColor: "#E6F2FF",
      padding: "15px",
      borderRadius: "10px",
      fontWeight: "700",
      color: "#1E40AF",
    },
  };

  useEffect(() => {
    fetch(`http://localhost:8082/api/labours?deptId=${deptId}`)
      .then((response) => response.json())
      .then((data) => setLabours(data))
      .catch((error) => console.error("Error fetching labours:", error));
  }, [deptId]);

  const addLabourToTable = (labour) => {
    setSelectedLabours((prev) =>
      prev.some((l) => l.labCode === labour.labCode) ? prev : [...prev, labour]
    );
    setAddedLabours((prev) => new Set(prev).add(labour.labCode)); // Add to the set of added labours
  };

  const removeLabourFromTable = (labCode) => {
    setSelectedLabours((prev) =>
      prev.filter((labour) => labour.labCode !== labCode)
    );
    setLocalQuantities((prev) => {
      const updatedQuantities = { ...prev };
      delete updatedQuantities[labCode];
      return updatedQuantities;
    });
    setAddedLabours((prev) => {
      const updatedAddedLabours = new Set(prev);
      updatedAddedLabours.delete(labCode); // Remove from the set of added labours
      return updatedAddedLabours;
    });
  };

  const handleQuantityChange = (labCode, value) => {
    setLocalQuantities((prev) => ({ ...prev, [labCode]: value }));
    onQuantityChange(labCode, value); 
  };

  const calculateLabourCost = (unitPrice, quantity) => unitPrice * quantity;

  const totalLabourCost = useMemo(() => {
    return selectedLabours.reduce((total, labour) => {
      return (
        total +
        calculateLabourCost(
          labour.unitPrice,
          localQuantities[labour.labCode] || 0
        )
      );
    }, 0);
  }, [selectedLabours, localQuantities]);

  useEffect(() => {
    onCostChange(totalLabourCost);
  }, [totalLabourCost, onCostChange]);

  return (
    <div style={styles.container}>
      <button
        onClick={() => setShowLabourTable(!showLabourTable)}
        style={{
          ...styles.toggleButton,
          ":hover": styles.toggleButton.hover,
        }}
      >
        {showLabourTable ? "Close Labour Table" : "Open Labour Table"}
      </button>

      {showLabourTable && (
        <div style={{ marginTop: "15px" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ whiteSpace: "nowrap", padding: "12px" }}>
                  Labour Code
                </th>
                <th >Name</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labours.map((labour) => (
                <tr
                  key={labour.labCode}
                  style={{
                    ...styles.tableRow,
                    ":hover": styles.tableRow.hover,
                  }}
                >
                  <td>{labour.labCode}</td>
                  <td style={{textAlign:'left'}}>{labour.name}</td>
                  <td>{labour.unitPrice}</td>
                  <td>
                    <button
                      onClick={() => addLabourToTable(labour)}
                      style={{
                        ...styles.addButton,
                        backgroundColor: addedLabours.has(labour.labCode)
                          ? "#10B981"
                          : "#059669",
                        color: "white",
                      }}
                    >
                      {addedLabours.has(labour.labCode) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ marginTop: "20px", fontSize: "1.2rem", fontWeight: "700" }}>
        Selected Labours
      </h3>

      <table style={{ ...styles.table, marginTop: "10px" }}>
        <thead>
          <tr style={styles.tableHeader}>
            <th>Labour Code</th>
            <th>Labour Name</th>
            <th>Unit Price</th>
            <th>Labour Hours</th>
            <th>Total Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {selectedLabours.map((labour) => (
            <tr
              key={labour.labCode}
              style={{
                ...styles.tableRow,
                ":hover": styles.tableRow.hover,
              }}
            >
              <td>{labour.labCode}</td>
              <td>{labour.name}</td>
              <td>{labour.unitPrice}</td>
              <td>
                <input
                  type="number"
                  value={localQuantities[labour.labCode] || ""}
                  onChange={(e) =>
                    handleQuantityChange(labour.labCode, Number(e.target.value))
                  }
                  style={styles.input}
                />
              </td>
              <td>
                {calculateLabourCost(
                  labour.unitPrice,
                  localQuantities[labour.labCode] || 0
                )}
              </td>
              <td>
                <button
                  onClick={() => removeLabourFromTable(labour.labCode)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.totalCost}>
        Total Labour Cost: Rs.{totalLabourCost.toFixed(2)}
      </div>
    </div>
  );
};

LabourTable.propTypes = {
  applicationNo: PropTypes.string.isRequired,
  deptId: PropTypes.string.isRequired,
  quantities: PropTypes.object.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  onCostChange: PropTypes.func.isRequired,
};

export default LabourTable;
