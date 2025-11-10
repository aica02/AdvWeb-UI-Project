const express = require('express');
const Book = require('../models/bookModel');
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook } = require('./../controllers/bookController');
const { protect } = require('../middleware/authMiddlew');
const router =  express.Router();

// frontend => backend server => controller => book schema  => database => send to server => back to the frontend


router.post("/create-book", protect, postABook)

router.get("/", getAllBooks);

router.get("/:id", getSingleBook);

router.put("/edit/:id", protect, UpdateBook);

router.delete("/:id", protect, deleteABook)

module.exports = router;