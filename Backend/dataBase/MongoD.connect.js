import mongoose from "mongoose";
// console.log(process.env.MONGODB_URI)

const connectMongodb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB", connection.connection.host)

  } catch (error) {
    console.error("Error while connecting",error);
    process.exit(1)
  }
};

export default connectMongodb