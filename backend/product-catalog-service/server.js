const express = require("express");
const app = express();
const port = 4004;
const router = require("./routers/index");
const cors = require("cors");
const connectDB = require("./config/connectDB");
require("dotenv").config();


// Kết nối MongoDB từ .env
connectDB();

app.use(
  cors({
    origin: process.env.FONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
