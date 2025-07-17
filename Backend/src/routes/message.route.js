import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/users",protectRoute, getUsersForSidebar);
router.get("/conversation/:id",protectRoute,getMessages);

router.post("/send/:id", protectRoute , sendMessage);

export default router;