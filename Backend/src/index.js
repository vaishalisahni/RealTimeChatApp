import express from "express"; // type - module 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"; // cors error resolve - different port or domains for frontend and backend

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js"; // for local files we need to put .js bcoz we are using type - module 
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT||5001;
const __dirname = path.resolve();

// console.log("NODE_ENV:", process.env.NODE_ENV);

// Increase the payload size limits for handling image uploads
app.use(express.json({ limit: '50mb' })); // Increased from default ~100kb to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also handle URL-encoded data

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});