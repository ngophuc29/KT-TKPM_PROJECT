const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:2000",
        "http://localhost:5173",
        "https://kt-tkpm-project.vercel.app"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
