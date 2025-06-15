import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async(req,res,next) => {
    try {
        // console.log("cookies : ", req.cookies);
        const token = req.cookies?.jwt; // Get the token from the cookies (utils.js -> cookie jwt if there is x then call x )
        
        if(!token) {
            return res.status(401).json({message: "Unauthorized - Token not found"})
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); 
        if(!decodedToken) {
            return res.status(401).json({message: "Unauthorized - Invalid token"})
        }

        const user = await User.findById(decodedToken.userId).select("-password"); // Find the user by ID and exclude the password field

        if(!user) {
            return res.status(401).json({message: "Unauthorized - User not found"})
        }

        req.user = user;

        next(); // Call the next middleware or route handler
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
};