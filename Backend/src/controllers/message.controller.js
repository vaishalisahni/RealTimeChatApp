import User from "../models/user.model.js"
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ id: { $ne: loggedInUserId } }).select("-password"); // ne--> not equal

        res.status(200).json(filteredUsers);
    }
    catch (error) {
        console.log("Error in getUsersForSideBar Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {

    try {
        const userToChatId = req.params.id;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage= async(req,res)=>{
    try {
        const {text,image} = req.body;
        const receiverId=req.params.id;
        const senderId= req.user._id;

        let imageUrl;
        if(image)
        {
            // upload base64 img to cloudinary
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        })
        await newMessage.save();

        // todo:real time functionality => socket.io

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

