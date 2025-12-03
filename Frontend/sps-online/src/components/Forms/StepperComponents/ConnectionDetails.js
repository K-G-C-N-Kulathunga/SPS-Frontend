import React, { useEffect, useState } from "react";
import { api } from '../../../api';

const ConnectionDetails = ({ formData, setFormData, customerData, accountNumbers, setAccountNumbers }) => {
  const idNo = customerData?.idNo;

  // --- NEW: inline error messages per input ---
  const [errors, setErrors] = useState(["", "", "", ""]);

  useEffect(() => {
    if (idNo) {
      api
        .get(`/accounts/${idNo}`)
        .then((res) => {
          let list = res.data.map((item) => item.accountNo);

          // Pad to 4 elements
          while (list.length < 4) list.push("");

          // sanitize to digits and cap at 10
          list = list.map((v) => (v ?? "").toString().replace(/\D/g, "").slice(0, 10));
          setAccountNumbers(list);
          setErrors(["", "", "", ""]);
        })
        .catch((err) => {
          console.error("Failed to load account numbers", err);
        });
    }
  }, [idNo, setAccountNumbers]);

  // keep errors array length in sync (defensive)
  useEffect(() => {
    if (Array.isArray(accountNumbers) && accountNumbers.length !== errors.length) {
      setErrors(new Array(accountNumbers.length).fill(""));
    }
  }, [accountNumbers, errors.length]);

  // --- UPDATED: change handler with validation (digits only, max 10) ---
  const handleChange = (index, raw) => {
    const digits = (raw ?? "").replace(/\D/g, "");
    const capped = digits.slice(0, 10);

    const updatedNumbers = [...accountNumbers];
    updatedNumbers[index] = capped;

    const updatedErrors = [...errors];
    if (digits.length > 10) {
      updatedErrors[index] = "Maximum 10 digits allowed.";
    } else {
      // live typing: no error unless user leaves incomplete on blur
      updatedErrors[index] = "";
    }

    setAccountNumbers(updatedNumbers);
    setErrors(updatedErrors);
  };

  // Optional: require exactly 10 digits when the user leaves the field
  const handleBlur = (index) => {
    const val = (accountNumbers[index] || "").trim();
    const updatedErrors = [...errors];
    if (val !== "" && val.length !== 10) {
      updatedErrors[index] = "Account number must be 10 digits.";
    } else {
      // clear if valid or empty
      updatedErrors[index] = "";
    }
    setErrors(updatedErrors);
  };

  const isDisabled = (index) => {
    if (index === 0) return false;
    return accountNumbers[index - 1].trim() === ""; // keep your existing gating logic
  };

  useEffect(() => {
    if (!formData.tariffCatCode) {
      setFormData((prev) => ({
        ...prev,
        tariffCatCode: "DP",
        tariffCode: "11",
        customerCategory: prev.customerCategory || "PRIV",
        weldingPlant: prev.weldingPlant || 0,
        metalCrusher: prev.metalCrusher || 0,
        sawMills: prev.sawMills || 0,
      }));
    }
  }, [formData.tariffCatCode, setFormData]);

  return (
    <div className="form-row ">
      <div className="mt-4 mb-4 flex gap-4"></div>

      {/* Phase */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Phase:</label>
          <div className="radio-group-phase">
            <div className="radio-option">
              <input
                type="radio"
                id="1ph"
                name="phase"
                value="1"
                className="radio-input"
                checked={formData.phase === 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phase: parseInt(e.target.value, 10),
                    connectionType: "30", // reset connection type to 30A for 1ph
                  })
                }
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
                checked={formData.phase === 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phase: parseInt(e.target.value, 10),
                  })
                }
              />
              <label htmlFor="3ph" className="radio-label">3ph</label>
            </div>
          </div>
        </div>

        {/* Connection Type */}
        <div className="form-group">
          <label className="form-label required">Connection Type:</label>
          <div className="radio-group-connection">
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
                disabled={formData.phase !== 3}
                checked={formData.connectionType === "60"}
                onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
              />
              <label htmlFor="60" className="radio-label">60A</label>
            </div>
          </div>
        </div>
      </div>

      {/* Intended purpose of usage of electricity */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Intended purpose of usage of electricity:</label>
          <select
            id="usageElectricity"
            name="usageElectricity"
            className="form-input-half-electricity"
            value={formData.usageElectricity || ""}
            onChange={(e) => setFormData({ ...formData, usageElectricity: e.target.value })}
          >
            <option value="" disabled>Select Type</option>
            <option value="RESI">Residential</option>
            <option value="HOTEL">Hotel</option>
            <option value="SHOP">Shop</option>
            <option value="OFFI">Office</option>
            <option value="RELI">Religious</option>
            <option value="SMILL">Saw Mill/Stone Quarry</option>
            <option value="RMILL">Rice Mill/Chilli Mill</option>
            <option value="WELD">Welding workshop</option>
            <option value="PUMP">Pumping Station</option>
            <option value="INDU">Industrial</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">Requesting time of usage tarif?</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="requestingTime-yes"
                name="requestingTime"
                value="yes"
                className="radio-group-tariff"
                checked={formData.requestingTime === "yes"}
                onChange={(e) => setFormData({ ...formData, requestingTime: e.target.value })}
              />
              <label htmlFor="requestingTime-yes" className="radio-label">Yes</label>
            </div>

            <div className="radio-option">
              <input
                type="radio"
                id="requestingTime-no"
                name="requestingTime"
                value="no"
                className="radio-input"
                checked={formData.requestingTime === "no"}
                onChange={(e) => setFormData({ ...formData, requestingTime: e.target.value })}
              />
              <label htmlFor="requestingTime-no" className="radio-label">No</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Customer Category:</label>
          <select
            id="customerCategory"
            name="customerCategory"
            className="form-input-customer-category"
          >
            <option value="" disabled>Select Type</option>
            <option value="RESI">Private</option>
            <option value="HOTEL">Public</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">Customer Type:</label>
          <select
            id="customerType"
            name="customerType"
            className="form-input-customer-type"
          >
            <option value="" disabled>Select Type</option>
            <option value="RESI">Domestic</option>
            <option value="HOTEL">Public</option>
          </select>
        </div>
      </div>

      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required">Tariff Category Code:</label>
          <select
            id="customerCategory"
            name="customerCategory"
            className="form-input-customer-category"
          >
            <option value="" disabled>Select Type</option>
            <option value="RESI">DP</option>
            <option value="HOTEL">SK</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">Tariff Code:</label>
          <select
            id="customerType"
            name="customerType"
            className="form-input-customer-type"
          >
            <option value="" disabled>Select Type</option>
            <option value="RESI">11</option>
            <option value="HOTEL">12</option>
          </select>
        </div>
      </div>

      {/* previous acc no. */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label" htmlFor="pre-acc">Previous connection account number(if available):</label>
          <input
            type="text"
            id="pre-acc"
            name="preAccountNo"
            className="form-input"
            maxLength={10}
            inputMode="numeric"
            pattern="\d{10}"
            title="Enter up to 10 digits"
            value={formData.preAccountNo || ""}
            onChange={(e) => setFormData({ ...formData, preAccountNo: e.target.value })}
          />
        </div>

        {/* boundary wall */}
        <div className="form-group">
          <label className="form-label required">
            Will the electricity meter for the new service <br /> connection be installed at the boundary wall?
          </label>
          <div className="radio-group">
            <div className="radio-option ml-0.7">
              <input
                type="radio"
                id="boundaryWall-yes"
                name="boundaryWall"
                value="yes"
                className="radio-input"
                checked={formData.boundaryWall === "yes"}
                onChange={(e) => setFormData({ ...formData, boundaryWall: e.target.value })}
              />
              <label htmlFor="boundaryWall-yes" className="radio-la bel">Yes</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="boundaryWall-no"
                name="boundaryWall"
                value="no"
                className="radio-input"
                checked={formData.boundaryWall === "no"}
                onChange={(e) => setFormData({ ...formData, boundaryWall: e.target.value })}
              />
              <label htmlFor="boundaryWall-no" className="radio-label">No</label>
            </div>
          </div>
        </div>
      </div>

      {/* Account numbers */}
      <div className="form-box-inner">
        <div className="form-row">
          <label className="form-label ">
            Account numbers of other premises under the <br />
            same applicant's name:
          </label>

          <div className="space-y-4">
            <div className="flex space-x-4">
              {accountNumbers.map((number, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={number}
                    disabled={isDisabled(index)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onBlur={() => handleBlur(index)}
                    // UX hints (don’t rely on HTML5 validation alone)
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d{10}"
                    title="Enter up to 10 digits"
                  />
                  {/* tiny inline error */}
                  {errors[index] ? (
                    <span style={{ color: "#cc0000", fontSize: 12, marginTop: 4 }}>
                      {errors[index]}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ConnectionDetails };
