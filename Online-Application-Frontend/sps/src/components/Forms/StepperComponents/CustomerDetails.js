import React, { useEffect, useState } from "react";
import { api } from "../../../apiService";

// eslint-disable-next-line react-hooks/rules-of-hooks
const CustomerDetails = ({ formData, setFormData, handleChange }) => {
  const [customerExists, setCustomerExists] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Function for automatically selecting the radio of idtype
  const handleSelectIdType = (e) => {
    const selectValue = e.target.value;

    setFormData((prev) => ({
      ...prev,
      personalCorporate: selectValue,
      // ✅ Force BRN only for Corporate
      idType: selectValue === "COR" ? "BRN" : prev.idType,
    }));
  };


  // ✅ Enforce correct idType even if state is changed somehow
  useEffect(() => {
    if (formData.personalCorporate === "PER" && formData.idType !== "NIC") {
      setFormData((p) => ({ ...p, idType: "NIC" }));
    }
    if (formData.personalCorporate === "COR" && formData.idType !== "BRN") {
      setFormData((p) => ({ ...p, idType: "BRN" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.personalCorporate]);

  const handlefind = async () => {
    try {
      const response = await api.get(`/applicants/findById/${formData.idNo}`);
      if (response.data) {
        setCustomerExists(true);
        setFormData((prev) => ({
          ...prev,
          idNo: prev.idNo || response.data.idNo, // Ensure ID is always retained
          idType: prev.idType || response.data.idType,
          personalCorporate:
            response.data.personalCorporate || prev.personalCorporate,
          fullName: response.data.fullName || prev.fullName,
          firstName: response.data.firstName || prev.firstName,
          lastName: response.data.lastName || prev.lastName,
          streetAddress: response.data.streetAddress || prev.streetAddress,
          suburb: response.data.suburb || prev.suburb,
          city: response.data.city || prev.city,
          postalCode: response.data.postalCode || prev.postalCode,
          telephoneNo: response.data.telephoneNo || prev.telephoneNo,
          mobileNo: response.data.mobileNo || prev.mobileNo,
          email: response.data.email || prev.email,
        }));
      } else {
        setCustomerExists(false);
      }
    } catch (error) {
      console.error("error fetching data", error);
      setCustomerExists(false);
    }
  };

  // ID validation (supports either 12 digits OR 9 digits followed by uppercase V)
  const handleIdValidation = (e) => {
    let value = e.target.value;

    // Auto convert any lowercase 'v' at the end to uppercase 'V'
    if (/v$/.test(value)) {
      value = value.slice(0, -1) + "V";
    }

    // Disallow any characters other than digits and an optional trailing 'V'
    if (!/^\d{0,12}$/.test(value) && !/^\d{0,9}V?$/.test(value)) {
      return; // reject invalid keystroke
    }

    // Enforce maximum lengths (12 digits OR 9 digits + V)
    if (value.length > 12) return;
    if (/^\d{9}V/.test(value) && value.length > 10) return; // safety guard

    // Prevent placing 'V' before 9 digits (e.g., '123V')
    if (value.includes("V") && !/^\d{9}V$/.test(value)) {
      // Allow intermediate state while user deletes, but don't update state to malformed pattern with V in wrong place
      if (!/^\d{0,9}$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      idNo: value,
    }));

    const finalPattern = /^(?:\d{12}|\d{9}V)$/; // only uppercase V allowed

    if (value === "") {
      setError("");
      return;
    }

    if (finalPattern.test(value)) {
      setError("");
    } else if (/^\d{9}$/.test(value)) {
      setError(
        "After 9 digits add uppercase V (e.g. 123456789V) or use 12-digit format."
      );
    } else {
      setError(
        "ID must be either 9 digits followed by uppercase V (e.g. 123456789V) or 12 digits (e.g. 200012345678)."
      );
    }
  };

  // Email validation handler
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      email: value,
    }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="dashboard-card">
      <div className="form-box">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Personal/Corporate</label>
            <select
              id="type"
              name="personalCorporate"
              className="form-select-halfhalf"
              onChange={handleSelectIdType}
              value={formData.personalCorporate}
              disabled={customerExists}
            >
              <option value="" disabled hidden>
                Select Type
              </option>
              <option value="PER">Personal</option>
              <option value="COR">Corporate</option>
            </select>
          </div>
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <div className="form-group-inline">
              <div className="form-row">
                <label className="form-label required" htmlFor="IdType">
                  ID Type:
                </label>

                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      id="NIC"
                      name="idType"
                      value="NIC"
                      className="radio-input"
                      checked={formData.idType === "NIC"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          idType: e.target.value,
                        }))
                      }
                      // ✅ Corporate users cannot select NIC
                      disabled={customerExists || formData.personalCorporate === "COR"}
                    />
                    <span>NIC</span>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      id="BRN"
                      name="idType"
                      value="BRN"
                      className="radio-input"
                      checked={formData.idType === "BRN"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          idType: e.target.value,
                        }))
                      }
                      // ✅ Personal users cannot select BRN
                      disabled={customerExists}
                    />
                    <span>Business Reg No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="form-group-inline">
              <label className="form-idlabel required" htmlFor="id">
                ID:
              </label>
              <input
                type="text"
                id="idNo"
                name="idNo"
                className="form-input"
                required
                value={formData.idNo}
                onChange={handleIdValidation}
              />
              {error && (
                <div style={{ color: "red", fontSize: "12px" }}>{error}</div>
              )}
            </div>

            <div className="form-group-inline">
              <button
                type="button"
                value="find"
                onClick={handlefind}
                className="find-button"
              >
                Find
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required" htmlFor="fullName">
            Full Name:
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-input"
            onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
            required
            value={formData.fullName}
            onChange={handleChange}
            readOnly={customerExists}
          />
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <label className="form-label required" htmlFor="firstName">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input"
              onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
              required
              value={formData.firstName}
              onChange={handleChange}
              readOnly={customerExists}
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="lastName">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-input"
              onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
              required
              value={formData.lastName}
              onChange={handleChange}
              readOnly={customerExists}
            />
          </div>
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <label className="form-label required" htmlFor="streetAddress">
              Home/Company No:
            </label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              className="form-input"
              value={formData.streetAddress}
              onChange={handleChange}
              readOnly={customerExists}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="suburb">
              Street Name:
            </label>
            <input
              type="text"
              id="suburb"
              name="suburb"
              className="form-input"
              value={formData.suburb}
              onChange={handleChange}
              readOnly={customerExists}
              required
            />
          </div>
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <label className="form-label required" htmlFor="city">
              City:
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className="form-input"
              value={formData.city}
              onChange={handleChange}
              readOnly={customerExists}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postalCode">
              Postal Code:
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              className="form-input"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <label className="form-label" htmlFor="telephoneNo">
              Telephone No:
            </label>
            <input
              type="tel"
              id="telephoneNo"
              name="telephoneNo"
              className="form-input"
              placeholder="0xxxxxxxxx"
              pattern="\d{10}"
              maxLength={10}
              title="Phone number must be exactly 10 digits"
              value={formData.telephoneNo}
              onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="mobileNo">
              Mobile No:
            </label>
            <input
              type="tel"
              id="mobileNo"
              name="mobileNo"
              className="form-input"
              placeholder="0xxxxxxxxx"
              pattern="\d{10}"
              maxLength={10}
              title="Mobile number must be exactly 10 digits"
              required
              value={formData.mobileNo}
              disabled={
                localStorage.getItem("passingTempId") !== null &&
                localStorage.getItem("passingTempId") !== "null"
              }
              onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-box-inner">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input-email"
              value={formData.email}
              onChange={handleEmailChange}
            />
            {emailError && (
              <div style={{ color: "red", fontSize: "12px" }}>{emailError}</div>
            )}
          </div>

          <div className="form-row">
            <label
              className="form-label required"
              htmlFor="language"
              style={{ minWidth: "120px" }}
            >
              Preferred Language for communication:
            </label>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="SI"
                  className="radio-input"
                  checked={formData.preferredLanguage === "SI"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredLanguage: e.target.value,
                    }))
                  }
                />
                <span style={{ fontWeight: "normal" }}>Sinhala</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="TA"
                  className="radio-input"
                  checked={formData.preferredLanguage === "TA"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredLanguage: e.target.value,
                    }))
                  }
                />
                <span style={{ fontWeight: "normal" }}>Tamil</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="EN"
                  className="radio-input"
                  checked={formData.preferredLanguage === "EN"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredLanguage: e.target.value,
                    }))
                  }
                />
                <span>English</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CustomerDetails };
