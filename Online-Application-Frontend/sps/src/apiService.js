import axios from "axios";

// Retrieve encrypted credentials from environment variables
const encryptedUsername = process.env.REACT_APP_ENCRYPTED_USERNAME;
const encryptedPassword = process.env.REACT_APP_ENCRYPTED_PASSWORD;

// Decrypt the credentials (example assumes Base64 encoding for simplicity)
const username = atob(encryptedUsername);
const password = atob(encryptedPassword);

const token = btoa(`${username}:${password}`);

const SPS_BASE_URL = process.env.REACT_APP_SPS_API_BASE;
export const api = axios.create({
  baseURL: `${SPS_BASE_URL}/sps/api`,
  headers: {
    Authorization: `Basic ${token}`,
  },
});
