import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import { generateTokenCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // if (!emailRegex.test(email)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid email, check the format" });
    // }

    const userExist = await User.findOne({ email, username });
    if (userExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    if (password.length < 5) {
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error("SignUp controller", error);
    res.status(500).json({ message: "Error signing up user" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid username or email, user not found " });
    }
    const isValidPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "Invalid password or username or email i am not going to tell you, are you the Real owner??" });
    }
    generateTokenCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
       message: "Congratulation , You are successfully logged In"
    });
  } catch (error) {
    console.error("Login controller", error);
    res.status(500).json({ message: "Error Login up user" });
  }
};
export const logout = async (req, res) => {
    try {
        res.cookie("jwtToken", "",{maxAge:0})
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout controller", error);
        res.status(500).json({ message: "Error logout user" });
    }
};

export const getMe = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
      console.error("Get me controller", error);
      res.status(500).json({ message: "Error get user, Internal error" });        
    }
}