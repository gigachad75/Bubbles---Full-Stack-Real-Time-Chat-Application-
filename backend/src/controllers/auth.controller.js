import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
// import { v2 as cloudinary } from "cloudinary";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }
    //Check the length of password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  try {
    const { profilePic } = req.body;
    // const { profilePic } = req?.body || {};
    if (!profilePic) {
      return res.status(400).json({
        message: "Profile Pic is required",
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilePic);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError.message);
      return res
        .status(500)
        .json({ message: "Failed to upload profile picture" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse?.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({
      message: "User is authenticated",
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
