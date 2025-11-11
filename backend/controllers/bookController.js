import Book from "../models/bookModel.js";
import fs from "fs";
import path from "path";

// POST a book
export const postABook = async (req, res) => {
  try {
    const newBook = new Book({
      ...req.body,
      coverImage: "", // will update if file is uploaded
    });

    await newBook.save();

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `${newBook._id}${ext}`;
      const uploadsDir = path.join(path.resolve(), "uploads"); // ensure we save inside /uploads

      // make sure uploads folder exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      const newPath = path.join(uploadsDir, newFilename);

      // move file to uploads/
      fs.renameSync(req.file.path, newPath);

      // save only filename in DB
      newBook.coverImage = newFilename;
      await newBook.save();
    }

    res.status(201).json({ message: "Book posted successfully", book: newBook });
  } catch (error) {
    console.error("Error creating book", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};


// GET all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

// GET a single book
export const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

// UPDATE a book
export const updateBook = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `${req.params.id}${ext}`;
      const uploadsDir = path.join(path.resolve(), "uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      const newPath = path.join(uploadsDir, newFilename);
      fs.renameSync(req.file.path, newPath);

      updates.coverImage = newFilename; // store only filename
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Error updating book", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

// DELETE a book
export const deleteABook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully", id: deletedBook.id });
  } catch (error) {
    console.error("Error deleting book", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
