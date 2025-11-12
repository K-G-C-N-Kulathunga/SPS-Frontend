// import axios from "axios";

// const API_BASE_URLS = {
//   newApplicationServceApi:
//     "http://localhost:9091/sps-3.3.5/api",
// };

// const applicationServiceApi = axios.create({
//   baseURL: API_BASE_URLS.newApplicationServceApi,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });

// export const api = {
//   findApplicant: (idNo) => applicationServiceApi.get(`/applicants/${idNo}`),
//   fetchAreas: () => applicationServiceApi.get(`/cscNo/areas`),
//   fetchDepot: (deptId) =>
//     applicationServiceApi.get(`/cscNo/depots?deptId=${deptId}`),
//   // POST methods
//   createApplication: (payload) => {
//     console.log("Payload being sent:", payload); // Additional logging
//     return applicationServiceApi.post("/applications", payload);
//   },
// };

// // applicationServiceApi.interceptors.request.use((config) => {
// //   console.log("Sending request to:", config.url);
// //   console.log("Request payload:", config.data); // Logs POST data
// //   return config;
// // });

// // // Add response interceptor
// // applicationServiceApi.interceptors.response.use(
// //   (response) => response.data, // Directly return data
// //   (error) => {
// //     console.error("API Error:", {
// //       URL: error.config?.url,
// //       Method: error.config?.method,
// //       Status: error.response?.status,
// //       Error: error.message,
// //     });
// //     return Promise.reject(error);
// //   }
// // );

// apiService.js
import axios from "axios";

const username = "admin";
const password = "admin123";
const token = btoa(`${username}:${password}`);

export const api = axios.create({
  baseURL: "http://localhost:9090/sps/api",
  headers: {
    "Authorization": `Basic ${token}`,
    "Content-Type": "application/json",
  },
});
