import axios from "axios";
export const api = axios.create({
  // baseURL: `/api`,
  baseURL: `http://localhost:7805/api`,
});
// export const host = "/";
export const host = "http://localhost:7805";
