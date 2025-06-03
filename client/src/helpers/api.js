import axios from "axios";

export const api = axios.create({
  baseURL: "https://zehat-server.marha.me",
  // baseURL: "http://localhost:3000",
});
