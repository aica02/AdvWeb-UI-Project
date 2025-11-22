import express from "express";
import Book from "../models/bookModel.js";
import Log from "../models/logModel.js";
import { upload } from "../middleware/uploadMiddlew.js";
import { protect, adminOnly } from "../middleware/authMiddlew.js";
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
router.post("/", protect, adminOnly, upload.single("coverImage"), asyncHandler(async (req, res) => {
  console.log("POST /books - req.body:", req.body);
  console.log("POST /books - req.file:", req.file);

  const { title, author, description, category, trending, onSale, oldPrice, newPrice, recommendedAge, bookLanguage, stock } = req.body;
  // store filename only (frontend will prefix with /uploads/)
  const coverImage = req.file ? req.file.filename : null;

  if (!title || !author || !description || !category || oldPrice === undefined || !coverImage) {
    return res.status(400).json({ message: "Missing required fields: title, author, description, category, oldPrice, coverImage" });
  }

  const normalizedCategory = Array.isArray(category) ? category : (category ? [category] : []);
  const newBook = new Book({
    title,
    author,
    description,
    category: normalizedCategory,
    trending: trending === "true" || trending === true,
    onSale: onSale === "true" || onSale === true,
    oldPrice: Number(oldPrice),
    newPrice: newPrice ? Number(newPrice) : undefined,
    recommendedAge: Array.isArray(recommendedAge) ? recommendedAge : (recommendedAge ? [recommendedAge] : []),
    bookLanguage: Array.isArray(bookLanguage) ? bookLanguage : (bookLanguage ? [bookLanguage] : []),
    coverImage,
    stock: stock !== undefined ? Number(stock) : 0,
  });

  await newBook.save();
  try {
    await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: 'Added book', meta: { bookId: newBook._id, title: newBook.title } });
  } catch (e) { console.error('Log error:', e); }

  res.status(201).json(newBook);
}));

// PUT (Update book) with optional cover image upload
router.put("/:id", protect, adminOnly, upload.single("coverImage"), asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) updates.coverImage = req.file.filename;

  // Normalize category and numeric fields
  if (updates.category) {
    updates.category = Array.isArray(updates.category) ? updates.category : [updates.category];
  }
  if (updates.oldPrice !== undefined) updates.oldPrice = Number(updates.oldPrice);
  if (updates.newPrice !== undefined) updates.newPrice = Number(updates.newPrice);
  if (updates.onSale !== undefined) updates.onSale = (updates.onSale === 'true' || updates.onSale === true);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedBook) return res.status(404).json({ message: "Book not found" });
  try {
    await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: 'Updated book', meta: { bookId: updatedBook._id, title: updatedBook.title } });
  } catch (e) { console.error('Log error:', e); }

  res.json(updatedBook);
}));

// DELETE a book
router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  const deletedBook = await Book.findByIdAndDelete(req.params.id);
  if (!deletedBook) return res.status(404).json({ message: "Book not found" });
  try {
    await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: 'Deleted book', meta: { bookId: deletedBook._id, title: deletedBook.title } });
  } catch (e) { console.error('Log error:', e); }
  res.json({ message: "Book deleted successfully" });
}));

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});


export default router;
