import React, { useState, useEffect } from "react";

const ContactPersonDetails = ({
  formData,
  setFormData,
  handleChange,
  customerData,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Initialize manualData with formData values
  const [manualData, setManualData] = useState({
    contactIdNo: "",
    contactName: "",
    contactAddress: "",
    contactTelephone: "",
    contactMobile: "",
    contactEmail: "",
  });

  // Initialize manualData when component mounts or formData changes
  useEffect(() => {
    setManualData({
      contactIdNo: formData.contactIdNo || "",
      contactName: formData.contactName || "",
      contactAddress: formData.contactAddress || "",
      contactTelephone: formData.contactTelephone || "",
      contactMobile: formData.contactMobile || "",
      contactEmail: formData.contactEmail || "",
    });
  }, []); // Run only once on mount

  // Update formData when manualData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...manualData
    }));
  }, [manualData, setFormData]);

  const handleselect = () => {
    const newState = !isSelected;
    
    if (newState) {
      const fullAddress = [
        customerData?.streetAddress || "",
        customerData?.suburb || "",
        customerData?.city || "",
        customerData?.postalCode || "",
      ]
        .filter(Boolean)
        .join(", ");

      const newManualData = {
        contactIdNo: customerData?.idNo || "",
        contactName: customerData?.fullName || "",
        contactAddress: fullAddress,
        contactTelephone: customerData?.telephoneNo || "",
        contactMobile: customerData?.mobileNo || "",
        contactEmail: customerData?.email || "",
      };

      setManualData(newManualData);
    } else {
      const clearedData = {
        contactIdNo: "",
        contactName: "",
        contactAddress: "",
        contactTelephone: "",
        contactMobile: "",
        contactEmail: "",
      };

      setManualData(clearedData);
    }

    setIsSelected(newState);
  };

  // Handle manual input changes
  const handleManualChange = (field, value) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
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
            onChange={(e) =>
              handleManualChange("contactIdNo", e.target.value)
            }
            disabled={isSelected}
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
            onChange={(e) =>
              handleManualChange("contactName", e.target.value)
            }
            disabled={isSelected}
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
            onChange={(e) =>
              handleManualChange("contactAddress", e.target.value)
            }
            disabled={isSelected}
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
            onChange={(e) =>
              handleManualChange("contactEmail", e.target.value)
            }
            disabled={isSelected}
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
            onChange={(e) =>
              handleManualChange("contactTelephone", e.target.value)
            }
            disabled={isSelected}
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
            onChange={(e) =>
              handleManualChange("contactMobile", e.target.value)
            }
            disabled={isSelected}
          />
        </div>
      </div>
    </div>
  );
};

export { ContactPersonDetails };