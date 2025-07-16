import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const payload = { userId }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000, //Milliseconds
        httpOnly:true, //prevent XSS attacks cross-site scripting attacks-- more secure
        sameSite: "strict", //CSRF attacks cross-site request foggery attacks
        secure: process.env.NODE_ENV!=="development",
    })
    return token;
}

export const validateToken = (token) => {
    const userId=jwt.verify(token,process.env.JWT_SECRET);
    return userId;

}