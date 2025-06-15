import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

// CORS middleware (must be at the top)
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow cookies and credentials
  })
);

// Middleware to parse JSON and cookies
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port ✅" + PORT);
  connectDB();

  // console.log("Database connected successfully!");
});
