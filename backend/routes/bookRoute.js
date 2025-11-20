import express from "express";
import Book from "../models/bookModel.js";
import { upload } from "../middleware/uploadMiddlew.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Async handler to reduce repeated try/catch
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all books
router.get("/", asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
}));

// GET a single book
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
}));

// POST (Add book) with cover image upload
router.post("/", upload.single("coverImage"), asyncHandler(async (req, res) => {
  console.log("POST /books - req.body:", req.body);
  console.log("POST /books - req.file:", req.file);

  const { title, author, description, category, trending, oldPrice, newPrice, recommendedAge, bookLanguage } = req.body;
  // store filename only (frontend will prefix with /uploads/)
  const coverImage = req.file ? req.file.filename : null;

  if (!title || !author || !description || !category || oldPrice === undefined || !coverImage) {
    return res.status(400).json({ message: "Missing required fields: title, author, description, category, oldPrice, coverImage" });
  }

  const newBook = new Book({
    title,
    author,
    description,
    category,
    trending: trending === "true" || trending === true,
    oldPrice: Number(oldPrice),
    newPrice: newPrice ? Number(newPrice) : undefined,
    recommendedAge: Array.isArray(recommendedAge) ? recommendedAge : (recommendedAge ? [recommendedAge] : []),
    bookLanguage: Array.isArray(bookLanguage) ? bookLanguage : (bookLanguage ? [bookLanguage] : []),
    coverImage,
  });

  await newBook.save();
  res.status(201).json(newBook);
}));

// PUT (Update book) with optional cover image upload
router.put("/:id", upload.single("coverImage"), asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) updates.coverImage = req.file.filename;

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedBook) return res.status(404).json({ message: "Book not found" });
  res.json(updatedBook);
}));

// DELETE a book
router.delete("/:id", asyncHandler(async (req, res) => {
  const deletedBook = await Book.findByIdAndDelete(req.params.id);
  if (!deletedBook) return res.status(404).json({ message: "Book not found" });
  res.json({ message: "Book deleted successfully" });
}));

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});


export default router;
