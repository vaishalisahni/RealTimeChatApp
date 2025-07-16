import { validateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const protectRoute=async(req,res,next)=>{
    try {
        const token= req.cookies?.jwt;
        if(!token)
        {
            return res.status(400).json({message:"Unauthorized - No token provided"});
        }

        const decoded=validateToken(token);
        if(!decoded)
        {
            return res.status(400).json({message:"Unauthorized - Invalid token"});
        }

        const user= await User.findById(decoded.userId).select("-password");

        if(!user)
        {
            return res.status(404).json({message:"User not found"});
        }

        req.user=user;
        return next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}