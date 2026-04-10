import { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "./NewCustomerForm.css";
import axios from "axios";

// Step Components
import { CustomerDetails } from "../Forms/StepperComponents/CustomerDetails";
import { ContactPersonDetails } from "../Forms/StepperComponents/ContactPersonDetails.js";
import { ServiceLocationDetails } from "../Forms/StepperComponents/ServiceLocationDetails";
import { ConnectionDetails } from "../Forms/StepperComponents/ConnectionDetails";
import DocumentUpload from "./StepperComponents/DocumentUpload";
import { api } from '../../api';

const ENABLE_OTP = false;

// Optional: centralize SharedService base (or keep your fixed IP if required)
const OTP_BASE =
  process.env.REACT_APP_SHARED_SERVICE_BASE ||
  "http://10.128.1.227:8080/SharedService";

// ========= Helpers for tempId handling =========

// Safely read from localStorage ("null" -> null)
const safeGet = (key) => {
  const v = localStorage.getItem(key);
  return v && v !== "null" ? v : null;
};

// Recreate legacy id: "0" + (Number(tempId) - 1)
// Handles strings with/without leading zeros.
const buildLegacyTempId = (raw) => {
  if (!raw) return null;
  const num = Number(String(raw).replace(/^0+/, "")); // strip leading zeros for parse
  if (Number.isNaN(num)) return null;
  return "0" + (num - 1);
};

// Single source of truth for which id to use in PUTs / Uploads
const resolveTempIdForPut = (location) => {
  const fromUrl = new URLSearchParams(location.search).get("tempId");
  if (fromUrl) return fromUrl;

  const passing = safeGet("passingTempId");
  if (passing) return passing;

  const stored = safeGet("tempId");
  const legacy = buildLegacyTempId(stored);
  if (legacy) {
    localStorage.setItem("passingTempId", legacy);
    return legacy;
  }
  return null;
};

// ==============================================

const maskPhone = (phone) => {
  const digits = (phone || "").toString().replace(/\D/g, "");
  if (!digits) return "";
  const last4 = digits.slice(-4);
  return digits.length > 4 ? `${"*".repeat(digits.length - 4)}${last4}` : last4;
};

const NewCustomerStepper = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(Array(5).fill(false));
  const [customerExists, setCustomerExists] = useState(false);
  const history = useHistory();
  const [accountNumbers, setAccountNumbers] = useState([""]);
  const location = useLocation();

  // =========================
  // OTP state (modal overlay)
  // =========================
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRef = useRef(null);

  // --- NEW STATE FOR INLINE MESSAGE ---
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSuccessUpdateMessage, setShowSuccessUpdateMessage] = useState(false);
  const [successRefNo, setSuccessRefNo] = useState("");

  // CHANGED: Just hide message, DO NOT reload page
  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
  };

  // 🟢 ADD THIS: Auto-hide the success message after 5 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 7500); 

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleSuccessUpdateClose = () => {
    setShowSuccessUpdateMessage(false);
  };

  useEffect(() => {
    if (showSuccessUpdateMessage) {
      const timer = setTimeout(() => {
        setShowSuccessUpdateMessage(false);
      }, 7500); 

      return () => clearTimeout(timer);
    }
  }, [showSuccessUpdateMessage]);

  useEffect(() => {
    if (showOtpModal && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtpModal]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [activeTab]);


  useEffect(() => {
    if (!showOtpModal || otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [showOtpModal, otpTimer]);

  // const sendOtp = async (mobileNo) => {
  //   if (!mobileNo || String(mobileNo).trim().length < 9) {
  //     alert("Please enter a valid mobile number before sending OTP.");
  //     return false;
  //   }
  //   try {
  //     setIsSendingOtp(true);
  //     setOtp("");
  //     setOtpError("");
  //     await axios.post(`${OTP_BASE}/api/otp/sendOtp`, { mobileNo });
  //     setShowOtpModal(true);
  //     setOtpTimer(60);
  //     return true;
  //   } catch (error) {
  //     console.error("sendOtp failed:", error);
  //     alert("Failed to send OTP. Please try again.");
  //     return false;
  //   } finally {
  //     setIsSendingOtp(false);
  //   }
  // };

    const sendOtp = async (mobileNo) => {
    if (!mobileNo || String(mobileNo).trim().length < 9) {
      alert("Please enter a valid mobile number before sending OTP.");
      return false;
    }
    try {
      setIsSendingOtp(true);
      setOtp("");
      setOtpError("");

      await axios.post(`${OTP_BASE}/api/otp/sendOtp`, {
        mobileNo,
        systemName: "New Service Connection",   // <- controls the text in the SMS
        systemCode: "CEB Info",
      });

      setShowOtpModal(true);
      setOtpTimer(60);
      return true;
    } catch (error) {
      console.error("sendOtp failed:", error);
      alert("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };


  const validateOtp = async (mobileNo, code) => {
    if (!code || code.length < 4) {
      setOtpError("Please enter the OTP.");
      return false;
    }
    try {
      setIsVerifyingOtp(true);
      setOtpError("");
      const res = await axios.post(`${OTP_BASE}/api/otp/validateOtp`, {
        mobileNo,
        otp: code,
      });
      const data = res?.data;
      const ok =
        data === true ||
        data?.valid === true ||
        data?.valid === "Y" ||
        String(data?.status || "").toUpperCase() === "VERIFIED" ||
        String(data?.message || "").toLowerCase().includes("valid");
      if (!ok) {
        setOtpError("Invalid OTP. Please try again.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("validateOtp failed:", error);
      setOtpError("Invalid OTP. Please try again.");
      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // =========================
  // Form state
  // =========================
  const [customerDetails, setCustomerDetails] = useState({
    idNo: "",
    personalCorporate: "",
    idType: "",
    fullName: "",
    firstName: "",
    lastName: "",
    suburb: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    telephoneNo: "",
    mobileNo: "",
    email: "",
    preferredLanguage: "",
    appSubType: "",
    loanType: "",
    customerDescription: "",
  });

  const [contactPersonDetails, setContactPersonDetails] = useState({
    contactIdNo: "",
    contactName: "",
    contactAddress: "",
    contactTelephone: "",
    contactMobile: "",
    contactEmail: "",
    deptId: "",
  });

  const [serviceLocationDetails, setServiceLocationDetails] = useState({
    neighboursAccNo: "",
    serviceStreetAddress: "",
    serviceSuburb: "",
    serviceCity: "",
    servicePostalCode: "",
    assessmentNo: "",
    ownership: "",
    deptId: "",
    customerType: "DOME",
    longitude: "",
    latitude: "",
  });

  const [connectionDetails, setConnectionDetails] = useState({
    phase: "",
    connectionType: "",
    usageElectricity: "",
    requestingTime: "",
    boundaryWall: "",
    preAccountNo: "",
    tariffCatCode: "",
    tariffCode: "",
    customerCategory: "",
  });

  const [documentUpload, setDocumentUpload] = useState({
    idCopy: "",
    ownershipCertificate: "",
    gramaNiladhariCertificate: "",
    threephChartedEngineerCertificate: "",
  });

  // Sync deptId into contact details
  useEffect(() => {
    setContactPersonDetails((prev) => ({
      ...prev,
      deptId: serviceLocationDetails.deptId,
    }));
  }, [serviceLocationDetails.deptId]);

  // Handlers
  const handleCustomerDetailsChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };
  const handleContactPersonDetailsChange = (e) => {
    const { name, value } = e.target;
    setContactPersonDetails({ ...contactPersonDetails, [name]: value });
  };
  const handleServiceLocationDetailsChange = (e) => {
    const { name, value } = e.target;
    setServiceLocationDetails({ ...serviceLocationDetails, [name]: value });
  };
  const handleConnectionDetailsChange = (e) => {
    const { name, value } = e.target;
    setConnectionDetails({ ...connectionDetails, [name]: value });
  };
  const handleDocumentUploadChange = (e) => {
    const { name, files } = e.target;
    setDocumentUpload({ ...documentUpload, [name]: files[0] });
  };

  // Basic completion helper
  const isFormCompleted = (formData, requiredFields) => {
    if (!requiredFields || requiredFields.length === 0) return true;
    return requiredFields.every(
      (field) => formData[field] !== "" && formData[field] !== undefined
    );
  };

  // Fetch existing customer by ID (auto-search)
  const fetchCustomerById = async (idNo) => {
    try {
      const response = await api.get(`/applicants/findById/${idNo}`);//applicants/findById/${idNo}
      if (response.data) {
        setCustomerExists(true);
        setCustomerDetails((prev) => ({
          ...prev,
          ...response.data,
          mobileNo: response.data.mobileNo || "",
          email: response.data.email || "",
        }));
      } else {
        setCustomerExists(false);
      }
    } catch (error) {
      setCustomerExists(false);
      console.error("Error fetching customer:", error);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (customerDetails.idNo && String(customerDetails.idNo).length > 5) {
  //       fetchCustomerById(customerDetails.idNo);
  //     }
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [customerDetails.idNo]);

  // Progress / Completed tabs
  useEffect(() => {
    const requiredCustomerFields = [
      "personalCorporate",
      "idNo",
      "fullName",
      "mobileNo",
      "streetAddress",
      "city",
      "preferredLanguage",
      "firstName",
      "lastName",
      "suburb",
    ];
    const requiredServiceFields = ["serviceStreetAddress", "serviceCity"];
    const requiredConnectionFields = [
      "phase",
      "connectionType",
      // If you don't actually capture these two, remove them:
      // "customerCategory",
      // "tariffCatCode",
    ];
    const requiredContactFields = ["contactName", "contactMobile"];
    const requiredDocumentUploadFields = [
      "idCopy",
      "ownershipCertificate",
      "gramaNiladhariCertificate",
    ];

    setCompletedTabs([
      isFormCompleted(customerDetails, requiredCustomerFields),
      isFormCompleted(serviceLocationDetails, requiredServiceFields),
      isFormCompleted(connectionDetails, requiredConnectionFields),
      isFormCompleted(contactPersonDetails, requiredContactFields),
      isFormCompleted(documentUpload, requiredDocumentUploadFields),
    ]);
  }, [
    customerDetails,
    serviceLocationDetails,
    connectionDetails,
    contactPersonDetails,
    documentUpload,
  ]);

  // ======== API helpers for step saves ========

  // Generate server tempId and also compute/store the legacy id
  const generateTempId = async () => {
    try {
      const res = await api.get(
        `/online-applications/generate-tempId?mobile=${customerDetails.mobileNo}`,
        { responseType: "text" }
      );
      const tempId = res.data; // e.g. "77240628025040"
      localStorage.setItem("tempId", tempId);

      // Ensure legacy id is available for PUTs (matches your old server behavior)
      const legacy = buildLegacyTempId(tempId); // -> "077240628025039"
      if (legacy) localStorage.setItem("passingTempId", legacy);

      return tempId;
    } catch (e) {
      console.error("Error generating tempId:", e);
      return null;
    }
  };

  // Customer Details (POST for new draft, PUT for existing draft)
  const postCustomerDetails = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const tempIdFromUrl = params.get("tempId");
      const existingPassing = safeGet("passingTempId");
      const storedTempId = safeGet("tempId");

      // Rebuild legacy id (what your backend expects for updates)
      const legacyId = buildLegacyTempId(storedTempId);

      // Keep "passingTempId" in sync (mirrors your previous working flow)
      if (legacyId) {
        localStorage.setItem("passingTempId", legacyId);
      }

      let response;

      // NEW draft (no passing + no URL id) -> POST first
      if ((!existingPassing || existingPassing === "null") && !tempIdFromUrl) {
        const payload = {
          idNo: customerDetails.idNo,
          idType: customerDetails.idType,
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          fullName: customerDetails.fullName,
          streetAddress: customerDetails.streetAddress,
          suburb: customerDetails.suburb,
          city: customerDetails.city,
          postalCode: customerDetails.postalCode,
          email: customerDetails.email,
          telephone: customerDetails.telephoneNo,
          mobile: customerDetails.mobileNo,
          preferredLanguage: customerDetails.preferredLanguage,
          personalCorporate: customerDetails.personalCorporate,
          appSubType: customerDetails.appSubType,
          loanType: customerDetails.loanType,
          customerDescription: customerDetails.customerDescription,
        };
        response = await api.post(`/online-applications`, payload);

        // make sure we have both tempId and passingTempId set for later PUTs
        const tmp = await generateTempId();
        if (!tmp) {
          console.warn("tempId not generated; PUTs may fail until it is.");
        }
      } else {
        // UPDATE existing draft -> PUT using URL tempId OR the legacy id we just computed
        const tempIdToUse =
          tempIdFromUrl || legacyId || existingPassing || resolveTempIdForPut(location);

        if (!tempIdToUse) {
          throw new Error("No tempId available for update.");
        }

        const payload = {
          tempId: tempIdToUse,
          idNo: customerDetails.idNo,
          idType: customerDetails.idType,
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          fullName: customerDetails.fullName,
          streetAddress: customerDetails.streetAddress,
          suburb: customerDetails.suburb,
          city: customerDetails.city,
          postalCode: customerDetails.postalCode,
          email: customerDetails.email,
          telephone: customerDetails.telephoneNo,
          mobile: customerDetails.mobileNo,
          preferredLanguage: customerDetails.preferredLanguage,
          personalCorporate: customerDetails.personalCorporate,
        };

        response = await api.put(`/online-applications/${tempIdToUse}`, payload);
      }

      console.log("Backend response:", response?.data);
    } catch (error) {
      console.error("Error submitting details:", error);
      localStorage.setItem("passingTempId", "null");
      throw error;
    }
  };

  const postServiceLocationDetails = async () => {
    const tempIdToUse = resolveTempIdForPut(location);
    if (!tempIdToUse) {
      alert("Temporary ID not found. Please start the application again.");
      return;
    }

    try {
      const payload = {
        neighboursAccNo: serviceLocationDetails.neighboursAccNo,
        serviceStreetAddress: serviceLocationDetails.serviceStreetAddress,
        serviceSuburb: serviceLocationDetails.serviceSuburb,
        serviceCity: serviceLocationDetails.serviceCity,
        servicePostalCode: serviceLocationDetails.servicePostalCode,
        assessmentNo: serviceLocationDetails.assessmentNo,
        ownership: serviceLocationDetails.ownership,
        latitude: serviceLocationDetails.latitude,
        longitude: serviceLocationDetails.longitude,
        deptId: serviceLocationDetails.deptId,
      };

      const response = await api.put(`/online-applications/${tempIdToUse}`, payload);
      console.log("Updated data:", serviceLocationDetails);
      console.log("Backend response:", response?.data);
    } catch (error) {
      console.error("Error updating details:", error);
      alert(
        "Failed to update service location details. Error: " +
          (error?.message || JSON.stringify(error))
      );
      throw error;
    }
  };

  const postContactPersonDetails = async () => {
    const tempIdToUse = resolveTempIdForPut(location);
    if (!tempIdToUse) {
      alert("Temporary ID not found. Please start the application again.");
      return;
    }

    try {
      const payload = {
        contactIdNo: contactPersonDetails.contactIdNo,
        contactName: contactPersonDetails.contactName,
        contactAddress: contactPersonDetails.contactAddress,
        contactTelephone: contactPersonDetails.contactTelephone,
        contactMobile: contactPersonDetails.contactMobile,
        contactEmail: contactPersonDetails.contactEmail,
      };

      const response = await api.put(`/online-applications/${tempIdToUse}`, payload);
      console.log("Updated data:", payload);
      console.log("Backend response:", response?.data);
    } catch (error) {
      console.error("Error updating details:", error);
      alert(
        "Failed to update contact person details. Error: " +
          (error?.message || JSON.stringify(error))
      );
      throw error;
    }
  };

  const postConnectionDetails = async () => {
    const tempIdToUse = resolveTempIdForPut(location);
    if (!tempIdToUse) {
      alert("Temporary ID not found. Please start the application again.");
      return;
    }

    try {
      const payload = {
        // Backend expects Boolean for phase in OnlineApplication
        phase: connectionDetails.phase === 3 ? true : connectionDetails.phase === 1 ? false : undefined,
        connectionType: connectionDetails.connectionType,
        usageElectricity: connectionDetails.usageElectricity,
        requestingTime: connectionDetails.requestingTime,
        boundaryWall: connectionDetails.boundaryWall,
        preAccountNo: connectionDetails.preAccountNo,
        tariffCatCode: connectionDetails.tariffCatCode,
        tariffCode: connectionDetails.tariffCode,
        customerCategory: connectionDetails.customerCategory,
      };

      await api.put(`/online-applications/${tempIdToUse}`, payload);
      console.log("✔ Connection details updated:", payload);

      if (customerDetails?.idNo) {
        const cleanAccounts = accountNumbers
          .map((acc) => acc.trim())
          .filter((acc) => acc !== "");
        if (cleanAccounts.length > 0) {
          try {
            const getResponse = await api.get(`/accounts/${customerDetails.idNo}`);
            const existingAccounts = getResponse.data || [];
            if (existingAccounts.length > 0) {
              await api.put(`/accounts/${customerDetails.idNo}`, cleanAccounts);
            } else {
              await api.post(`/accounts/${customerDetails.idNo}`, cleanAccounts);
            }
          } catch (err) {
            console.error("❌ Error saving account numbers:", err);
            alert(
              "Failed to save account numbers. Error: " +
                (err?.message || JSON.stringify(err))
            );
            throw err;
          }
        }
      }
    } catch (error) {
      console.error("❌ Error updating details:", error);
      alert(
        "Failed to update connection details. Error: " +
          (error?.message || JSON.stringify(error))
      );
    }
  };

  // handleDocumentUpload removed: uploads are now part of the single multipart /application call

  // Submit: single multipart POST /application with JSON + files
  const handleSubmit = async () => {
    try {
      // 1. Prepare JSON payload (Keep your existing code here)
      const formDataDto = {
        formApplicantDto: {
          idNo: customerDetails.idNo,
          idType: customerDetails.idType,
          personalCorporate: customerDetails.personalCorporate,
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          fullName: customerDetails.fullName,
          streetAddress: customerDetails.streetAddress,
          suburb: customerDetails.suburb,
          city: customerDetails.city,
          postalCode: customerDetails.postalCode,
          telephoneNo: customerDetails.telephoneNo,
          mobileNo: customerDetails.mobileNo,
          email: customerDetails.email,
          preferredLanguage: customerDetails.preferredLanguage,
          appSubType: customerDetails.appSubType,
          loanType: customerDetails.loanType,
          customerDescription: customerDetails.customerDescription,
        },
        applicationFormRequestDto: {
          deptId: contactPersonDetails.deptId,
          contactIdNo: contactPersonDetails.contactIdNo,
          contactName: contactPersonDetails.contactName,
          contactAddress: contactPersonDetails.contactAddress,
          contactTelephone: contactPersonDetails.contactTelephone,
          contactMobile: contactPersonDetails.contactMobile,
          contactEmail: contactPersonDetails.contactEmail,
        },
        formWiringLandDetailDto: {
          neighboursAccNo: serviceLocationDetails.neighboursAccNo,
          serviceStreetAddress: serviceLocationDetails.serviceStreetAddress,
          serviceSuburb: serviceLocationDetails.serviceSuburb,
          serviceCity: serviceLocationDetails.serviceCity,
          servicePostalCode: serviceLocationDetails.servicePostalCode,
          assessmentNo: serviceLocationDetails.assessmentNo,
          ownership: serviceLocationDetails.ownership || "O",
          deptId: serviceLocationDetails.deptId,
          phase: connectionDetails.phase,
          connectionType: connectionDetails.connectionType,
          customerCategory: connectionDetails.customerCategory, 
          tariffCatCode: connectionDetails.tariffCatCode, 
          tariffCode: connectionDetails.tariffCode,
          customerType: connectionDetails.customerType || "DOME",
          longitude: serviceLocationDetails.longitude,
          latitude: serviceLocationDetails.latitude,
        },
      };

      // 2. Resolve tempId (Keep existing code)
      const tempIdToUse = resolveTempIdForPut(location);
      if (!tempIdToUse) {
        alert("Temporary ID not found. Please start the application again from step 1.");
        return;
      }

      // 3. Build multipart form (Keep existing code)
      const multipart = new FormData();
      const jsonBlob = new Blob([JSON.stringify(formDataDto)], { type: "application/json" });
      multipart.append("formData", jsonBlob);
      multipart.append("tempId", tempIdToUse);
      if (documentUpload.idCopy) multipart.append("idCopy", documentUpload.idCopy);
      if (documentUpload.ownershipCertificate) multipart.append("ownershipCertificate", documentUpload.ownershipCertificate);
      if (documentUpload.gramaNiladhariCertificate) multipart.append("gramaNiladhariCertificate", documentUpload.gramaNiladhariCertificate);
      if (documentUpload.threephChartedEngineerCertificate)
        multipart.append("threephChartedEngineerCertificate", documentUpload.threephChartedEngineerCertificate);

      // --- LOGIC CHANGE STARTS HERE ---
      
      let appResponse;

      // Check if we already have a Reference Number (Update Mode)
      if (successRefNo) {
        // === PUT REQUEST (Update) ===
        
        appResponse = await api.put(`/newapplication?refNo=${encodeURIComponent(successRefNo)}`, multipart, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        
        setShowSuccessUpdateMessage(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        console.log("Updated successfully");
        
      } else {
        // === POST REQUEST (Create) ===
        appResponse = await api.post(`/newapplication`, multipart, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Extract reference number
        const data = appResponse?.data;
        let refNo = null;
        if (data && typeof data === "object") {
          refNo = data.applicationNo || data.applicationId || data.ref || null;
        } else if (typeof data === "string") {
          refNo = data;
        }
        
        if (!refNo) {
           console.error("No ref number in /application response:", data);
           alert("We couldn't get your reference number. Please try again.");
           return;
        }

        sessionStorage.setItem("lastApplicationNo", refNo);
        sessionStorage.setItem(
          "lastCustomerName",
          customerDetails.fullName || contactPersonDetails.contactName || ""
        );

        // SHOW SUCCESS MESSAGE (Only on first creation)
        setSuccessRefNo(refNo);
        setShowSuccessMessage(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

    } catch (error) {
      alert(
        "Submission failed: " + (error?.response?.data?.error || error.message)
      );
      console.error(error);
    }
  };

  const tabs = [
    {
      name: "Customer Details",
      content: (
        <CustomerDetails
          formData={customerDetails}
          handleChange={handleCustomerDetailsChange}
          setFormData={setCustomerDetails}
          customerExists={customerExists}
        />
      ),
    },
    {
      name: "Service Location Details",
      content: (
        <ServiceLocationDetails
          formData={serviceLocationDetails}
          handleChange={handleServiceLocationDetailsChange}
          customerData={customerDetails}
        />
      ),
    },
    {
      name: "Connection Details",
      content: (
        <ConnectionDetails
          formData={connectionDetails}
          handleChange={handleConnectionDetailsChange}
          handleSubmit={handleSubmit}
          customerData={customerDetails}
          accountNumbers={accountNumbers}
          setAccountNumbers={setAccountNumbers}
        />
      ),
    },
    {
      name: "Contact Person Details",
      content: (
        <ContactPersonDetails
          formData={contactPersonDetails}
          handleChange={handleContactPersonDetailsChange}
        />
      ),
    },
    {
      name: "Upload Document",
      content: (
        <DocumentUpload
          formData={documentUpload}
          handleChange={handleDocumentUploadChange}
        />
      ),
    },
  ];

  // fetch the data by tempId (Existing app)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tempId = params.get("tempId");
    if (tempId) {
      localStorage.setItem("passingTempId", tempId);
      api
        .get(`/online-applications/${tempId}`)
        .then((res) => {
          const data = res.data;
          setCustomerDetails({
            idNo: data.idNo || "",
            personalCorporate: data.personalCorporate || "",
            idType: data.idType || "",
            fullName: data.fullName || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            suburb: data.suburb || "",
            streetAddress: data.streetAddress || "",
            city: data.city || "",
            postalCode: data.postalCode || "",
            telephoneNo: data.telephone || "",
            mobileNo: data.mobile || "",
            email: data.email || "",
            preferredLanguage: data.preferredLanguage || "",
            appSubType: data.appSubType || "",
            loanType: data.loanType || "",
            customerDescription: data.customerDescription || "",
          });
          setContactPersonDetails({
            contactIdNo: data.contactIdNo || "",
            contactName: data.contactName || "",
            contactAddress: data.contactAddress || "",
            contactTelephone: data.contactTelephone || "",
            contactMobile: data.contactMobile || "",
            contactEmail: data.contactEmail || "",
            deptId: data.deptId || "",
          });
          setServiceLocationDetails((prev) => ({
            ...prev,
            neighboursAccNo: data.neighboursAccNo || "",
            serviceStreetAddress: data.serviceStreetAddress || "",
            serviceSuburb: data.serviceSuburb || "",
            serviceCity: data.serviceCity || "",
            servicePostalCode: data.servicePostalCode || "",
            assessmentNo: data.assessmentNo || "",
            ownership: data.ownership || "",
            deptId: data.deptId || "",
            customerType: data.customerType ||"DOME",
            longitude: data.longitude || "",
            latitude: data.latitude || "",
          }));
          // Normalize types coming from backend so radios render correctly
          const normalizePhase = (rawPhase, rawConnType) => {
            // Accept numbers, strings, booleans, or Y/N
            if (rawPhase === 3 || rawPhase === "3") return 3;
            if (rawPhase === 1 || rawPhase === "1") return 1;
            if (rawPhase === true || rawPhase === "true" || rawPhase === "Y") return 3; // three-phase
            if (rawPhase === false || rawPhase === "false" || rawPhase === "N") return 1; // single-phase
            // Fallback inference: 60A implies 3ph
            const nConn = Number(rawConnType);
            if (!Number.isNaN(nConn) && nConn === 60) return 3;
            return ""; // unknown -> leave unselected
          };

          const normalizeConnType = (raw) => {
            // Ensure it's a string '30' | '60' for the radio checks
            if (raw == null || raw === "") return "";
            const n = Number(raw);
            if (!Number.isNaN(n)) return String(n);
            return String(raw);
          };

          const normPhase = normalizePhase(data.phase, data.connectionType);
          const normConnType = normalizeConnType(data.connectionType);

          setConnectionDetails({
            phase: normPhase,
            connectionType: normConnType,
            usageElectricity: data.usageElectricity || "",
            requestingTime: data.requestingTime || "",
            boundaryWall: data.boundaryWall || "",
            preAccountNo: data.preAccountNo || "",
            tariffCatCode: data.tariffCatCode || "DP",
            tariffCode: data.tariffCode || "11",
            customerCategory: data.customerCategory || "PRIV",
          });
        })
        .catch(() => alert("Application not found"));

      api
        .get(`/online-applications/${tempId}/service-location-details`)
        .then((res) => {
          setServiceLocationDetails((prev) => ({
            ...prev,
            area: res.data.area || "",
            nearestCSC: res.data.nearestCSC || "",
          }));
        });
    }
  }, [location.search]);

  // =========================
  // Stepper navigation
  // =========================
  const handleNext = async () => {
  try {
    const params = new URLSearchParams(location.search);
    const tempIdFromUrl = params.get("tempId"); // presence => Existing Application

    if (activeTab === 0) {
      const missing = [];
      if (!customerDetails.personalCorporate) missing.push("Select Type");
      if (!customerDetails.idNo) missing.push("ID No");
      if (!customerDetails.fullName) missing.push("Full Name");
      if (!customerDetails.firstName) missing.push("First Name");
      if (!customerDetails.lastName) missing.push("Last Name");
      if (!customerDetails.suburb) missing.push("Street Name");
      if (!customerDetails.mobileNo) missing.push("Mobile No");
      if (!customerDetails.streetAddress) missing.push("Street Address");
      if (!customerDetails.city) missing.push("City");
      if (!customerDetails.preferredLanguage) missing.push("Preferred Language");
      if (!customerDetails.appSubType) missing.push("Application Sub Type"); // ADDED
      if (!customerDetails.loanType) missing.push("Loan Type");

      if (missing.length > 0) {
        alert(`Please fill all required customer details.\nMissing: ${missing.join(", ")}`);
        return;
      }

      await postCustomerDetails();

      if (!tempIdFromUrl) {
        const tmp = await generateTempId();
        if (!tmp) {
          alert("Could not generate a temporary ID. Try again.");
          return;
        }
      }

      // ✅ OTP REMOVED — FLOW CONTINUES DIRECTLY
    }

    else if (activeTab === 1) {
      const missing = [];
      if (!serviceLocationDetails.serviceStreetAddress) missing.push("Service Street Address");
      if (!serviceLocationDetails.serviceSuburb) missing.push("Service Suburb");
      if (!serviceLocationDetails.serviceCity) missing.push("Service City");
      if (!serviceLocationDetails.ownership) missing.push("Ownership");

      if (missing.length > 0) {
        alert(`Please fill all required service location details.\nMissing: ${missing.join(", ")}`);
        return;
      }

      await postServiceLocationDetails();
    }

    else if (activeTab === 2) {
      const missing = [];
      if (!connectionDetails.phase) missing.push("Phase");
      if (!connectionDetails.connectionType) missing.push("Connection Type");
      if (!connectionDetails.usageElectricity) missing.push("Usage of Electricity");
      if (!connectionDetails.requestingTime) missing.push("Requesting Time");
      if (!connectionDetails.boundaryWall) missing.push("Boundary Wall");
      if (!connectionDetails.tariffCatCode) missing.push("Tariff Category Code"); // ADDED
      if (!connectionDetails.tariffCode) missing.push("Tariff Code"); // ADDED
      if (!connectionDetails.customerCategory) missing.push("Customer Category"); // ADDED

      if (missing.length > 0) {
        alert(`Please fill all required connection details.\nMissing: ${missing.join(", ")}`);
        return;
      }

      await postConnectionDetails();
    }

    else if (activeTab === 3) {
      const missing = [];
      if (!contactPersonDetails.contactName) missing.push("Contact Name");
      if (!contactPersonDetails.contactIdNo) missing.push("Contact ID No");
      if (!contactPersonDetails.contactAddress) missing.push("Contact Address");
      if (!contactPersonDetails.contactMobile) missing.push("Contact Mobile");

      if (missing.length > 0) {
        alert(`Please fill all required contact person details.\nMissing: ${missing.join(", ")}`);
        return;
      }

      await postContactPersonDetails();
    }

    else if (activeTab === 4) {
      const missing = [];
      if (!documentUpload.idCopy) missing.push("ID Copy");
      if (!documentUpload.ownershipCertificate) missing.push("Ownership Certificate");
      if (!documentUpload.gramaNiladhariCertificate) missing.push("Grama Niladhari Certificate");

      if (missing.length > 0) {
        alert(`Please fill all required document upload fields.\nMissing: ${missing.join(", ")}`);
        return;
      }
    }

    // ✅ Move to next tab always
    setActiveTab((prev) => prev + 1);

  } catch (error) {
    console.error("Error during post operations:", error);
    alert("Something went wrong while submitting. Please try again.");
  }
};


  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="dashboard-header">
          <h1>New Service Connection Application Form</h1>
        </div>

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
                      <span className="text-xs mt-2">{tab.name}</span>
                    </div>
                  ))}
                </div>

                <div className="ml-0 p-0 bg-blueGray-100 ">
                  <h6 className=" py-0 text-xl text-center font-bold text-blueGray-700">
                    {tabs[activeTab].name}
                  </h6>

                  {showSuccessMessage && (
                    <div className="mx-auto w-full max-w-5xl mb-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm relative text-center">
                      
                      {/* Close Button */}
                      <button 
                        onClick={handleSuccessClose}
                        className="absolute top-2 right-2 text-green-700 hover:text-green-900 font-bold text-xl px-2"
                        title="Close message and edit form"
                      >
                        &times;
                      </button>

                      <div className="flex flex-col items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-2">
                          <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.2"/>
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#22c55e"/>
                          <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        
                        <h3 className="text-green-800 font-bold text-xl">Application Submitted Successfully!</h3>
                        
                        <div className="mt-2 bg-white px-6 py-2 rounded border border-green-100">
                          <span className="text-gray-500 text-sm block">Reference Number</span>
                          <span className="text-gray-900 font-bold text-2xl">{successRefNo}</span>
                        </div>

                        <p className="text-green-700 mt-3 font-medium">
                           You can continue to edit the details below if needed.
                        </p>
                      </div>
                    </div>
                  )}

                 {showSuccessUpdateMessage && (
                    <div className="mx-auto w-full max-w-5xl mb-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm relative text-center">
                      
                      {/* Close Button */}
                      <button 
                        onClick={handleSuccessUpdateClose}
                        className="absolute top-2 right-2 text-green-700 hover:text-green-900 font-bold text-xl px-2"
                        title="Close message"
                      >
                        &times;
                      </button>

                      <div className="flex flex-col items-center justify-center">
                        {/* Green Checkmark Icon (Same attractive icon as before) */}
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-2">
                          <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.2"/>
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#22c55e"/>
                          <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        
                        {/* Title */}
                        <h3 className="text-green-800 font-bold text-xl">Application Updated Successfully!</h3>
                        
                        {/* Reference Number Box */}
                        <div className="mt-2 bg-white px-6 py-2 rounded border border-green-100">
                          <span className="text-gray-500 text-sm block">Reference Number</span>
                          <span className="text-gray-900 font-bold text-2xl">{successRefNo}</span>
                        </div>

                        {/* Description */}
                        <p className="text-green-700 mt-3 font-medium">
                            Your changes have been saved successfully.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-2 rounded w-full max-w-5xl">
                    {activeTab === 3 ? (
                      <ContactPersonDetails
                        formData={contactPersonDetails}
                        customerData={customerDetails}
                        setFormData={setContactPersonDetails}
                      />
                    ) : activeTab === 2 ? (
                      <ConnectionDetails
                        formData={connectionDetails}
                        customerData={customerDetails}
                        setFormData={setConnectionDetails}
                        accountNumbers={accountNumbers}
                        setAccountNumbers={setAccountNumbers}
                      />
                    ) : activeTab === 1 ? (
                      <ServiceLocationDetails
                        formData={serviceLocationDetails}
                        customerData={customerDetails}
                        setFormData={setServiceLocationDetails}
                        handleChange={handleServiceLocationDetailsChange}
                      />
                    ) : (
                      tabs[activeTab].content
                    )}

                    {/* OTP Modal */}
                    {showOtpModal && (
                      <div className="otp-modal">
                        <div className="otp-card">
                          <h3 className="otp-title">
                            Enter OTP sent to {maskPhone(customerDetails.mobileNo)}
                          </h3>

                          <input
                            ref={otpInputRef}
                            type="text"
                            value={otp}
                            onChange={(e) => {
                              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                              setOtpError("");
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && otp.length >= 4 && !isVerifyingOtp) {
                                const ok = await validateOtp(
                                  customerDetails.mobileNo,
                                  otp
                                );
                                if (ok) {
                                  setShowOtpModal(false);
                                  setActiveTab((prev) => prev + 1);
                                }
                              }
                            }}
                            maxLength={6}
                            className="otp-input"
                          />

                          {otpError && (
                            <div style={{ color: "red", marginTop: 6 }}>
                              {otpError}
                            </div>
                          )}

                          <div className="otp-actions">
                            <button
                              className="otp-verify-btn"
                              disabled={otp.length < 4 || isVerifyingOtp}
                              onClick={async () => {
                                const ok = await validateOtp(
                                  customerDetails.mobileNo,
                                  otp
                                );
                                if (ok) {
                                  setShowOtpModal(false);
                                  setActiveTab((prev) => prev + 1);
                                }
                              }}
                            >
                              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                            </button>

                            <button
                              className="otp-resend-btn"
                              disabled={otpTimer > 0 || isSendingOtp}
                              onClick={async () => {
                                await sendOtp(customerDetails.mobileNo);
                              }}
                              title={
                                otpTimer > 0
                                  ? `You can resend in ${otpTimer}s`
                                  : "Resend OTP"
                              }
                            >
                              {isSendingOtp
                                ? "Sending..."
                                : otpTimer > 0
                                ? `Resend in ${otpTimer}s`
                                : "Resend OTP"}
                            </button>

                            <button
                              className="otp-cancel-btn"
                              onClick={() => {
                                setShowOtpModal(false);
                                setOtp("");
                                setOtpError("");
                                setOtpTimer(0);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                

                <div className="flex justify-between items-center mb-1">
                  <div className="form-row-button">
                    {activeTab > 0 && (
                      <button
                        onClick={handlePrev}
                        className="text-white font-bold text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                        style={{ backgroundColor: "#7d0000", color: "white" }}
                      >
                        Previous
                      </button>
                    )}

                    {activeTab < tabs.length - 1 ? (
                      <button
                        onClick={handleNext}
                        disabled={showOtpModal}
                        className="text-white font-bold text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                        style={{
                          backgroundColor: "#7d0000",
                          color: "white",
                          opacity: showOtpModal ? 0.7 : 1,
                        }}
                      >
                        {showOtpModal ? "Waiting for OTP..." : "Next"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white font-bold text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal inline styles for OTP modal */}
      <style>{`
        .otp-modal {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
        }
        .otp-card {
          background: #fff; padding: 20px; border-radius: 12px; width: 400px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .otp-title { margin: 0 0 10px 0; font-weight: 600; }
        .otp-input {
          width: 100%; font-size: 18px; letter-spacing: 4px;
          padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px;
        }
        .otp-actions {
          margin-top: 12px; display: flex; gap: 8px; flex-wrap: nowrap; justify-content: space-between;
        }
        .otp-verify-btn { background: #2563eb; color: #fff; }
        .otp-resend-btn { background: #f59e0b; color: #111; }
        .otp-cancel-btn { background: #e5e7eb; color: #111;  }
        .otp-verify-btn:disabled, .otp-resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default NewCustomerStepper;
