const mongoose = require("mongoose");

async function connectDB() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection successful");
    });

    connection.on("error", (error) => {
      console.error("MongoDB connection unsuccessful", error);
    });
  } catch (error) {
    console.error("MongoDB connection unsuccessful", error);
    // process.exit(1);
  }
}

module.exports = connectDB;
