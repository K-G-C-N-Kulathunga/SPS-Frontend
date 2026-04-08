import axios from "axios";

// Create a simple Axios instance that sends all requests to /sps/api
// Nginx will add the Basic Auth header before forwarding to the backend.
export const api = axios.create({
  baseURL: "/sps/api",
});