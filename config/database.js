import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongodb connected with ${connection.host}`.brightCyan);
  } catch (error) {
    console.log(error.message);
  }
};
