// import React, { useState, useEffect, useRef } from "react";
// import { useHistory } from "react-router-dom";
// import "./LandingForm.css";
// import axios from "axios";
// import { api } from '../../api';

// export default function LandingForm() {
//   const history = useHistory();
//   const [selectedOption, setSelectedOption] = useState("");
//   const [tempId, setTempId] = useState("");

//   // OTP state (modal overlay)
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpError, setOtpError] = useState("");
//   const [isSendingOtp, setIsSendingOtp] = useState(false);
//   const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
//   const [otpTimer, setOtpTimer] = useState(0);
//   const [mobileToVerify, setMobileToVerify] = useState("");
//   const otpInputRef = useRef(null);

//   useEffect(() => {
//     if (showOtpModal && otpInputRef.current) otpInputRef.current.focus();
//   }, [showOtpModal]);

//   useEffect(() => {
//     if (!showOtpModal || otpTimer <= 0) return;
//     const id = setInterval(() => setOtpTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
//     return () => clearInterval(id);
//   }, [showOtpModal, otpTimer]);

//   const sendOtp = async (mobileNo) => {
//     if (!mobileNo || String(mobileNo).trim().length < 9) {
//       alert("Could not find a valid mobile number for this Temporary Application.");
//       return false;
//     }
//     try {
//       setIsSendingOtp(true);
//       setOtp("");
//       setOtpError("");
//       await axios.post(
//         "http://10.128.1.227:8080/SharedService/api/otp/sendOtp",
//         { mobileNo,
//           systemName: "New Service Connection",
//           systemCode: "CEB Info",
//          }
//       );
//       setShowOtpModal(true);
//       setOtpTimer(60);
//       return true;
//     } catch (e) {
//       console.error("sendOtp failed:", e);
//       alert("Failed to send OTP. Please try again.");
//       return false;
//     } finally {
//       setIsSendingOtp(false);
//     }
//   };

//   const maskPhone = (phone) => {
//   const digits = (phone || "").toString().replace(/\D/g, "");
//   if (!digits) return "";
//   const last4 = digits.slice(-4);
//   return digits.length > 4 ? `${"*".repeat(digits.length - 4)}${last4}` : last4;
//   };


//   const validateOtp = async (mobileNo, code) => {
//     if (!code || code.length < 4) {
//       setOtpError("Please enter the OTP.");
//       return false;
//     }
//     try {
//       setIsVerifyingOtp(true);
//       setOtpError("");
//       const res = await axios.post(
//         "http://10.128.1.227:8080/SharedService/api/otp/validateOtp",
//         { mobileNo, otp: code }
//       );
//       const data = res?.data;
//       const ok =
//         data === true ||
//         data?.valid === true ||
//         data?.valid === "Y" ||
//         String(data?.status || "").toUpperCase() === "VERIFIED" ||
//         String(data?.message || "").toLowerCase().includes("valid");
//       if (!ok) {
//         setOtpError("Invalid OTP. Please try again.");
//         return false;
//       }
//       return true;
//     } catch (e) {
//       console.error("validateOtp failed:", e);
//       setOtpError("Invalid OTP. Please try again.");
//       return false;
//     } finally {
//       setIsVerifyingOtp(false);
//     }
//   };

//   const handleSubmit = async () => {
//     // reset local flags used later in the flow
//     localStorage.setItem("passingTempId", null);
//     localStorage.setItem("newNewTempId", null);

//     if (selectedOption === "new") {
//       // ⬅ New Application: go straight to form (OTP happens later on Customer Details step)
//       history.push("/form");
//       return;
//     }

//     if (selectedOption === "existing") {
//       if (tempId.trim() === "") {
//         alert("Please enter your Temporary Application ID");
//         return;
//       }

//       try {
//         // Fetch existing app to get its mobile number
//         // const res = await api.get(`/online-applications/${tempId}`);
//         // const mobile =
//         //   res?.data?.mobile ?? res?.data?.mobileNo ?? res?.data?.telephone ?? "";

//         // Fetch existing app to get status + mobile

//         const res = await api.get(`/online-applications/${tempId}`);

//         // 1) Block if already completed
//         const status = String(res?.data?.status || "").toUpperCase();
//         if (status === "C") {
//           alert("This temporary ID is expired.");
//           return; // <-- stop here
//         }

//         const mobile = res?.data?.mobile ?? res?.data?.mobileNo ?? res?.data?.telephone ?? "";


//         if (!mobile) {
//           alert(
//             "No mobile number found for this Temporary Application. Please contact support."
//           );
//           return;
//         }

//         setMobileToVerify(String(mobile));
//         const sent = await sendOtp(String(mobile));
//         if (!sent) return;

//         // After OTP verified (in modal), we’ll route to /form?tempId=...
//         // Do not navigate yet.
//       } catch (err) {
//         console.error("Failed to load application for OTP:", err);
//         alert("Invalid Temporary Application ID or server error.");
//       }
//       return;
//     }

//     alert("Please select an application type.");
//   };

//   return (
//     <div className="landing-app-container">
//       <div className="landing-main-content">
//         <div className="landing-dashboard-header">
//           <h1>New Service Connection Application Form</h1>
//         </div>

//         <div className="landing-form-container">
//           <div className="">
//             <div className="w-full max-w-4xl mx-auto px-4">
//               <div className="bg-white rounded p-6 space-y-8 landing-full-lading-page-option">
//                 <div className="">
//                   {/* Right side */}
//                   <div className="w-1/2 flex flex-col space-y-4">
//                     <div className="">
//                       {/* Radio: New Application */}
//                       <label className="items-center space-x-2 landing-new-application-radio-button">
//                         <input
//                           type="radio"
//                           name="applicationType"
//                           value="new"
//                           checked={selectedOption === "new"}
//                           onChange={(e) => setSelectedOption(e.target.value)}
//                           className="form-radio"
//                         />
//                         <span>&nbsp;&nbsp;New Application</span>
//                       </label>
//                       <div className="flex items-center space-x-2 mt-2"></div>

//                       {/* Radio: Existing Application */}
//                       <label className="items-center space-x-2 landing-label">
//                         <input
//                           type="radio"
//                           name="applicationType"
//                           value="existing"
//                           checked={selectedOption === "existing"}
//                           onChange={(e) => setSelectedOption(e.target.value)}
//                           className="form-radio"
//                         />
//                         <span>&nbsp;&nbsp;Existing Application</span>
//                       </label>
//                     </div>

//                     <div className="flex items-center space-x-2 mt-2"></div>

//                     {/* Temp ID input (same UI; disabled unless 'existing') */}
//                     <div className=" justify-start  mr-4 ">
//                       <label htmlFor="tempId" className="font-medium whitespace-nowrap">
//                         Temporary Application ID:&nbsp;&nbsp;
//                       </label>
//                       <input
//                         type="text"
//                         id="tempId"
//                         value={tempId}
//                         onChange={(e) => setTempId(e.target.value)}
//                         className={`landing-form-input ${
//                           selectedOption !== "existing"
//                             ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-70"
//                             : "bg-white text-black border-gray-400"
//                         }`}
//                         placeholder="ex :- xxx-xxxxx-xxx"
//                         disabled={selectedOption !== "existing"}
//                       />
//                     </div>
//                   </div>

//                   {/* Submit button */}
//                   <div className="flex justify-end landing-proceed-button">
//                     <button
//                       onClick={handleSubmit}
//                       className="mt-4 text-white font-bold py-2 px-8 mr-8 rounded shadow-2xl hover:bg-red-800 transition duration-150"
//                       style={{ backgroundColor: "#7d0000" }}
//                     >
//                       Proceed
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* OTP Modal overlay (does not change page layout) */}
//             {showOtpModal && (
//               <div className="otp-modal">
//                 <div className="otp-card">
//                   <h3 className="otp-title">
//                     Enter OTP sent to {maskPhone(mobileToVerify)}
//                   </h3>

//                   <input
//                     ref={otpInputRef}
//                     type="text"
//                     value={otp}
//                     onChange={(e) => {
//                       setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
//                       setOtpError("");
//                     }}
//                     onKeyDown={async (e) => {
//                       if (e.key === "Enter" && otp.length >= 4 && !isVerifyingOtp) {
//                         const ok = await validateOtp(mobileToVerify, otp);
//                         if (ok) {
//                           setShowOtpModal(false);
//                           setOtp("");
//                           setOtpError("");
//                           setOtpTimer(0);
//                           // ✅ only after OTP verified, go to existing form
//                           history.push(`/form?tempId=${tempId}`);
//                         }
//                       }
//                     }}
//                     maxLength={6}
//                     className="otp-input"
//                     placeholder="6-digit code"
//                   />

//                   {otpError && (
//                     <div style={{ color: "red", marginTop: 6 }}>{otpError}</div>
//                   )}

//                   <div className="otp-actions">
//                     <button
//                       className="otp-verify-btn"
//                       disabled={otp.length < 4 || isVerifyingOtp}
//                       onClick={async () => {
//                         const ok = await validateOtp(mobileToVerify, otp);
//                         if (ok) {
//                           setShowOtpModal(false);
//                           setOtp("");
//                           setOtpError("");
//                           setOtpTimer(0);
//                           history.push(`/form?tempId=${tempId}`);
//                         }
//                       }}
//                     >
//                       {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
//                     </button>

//                     <button
//                       className="otp-resend-btn"
//                       disabled={otpTimer > 0 || isSendingOtp}
//                       onClick={async () => {
//                         await sendOtp(mobileToVerify);
//                       }}
//                       title={
//         otpTimer > 0 ? `You can resend in ${otpTimer}s` : "Resend OTP"
//                       }
//                     >
//                       {isSendingOtp
//                         ? "Sending..."
//                         : otpTimer > 0
//                         ? `Resend in ${otpTimer}s`
//                         : "Resend OTP"}
//                     </button>

//                     <button
//                       className="otp-cancel-btn"
//                       onClick={() => {
//                         setShowOtpModal(false);
//                         setOtp("");
//                         setOtpError("");
//                         setOtpTimer(0);
//                       }}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Minimal inline styles for OTP modal (no UI changes elsewhere) */}
//             <style>{`
//               .otp-modal {
//                 position: fixed; inset: 0; background: rgba(0,0,0,0.5);
//                 display: flex; align-items: center; justify-content: center; z-index: 9999;
//               }
//               .otp-card {
//                 background: #fff; padding: 20px; border-radius: 12px; width: 380px;
//                 box-shadow: 0 10px 30px rgba(0,0,0,0.2);
//               }
//               .otp-title { margin: 0 0 10px 0; font-weight: 600; }
//               .otp-input {
//                 width: 100%; font-size: 18px; letter-spacing: 4px;
//                 padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px;
//               }
//               .otp-actions {
//                 margin-top: 12px;
//                 display: flex;
//                 flex-wrap: nowrap;
//                 justify-content: space-between; /* equal space between items */
//                 gap: 0;                         /* let space-between do the spacing */
//                 width: 100%;
//               }
//               .otp-verify-btn, .otp-resend-btn, .otp-cancel-btn {
//                 padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer;
//               }
//               .otp-verify-btn { background: #2563eb; color: #fff; }
//               .otp-resend-btn { background: #f59e0b; color: #111; }
//               .otp-cancel-btn { background: #e5e7eb; color: #111; }
//               .otp-verify-btn:disabled, .otp-resend-btn:disabled {
//                 opacity: 0.6; cursor: not-allowed;
//               }
//             `}</style>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
