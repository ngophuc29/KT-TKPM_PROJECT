const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routers/index");
const connectDB = require("./config/connectDB");

dotenv.config();
const app = express();
const port = process.env.PORT || 4004;

// Kết nối DB
connectDB();

// Danh sách origin được phép (bỏ dấu / cuối url nếu có)
const allowedOrigins = [
  (process.env.FRONTEND_URL || "http://localhost:2000").replace(/\/$/, ""),
  (process.env.FRONTEND_URL_2 || "http://localhost:5173").replace(/\/$/, ""),
  "https://kt-tkpm-project.vercel.app",
  "https://kt-tkpm-project-asa09y0ei-phuc-ngos-projects-529e4a42.vercel.app"
];

console.log("Allowed Origins:", allowedOrigins);


// Cấu hình CORS đúng với credentials: true
app.use(
  cors({
    origin: function (origin, callback) {
      // Nếu không có origin (vd: Postman, server-to-server), cho phép luôn
      if (!origin) return callback(null, true);

      // Nếu origin có trong danh sách, cho phép
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Nếu không thuộc danh sách, trả lỗi CORS
      return callback(new Error("CORS policy does not allow this origin."));
    },
    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware xử lý JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sử dụng router
app.use(router);

// Middleware xử lý lỗi CORS
app.use((err, req, res, next) => {
  if (err.message === "CORS policy does not allow this origin.") {
    return res.status(403).json({ error: "CORS policy blocked this request." });
  }
  next(err);
});

// Chạy server
app.listen(port, () => {
  console.log(`🚀 Server is running on portt ${port}`);
});
