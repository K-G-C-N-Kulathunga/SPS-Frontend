import { useState, useEffect } from "react";
import { useHistory , useLocation } from "react-router-dom";
import "./NewCustomerForm.css";
import axios from "axios";
import { api } from '../../api'; // import our Axios instance

import ceb from "../../assets/img/ceb.png";


import { CustomerDetails } from "../Forms/StepperComponents/CustomerDetails";
import { ContactPersonDetails } from "../Forms/StepperComponents/ContactPersonDetails.js";
import { ServiceLocationDetails } from "../Forms/StepperComponents/ServiceLocationDetails";
import { ConnectionDetails } from "../Forms/StepperComponents/ConnectionDetails";
import DocumentUpload from "./StepperComponents/DocumentUpload";

const NewCustomerStepper = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(Array(4).fill(false));
  const [customerExists, setCustomerExists] = useState(false);
  const history = useHistory();

  const location = useLocation();

  // Customer Details state
  const [customerDetails, setCustomerDetails] = useState({
    idNo: "",
    personalCorporate: "PER",
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

  // Contact Person Details state
  const [contactPersonDetails, setContactPersonDetails] = useState({
    contactidNo: "",
    contactName: "",
    contactAddress: "",
    contactTelephone: "",
    contactMobile: "",
    contactEmail: "",
    deptId: "",
  });

  // Service Location Details state
  const [serviceLocationDetails, setServiceLocationDetails] = useState({
    deptId: "",
    serviceStreetAddress: "",
    serviceSuburb: "",
    serviceCity: "",
    servicePostalCode: "",
    assestmentNo: "",
    neigboursAccNo: "",
    customerType: "DOME",
  });

  // Connection Details state
  const [connectionDetails, setConnectionDetails] = useState({
    phase: "",
    connectionType: "",
    customerCategory: "PRIV",
    tariffCatCode: "DP",
    metalCrusher: "",
    sawMills: "",
    weldingPlant: "",
    tariffCode: "11",
    customerType: "DOME",
    tariffCategoryCode: ""
  });

  // Document Upload state
  const [documentUpload, setDocumentUpload] = useState({
    idCopy: "",
    ownershipCertificate: "",
    gramaNiladhariCertificate: "",
  });

  // Sync deptId whenever serviceLocationDetails.deptId changes
  useEffect(() => {
    setContactPersonDetails((prevDetails) => ({
      ...prevDetails,
      deptId: serviceLocationDetails.deptId, // Update deptId dynamically
    }));
  }, [serviceLocationDetails.deptId]);

  // Generic handlers for form state updates
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
    setDocumentUpload({ ...documentUpload, [name]: files[0] }); // Store the File object
  };


  // Check if a form is completed - basic validation
  const isFormCompleted = (formData, requiredFields) => {
    if (!requiredFields || requiredFields.length === 0) return true;
    return requiredFields.every(
      (field) => formData[field] !== "" && formData[field] !== undefined
    );
  };
  const wiringLandDetailDto = {
    ...serviceLocationDetails,
    ...connectionDetails,
  };
  const applicantDto = { ...customerDetails };
  const applicationDto = { ...contactPersonDetails };
  const documentDto = { ...documentUpload };


  // const fetchCustomerById = async (id) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8082/api/applicants/${id}`
  //     );
  //     if (response.data) {
  //       setCustomerExists(true);
  //       setCustomerDetails({
  //         ...response.data,
  //         mobileNo: response.data.mobileNo || "",
  //         email: response.data.email || "",
  //       });
  //     } else {
  //       setCustomerExists(false);
  //     }
  //   } catch (error) {
  //     setCustomerExists(false);
  //     console.error("Error fetching customer:", error);
  //   }
  // };

  // Add this useEffect for auto-search
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (customerDetails.id && customerDetails.id.length > 5) {
  //       fetchCustomerById(customerDetails.id);
  //     }
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [customerDetails.id]);

  // Update completed steps when form changes
  useEffect(() => {
    const requiredCustomerFields = [
      "idNo",
      "fullName",
      "mobileNo",
      "streetAddress",
      "city",
      "preferredLanguage",
    ];
    const requiredServiceFields = [
      // "deptId",
      "serviceStreetAddress",
      "serviceCity",
    ];
    const requiredConnectionFields = [
      "phase",
      "connectionType",
      "customerCategory",
      "tariffCatCode",
    ];
    const requiredContactFields = ["contactName", "contactMobile"];
    const requiredDocumentUploadFields = [
      "idCopy",
      "ownershipCertificate",
      "gramaNiladhariCertificate",
    ];

    setCompletedTabs([
      isFormCompleted(customerDetails, requiredCustomerFields),
      isFormCompleted(contactPersonDetails, requiredContactFields),
      isFormCompleted(serviceLocationDetails, requiredServiceFields),
      isFormCompleted(connectionDetails, requiredConnectionFields),
      isFormCompleted(documentUpload, requiredDocumentUploadFields),
    ]);

  }, [
    customerDetails,
    serviceLocationDetails,
    connectionDetails,
    contactPersonDetails,
      documentUpload,
  ]);


  const postContactPersonDetails = async () => {
    // Get tempId from URL if present (for existing application)
    const params = new URLSearchParams(location.search);
    const tempIdFromUrl = params.get("tempId");
    const storedTempId = localStorage.getItem("tempId");
    const newTempId = storedTempId - 1;
    const newNewTempId = '0' + newTempId;
    console.log("Stored tempId:", storedTempId);
    console.log("newTempId:", newTempId);
    console.log("newNewTempId:", newNewTempId);

    // Use tempId from URL if available, else fallback to generated one
    const tempIdToUse = tempIdFromUrl ? tempIdFromUrl : newNewTempId;

    try {
      const updatedConnectionDetails = {
        // neighboursAccNo: serviceLocationDetails.neighboursAccNo,
        // serviceStreetAddress: serviceLocationDetails.serviceStreetAddress,
        // serviceSuburb: serviceLocationDetails.serviceSuburb,
        // serviceCity: serviceLocationDetails.serviceCity,
        // servicePostalCode: serviceLocationDetails.servicePostalCode,
        // assessmentNo: serviceLocationDetails.assessmentNo,
        // ownership: serviceLocationDetails.ownership,

        contactIdNo: contactPersonDetails.contactIdNo,
        contactName: contactPersonDetails.contactName,
        contactAddress: contactPersonDetails.contactAddress,
        contactTelephone: contactPersonDetails.contactTelephone,
        contactMobile: contactPersonDetails.contactMobile,
        contactEmail: contactPersonDetails.contactEmail,

        // phase: "",
        // connectionType: "",
        // usageElectricity: "",
        // requestingTime: "",
        // boundaryWall: "",
        // preAccountNo: "",
      };

      const response = await api.put(
          `/online-applications/${tempIdToUse}`,
          updatedConnectionDetails
      );
      console.log("Updated data:", updatedConnectionDetails);
      console.log("Backend response:", response.data);
      alert("Customer details updated successfully.");
    } catch (error) {
      console.error("Error updating details:", error);
      alert("Failed to update customer details. Error: " + (error?.message || JSON.stringify(error)));
      throw error; // Re-throw to handle in calling function if needed
    }
  };

  const handleSubmit = async () => {
    // Basic validation for required fields
    // if (!customerDetails.id || !customerDetails.fullName) {
    //   alert("Please fill in all required fields.");
    //   return;
    // }

    const payload = {
      applicantDto,
      wiringLandDetailDto,
      applicationDto,
    };



    try {
      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      const response = await fetch("http://localhost:9090/sps/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (response.ok) {
        console.log("Success Response:", responseData);
        alert("Application submitted successfully!");
        history.push({
          pathname: ("/success"),
          state: {
            applicationNo: responseData.applicationNo,
            customerName: customerDetails.fullName
          }
        });
      } else {
        console.error("Failed Response:", responseData);
        alert(
          `Failed to submit application: ${
            responseData?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting application. Check the console for details.");
    }
  };


  const tabs = [
    {
      name: "Application Details",
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
      name: "Contact Person Details",
      content: (
          <ContactPersonDetails
              formData={contactPersonDetails}
              handleChange={handleContactPersonDetailsChange}
          />
      ),
    },
    {
      name: "Service Location Details",
      content: (
          <ServiceLocationDetails
              formData={serviceLocationDetails}
              handleChange={handleServiceLocationDetailsChange}
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


  const handleNext = () => {
    // Tab-specific validation
    if (activeTab === 0) {
      // Application Details
      if (
          !customerDetails.idNo ||
          !customerDetails.fullName ||
          !customerDetails.mobileNo ||
          !customerDetails.streetAddress ||
          !customerDetails.city ||
          !customerDetails.preferredLanguage
      ) {
        alert("Please fill all required customer details");
        return;
      }
    } else if (activeTab === 1) {
      // Contact Person Details
      if (
          !contactPersonDetails.contactName ||
          !contactPersonDetails.contactMobile
      ) {
        alert("Please fill all required contact person details");
        return;
      }
        console.log("conatact Id No", contactPersonDetails.contactIdNo);
        console.log("contact Name", contactPersonDetails.contactName);
        console.log("contact Address", contactPersonDetails.contactAddress);
        console.log("contact Telephone", contactPersonDetails.contactTelephone);
        console.log("contact Mobile", contactPersonDetails.contactMobile);
        console.log("contact Email", contactPersonDetails.contactEmail);

       postContactPersonDetails();
      console.log("Contact person details submitted");
    } else if (activeTab === 2) {
      console.log("Service Location Details:", serviceLocationDetails);
      console.log("Service Location Details - service Street Address:", serviceLocationDetails.serviceStreetAddress);
      console.log("Service Location Details - service City:", serviceLocationDetails.serviceCity);
        console.log("Service Location Details - service Suburb:", serviceLocationDetails.serviceSuburb);
      // Service Location Details
      if (!serviceLocationDetails.serviceStreetAddress||
            !serviceLocationDetails.serviceCity||
          !serviceLocationDetails.serviceSuburb
          // !connectionDetails.customerType||
          // !connectionDetails.tariffCode ||
          // !connectionDetails.tariffCategoryCode||
          // !connectionDetails.weldingPlant
      ) {
        alert("Please fill all required service location details");
        return;
      }
    } else if (activeTab === 3) {
      // Connection Details
      if (
          !connectionDetails.phase ||
          !connectionDetails.connectionType ||
          !connectionDetails.customerCategory ||
          !connectionDetails.tariffCatCode
      ) {
        alert("Please fill all required connection details");
        return;
      }
    } else if (activeTab === 4) {
      // Document Upload
      if (
          !documentUpload.idCopy ||
          !documentUpload.ownershipCertificate ||
          !documentUpload.gramaNiladhariCertificate
      ) {
        alert("Please upload all required documents");
        return;
      }
    }


    // Mark current tab as completed
    const newCompletedTabs = [...completedTabs];
    newCompletedTabs[activeTab] = true;
    setCompletedTabs(newCompletedTabs);

    // Move to next tab if not last
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrev = () => {
    // Simply go back without validation
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* <div className="dashboard-header">
          <h1>New Connection Application Form</h1>
          <div className="ceb-logo">
            <img src={ceb} alt="ceb-logo"></img>
          </div>
        </div> */}
        <div className="dashboard-header"></div>

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
                        {/* Step circle */}
                        <div
                            className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${
                                index === activeTab
                                    ? "bg-red-400 text-white border-yellow-600" // Active step is yellow
                                    : completedTabs[index]
                                        ? "bg-green-500 text-white border-green-600" // Completed step is green
                                        : "border-gray-400 bg-white text-gray-600" // Future step is gray
                            }`}
                        >
                          {index + 1}
                      </div>
                      <span className="text-xs mt-2">{tab.name}</span>
                    </div>
                  ))}
                </div>

                <div className="ml-0 p-0 bg-blueGray-100">
                  <h6 className=" py-0 text-xl text-center font-bold text-blueGray-700">
                    {tabs[activeTab].name}
                  </h6>
                  <div className="p-2 rounded w-full max-w-5xl">
                    { activeTab === 3 ? (
                        <ConnectionDetails
                            formData={connectionDetails}
                            // customerData={customerDetails}
                            setFormData={setConnectionDetails}
                        />
                    ) : activeTab === 2 ? (
                        <ServiceLocationDetails
                            formData={connectionDetails}
                            // customerData={customerDetails}
                            setFormData={setConnectionDetails}
                        />
                    ) :activeTab === 1 ? (
                      <ContactPersonDetails
                        formData={contactPersonDetails}
                        customerData={customerDetails}
                        setFormData={setContactPersonDetails}
                      />
                    ) :(
                      tabs[activeTab].content
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="form-row-button">
                    {activeTab > 0 && (
                      <button
                        onClick={handlePrev}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3  rounded shadow hover:shadow-md transition duration-150"
                      >
                        Previous
                      </button>
                    )}

                    {activeTab < tabs.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-md transition duration-150"
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
    </div>
  );
};

export default NewCustomerStepper;
