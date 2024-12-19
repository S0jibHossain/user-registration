const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {

    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      console.error("MongoDB URI is missing in the environment variables!");
      return;
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

module.exports = connectDB;
