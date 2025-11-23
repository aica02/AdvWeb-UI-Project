import express from 'express';
import User from '../models/userModel.js';
import Book from '../models/bookModel.js';
import { protect } from '../middleware/authMiddlew.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist || []);
  } catch (err) {
    console.error('Error fetching wishlist', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'bookId required' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent duplicates
    if (!user.wishlist) user.wishlist = [];
    const exists = user.wishlist.find((id) => id.toString() === bookId.toString());
    if (!exists) user.wishlist.push(bookId);

    await user.save();
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json(populated.wishlist);
  } catch (err) {
    console.error('Error adding to wishlist', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/remove/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = (user.wishlist || []).filter((id) => id.toString() !== bookId.toString());
    await user.save();
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json(populated.wishlist);
  } catch (err) {
    console.error('Error removing from wishlist', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
