import axios from "axios";

export const axiosInstance= axios.create(
    {
        baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://real-time-chat-app-vn8i.onrender.com/api",
        withCredentials: true , // send cookie with every request 
    }
)