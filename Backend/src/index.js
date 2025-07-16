import express from "express"; // type - module 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"; // cors error resolve - different port or domains for frontend and backend

import {connectDB} from "./lib/db.js";

import authRoutes from "./routes/auth.route.js"; // for local files we need to put .js bcoz we are using type - module 
import messageRoutes from "./routes/message.route.js";

dotenv.config();
const app = express();

const PORT=process.env.PORT;

// Increase the payload size limits for handling image uploads
app.use(express.json({ limit: '50mb' })); // Increased from default ~100kb to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also handle URL-encoded data

app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port: ${PORT}`);
    connectDB();
});