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

        setFormData({
          ...formData,
          contactIdNo: customerData.idNo,
          contactName: customerData.fullName,
          contactAddress: fullAddress,
          contactTelephone: customerData.telephoneNo,
          contactMobile: customerData.mobileNo,
          contactEmail: customerData.email,
        });

        setManualData({
          contactIdNo: customerData.idNo,
          contactName: customerData.fullName,
          contactAddress: fullAddress,
          contactTelephone: customerData.telephoneNo,
          contactMobile: customerData.mobileNo,
          contactEmail: customerData.email,
        });
      } else {
        setFormData({
          ...formData,
          contactIdNo: "",
          contactName: "",
          contactAddress: "",
          contactTelephone: "",
          contactMobile: "",
          contactEmail: "",
        });

        setManualData({
          contactIdNo: "",
          contactName: "",
          contactAddress: "",
          contactTelephone: "",
          contactMobile: "",
          contactEmail: "",
        });
      }

      return newState;
    });
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
              setManualData({ ...manualData, contactIdNo: e.target.value })
            }
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
              setManualData({ ...manualData, contactName: e.target.value })
            }
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
              setManualData({ ...manualData, contactAddress: e.target.value })
            }
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
              setManualData({ ...manualData, contactEmail: e.target.value })
            }
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
              setManualData({
                ...manualData,
                contactTelephone: e.target.value,
              })
            }
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
              setManualData({ ...manualData, contactMobile: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export { ContactPersonDetails };
