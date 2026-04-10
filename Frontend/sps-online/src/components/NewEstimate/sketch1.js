import React, { useState, useEffect, useMemo } from "react";

// ── Static constants (outside component — no re-creation on each render) ────

const BASE_AMOUNTS = {
  FC: 1000.0, VC: 500.0, ST: 1500.0, MC: 300.0,
  LC: 400.0,  OC: 200.0, TC: 100.0,  CC: 250.0,
  SYA_COST: 75.0, MV_NETWORK: 600.0,
};

const LEFT_LABELS = {
  categoryCode:               "Category Code",
  totalLineLength:            "Total Line Length (m)",
  conductorType:              "Conductor Type",
  conductorLength:            "Conductor Length (m)",
  serviceLength:              "Service Length (m)",
  lengthInsidePremises:       "Length Inside Premises (m)",
  conversion1P3P:             "1P-3P Conv. Len. Inside Premises (m)",
  conversion2P3P:             "2P-3P Conv. Len. Inside Premises (m)",
  secondCircuitLength:        "Second Circuit Length (m)",
  secondCircuitConductorType: "Second Circuit Conductor Type",
  wiringType:                 "Wiring Type",
  loopService:                "Is Loop Service?",
  cableType:                  "Cable Type",
  spans:                      "Spans",
  noPoles:                    "No. Poles",
  noStays:                    "No. Stays",
  noStruts:                   "No. Struts",
  sinNo:                      "SIN Number",
  distanceToSp:               "Distance to Service Place (Km)",
};

const INITIAL_LEFT = {
  categoryCode: "", totalLineLength: "", conductorType: "",
  conductorLength: "", serviceLength: "", lengthInsidePremises: "",
  conversion1P3P: "", conversion2P3P: "", secondCircuitLength: "",
  secondCircuitConductorType: "", wiringType: "", loopService: "",
  cableType: "", spans: "", noPoles: "", noStays: "",
  noStruts: "", sinNo: "", distanceToSp: "",
};

const STYLES = {
  container: {
    background: "#fff", padding: "15px", borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "12px",
    maxWidth: "1200px", margin: "15px auto",
  },
  grid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" },
  field: { display: "flex", alignItems: "center", marginBottom: "8px" },
  label: { width: "200px", fontWeight: 500, fontSize: "12px", flexShrink: 0 },
  input: {
    flex: 1, padding: "4px 8px", fontSize: "12px", borderRadius: "4px",
    border: "1px solid #d1d5db", background: "#fff", color: "#374151",
  },
};

// ── Calculation engine ───────────────────────────────────────────────────────
// Extend this function to add/change any formula driven by left-field inputs.

function computeCosts(left, costItems) {
  const n = (key) => parseFloat(left[key]) || 0;

  const values = {
    FC:         BASE_AMOUNTS.FC,
    VC:         BASE_AMOUNTS.VC  + n("totalLineLength")  * 0.50,
    ST:         BASE_AMOUNTS.ST  + n("noPoles") * 50     + n("noStays") * 30,
    MC:         BASE_AMOUNTS.MC  + n("conductorLength")  * 2.50,
    LC:         BASE_AMOUNTS.LC  + (n("conductorLength") + n("serviceLength") + n("lengthInsidePremises")) * 1.20,
    OC:         BASE_AMOUNTS.OC  + n("spans")            * 15,
    TC:         BASE_AMOUNTS.TC  + n("distanceToSp")     * 25,   // ← reacts to Distance to SP
    CC:         BASE_AMOUNTS.CC,
    SYA_COST:   BASE_AMOUNTS.SYA_COST,
    MV_NETWORK: BASE_AMOUNTS.MV_NETWORK + n("totalLineLength") * 0.80,
  };

  // EST_TOTAL = sum of all active parentKey === 11 items
  values.EST_TOTAL = costItems
    .filter(i => i.parentKey === 11 && i.costItemCode !== "EST_TOTAL")
    .reduce((sum, i) => sum + (values[i.costItemCode] ?? i.amount ?? 0), 0);

  return values;
}

// ── Component ────────────────────────────────────────────────────────────────

const Sketch1 = ({ formData }) => {
  const costItems = formData.costItems || [];

  const [leftData, setLeftData] = useState(INITIAL_LEFT);

  // Populate left fields from API data
  useEffect(() => {
    if (!formData.estimationData) return;
    const d = formData.estimationData;
    setLeftData({
      categoryCode:               "SMC",
      totalLineLength:            d.totalLength         ?? "",
      conductorType:              d.bareconType         ?? "",
      conductorLength:            d.bareconLength       ?? "",
      serviceLength:              d.serviceLength       ?? "",
      lengthInsidePremises:       d.insideLength        ?? "",
      conversion1P3P:             d.conversionLength    ?? "",
      conversion2P3P:             d.conversionLength2p  ?? "",
      secondCircuitLength:        d.secondCircuitLength ?? "",
      secondCircuitConductorType: d.serviceWireType     ?? "",
      wiringType:                 d.wiringType          ?? "",
      loopService:                d.loopCable           ?? "",
      cableType:                  d.cableType           ?? "",
      spans:                      d.noOfSpans           ?? "",
      noPoles:                    d.poleno              ?? "",
      noStays:                    "",
      noStruts:                   "",
      sinNo:                      d.sin                 ?? "",
      distanceToSp:               d.distanceToSp        ?? "",
    });
  }, [formData.estimationData]);

  // Derived — recomputes automatically whenever leftData or costItems change
  const costValues = useMemo(
    () => computeCosts(leftData, costItems),
    [leftData, costItems]
  );

  const handleLeftChange = (e) => {
    const { name, value } = e.target;
    setLeftData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={STYLES.container}>
      <div style={STYLES.grid}>

        {/* LEFT – Estimation inputs */}
        <div>
          {Object.entries(LEFT_LABELS).map(([key, label]) => (
            <div style={STYLES.field} key={key}>
              <label style={STYLES.label}>{label}:</label>
              <input
                type="text"
                name={key}
                value={leftData[key]}
                onChange={handleLeftChange}
                style={STYLES.input}
              />
            </div>
          ))}
        </div>

        {/* RIGHT – Cost items (read-only, driven by left inputs) */}
        <div>
          {costItems.length === 0 ? (
            <div style={{ color: "#999", textAlign: "center", padding: "20px" }}>
              No cost items loaded.
            </div>
          ) : (
            costItems
              .filter(item => item.isActive === 1)
              .map(item => (
                <div style={STYLES.field} key={item.costItemCode}>
                  <label style={STYLES.label}>{item.description}:</label>
                  <input
                    type="text"
                    value={costValues[item.costItemCode]?.toFixed(5) ?? ""}
                    style={STYLES.input}
                    readOnly
                  />
                </div>
              ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Sketch1;