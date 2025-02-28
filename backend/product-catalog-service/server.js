const express = require("express");
const app = express();
const port = 4004;
const router = require("./routers/index");
const cors = require("cors");
const connectDB = require("./config/connectDB");
require("dotenv").config();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
