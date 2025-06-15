import jwt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
    const token = jwt.sign({userId: userId._id}, process.env.JWT_SECRET,{
        expiresIn: "30d",
    })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie (XSS)
        sameSite : "strict", 
        secure: process.env.NODE_ENV !== "development", 
    })

    return token;
}