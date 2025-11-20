import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import xss from "xss";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoute.js";
import bookRoutes from "./routes/bookRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import logRoutes from "./routes/logRoute.js";
import wishlistRoutes from "./routes/wishlistRoute.js";
import { trackVisit } from "./middleware/visitMiddlew.js";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//  Middleware 
app.use(helmet());
app.use(cors());
app.use(express.json());


//  Custom XSS Sanitizer 
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

//  Custom MongoDB Sanitizer 
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

//  DB Connection 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/logs", logRoutes);
app.use(trackVisit);


// Serve static uploads
app.use("/uploads", express.static(path.join(path.resolve(),  "uploads")));

// Start Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
