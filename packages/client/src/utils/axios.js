import Axios from "axios";
import { makeUseAxios } from "axios-hooks";

// Use environment variable for API URL, fallback to relative path for dev
const API_URL = process.env.REACT_APP_API_URL || '';

const axios = Axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const useAxios = makeUseAxios({ axios });

export {
  useAxios,
  axios,
};
