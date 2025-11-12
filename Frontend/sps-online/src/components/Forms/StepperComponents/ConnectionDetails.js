import React,{useEffect} from "react";

const ConnectionDetails = ({ formData, setFormData, handleSubmit }) => {
  const handleDisturbanceChange = (selectedType) => {
    setFormData({
      ...formData,
      weldingPlant: selectedType === "weldingPlant" ? 1 : 0,
      metalCrusher: selectedType === "metalCrusher" ? 1 : 0,
      sawMills: selectedType === "sawMills" ? 1 : 0,
    });
  };

  const tariffMapping = {
    DP: "11",
    RP: "51",
    GP: "31",
    IP: "21",
    AG: "71",
  };

  useEffect(() => {
    if (!formData.tariffCatCode) {
      setFormData(prev => ({
        ...prev,
        tariffCatCode: "DP",
        tariffCode:"11",
        tariffCode: tariffMapping["DP"],
        customerCategory: prev.customerCategory || "PRIV",
        weldingPlant: prev.weldingPlant || 0,
        metalCrusher: prev.metalCrusher || 0,
        sawMills: prev.sawMills || 0
      }));
    }
  }, [formData.tariffCatCode, setFormData]);

  return (
    <div className="form-row">
      <div className="form-group">
        <label className="form-label required"><b>Loads Creating Disturbance:</b></label>
        <div className="radio-group">
          <div className="radio-option">
            <input 
              type="radio" 
              id="none" 
              name="disturbance" 
              className="radio-input"
              checked={formData.weldingPlant === 0 && formData.metalCrusher === 0 && formData.sawMills === 0}
              onChange={() => handleDisturbanceChange("none")}
            />
            <label htmlFor="none" className="radio-label">None</label>
          </div>
          
          <div className="radio-option">
            <input 
              type="radio" 
              id="weldingPlant" 
              name="disturbance" 
              className="radio-input"
              checked={formData.weldingPlant === 1}
              onChange={() => handleDisturbanceChange("weldingPlant")}
            />
            <label htmlFor="weldingPlant" className="radio-label">Welding Plant</label>
          </div>
          
          <div className="radio-option">
            <input 
              type="radio" 
              id="metalCrusher" 
              name="disturbance" 
              className="radio-input"
              checked={formData.metalCrusher === 1}
              onChange={() => handleDisturbanceChange("metalCrusher")}
            />
            <label htmlFor="metalCrusher" className="radio-label">Metal Crusher</label>
          </div>
          
          <div className="radio-option">
            <input 
              type="radio" 
              id="sawMills" 
              name="disturbance" 
              className="radio-input"
              checked={formData.sawMills === 1}
              onChange={() => handleDisturbanceChange("sawMills")}
            />
            <label htmlFor="sawMills" className="radio-label">Saw Mill</label>
          </div>
        </div>
      </div>
      
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required"><b>Phase:</b></label>
          <div className="radio-group">
            <div className="radio-option">
              <input 
                type="radio" 
                id="1ph" 
                name="phase" 
                value="1" 
                className="radio-input"
                checked={formData.phase === "1"}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              />
              <label htmlFor="1ph" className="radio-label">1ph</label>
            </div>
            <div className="radio-option">
              <input 
                type="radio" 
                id="3ph" 
                name="phase" 
                value="3" 
                className="radio-input"
                checked={formData.phase === "3"}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              />
              <label htmlFor="3ph" className="radio-label">3ph</label>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label required"><b>Connection Type:</b></label>
          <div className="radio-group">
            <div className="radio-option">
              <input 
                type="radio" 
                id="30" 
                name="connectionType" 
                value="30" 
                className="radio-input"
                checked={formData.connectionType === "30"}
                onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
              />
              <label htmlFor="30" className="radio-label">30A</label>
            </div>
            <div className="radio-option">
              <input 
                type="radio" 
                id="60" 
                name="connectionType" 
                value="60" 
                className="radio-input"
                checked={formData.connectionType === "60"}
                onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
              />
              <label htmlFor="60" className="radio-label">60A</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of your component remains the same */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Customer Category</label>
          <select 
            id="customerCategory" 
            name="customerCategory" 
            className="form-select"
            value={formData.customerCategory}
            onChange={(e) => setFormData({ ...formData, customerCategory: e.target.value })}
          >
            <option value="PRIV">Private</option>
            <option value="GOVE">Government</option>
            <option value="SEGO">Semi Government</option>
            <option value="RELI">Religious</option>
          </select>
        </div>
    
        <div className="form-group">
          <label className="form-label required">Customer Type</label>
          <select 
            id="customerType"
            name="customerType"
            className="form-select"
            value={formData.customerType || "DP"}
            onChange={(e) => {
              const selectedCatCode = e.target.value;
              setFormData({ 
                ...formData,
                customerType: selectedCatCode,
              });
            }}
          >
            <option value="DP">Domestic purpose</option>
            <option value="RP">Religious purpose</option>
            <option value="GP">General purpose</option>
            <option value="IP">Industrial purpose</option>
            <option value="AG">Agricultural purpose</option>
          </select>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Tariff Category Code</label>
          <select
              id="tariffCategoryCode"
              name="tariffCategoryCode"
              className="form-select"
              value={formData.tariffCategoryCode}
              onChange={(e) => setFormData({ ...formData, tariffCategoryCode: e.target.value })}
          >
            <option value="PRIV">DP</option>
            <option value="GOVE">Government</option>
            <option value="SEGO">Semi Government</option>
            <option value="RELI">Religious</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">Tariff Code</label>
          <select
              id="tariffCode"
              name="tariffCode"
              className="form-select"
              value={formData.tariffCode || "DP"}
              onChange={(e) => {
                const selectedCatCode = e.target.value;
                setFormData({
                  ...formData,
                  tariffCode: selectedCatCode,
                  //tariffCode: tariffMapping[selectedCatCode]
                });
              }}
          >
            <option value="DP">11</option>
            <option value="RP">Religious purpose</option>
            <option value="GP">General purpose</option>
            <option value="IP">Industrial purpose</option>
            <option value="AG">Agricultural purpose</option>
          </select>
        </div>
      </div>


    </div>
  );
};

export { ConnectionDetails };