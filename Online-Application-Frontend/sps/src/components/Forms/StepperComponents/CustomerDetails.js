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
    let value = e.target.value;
    
    // Only allow valid email characters: letters, numbers, @, ., _, -
    if (!/^[A-Za-z0-9@._-]*$/.test(value)) {
      return; // reject invalid characters
    }
    
    setFormData((prev) => ({
      ...prev,
      email: value,
    }));
    
    const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (value && !emailRegex.test(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };
// Name validation state 
  const [nameErrors, setNameErrors] = useState({
  fullName: "",
  firstName: "",
  lastName: "",
});

// Address validation state
const [addressErrors, setAddressErrors] = useState({
  streetAddress: "",
  suburb: "",
  city: "",
  postalCode: "",
});

const validateNameField = (fieldName, value) => {
  let errorMessage = "";

  const personalFullNameRegex =
    /^[A-Za-z]+(?:\.?[A-Za-z]+)*(?: [A-Za-z]+(?:\.?[A-Za-z]+)*)*$/;

  const corporateNameRegex =
    /^[A-Za-z0-9&().,\- ]{2,100}$/;

  const singleNameRegex = /^[A-Za-z]{2,30}$/;

  if (!value.trim()) {
    errorMessage = "This field is required";
  } else {
    if (formData.personalCorporate === "COR") {
      if (!corporateNameRegex.test(value)) {
        errorMessage =
          "Corporate name can include letters, numbers & symbols (& . , -)";
      }
    } else {
      if (fieldName === "fullName" && !personalFullNameRegex.test(value)) {
        errorMessage =
          "Only letters, spaces and initials allowed (e.g., A.B. PERERA)";
      }

      if (
        (fieldName === "firstName" || fieldName === "lastName") &&
        !singleNameRegex.test(value)
      ) {
        errorMessage = "Only letters allowed (min 2 characters)";
      }
    }
  }

  setNameErrors((prev) => ({
    ...prev,
    [fieldName]: errorMessage,
  }));

  return errorMessage === "";
};
const capitalizeWords = (value) => {
  return value
    .replace(/\s{2,}/g, " ");   // prevent double spaces
};

const handleNameChange = (e) => {
  const { name, value } = e.target;

  // Clean up value (prevent double spaces)
  let formattedValue = capitalizeWords(value);

  // Character filtering
  if (formData.personalCorporate === "COR") {
    if (!/^[A-Za-z0-9&().,\- ]*$/.test(formattedValue)) return;
  } else {
    if (name === "fullName" && !/^[A-Za-z.\s]*$/.test(formattedValue)) return;

    if (
      (name === "firstName" || name === "lastName") &&
      !/^[A-Za-z]*$/.test(formattedValue)
    )
      return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: formattedValue,
  }));

  validateNameField(name, formattedValue);
};

const validateAddressField = (fieldName, value) => {
  let errorMessage = "";

  const streetAddressRegex = /^[A-Za-z0-9\s]{2,100}$/; // letters, numbers and spaces for company/house no
  const addressRegex = /^[A-Za-z\s]{2,100}$/; // only letters and spaces for suburb/city
  const postalRegex = /^[0-9]{5}$/; // exactly 5 digits

  if (!value.trim()) {
    errorMessage = "This field is required";
  } else {
    if (fieldName === "streetAddress") {
      if (!streetAddressRegex.test(value)) {
        errorMessage =
          "Must be 2-100 characters. Letters and numbers allowed (e.g., No 24).";
      }
    }

    if (fieldName === "suburb" || fieldName === "city") {
      if (!addressRegex.test(value)) {
        errorMessage =
          "Must be 2-100 characters. Only letters allowed.";
      }
    }

    if (fieldName === "postalCode") {
      if (!postalRegex.test(value)) {
        errorMessage = "Postal code must be exactly 5 digits";
      }
    }
  }

  setAddressErrors((prev) => ({
    ...prev,
    [fieldName]: errorMessage,
  }));

  return errorMessage === "";
};
const handleAddressChange = (e) => {
  const { name, value } = e.target;

  let formattedValue = value.replace(/\s{2,}/g, " "); // prevent double spaces

  // Only allow numbers for postal code
  if (name === "postalCode" && !/^[0-9]{5}$/.test(formattedValue)) return;

  // Allow letters, numbers and spaces for streetAddress (company/house no)
  if (name === "streetAddress" && !/^[A-Za-z0-9\s]*$/.test(formattedValue)) return;

  // Only allow letters and spaces for suburb and city
  if ((name === "suburb" || name === "city") && 
      !/^[A-Za-z\s]*$/.test(formattedValue)) return;

  setFormData((prev) => ({
    ...prev,
    [name]: formattedValue,
  }));

  validateAddressField(name, formattedValue);
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
                placeholder="123456789V or 200012345678"
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
            placeholder="A.B. Perera"
            onChange={handleNameChange}
            required
            value={formData.fullName}
            readOnly={customerExists}
          />
          {nameErrors.fullName && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {nameErrors.fullName}
  </div>
)}
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
              placeholder="John"
              required
              value={formData.firstName}
              onChange={handleNameChange}
              readOnly={customerExists}
            />
            {nameErrors.firstName && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {nameErrors.firstName}
  </div>
)}
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
              placeholder="Perera"
              required
              value={formData.lastName}
              onChange={handleNameChange}
              readOnly={customerExists}
            />
            {nameErrors.lastName && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {nameErrors.lastName}
  </div>
)}
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
              placeholder="No 24"
              value={formData.streetAddress}
              onChange={handleAddressChange}
              onBlur={(e) => validateAddressField("streetAddress", e.target.value)}
              readOnly={customerExists}
              required
            />
            {addressErrors.streetAddress && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {addressErrors.streetAddress}
              </div>
            )}
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
              placeholder="Main Street"
              value={formData.suburb}
              onChange={handleAddressChange}
              onBlur={(e) => validateAddressField("suburb", e.target.value)}
              readOnly={customerExists}
              required
            />
             {addressErrors.suburb && (
    <div style={{ color: "red", fontSize: "12px" }}>
      {addressErrors.suburb}
    </div>
  )}
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
              placeholder="Colombo"
              value={formData.city}
              onChange={handleAddressChange}
              onBlur={(e) => validateAddressField("city", e.target.value)}
              readOnly={customerExists}
              required
            />
             {addressErrors.city && (
    <div style={{ color: "red", fontSize: "12px" }}>
      {addressErrors.city}
    </div>
  )}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="postalCode">
              Postal Code:
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              className="form-input"
              placeholder="00100"
              value={formData.postalCode}
              onChange={handleAddressChange}
              onBlur={(e) => validateAddressField("postalCode", e.target.value)}
              required
            />
            {addressErrors.postalCode && (
    <div style={{ color: "red", fontSize: "12px" }}>
      {addressErrors.postalCode}
    </div>
  )}
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
              placeholder="example@email.com"
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
