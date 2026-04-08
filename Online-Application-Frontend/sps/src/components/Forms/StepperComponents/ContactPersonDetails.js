import React, { useState } from "react";

const ContactPersonDetails = ({
  formData,
  setFormData,
  handleChange,
  customerData,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Manual data (no availableTime)
  const [manualData, setManualData] = useState({
    contactIdNo: formData.contactIdNo || "",
    contactName: formData.contactName || "",
    contactAddress: formData.contactAddress || "",
    contactTelephone: formData.contactTelephone || "",
    contactMobile: formData.contactMobile || "",
    contactEmail: formData.contactEmail || "",
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    contactIdNo: "",
    contactName: "",
    contactAddress: "",
    contactEmail: "",
  });

  // Validate ID (NIC format: 12 digits OR 9 digits + V)
  const validateIdNo = (value) => {
    if (!value.trim()) {
      return "ID is required";
    }
    const idPattern = /^(?:\d{12}|\d{9}V)$/;
    if (!idPattern.test(value)) {
      return "ID must be 12 digits or 9 digits followed by V (e.g., 123456789V)";
    }
    return "";
  };

  // Validate name (only letters and spaces)
  const validateName = (value) => {
    if (!value.trim()) {
      return "Name is required";
    }
    const namePattern = /^[A-Za-z\s]{2,100}$/;
    if (!namePattern.test(value)) {
      return "Name must be 2-100 characters. Only letters allowed.";
    }
    return "";
  };

  // Validate contact address
  const validateAddress = (value) => {
    if (!value.trim()) {
      return "Contact address is required";
    }
    const addressPattern = /^[A-Za-z0-9\s]{2,200}$/;
    if (!addressPattern.test(value)) {
      return "Address must be 2-200 characters. Letters, numbers and spaces allowed.";
    }
    return "";
  };

  // Validate email
  const validateEmail = (value) => {
    if (!value.trim()) {
      return ""; // Email is optional
    }
    const emailPattern = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(value)) {
      return "Invalid email address";
    }
    return "";
  };

  const handleselect = () => {
    setIsSelected((prevState) => {
      const newState = !prevState;

      if (newState) {
        const fullAddress = [
          customerData.streetAddress,
          customerData.suburb,
          customerData.city,
          customerData.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        const updatedFormData = {
          ...formData,
          contactIdNo: customerData.idNo,
          contactName: customerData.fullName,
          contactAddress: fullAddress,
          contactTelephone: customerData.telephoneNo,
          contactMobile: customerData.mobileNo,
          contactEmail: customerData.email,
        };

        const updatedManualData = {
          contactIdNo: customerData.idNo,
          contactName: customerData.fullName,
          contactAddress: fullAddress,
          contactTelephone: customerData.telephoneNo,
          contactMobile: customerData.mobileNo,
          contactEmail: customerData.email,
        };

        setFormData(updatedFormData);
        setManualData(updatedManualData);
      } else {
        const updatedFormData = {
          ...formData,
          contactIdNo: "",
          contactName: "",
          contactAddress: "",
          contactTelephone: "",
          contactMobile: "",
          contactEmail: "",
        };

        const updatedManualData = {
          contactIdNo: "",
          contactName: "",
          contactAddress: "",
          contactTelephone: "",
          contactMobile: "",
          contactEmail: "",
        };

        setFormData(updatedFormData);
        setManualData(updatedManualData);
      }

      return newState;
    });
  };

  // Update manual data and form data when user types (only when not selected)
  const handleManualChange = (field, value) => {
    if (isSelected) return; // Prevent editing when checkbox is selected

    // Filter numbers only for telephone and mobile fields
    let filteredValue = value;
    if (field === "contactTelephone" || field === "contactMobile") {
      filteredValue = value.replace(/\D/g, "").slice(0, 10); // Only digits, max 10
    }

    // Filter ID field (only digits and V)
    if (field === "contactIdNo") {
      // Auto convert lowercase 'v' to uppercase 'V'
      if (/v$/.test(value)) {
        filteredValue = value.slice(0, -1) + "V";
      } else {
        filteredValue = value;
      }
      
      // Only allow digits and optional trailing V
      if (!/^\d{0,12}$/.test(filteredValue) && !/^\d{0,9}V?$/.test(filteredValue)) {
        return; // reject invalid input
      }
      
      // Enforce maximum lengths
      if (filteredValue.length > 12) return;
      if (/^\d{9}V/.test(filteredValue) && filteredValue.length > 10) return;
    }

    // Filter name field (only letters and spaces)
    if (field === "contactName") {
      filteredValue = value.replace(/\s{2,}/g, " "); // prevent double spaces
      if (!/^[A-Za-z\s]*$/.test(filteredValue)) return; // Only letters and spaces
    }

    // Filter address field (only letters, numbers and spaces)
    if (field === "contactAddress") {
      filteredValue = value.replace(/\s{2,}/g, " "); // prevent double spaces
      if (!/^[A-Za-z0-9\s]*$/.test(filteredValue)) return; // Only alphanumeric characters and spaces
      if (filteredValue.length > 200) return; // Max 200 characters
    }

    // Filter email field (only valid email characters)
    if (field === "contactEmail") {
      if (!/^[A-Za-z0-9@._-]*$/.test(value)) return; // Only valid email characters
      filteredValue = value;
    }

    const updatedManualData = {
      ...manualData,
      [field]: filteredValue,
    };

    const updatedFormData = {
      ...formData,
      [field]: filteredValue,
    };

    setManualData(updatedManualData);
    setFormData(updatedFormData);

    // Validate and set errors
    if (field === "contactIdNo") {
      const error = validateIdNo(filteredValue);
      setValidationErrors((prev) => ({ ...prev, contactIdNo: error }));
    }
    if (field === "contactName") {
      const error = validateName(filteredValue);
      setValidationErrors((prev) => ({ ...prev, contactName: error }));
    }
    if (field === "contactAddress") {
      const error = validateAddress(filteredValue);
      setValidationErrors((prev) => ({ ...prev, contactAddress: error }));
    }
    if (field === "contactEmail") {
      const error = validateEmail(filteredValue);
      setValidationErrors((prev) => ({ ...prev, contactEmail: error }));
    }
  };

  return (
    <div className="form-box">
      <div className="checkbox-label">
        <label style={{ fontSize: "16px" }}>
          <input
            type="checkbox"
            className="checkbox-input"
            style={{ paddingLeft: "5px" }}
            checked={isSelected}
            onChange={handleselect}
          />
          <span>Same as Customer Details</span>
          {isSelected && (
            <span style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}>
              (Fields are locked)
            </span>
          )}
        </label>
      </div>

      {/* ID and Name */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required" htmlFor="contactIdNo">
            ID:
          </label>
          <input
            type="text"
            id="contactIdNo"
            name="contactIdNo"
            className="form-input"
            placeholder="123456789V or 200012345678"
            value={manualData.contactIdNo}
            onChange={(e) => handleManualChange("contactIdNo", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {validationErrors.contactIdNo && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {validationErrors.contactIdNo}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label required" htmlFor="contactName">
            Contact Name:
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            className="form-input"
            placeholder="John Perera"
            value={manualData.contactName}
            onChange={(e) => handleManualChange("contactName", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {validationErrors.contactName && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {validationErrors.contactName}
            </div>
          )}
        </div>
      </div>

      {/* Address and Email side by side */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label required" htmlFor="contactAddress">
            Contact Address:
          </label>
          <input
            type="text"
            id="contactAddress"
            name="contactAddress"
            className="form-input"
            placeholder="No 24, Main Street, Colombo"
            value={manualData.contactAddress}
            onChange={(e) => handleManualChange("contactAddress", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {validationErrors.contactAddress && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {validationErrors.contactAddress}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="contactEmail">
            Email:
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            className="form-input"
            placeholder="example@email.com"
            value={manualData.contactEmail}
            onChange={(e) => handleManualChange("contactEmail", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {validationErrors.contactEmail && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {validationErrors.contactEmail}
            </div>
          )}
        </div>
      </div>

      {/* Telephone and Mobile */}
      <div className="form-box-inner">
        <div className="form-group">
          <label className="form-label" htmlFor="contactTelephone">
            Telephone No:
          </label>
          <input
            type="tel"
            id="contactTelephone"
            name="contactTelephone"
            className="form-input"
            value={manualData.contactTelephone}
            onChange={(e) => handleManualChange("contactTelephone", e.target.value)}
            disabled={isSelected}
            maxLength={10}
            inputMode="numeric"
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
        </div>
        <div className="form-group">
          <label className="form-label required" htmlFor="contactMobile">
            Mobile No:
          </label>
          <input
            type="tel"
            id="contactMobile"
            name="contactMobile"
            className="form-input"
            value={manualData.contactMobile}
            onChange={(e) => handleManualChange("contactMobile", e.target.value)}
            disabled={isSelected}
            maxLength={10}
            inputMode="numeric"
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
        </div>
      </div>
    </div>
  );
};

export { ContactPersonDetails };