require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");
const inventoryRoutes = require("./routers/inventoryRoutes");

const app = express();
connectDB();

app.use(
  cors({
    origin: process.env.FONTEND_URL || "*", // Nếu không có biến môi trường, cho phép tất cả
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use( inventoryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Inventory Service chạy trên cổng ${PORT}`));
