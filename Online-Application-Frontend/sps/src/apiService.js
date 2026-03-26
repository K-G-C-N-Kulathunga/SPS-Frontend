// import axios from "axios";

// const username = "admin";
// const password = "admin123";
// const token = btoa(`${username}:${password}`);

// export const api = axios.create({
//   // baseURL: "http://10.128.1.227:8086/sps/api",
//   baseURL: "http://localhost:9090/sps/api",
//   headers: {
//     "Authorization": `Basic ${token}`
//   },
// });


import axios from "axios";

const username = "admin";
const password = "admin123";
const token = btoa(`${username}:${password}`);


const SPS_BASE_URL = process.env.REACT_APP_SPS_API_BASE;
export const api = axios.create({
  baseURL: `${SPS_BASE_URL}/sps/api`,
  headers: {
    Authorization: `Basic ${token}`,
  },
});
