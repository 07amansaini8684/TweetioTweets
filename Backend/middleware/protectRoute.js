import User from "../models/UserModel.js";
import jwt from "jsonwebtoken"

// console.log("jwt token",process.env.JWT_SECRET)
// console.log("enviroment", process.env.NODE_ENV)

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, Token not found ||suspicious" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized, Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in the protectRoute middleware",error);
    res.status(401).json({ msg: "Please login to access this route, or it may be internal server error who know's" });
  }
};
