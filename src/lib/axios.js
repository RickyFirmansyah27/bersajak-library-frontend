import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://bersajak-library-frontend.vercel.app/api",
    timeout: 10000,
    timeoutErrorMessage: "Request Timeout"
});

export default axiosInstance;
