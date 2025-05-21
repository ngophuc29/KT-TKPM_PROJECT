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
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2],
    credentials: true,
  },
});

// Middleware xử lý JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/base-url", (req, res) => {
  res.json({ baseUrl: `http://localhost:${port}` });
});

// Thiết lập socket.io để các controller có thể sử dụng
global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Sử dụng router
app.use(router);

server.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});
