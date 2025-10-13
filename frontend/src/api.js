import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:5000" });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers['x-access-token'] = localStorage.getItem('token');
  }
  return req;
});

export const login = (userData) => API.post("/api/login", userData);
export const register = (userData) => API.post("/api/register", userData);

export default API;
