import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import xss from "xss";
import authRoutes from "./routes/authRoutes.js";
// import bookRoutes from './src/books/book.route.js';
// import orderRoutes from './src/orders/order.route.js';
// import userRoutes from './src/users/user.route.js';
// import adminRoutes from './src/stats/admin.stats.js';

dotenv.config();
const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
// app.use("/api/books", bookRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/auth", userRoutes)
// app.use("/api/admin", adminRoutes)

// --- Custom XSS Sanitizer ---
app.use((req, res, next) => {
  const sanitizeXSS = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = xss(obj[key]);
      }
    }
  };
  if (req.body) sanitizeXSS(req.body);
  if (req.query) sanitizeXSS(req.query);
  next();
});

// --- Custom MongoDB Sanitizer ---
const sanitizeMongo = (obj) => {
  for (const key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeMongo(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeMongo(req.body);
  if (req.query) sanitizeMongo(req.query);
  if (req.params) sanitizeMongo(req.params);
  next();
});

// --- DB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// --- Routes ---
app.use("/api/auth", authRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
