// import React, { useState } from "react";
// import { Link, useHistory } from "react-router-dom";
// import { useUser } from "../../context/UserContext";
// import axios from "axios";
// import { api } from '../../api';


// export default function Login() {
//   // Hardcoded user ID to allow login even if it's not present in DB
//   const HARDCODED_USER_ID = "423EE";

//   // Prefill the field with the hardcoded ID for convenience (user can still edit)
//   const [userId, setUserId] = useState(HARDCODED_USER_ID);
//   const [password, setPassword] = useState(""); // Field remains, but not used
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const history = useHistory();
//   const { setUserRole, setMainMenus } = useUser();

//   // const api = axios.create({
//   //   baseURL: "http://localhost:9090/sps/api",
//   //   headers: {
//   //     "Content-Type": "application/json",
//   //   },j
//   // });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!userId) {
//       setError("Please enter user ID.");
//       return;
//     }
//     try {
//       setLoading(true);
//       setError(null);

//       // If the entered user matches the hardcoded one, bypass API validation
//       if (userId.trim().toUpperCase() === HARDCODED_USER_ID) {
//         const userInfo = {
//           userId: HARDCODED_USER_ID,
//           // Choose a safe default role; other parts of the app don't enforce it currently
//           userLevel: "ADMIN",
//           rptUser: "",
//         };

//         setUserRole(userInfo.userLevel);

//         // Persist session according to user's choice
//         if (rememberMe) {
//           localStorage.setItem("user", JSON.stringify(userInfo));
//         } else {
//           sessionStorage.setItem("user", JSON.stringify(userInfo));
//         }

//         // Try to fetch menus for consistency; don't block login on failure
//         try {
//           const menuResponse = await api.get(`/login/main-menus?userId=${HARDCODED_USER_ID}`);
//           setMainMenus(Array.isArray(menuResponse.data) ? menuResponse.data : []);
//         } catch (menuErr) {
//           console.warn("Menu fetch failed for hardcoded user:", menuErr);
//           setMainMenus([]);
//         }

//         history.push("/admin/dashboard");
//         return; // Stop here; we've handled the hardcoded path
//       }

//       // Only use userId for login
//       const response = await api.get(`/login/info?userId=${userId}`);
//       const data = response.data;

//       if (!data.userLevel) {
//         setError("Invalid user ID.");
//         setLoading(false);
//         return;
//       }

//       setUserRole(data.userLevel);
//       const userInfo = {
//         userId: userId,
//         userLevel: data.userLevel,
//         rptUser: data.branchInfoList?.[0]?.deptId || "",
//       };

//       if (rememberMe) {
//         localStorage.setItem("user", JSON.stringify(userInfo));
//       } else {
//         sessionStorage.setItem("user", JSON.stringify(userInfo));
//       }

//       const menuResponse = await api.get(`/login/main-menus?userId=${userId}`);
//       setMainMenus(menuResponse.data);

//       history.push("/admin/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("An error occurred during login. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//       <>
//         <div className="container mx-auto px-4 h-full">
//           <div className="flex content-center items-center justify-center h-full">
//             <div className="w-full lg:w-4/12 px-4">
//               <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
//                 <div className="rounded-t mb-0 px-6 py-6">
//                   <div className="text-center mb-3">
//                     <h6 className="text-blueGray-500 text-sm font-bold">
//                       Sign in with
//                     </h6>
//                   </div>
//                   <div className="btn-wrapper text-center">
//                     <button
//                         className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
//                         type="button"
//                     >
//                       <img
//                           alt="..."
//                           className="w-5 mr-1"
//                           src={require("assets/img/github.svg").default}
//                       />
//                       Github
//                     </button>
//                     <button
//                         className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
//                         type="button"
//                     >
//                       <img
//                           alt="..."
//                           className="w-5 mr-1"
//                           src={require("assets/img/google.svg").default}
//                       />
//                       Google
//                     </button>
//                   </div>
//                   <hr className="mt-6 border-b-1 border-blueGray-300" />
//                 </div>
//                 <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
//                   <div className="text-blueGray-400 text-center mb-3 font-bold">
//                     <small>Or sign in with credentials</small>
//                   </div>
//                   {error && (
//                       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                         {error}
//                       </div>
//                   )}
//                   <form onSubmit={handleSubmit}>
//                     <div className="relative w-full mb-3">
//                       <label
//                           className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
//                           htmlFor="user-id"
//                       >
//                         User ID
//                       </label>
//                       <input
//                           id="user-id"
//                           type="text"
//                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//               placeholder={`User ID (${HARDCODED_USER_ID} for testing)`}
//                           value={userId}
//                           onChange={(e) => setUserId(e.target.value)}
//                           required
//                       />
//                     </div>

//                     <div className="relative w-full mb-3">
//                       <label
//                           className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
//                           htmlFor="password"
//                       >
//                         Password
//                       </label>
//                       <input
//                           id="password"
//                           type="password"
//                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                           placeholder="Password (es322 for testing)"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                       />
//                     </div>

//                     <div>
//                       <label className="inline-flex items-center cursor-pointer">
//                         <input
//                             id="remember-me"
//                             type="checkbox"
//                             className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
//                             checked={rememberMe}
//                             onChange={(e) => setRememberMe(e.target.checked)}
//                         />
//                         <span className="ml-2 text-sm font-semibold text-blueGray-600">
//                         Remember me
//                       </span>
//                       </label>
//                     </div>

//                     <div className="text-center mt-6">
//                       <button
//                           className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
//                           type="submit"
//                           disabled={loading}
//                       >
//                         {loading ? "Signing in..." : "Sign In"}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//               <div className="flex flex-wrap mt-6 relative">
//                 <div className="w-1/2">
//                   <Link
//                       to="/auth/forgot-password"
//                       className="text-blueGray-200"
//                   >
//                     <small>Forgot password?</small>
//                   </Link>
//                 </div>
//                 <div className="w-1/2 text-right">
//                   <Link to="/auth/register" className="text-blueGray-200">
//                     <small>Create new account</small>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//   );
// }







// import React, { useState } from "react";
// import { Link, useHistory } from "react-router-dom";
// import { useUser } from "../../context/UserContext";
// import axios from "axios";
// import { api } from '../../api';


// export default function Login() {
//   // Hardcoded user ID to allow login even if it's not present in DB
//   const HARDCODED_USER_ID = "423EE";

//   // Prefill the field with the hardcoded ID for convenience (user can still edit)
//   const [userId, setUserId] = useState(HARDCODED_USER_ID);
//   const [password, setPassword] = useState(""); // Field remains, but not used
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const history = useHistory();
//   const { setUserRole, setMainMenus } = useUser();

//   // const api = axios.create({
//   //   baseURL: "http://localhost:9090/sps/api",
//   //   headers: {
//   //     "Content-Type": "application/json",
//   //   },
//   // });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!userId) {
//       setError("Please enter user ID.");
//       return;
//     }
//     try {
//       setLoading(true);
//       setError(null);

//       // If the entered user matches the hardcoded one, bypass API validation
//       if (userId.trim().toUpperCase() === HARDCODED_USER_ID) {
//         const userInfo = {
//           userId: HARDCODED_USER_ID,
//           // Choose a safe default role; other parts of the app don't enforce it currently
//           userLevel: "ADMIN",
//           rptUser: "",
//         };

//         setUserRole(userInfo.userLevel);

//         // Persist session according to user's choice
//         if (rememberMe) {
//           localStorage.setItem("user", JSON.stringify(userInfo));
//         } else {
//           sessionStorage.setItem("user", JSON.stringify(userInfo));
//         }

//         // Try to fetch menus for consistency; don't block login on failure
//         try {
//           const menuResponse = await api.get(`/login/main-menus?userId=${HARDCODED_USER_ID}`);
//           setMainMenus(Array.isArray(menuResponse.data) ? menuResponse.data : []);
//         } catch (menuErr) {
//           console.warn("Menu fetch failed for hardcoded user:", menuErr);
//           setMainMenus([]);
//         }

//         history.push("/admin/dashboard");
//         return; // Stop here; we've handled the hardcoded path
//       }

//       // Only use userId for login
//       const response = await api.get(`/login/info?userId=${userId}`);
//       const data = response.data;

//       if (!data.userLevel) {
//         setError("Invalid user ID.");
//         setLoading(false);
//         return;
//       }

//       setUserRole(data.userLevel);
//       const userInfo = {
//         userId: userId,
//         userLevel: data.userLevel,
//         rptUser: data.branchInfoList?.[0]?.deptId || "",
//       };

//       if (rememberMe) {
//         localStorage.setItem("user", JSON.stringify(userInfo));
//       } else {
//         sessionStorage.setItem("user", JSON.stringify(userInfo));
//       }

//       const menuResponse = await api.get(`/login/main-menus?userId=${userId}`);
//       setMainMenus(menuResponse.data);

//       history.push("/admin/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("An error occurred during login. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//       <>
//         <div className="container mx-auto px-4 h-full">
//           <div className="flex content-center items-center justify-center h-full">
//             <div className="w-full lg:w-4/12 px-4">
//               <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
//                 <div className="rounded-t mb-0 px-6 py-6">
//                   <div className="text-center mb-3">
//                     <h6 className="text-blueGray-500 text-sm font-bold">
//                       Sign in with
//                     </h6>
//                   </div>
//                   <div className="btn-wrapper text-center">
//                     <button
//                         className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
//                         type="button"
//                     >
//                       <img
//                           alt="..."
//                           className="w-5 mr-1"
//                           src={require("assets/img/github.svg").default}
//                       />
//                       Github
//                     </button>
//                     <button
//                         className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
//                         type="button"
//                     >
//                       <img
//                           alt="..."
//                           className="w-5 mr-1"
//                           src={require("assets/img/google.svg").default}
//                       />
//                       Google
//                     </button>
//                   </div>
//                   <hr className="mt-6 border-b-1 border-blueGray-300" />
//                 </div>
//                 <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
//                   <div className="text-blueGray-400 text-center mb-3 font-bold">
//                     <small>Or sign in with credentials</small>
//                   </div>
//                   {error && (
//                       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                         {error}
//                       </div>
//                   )}
//                   <form onSubmit={handleSubmit}>
//                     <div className="relative w-full mb-3">
//                       <label
//                           className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
//                           htmlFor="user-id"
//                       >
//                         User ID
//                       </label>
//                       <input
//                           id="user-id"
//                           type="text"
//                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//               placeholder={`User ID (${HARDCODED_USER_ID} for testing)`}
//                           value={userId}
//                           onChange={(e) => setUserId(e.target.value)}
//                           required
//                       />
//                     </div>

//                     <div className="relative w-full mb-3">
//                       <label
//                           className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
//                           htmlFor="password"
//                       >
//                         Password
//                       </label>
//                       <input
//                           id="password"
//                           type="password"
//                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                           placeholder="Password (es322 for testing)"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                       />
//                     </div>

//                     <div>
//                       <label className="inline-flex items-center cursor-pointer">
//                         <input
//                             id="remember-me"
//                             type="checkbox"
//                             className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
//                             checked={rememberMe}
//                             onChange={(e) => setRememberMe(e.target.checked)}
//                         />
//                         <span className="ml-2 text-sm font-semibold text-blueGray-600">
//                         Remember me
//                       </span>
//                       </label>
//                     </div>

//                     <div className="text-center mt-6">
//                       <button
//                           className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
//                           type="submit"
//                           disabled={loading}
//                       >
//                         {loading ? "Signing in..." : "Sign In"}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//               <div className="flex flex-wrap mt-6 relative">
//                 <div className="w-1/2">
//                   <Link
//                       to="/auth/forgot-password"
//                       className="text-blueGray-200"
//                   >
//                     <small>Forgot password?</small>
//                   </Link>
//                 </div>
//                 <div className="w-1/2 text-right">
//                   <Link to="/auth/register" className="text-blueGray-200">
//                     <small>Create new account</small>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//   );
// }


















import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { api } from "../../api";

import { useUser } from "../../context/UserContext";
import edlLogo from "../../assets/img/edl-logo.png";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};


export default function Login() {
  const LOGIN_API_URL = "http://10.128.1.227:8080/SharedService/api/auth/login";
  const userId2 = "423EE";

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();
  const { setUserRole, setMainMenus } = useUser();



  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!userId) { setError("Please enter your User ID."); return; }
  //   if (!password) { setError("Please enter your password."); return; }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     // -- Hardcoded login --
  //     if (userId.trim().toUpperCase() === HARDCODED_USER.userId && password === HARDCODED_USER.password) {
  //       await new Promise(res => setTimeout(res, 800));
  //       const session = { ...SESSION_DATA, expiresAt: Date.now() + SESSION_DURATION };
  //       sessionStorage.setItem("cebSession", JSON.stringify(session));
  //       setUserRole(SESSION_DATA.userLevel);
  //       setMainMenus([]);
  //       history.push("/admin/dashboard");
  //       return;
  //     }

  //     // -- Wrong password for hardcoded user --
  //     if (userId.trim().toUpperCase() === HARDCODED_USER.userId && password !== HARDCODED_USER.password) {
  //       setError("Invalid password.");
  //       return;
  //     }

  //     // -- API login (only reaches here for non-hardcoded users) --
  //     const response = await api.get(`/login/info?userId=${userId.trim()}`);
  //     const data = response.data;

  //     if (!data.userLevel) { setError("Invalid User ID. Please try again."); return; }

  //     setUserRole(data.userLevel);
  //     const userInfo = {
  //       userId: userId.trim(),
  //       userLevel: data.userLevel,
  //       rptUser: data.branchInfoList?.[0]?.deptId || "",
  //     };
  //     rememberMe
  //       ? localStorage.setItem("user", JSON.stringify(userInfo))
  //       : sessionStorage.setItem("user", JSON.stringify(userInfo));

  //     try {
  //       const menuResponse = await api.get(`/login/main-menus?userId=${userId.trim()}`);
  //       setMainMenus(Array.isArray(menuResponse.data) ? menuResponse.data : []);
  //     } catch (menuErr) {
  //       console.warn("Menu fetch failed:", menuErr);
  //       setMainMenus([]);
  //     }

  //     history.push("/admin/dashboard");

  //   } catch (err) {
  //     console.error("Login error:", err);
  //     setError("An error occurred during login. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { setError("Please enter your EPF number."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    setError(null);

    try {
      const loginPayload = {
        epfNo: userId.trim(),
        password,
      };

      const response = await axios.post(LOGIN_API_URL, loginPayload, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      });

      console.log("Login API response:", response.data);

      if (response.status < 200 || response.status >= 300) {
        const backendMessage =
          response?.data?.message ||
          response?.data?.error ||
          response?.statusText ||
          "Login failed. Please check your credentials and try again.";
        setError(backendMessage);
        return;
      }

      const data = response?.data?.data || response?.data || {};
      const topStatus = String(response?.data?.status || data?.status || "").toUpperCase();
      const topSuccess = response?.data?.success ?? data?.success;
      const isSuccess =
        typeof topSuccess === "boolean"
          ? topSuccess
          : topStatus
            ? topStatus === "SUCCESS" || topStatus === "OK"
            : true;

      if (!isSuccess) {
        setError(data?.message || response?.data?.message || "Login failed. Please check your credentials and try again.");
        return;
      }

      // const responseUserId = String(data.userId || data.username || data.epfNo || userId || "").trim();
      // const responseUserId = "423EE";


      const responseUserId = String(data.userId || "").trim();
      const responseUserLevel = data.userLevel || data.role || "";
      const costCenter = String(data.costCenter || data.billingLevel || data.branchInfoList?.[0]?.deptId || "").trim();

      if (!responseUserId) {
        setError("Invalid login response. Please try again.");
        return;
      }

      setUserRole(responseUserLevel || "USER");
      const userInfo = {
        userId: responseUserId,
        userLevel: responseUserLevel || "USER",
        costCenter,
        billingLevel: String(data.billingLevel || costCenter || "").trim(),
        departmentType: data.departmentType || "",
        rptUser: data.rptUser || costCenter,
      };

      rememberMe
        ? localStorage.setItem("user", JSON.stringify(userInfo))
        : sessionStorage.setItem("user", JSON.stringify(userInfo));

      try {
        const menuResponse = await api.get(`/login/main-menus?userId=${encodeURIComponent(responseUserId)}`);
        console.log("Menu API response:", responseUserId);
        setMainMenus(toList(menuResponse.data));
        console.log("Main menus set:", toList(menuResponse.data));
      } catch (menuError) {
        console.error("Failed to fetch menus after login:", menuError);
        setMainMenus([]);
      }

      history.push("/admin/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      console.log("Login API error response:", err?.response?.data);
      setError(err?.response?.data?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };






  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800&display=swap');

        /* -- Consistent colour tokens -- */
        /* --t1  bright white  : input values, primary text     */
        /* --t2  soft silver   : labels, tagline, checkbox text */
        /* --t3  muted navy    : placeholders, divider, icons   */
        :root {
          --t1: #4B1F1F;
          --t2: #7A3B3B;
          --t3: #9A6A6A;
        }

        .ceb-page {
          position: fixed;
          inset: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          font-family: 'Barlow', sans-serif;
        }

        .ceb-dialog {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 390px;
          background: #FFF8F8;
          border: 1px solid rgba(128,0,0,0.22);
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(128,0,0,0.07),
            0 14px 36px rgba(96,0,0,0.16),
            0 4px 14px rgba(96,0,0,0.12);
          animation: popIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .ceb-accent-bar {
          height: 3px;
          background: linear-gradient(90deg, #5A0B0B 0%, #800000 50%, #A52A2A 100%);
        }

        .ceb-hdr {
          padding: 1.35rem 1.35rem 1.1rem;
          text-align: center;
          background: linear-gradient(180deg, rgba(128,0,0,0.08) 0%, transparent 100%);
          // border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ceb-emblem {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 74px;
          height: 74px;
          background: transparent;
          border-radius: 0;
          margin-bottom: 0.55rem;
          box-shadow: none;
        }

        .ceb-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .ceb-org {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 0.92rem;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: #800000;
          margin: 0 0 0.2rem;
        }

        .ceb-tagline {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--t2);
        }

        .ceb-body {
          padding: 1.15rem 1.35rem 1.2rem;
        }

        .ceb-rule {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.95rem;
          font-size: 0.56rem;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--t3);
        }
        .ceb-rule::before, .ceb-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(128,0,0,0.16);
        }

        .ceb-error {
          background: rgba(220,38,38,0.08);
          border: 1px solid rgba(220,38,38,0.25);
          border-left: 3px solid #DC2626;
          color: #FCA5A5;
          padding: 0.6rem 0.85rem;
          border-radius: 3px;
          font-size: 0.78rem;
          font-weight: 500;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: errShake 0.3s ease;
        }

        @keyframes errShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        .ceb-field { margin-bottom: 0.9rem; }

        .ceb-label {
          display: block;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--t2);
          margin-bottom: 0.4rem;
        }

        .ceb-input-wrap { position: relative; }

        .ceb-ico {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t3);
          pointer-events: none;
          transition: color 0.2s;
        }

        .ceb-input {
          width: 100%;
          padding: 0.68rem 0.9rem 0.68rem 2.4rem;
          background: #FFFFFF;
          border: 1px solid #E6C7C7;
          border-radius: 8px;
          color: var(--t1);
          font-family: 'Barlow', sans-serif;
          font-size: 0.86rem;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ceb-input::placeholder { color: var(--t3); font-weight: 400; }
        .ceb-input:focus {
          border-color: #800000;
          box-shadow: 0 0 0 3px rgba(128,0,0,0.14);
          background: #FFFFFF;
        }
        .ceb-input-wrap:focus-within .ceb-ico { color: #800000; }

        .ceb-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.4rem;
          cursor: pointer;
          user-select: none;
        }
        .ceb-chk {
          width: 15px;
          height: 15px;
          accent-color: #800000;
          cursor: pointer;
          flex-shrink: 0;
        }
        .ceb-chk-lbl {
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--t2);
          cursor: pointer;
        }

        .ceb-btn {
          width: 100%;
          padding: 0.7rem 1.2rem;
          background: #800000;
          color: #FFFFFF;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          box-shadow: 0 6px 18px rgba(128,0,0,0.25);
        }
        .ceb-btn:hover:not(:disabled) {
          background: #9A2323;
          box-shadow: 0 8px 24px rgba(128,0,0,0.34);
          transform: translateY(-1px);
        }
        .ceb-btn:active:not(:disabled) { transform: translateY(0); }
        .ceb-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ceb-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.34);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ceb-footer {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1.35rem 0.9rem;
          border-top: 1px solid rgba(128,0,0,0.12);
        }
        .ceb-flink {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--t3);
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: color 0.2s;
        }
        .ceb-flink:hover { color: #800000; }

        .ceb-copy {
          text-align: center;
          margin-top: 0.8rem;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #9A6A6A;
          font-family: 'Barlow', sans-serif;
        }
      `}</style>

      <div className="ceb-page">
        <div style={{ width: "100%", maxWidth: "390px", padding: "0 0.9rem" }}>
          <div className="ceb-dialog">
            <div className="ceb-accent-bar" />

            <div className="ceb-hdr">
              <div className="ceb-emblem">
                <img
                  className="ceb-logo"
                  src={edlLogo}
                  alt="EDL logo"
                />
              </div>
              <p className="ceb-org">Electricity Distribution Lanka</p>
            </div>

            <div className="ceb-body">
              <div className="ceb-rule">Sign in with credentials</div>

              {error && (
                <div className="ceb-error">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6" stroke="#DC2626" />
                    <path d="M6.5 3.5v3M6.5 9v.5" stroke="#FCA5A5" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ceb-field">
                  <label className="ceb-label" htmlFor="user-id">EPF Number</label>
                  <div className="ceb-input-wrap">
                    <span className="ceb-ico">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 12.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="user-id"
                      type="text"
                      className="ceb-input"
                      placeholder="Enter your EPF number"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="ceb-field">
                  <label className="ceb-label" htmlFor="password">Password</label>
                  <div className="ceb-input-wrap">
                    <span className="ceb-ico">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                    {/* <input
                      id="password"
                      type="password"
                      className="ceb-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    /> */}


                    <input
                      id="password"
                      type="password"
                      className="ceb-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />


                  </div>
                </div>

                <label className="ceb-row">
                  <input
                    type="checkbox"
                    className="ceb-chk"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ceb-chk-lbl">Keep me signed in</span>
                </label>

                <button className="ceb-btn" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="ceb-spinner" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M12 7H5M9.5 4L12 7 9.5 10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12h3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="ceb-footer">
              <Link to="/auth/forgot-password" className="ceb-flink">Forgot password?</Link>
              <Link to="/auth/register" className="ceb-flink">Create account</Link>
            </div>
          </div>

          <div className="ceb-copy">
            &copy; {new Date().getFullYear()} Electricity Distribution Lanka
          </div>
        </div>
      </div>
    </>
  );
}