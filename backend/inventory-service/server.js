require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");
const inventoryRoutes = require("./routers/inventoryRoutes");
const cron = require('node-cron');
const inventoryController = require('./controller/inventoryController');
const app = express();
connectDB();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, 'http://localhost:2000', 'http://localhost:5173'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(inventoryRoutes);
cron.schedule('* * * * *', async () => {
  try {
    console.log("🔄 Cron job: Đồng bộ Inventory với Product Service mỗi phút...");
    await inventoryController.syncInventory({}, { json: console.log, status: () => ({ json: console.log }) });
  } catch (error) {
    console.error("🚨 Cron job lỗi khi đồng bộ Inventory:", error.message);
  }
});
// app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Inventory Service chạy trên cổng ${PORT}`));
