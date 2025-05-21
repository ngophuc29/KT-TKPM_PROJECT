const express = require("express");
const app = express();
const port = 4001;
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const router = require("./routers/index");

// Kết nối DB
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, "*"],
    credentials: true,
  },
});

// Middleware xử lý JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get("/base-url", (req, res) => {
  res.json({ baseUrl: `http://localhost:${port}` });
});

// Tracking connected clients
const connectedClients = new Map();

// Thiết lập socket.io để các controller có thể sử dụng
global.io = io;

// Fixed admin ID for testing
const ADMIN_ID = "admin-dashboard-123";

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    // Keep track of which socket is in which room
    if (!connectedClients.has(socket.id)) {
      connectedClients.set(socket.id, new Set());
    }
    connectedClients.get(socket.id).add(userId);

    socket.join(userId);
    console.log(`User ${userId} joined room`);

    // If this is our fixed admin ID, also join the 'admin' room
    if (userId === ADMIN_ID || userId === "admin") {
      socket.join("admin");
      console.log(`Admin joined admin room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Clean up our tracking
    connectedClients.delete(socket.id);
  });
});

// Sử dụng router
app.use(router);

// Test route to manually send a notification to the admin
app.post("/test-admin-notification", (req, res) => {
  const { orderId } = req.body;

  const testOrderId = orderId || "TEST-" + Math.floor(Math.random() * 10000);

  const adminNotification = {
    title: "Đơn hàng mới!",
    message: `Có đơn hàng mới (#${testOrderId}) vừa được đặt thành công.`,
    type: "admin_order",
    orderId: testOrderId,
    orderStatus: "pending",
    status: "unread",
    isRead: false,
    platform: "admin",
  };

  // Emit to both specific admin ID and general admin room
  io.to(ADMIN_ID).emit("admin_notification", adminNotification);
  io.to("admin").emit("admin_notification", adminNotification);

  res.json({ success: true, message: "Test notification sent to admin" });
});

server.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});
