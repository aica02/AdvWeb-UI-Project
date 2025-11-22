

import mongoose from "mongoose";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Book from "../models/bookModel.js"; // Import Book model for stock validation
import eventEmitter from "../utils/eventEmitter.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity, price, title, author, image } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.cart) user.cart = [];

    const existing = user.cart.find(
      (item) => item.bookId.toString() === bookId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ bookId, quantity, price, title, author, image });
    }

    await user.save();

    // Emit cart updated event
    eventEmitter.emit("cartUpdated", { userId: req.user._id, cart: user.cart });

    res.json({ cart: user.cart });

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CART (Pending items)
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.bookId");

    if (!user || !user.cart)
      return res.json({ books: [], totalAmount: 0 });

    const books = user.cart.map((item) => ({
      book: item.bookId,
      price: item.price,
      quantity: item.quantity,
      title: item.title,
      author: item.author,
      image: item.image,
      outOfStock: item.bookId.stock === 0 // Add stock status
    }));

    const totalAmount = books.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    res.json({ books, totalAmount });

  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CART QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || !user.cart) return res.status(404).json({ message: "No cart found" });

    const item = user.cart.find(
      (i) => i.bookId.toString() === bookId
    );

    if (!item) return res.status(404).json({ message: "Book not found in cart" });

    item.quantity = quantity;
    await user.save();

    res.json({ cart: user.cart });

  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user || !user.cart)
      return res.status(404).json({ message: "Cart not found" });

    const idx = user.cart.findIndex(
      (item) => item.bookId.toString() === bookId
    );

    if (idx === -1)
      return res.status(404).json({ message: "Book not in cart" });

    user.cart.splice(idx, 1);
    await user.save();

    res.json({ cart: user.cart });

  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHECKOUT SELECTED ITEMS
export const checkoutCart = async (req, res) => {
  const userId = req.user._id;
  const { selectedBookIds, paymentMethod, status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.cart || user.cart.length === 0)
      return res.status(400).json({ message: "Your cart is empty." });

    // Filter selected items only
    const booksToCheckout = user.cart.filter((item) =>
      selectedBookIds.includes(item.bookId.toString())
    );

    if (!booksToCheckout.length) {
      return res.status(400).json({ message: "No selected books to checkout." });
    }

    // Validate stock availability
    for (const item of booksToCheckout) {
      const book = await Book.findById(item.bookId);
      if (!book || book.stock < item.quantity) {
        return res.status(400).json({
          message: `Book '${item.title}' is out of stock or insufficient stock.`
        });
      }
    }

    const subtotal = booksToCheckout.reduce(
      (sum, item) =>
        sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const shippingFee = 100;

    // Create new order
    const newOrder = new Order({
      user: userId,
      books: booksToCheckout.map((item) => ({
        book: item.bookId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        author: item.author,
        image: item.image
      })),
      totalAmount: subtotal + shippingFee,
      paymentMethod: paymentMethod || "Card",
      status: status || "Pending",
    });

    await newOrder.save();

    // Remove purchased items from cart
    user.cart = user.cart.filter(
      (item) => !selectedBookIds.includes(item.bookId.toString())
    );

    await user.save();

    // Emit checkout event
    eventEmitter.emit("checkoutCompleted", { userId, order: newOrder });

    res.status(200).json({
      message: "Order placed successfully!",
      order: newOrder
    });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET PENDING ORDERS
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: "Pending",
    }).populate("books.book");

    res.json(orders);

  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// GET COMPLETED ORDERS
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: "Complete",
    })
      .populate("books.book")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error("Error fetching completed orders:", err);
    res.status(500).json({ message: "Failed to fetch completed orders" });
  }
};
