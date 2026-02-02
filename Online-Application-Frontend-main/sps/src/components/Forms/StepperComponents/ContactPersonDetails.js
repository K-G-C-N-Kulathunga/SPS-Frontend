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

    const updatedManualData = {
      ...manualData,
      [field]: value,
    };

    const updatedFormData = {
      ...formData,
      [field]: value,
    };

    setManualData(updatedManualData);
    setFormData(updatedFormData);
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
            value={manualData.contactIdNo}
            onChange={(e) => handleManualChange("contactIdNo", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
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
            value={manualData.contactName}
            onChange={(e) => handleManualChange("contactName", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
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
            value={manualData.contactAddress}
            onChange={(e) => handleManualChange("contactAddress", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
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
            value={manualData.contactEmail}
            onChange={(e) => handleManualChange("contactEmail", e.target.value)}
            disabled={isSelected}
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
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
            style={isSelected ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
        </div>
      </div>
    </div>
  );
};

export { ContactPersonDetails };