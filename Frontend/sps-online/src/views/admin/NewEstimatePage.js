// import React, { useState, useEffect, useRef } from "react";
import React, { useState, useEffect, useRef } from "react";
import NewEstimateNew from "../../components/NewEstimate/NewEstimateNew";
import Sketch1 from "../../components/NewEstimate/sketch1";
import Sketch2 from "../../components/NewEstimate/sketch2";
import Sketch3 from "../../components/NewEstimate/sketch3";
import Sketch4 from "../../components/NewEstimate/sketch4";
import Header from "components/Headers/Header.js";

const NewEstimatePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(Array(5).fill(false));
  const [formData, setFormData] = useState({});
  const topRef = useRef(null);

  const tabs = [
    {
      name: "Application Connection Details",
      content: (
        <NewEstimateNew
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      name: "New Standard Estimation",
      content: <Sketch1 formData={formData} setFormData={setFormData} />,
    },
    {
      name: "Material Cost",
      content: <Sketch2 formData={formData} setFormData={setFormData} />,
    },
    {
      name: "Labor Cost",
      content: <Sketch3 formData={formData} setFormData={setFormData} />,
    },
    {
      name: "Rebate Items",
      content: <Sketch4 formData={formData} setFormData={setFormData} />,
    },
  ];

  const handleNext = () => {
    const newCompletedTabs = [...completedTabs];
    newCompletedTabs[activeTab] = true;
    setCompletedTabs(newCompletedTabs);
    if (activeTab < tabs.length - 1) setActiveTab(activeTab + 1);
    scrollToTop();
  };

  const handlePrev = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
    scrollToTop();
  };

  const handleSave = () => {
    console.log("Saving form data:", formData);
    alert("Service estimate details saved successfully!");
  };

  const scrollToTop = () => {
    if (topRef.current)
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  return (
    <div className="app-container">
      <div ref={topRef} />
      <Header />
      <div className="main-content">
        <div className="form-container">
          <div className="flex flex-col min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-6xl mx-auto px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
                {/* Stepper */}
                <div className="flex justify-between items-center mb-4 mt-4 relative w-full">
                  {tabs.map((tab, index) => (
                    <div
                      key={index}
                      className="relative flex-1 flex flex-col items-center"
                    >
                      <div
                        className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${
                          index === activeTab
                            ? "bg-red-400 text-white border-yellow-600"
                            : completedTabs[index]
                            ? "bg-green-500 text-white border-green-600"
                            : "border-gray-400 bg-white text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center">
                        {tab.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Show title except for Application Connection Details, Sketch1, Sketch2, Sketch3 */} 
                <div className="ml-0 p-0 bg-blueGray-100">
                  {![
                    "Application Connection Details",
                    "Sketch1",
                    "Sketch2",
                    "Sketch3",
                  ].includes(tabs[activeTab].name) && (
                    <h6 className="py-0 text-xl text-center font-bold text-blueGray-700">
                      {/* {tabs[activeTab].name} */}
                    </h6>
                  )}

                  <div className="p-2 rounded w-full max-w-5xl">
                    {tabs[activeTab].content}
                  </div>
                </div>

               <div className="flex justify-between items-center mb-1">
                  <div className="form-row-button">
                    {activeTab > 0 && (
                      <button
                        onClick={handlePrev}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Previous
                      </button>
                    )}

                    {/* 🔹 New Button - only visible in Sketch4 */}
                    {tabs[activeTab].name === "Rebate Items" && (
                      <button
                        className="bg-green-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150 ml-2"
                      >
                        Download Estimate
                      </button>
                    )}
                    {activeTab < tabs.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEstimatePage;



// import React from "react";
// import NewEstimate from "../../components/NewEstimate/NewEstimate";
// // import Header from "components/Headers/Header.js";

// const NewEstimatePage = () => {
//   return (
//     <div className="app-container">
//       {/* <Header /> */}
//       <NewEstimate />
//     </div>
//   );
// };

// export default NewEstimatePage;
