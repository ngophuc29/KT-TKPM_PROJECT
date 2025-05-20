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

// Danh sách origin được phép
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:2000",
  process.env.FRONTEND_URL_2 || "http://localhost:5173",
  "https://kt-tkpm-project.vercel.app",
  "https://kt-tkpm-project-asa09y0ei-phuc-ngos-projects-529e4a42.vercel.app"
];


console.log("Allowed Origins:", allowedOrigins);

// // Cấu hình CORS
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("CORS policy does not allow this origin."));
//       }
//     },
//     credentials: true,
//   })
// );

 app.use(
  cors({
    origin: "*", // Cho phép mọi origin
    credentials: false, // KHÔNG dùng credentials khi origin là "*"
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
  console.log(`🚀 Server is running on port ${port}`);
});
