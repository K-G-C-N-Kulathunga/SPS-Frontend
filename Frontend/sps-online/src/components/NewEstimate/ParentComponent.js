// ParentComponent.js
import React, { useState } from "react";
import ApplicationConnectionDetails from "./NewEstimateNew";
import Sketch1 from "./Sketch1";

const ParentComponent = () => {
  const [step, setStep] = useState(1); // 1 = details, 2 = sketch
  const [costItems, setCostItems] = useState([]);

  const handleFetchComplete = (items) => {
    setCostItems(items);
  };

  const handleNext = () => {
    if (step === 1 && costItems.length > 0) {
      setStep(2);
    }
  };

  return (
    <div>
      {step === 1 && (
        <>
          <ApplicationConnectionDetails onFetchComplete={handleFetchComplete} />
          {/* Existing Next button somewhere in the UI */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button onClick={handleNext} disabled={costItems.length === 0}>
              Next →
            </button>
          </div>
        </>
      )}
      {step === 2 && <Sketch1 costItems={costItems} />}
    </div>
  );
};

export default ParentComponent;