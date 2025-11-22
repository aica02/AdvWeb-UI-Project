import User from "../models/userModel.js";
import Book from "../models/bookModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const price = book.onSale ? book.newPrice : book.oldPrice;

    if (!user.cart) user.cart = [];

    const existingItem = user.cart.find(i => i.bookId.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = price;
    } else {
      user.cart.push({
        bookId,
        quantity,
        price,
        title: book.title,
        author: book.author,
        image: book.coverImage,
      });
    }

    await user.save();
    res.json({ cart: user.cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart.bookId",
      select: "title author oldPrice newPrice onSale stock coverImage",
    });

    if (!user || !user.cart) return res.json({ books: [], totalAmount: 0 });

    const books = user.cart.map(item => {
      const bookData = item.bookId;
      const price = bookData?.onSale ? bookData.newPrice : bookData?.oldPrice || item.price;

      return {
        book: {
          id: bookData?._id || item.bookId,
          title: bookData?.title || item.title,
          author: bookData?.author || item.author,
          price,
          stock: bookData?.stock || 0,
          image: bookData?.coverImage || item.image,
        },
        quantity: item.quantity,
        outOfStock: bookData?.stock === 0,
      };
    });

    const totalAmount = books.reduce((sum, i) => sum + (i.book.price || 0) * i.quantity, 0);

    res.json({ books, totalAmount });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CART QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || !user.cart) return res.status(404).json({ message: "Cart not found" });

    const item = user.cart.find(i => i.bookId.toString() === bookId);
    if (!item) return res.status(404).json({ message: "Book not found in cart" });

    const book = await Book.findById(bookId);
    if (book) item.price = book.onSale ? book.newPrice : book.oldPrice;

    item.quantity = quantity;
    await user.save();

    res.json({ cart: user.cart });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user || !user.cart) return res.status(404).json({ message: "Cart not found" });

    user.cart = user.cart.filter(i => i.bookId.toString() !== bookId);
    await user.save();

    res.json({ cart: user.cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CHECKOUT CART
export const checkoutCart = async (req, res) => {
  try {
    const { selectedBookIds, paymentMethod } = req.body;
    if (!selectedBookIds || !Array.isArray(selectedBookIds) || selectedBookIds.length === 0) {
      return res.status(400).json({ message: "No selected items" });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.cart || user.cart.length === 0)
      return res.status(400).json({ message: "Your cart is empty." });

    const items = user.cart.filter(i => selectedBookIds.includes(i.bookId.toString()));
    if (items.length === 0) return res.status(400).json({ message: "No selected items in cart" });

    // Check stock
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book || book.stock < item.quantity)
        return res.status(400).json({ message: `${item.title} stock insufficient` });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = 100;

    const order = new Order({
      user: user._id,
      books: items.map(i => ({
        book: i.bookId,
        quantity: i.quantity,
        price: i.price,
        title: i.title,
        author: i.author,
        image: i.image,
      })),
      totalAmount: subtotal + shippingFee,
      paymentMethod: paymentMethod || "Card",
      status: "Pending",
    });

    await order.save();

    // Remove checked out items from cart
    user.cart = user.cart.filter(i => !selectedBookIds.includes(i.bookId.toString()));
    await user.save();

    res.json({ message: "Order placed", order });
  } catch (error) {
    console.error("Checkout cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if the order belongs to the user
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to cancel this order" });
    }

    // Prevent cancellation if already complete or cancelled
    if (order.status === "Complete") {
      return res.status(400).json({ message: "Cannot cancel a completed order" });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Optional: enforce a time limit (e.g., 10 seconds) for cancellations
    const createdTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    if (now - createdTime > 10000) {
      return res.status(400).json({ message: "Cancellation period has expired" });
    }

    // Update order status to Cancelled
    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PENDING ORDERS
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: "Pending" }).populate(
      "books.book"
    );
    res.json(orders);
  } catch (error) {
    console.error("Get pending orders error:", error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// GET COMPLETED ORDERS
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: "Complete" })
      .populate("books.book")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get completed orders error:", error);
    res.status(500).json({ message: "Failed to fetch completed orders" });
  }
};
