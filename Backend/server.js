// console.log("it's working")
/// all the packages 
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary } from "cloudinary"

// all the routes 
import authRoutes from "./routes/auth.routes.js"; 
import userRoutes from "./routes/user.routes.js"; 
import postRoutes from "./routes/posts.routes.js"
import notificationRoutes from "./routes/notification.routes.js"



import connectMongodb from "./dataBase/MongoD.connect.js";

// Load environment variables
dotenv.config({path : ".env"});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET

})
// console.log("name",process.env.CLOUDINARY_CLOUD_NAME)
// console.log("key",process.env.CLOUDINARY_API_KEY)
// console.log("secret",process.env.CLOUDINARY_API_SECRET)


const app = express();
const PORT = process.env.PORT || 8020;

app.use(express.json({limit: "5mb"})); // to parse req.body
// limit shouldn't be to high to prevent DOs
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded) 
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notification", notificationRoutes)

// Debugging: log the values of your environment variables
// console.log("JWT_SECRET:", process.env.JWT_SECRET); // Should log the secret if set
// console.log("MongoDB URI:", process.env.MONGODB_URI); // Check the MongoDB URI

// Connection to MongoDB and starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongodb();
});
