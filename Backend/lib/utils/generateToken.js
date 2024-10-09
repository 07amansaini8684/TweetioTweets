import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

// Make sure your JWT_SECRET is set correctly in your environment
// console.log("cannot find it in gentoken",process.env.JWT_SECRET);

export const generateTokenCookie = (userId, res) => {
  // Correct the usage of the JWT_SECRET
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("jwtToken", token, {
    httpOnly: true, // prevent XSS attacks
    maxAge: 3 * 24 * 60 * 60 * 1000, // In milliseconds
    sameSite: "strict", // CSRF attacks prevention
    // secure: process.env.NODE_ENV !== "development", // Secure cookies in production
  });
}
