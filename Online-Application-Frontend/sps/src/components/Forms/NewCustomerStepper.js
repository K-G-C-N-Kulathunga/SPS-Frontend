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
import { api } from "../../apiService";

// Optional: centralize SharedService base
const BASE_URL = process.env.REACT_APP_SHARED_SERVICE_BASE;
const OTP_BASE = `${BASE_URL}/SharedService`;

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

  // ✅ OTP should be required only once per session for NEW application
  const [otpVerified, setOtpVerified] = useState(() => {
    return sessionStorage.getItem("otpVerified") === "true";
  });

  // ✅ Agreement confirmation popup (on Submit)
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (showOtpModal && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtpModal]);

  useEffect(() => {
    if (!showOtpModal || otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [showOtpModal, otpTimer]);

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
        systemName: "New Service Connection",
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
    area: "",
    nearestCSC: "",
  });

  const [connectionDetails, setConnectionDetails] = useState({
    phase: "",
    connectionType: "",
    usageElectricity: "",
    requestingTime: "",
    boundaryWall: "",
    preAccountNo: "",
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
      const response = await api.get(`/applicants/findById/${idNo}`);
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
    const requiredConnectionFields = ["phase", "connectionType"];
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
      const tempId = res.data;
      localStorage.setItem("tempId", tempId);

      const legacy = buildLegacyTempId(tempId);
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

      const legacyId = buildLegacyTempId(storedTempId);
      if (legacyId) localStorage.setItem("passingTempId", legacyId);

      let response;

      // NEW draft -> POST first
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
        };

        response = await api.post(`/online-applications`, payload);

        // Ensure tempId is available for later steps
        const tmp = await generateTempId();
        if (!tmp) console.warn("tempId not generated; PUTs may fail until it is.");
      } else {
        // UPDATE existing draft -> PUT
        const tempIdToUse =
          tempIdFromUrl || legacyId || existingPassing || resolveTempIdForPut(location);

        if (!tempIdToUse) throw new Error("No tempId available for update.");

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

    await api.put(`/online-applications/${tempIdToUse}`, payload);
  };

  const postContactPersonDetails = async () => {
    const tempIdToUse = resolveTempIdForPut(location);
    if (!tempIdToUse) {
      alert("Temporary ID not found. Please start the application again.");
      return;
    }

    const payload = {
      contactIdNo: contactPersonDetails.contactIdNo,
      contactName: contactPersonDetails.contactName,
      contactAddress: contactPersonDetails.contactAddress,
      contactTelephone: contactPersonDetails.contactTelephone,
      contactMobile: contactPersonDetails.contactMobile,
      contactEmail: contactPersonDetails.contactEmail,
    };

    await api.put(`/online-applications/${tempIdToUse}`, payload);
  };

  const postConnectionDetails = async () => {
    const tempIdToUse = resolveTempIdForPut(location);
    if (!tempIdToUse) {
      alert("Temporary ID not found. Please start the application again.");
      return;
    }

    const payload = {
      phase:
        connectionDetails.phase === 3
          ? true
          : connectionDetails.phase === 1
          ? false
          : undefined,
      connectionType: connectionDetails.connectionType,
      usageElectricity: connectionDetails.usageElectricity,
      requestingTime: connectionDetails.requestingTime,
      boundaryWall: connectionDetails.boundaryWall,
      preAccountNo: connectionDetails.preAccountNo,
    };

    await api.put(`/online-applications/${tempIdToUse}`, payload);
  };

  // =========================
  // REQUIRED DOCUMENT VALIDATION (FINAL GUARD)
  // =========================
  const validateRequiredDocuments = () => {
    const missing = [];
    if (!documentUpload.idCopy) missing.push("ID Copy");
    if (!documentUpload.ownershipCertificate) missing.push("Ownership Certificate");
    if (!documentUpload.gramaNiladhariCertificate)
      missing.push("Grama Niladhari Certificate");

    if (missing.length > 0) {
      alert(
        `Please upload all required documents before submitting.\n\nMissing:\n- ${missing.join(
          "\n- "
        )}`
      );
      return false;
    }
    return true;
  };

  // Submit: single multipart POST /application with JSON + files
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 🔐 FINAL document validation (cannot bypass)
    if (!validateRequiredDocuments()) return;

    try {
      setIsSubmitting(true);

      const formDataDto = {
        applicantDto: {
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
        },
        applicationDto: {
          deptId: contactPersonDetails.deptId,
          contactIdNo: contactPersonDetails.contactIdNo,
          contactName: contactPersonDetails.contactName,
          contactAddress: contactPersonDetails.contactAddress,
          contactTelephone: contactPersonDetails.contactTelephone,
          contactMobile: contactPersonDetails.contactMobile,
          contactEmail: contactPersonDetails.contactEmail,
        },
        wiringLandDetailDto: {
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
          customerType: serviceLocationDetails.customerType || "DOME",
        },
      };

      const tempIdToUse = resolveTempIdForPut(location);
      if (!tempIdToUse) {
        alert("Temporary ID not found. Please start the application again from step 1.");
        return;
      }

      const multipart = new FormData();
      const jsonBlob = new Blob([JSON.stringify(formDataDto)], {
        type: "application/json",
      });

      multipart.append("formData", jsonBlob);
      multipart.append("tempId", tempIdToUse);

      if (documentUpload.idCopy) multipart.append("idCopy", documentUpload.idCopy);
      if (documentUpload.ownershipCertificate)
        multipart.append("ownershipCertificate", documentUpload.ownershipCertificate);
      if (documentUpload.gramaNiladhariCertificate)
        multipart.append("gramaNiladhariCertificate", documentUpload.gramaNiladhariCertificate);
      if (documentUpload.threephChartedEngineerCertificate)
        multipart.append(
          "threephChartedEngineerCertificate",
          documentUpload.threephChartedEngineerCertificate
        );

      const appResponse = await api.post(`/application`, multipart, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

      history.push("/success", {
        applicationNo: refNo,
        customerName:
          customerDetails.fullName || contactPersonDetails.contactName || "",
      });
    } catch (error) {
      alert("Submission failed: " + (error?.response?.data?.error || error.message));
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
          fetchCustomerById={fetchCustomerById}
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
          serviceArea={serviceLocationDetails.area}
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

      // Existing app: skip OTP for this session
      setOtpVerified(true);
      sessionStorage.setItem("otpVerified", "true");

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
            customerType: "DOME",
            longitude: data.longitude || "",
            latitude: data.latitude || "",
          }));

          const normalizePhase = (rawPhase, rawConnType) => {
            if (rawPhase === 3 || rawPhase === "3") return 3;
            if (rawPhase === 1 || rawPhase === "1") return 1;
            if (rawPhase === true || rawPhase === "true" || rawPhase === "Y") return 3;
            if (rawPhase === false || rawPhase === "false" || rawPhase === "N") return 1;
            const nConn = Number(rawConnType);
            if (!Number.isNaN(nConn) && nConn === 60) return 3;
            return "";
          };

          const normalizeConnType = (raw) => {
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

        if (missing.length > 0) {
          alert(`Please fill all required customer details.\nMissing: ${missing.join(", ")}`);
          return;
        }

        await postCustomerDetails();

        // ✅ Existing app: no OTP
        if (tempIdFromUrl) {
          setActiveTab((prev) => prev + 1);
          return;
        }

        // ✅ NEW app: OTP only ONCE per session
        if (!otpVerified) {
          const tmp = await generateTempId();
          if (!tmp) {
            alert("Could not generate a temporary ID. Try again.");
            return;
          }

          const sent = await sendOtp(customerDetails.mobileNo);
          if (sent) return; // wait for OTP modal
        }

        // If already verified, just continue
        setActiveTab((prev) => prev + 1);
        return;
      } else if (activeTab === 1) {
        const missing = [];
        if (!serviceLocationDetails.deptId) missing.push("Department");
        if (!serviceLocationDetails.serviceStreetAddress) missing.push("Service Street Address");
        if (!serviceLocationDetails.serviceSuburb) missing.push("Service Suburb");
        if (!serviceLocationDetails.serviceCity) missing.push("Service City");
        if (!serviceLocationDetails.ownership) missing.push("Ownership");
        if (!serviceLocationDetails.latitude) missing.push("Latitude");
        if (!serviceLocationDetails.longitude) missing.push("Longitude");

        if (missing.length > 0) {
          alert(`Please fill all required service location details.\nMissing: ${missing.join(", ")}`);
          return;
        }

        await postServiceLocationDetails();
      } else if (activeTab === 2) {
        const missing = [];
        if (!connectionDetails.phase) missing.push("Phase");
        if (!connectionDetails.connectionType) missing.push("Connection Type");
        if (!connectionDetails.usageElectricity) missing.push("Usage of Electricity");
        if (!connectionDetails.requestingTime) missing.push("Requesting Time");
        if (!connectionDetails.boundaryWall) missing.push("Boundary Wall");

        if (missing.length > 0) {
          alert(`Please fill all required connection details.\nMissing: ${missing.join(", ")}`);
          return;
        }

        await postConnectionDetails();
      } else if (activeTab === 3) {
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
      } else if (activeTab === 4) {
        const missing = [];
        if (!documentUpload.idCopy) missing.push("ID Copy");
        if (!documentUpload.ownershipCertificate) missing.push("Ownership Certificate");
        if (!documentUpload.gramaNiladhariCertificate) missing.push("Grama Niladhari Certificate");

        if (missing.length > 0) {
          alert(`Please fill all required document upload fields.\nMissing: ${missing.join(", ")}`);
          return;
        }
      }

      setActiveTab((prev) => prev + 1);
    } catch (error) {
      console.error("Error during post operations:", error);
      alert("Something went wrong while submitting. Please try again.");
    }
  };

  const handlePrev = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  const openAgreementModal = () => {
    // ✅ do not allow opening modal unless mandatory docs exist
    if (!validateRequiredDocuments()) return;
    setShowAgreementModal(true);
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
                    <div key={index} className="relative flex-1 flex flex-col items-center">
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
                        serviceArea={serviceLocationDetails.area}
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
                                const ok = await validateOtp(customerDetails.mobileNo, otp);
                                if (ok) {
                                  // ✅ mark verified so it won't ask again
                                  setOtpVerified(true);
                                  sessionStorage.setItem("otpVerified", "true");

                                  setShowOtpModal(false);
                                  setActiveTab((prev) => prev + 1);
                                }
                              }
                            }}
                            maxLength={6}
                            className="otp-input"
                          />

                          {otpError && <div style={{ color: "red", marginTop: 6 }}>{otpError}</div>}

                          <div className="otp-actions">
                            <button
                              className="otp-verify-btn"
                              disabled={otp.length < 4 || isVerifyingOtp}
                              onClick={async () => {
                                const ok = await validateOtp(customerDetails.mobileNo, otp);
                                if (ok) {
                                  // ✅ mark verified so it won't ask again
                                  setOtpVerified(true);
                                  sessionStorage.setItem("otpVerified", "true");

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
                              title={otpTimer > 0 ? `You can resend in ${otpTimer}s` : "Resend OTP"}
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

                    {/* Agreement Confirm Modal */}
                    {showAgreementModal && (
                      <div className="agreement-overlay">
                        <div className="agreement-modal">
                          <div className="agreement-header">
                            <h3>Declaration / Agreement</h3>
                          </div>

                          <div className="agreement-body">
                            <p>
                              I assure that all the information given above is true and correct.
                              If it is later proved that false information or forged documents
                              have been submitted, I will consciously certify that the agreement
                              signed with the Ceylon Electricity Board will be terminated and my
                              Electricity supply shall be disconnected and that the Ceylon
                              Electricity Board will be fully relieved of all liability in that
                              regard.
                            </p>

                            <p>
                              I agree to pay the full cost of change of power line route which have
                              laid across someone else&apos;s land / house / property in case of any
                              objection. I also agree to use electricity without exceeding the
                              contract demand. I hereby request to issue an estimate for the
                              supply of electricity to the above premises.
                            </p>
                          </div>

                          <div className="agreement-actions">
                            <button
                              className="agreement-confirm"
                              disabled={isSubmitting}
                              onClick={async () => {
                                setShowAgreementModal(false);
                                await handleSubmit();
                              }}
                            >
                              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                            </button>

                            <button
                              className="agreement-cancel"
                              disabled={isSubmitting}
                              onClick={() => setShowAgreementModal(false)}
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
                        onClick={openAgreementModal}
                        disabled={isSubmitting}
                        className="bg-green-500 text-white font-bold text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                        style={{ opacity: isSubmitting ? 0.7 : 1 }}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal inline styles for OTP modal (reused for agreement modal too) */}
      <style>{`
        .otp-modal {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
        }
        .otp-card {
          background: #fff; padding: 20px; border-radius: 12px; width: 440px;
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
        .otp-verify-btn { background: #2563eb; color: #fff; padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; }
        .otp-resend-btn { background: #f59e0b; color: #111; padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; }
        .otp-cancel-btn { background: #e5e7eb; color: #111; padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; }
        .otp-verify-btn:disabled, .otp-resend-btn:disabled, .otp-cancel-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default NewCustomerStepper;