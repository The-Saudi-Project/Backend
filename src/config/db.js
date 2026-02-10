import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    mongoose.connection.once("open", () => {
      console.log("✅ Connected to DB:", mongoose.connection.name);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
