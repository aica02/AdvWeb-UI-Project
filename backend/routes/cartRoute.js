import express from "express";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Book from "../models/bookModel.js";
import Log from "../models/logModel.js";
import { adminOnly } from "../middleware/authMiddlew.js";
import { protect } from "../middleware/authMiddlew.js";
import { getPendingOrders, getCompletedOrders } from "../controllers/cartController.js"; 

const router = express.Router();

/* ---------------- Add book to cart (Pending Order) ---------------- */
// Add to cart (Update or Create Order)
router.post("/add", protect, async (req, res) => {
  try {
    const { bookId, price, quantity, title, author, image } = req.body;
    const userId = req.user._id;

    if (!bookId || !price || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid book data" });
    }

    // Find pending order or create new
    let order = await Order.findOne({ user: userId, status: "Pending" });

    if (!order) {
      // Create new order if no pending order exists
      order = new Order({
        user: userId,
        books: [{ book: bookId, quantity, price, title, author, image }],
        totalAmount: price * quantity,
      });
    } else {
      // Enforce cart limit: total quantity across books must be <= 20
      const currentTotalQty = order.books.reduce((s, it) => s + (it.quantity || 0), 0);
      if (currentTotalQty + quantity > 20) {
        return res.status(400).json({ message: "Cart limit reached. You can have up to 20 books in your cart." });
      }
      // Check if book exists in the cart (order)
      const bookIndex = order.books.findIndex(
        (item) => item.book.toString() === bookId.toString()
      );

      if (bookIndex > -1) {
        // Update quantity of existing book
        order.books[bookIndex].quantity += quantity;
      } else {
        // Add new book to cart
        order.books.push({ book: bookId, quantity, price, title, author, image });
      }

      // Recalculate total amount
      order.totalAmount = order.books.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    await order.save();
    res.json(order); // Return updated order
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Update book quantity in cart
// Mark order as complete

router.patch("/complete/:orderId", protect, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  try {
    // Find the pending order
    const order = await Order.findOne({ _id: orderId, user: userId, status: "Pending" });

    if (!order) {
      return res.status(404).json({ message: "Order not found or already completed" });
    }

    // Update order status to "Complete"
    order.status = "Complete";
    await order.save();

    res.status(200).json({ message: "Order marked as complete", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove book from cart
router.delete("/remove/:bookId", protect, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user._id;

  try {
    const order = await Order.findOne({ user: userId, status: "Pending" });
    if (!order) return res.status(404).json({ message: "Cart not found" });

    const bookIndex = order.books.findIndex(item => item.book.toString() === bookId);
    if (bookIndex === -1) return res.status(404).json({ message: "Book not in cart" });

    // Remove the book from the array
    order.books.splice(bookIndex, 1);

    // Recalculate total amount
    order.totalAmount = order.books.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await order.save();
    res.status(200).json({ message: "Book removed from cart", cart: order });
  } catch (err) {
    console.error("Error removing book:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Checkout cart - supports checking out full cart or only selectedBookIds
router.post("/checkout", protect, async (req, res) => {
  const userId = req.user._id;
  const { selectedBookIds, paymentMethod, status } = req.body; // selectedBookIds optional

  try {
    const pending = await Order.findOne({ user: userId, status: "Pending" });
    if (!pending || pending.books.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Determine which books to checkout
    let booksToCheckout = pending.books;
    if (Array.isArray(selectedBookIds) && selectedBookIds.length > 0) {
      booksToCheckout = pending.books.filter((b) => selectedBookIds.includes(b.book.toString()));
    }

    if (!booksToCheckout || booksToCheckout.length === 0) {
      return res.status(400).json({ message: "No selected books to checkout." });
    }

    const subtotal = booksToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 100;

    const newOrder = new Order({
      user: userId,
      books: booksToCheckout.map(b => ({ book: b.book, quantity: b.quantity, price: b.price, title: b.title, author: b.author, image: b.image })),
      shippingInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        province: user.province,
        city: user.city,
        barangay: user.barangay,
        street: user.street,
        postalCode: user.postalCode,
      },
      totalAmount: subtotal + shippingFee,
      paymentMethod: paymentMethod || "Card",
      status: status || "Pending",
    });

    await newOrder.save();

    // Remove checked out items from pending order
    pending.books = pending.books.filter((b) => !booksToCheckout.some(cb => cb.book.toString() === b.book.toString()));
    pending.totalAmount = pending.books.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (pending.books.length === 0) {
      // Optional: delete empty pending order
      await Order.findByIdAndDelete(pending._id);
    } else {
      await pending.save();
    }

    res.status(200).json({ message: "Order placed successfully!", order: newOrder });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: "Server error." });
  }
});



// Get current pending cart
router.get("/pending", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findOne({ user: userId, status: "Pending" })
      .populate("books.book");

    if (!order) {
      return res.json({ books: [], totalAmount: 0 });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update item quantity in the cart
router.patch("/update", protect, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user._id;

    if (!bookId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid book data" });
    }

    // Find pending order
    let order = await Order.findOne({ user: userId, status: "Pending" });

    if (!order) {
      return res.status(404).json({ message: "No pending order found" });
    }

    // Find the book in the cart
    const bookIndex = order.books.findIndex(
      (item) => item.book.toString() === bookId.toString()
    );

    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found in cart" });
    }

    // Update the book's quantity
    order.books[bookIndex].quantity = quantity;

    // Recalculate the total amount
    order.totalAmount = order.books.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await order.save();
    res.json(order); // Return updated order
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get all orders for logged-in user (both Pending and Complete)
router.get("/all-orders", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate("books.book")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Receive order - mark as "Complete" (user initiated)
router.put("/receive-order/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Find and update the order
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If already complete, nothing to do
    if (order.status === "Complete") return res.json({ message: "Order already complete", order });

    // Before marking complete, ensure stock is available and decrement stock + increment bookSold
    for (const item of order.books) {
      const book = await Book.findById(item.book);
      if (!book) return res.status(404).json({ message: `Book not found: ${item.book}` });
      if ((book.stock || 0) < (item.quantity || 0)) {
        return res.status(400).json({ message: `Insufficient stock for ${item.title}` });
      }
    }

    // perform updates
    for (const item of order.books) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity, bookSold: item.quantity } });
    }

    order.status = "Complete";
    await order.save();

    // Log the action
    try {
      await Log.create({ actor: userId, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: 'User received order', meta: { orderId: order._id } });
    } catch (logErr) {
      console.error('Failed to create log:', logErr);
    }

    res.json({ message: "Order marked as received", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (admin-initiated)
router.put("/update-order-status/:orderId", protect, adminOnly, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Complete", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Fetch existing order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const prevStatus = order.status;

    // If setting to Complete and previous wasn't Complete -> perform stock checks and update
    if (status === 'Complete' && prevStatus !== 'Complete') {
      for (const item of order.books) {
        const book = await Book.findById(item.book);
        if (!book) return res.status(404).json({ message: `Book not found: ${item.book}` });
        if ((book.stock || 0) < (item.quantity || 0)) {
          return res.status(400).json({ message: `Insufficient stock for ${item.title}` });
        }
      }

      for (const item of order.books) {
        await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity, bookSold: item.quantity } });
      }
    }

    order.status = status;
    await order.save();

    // Create a log entry
    try {
      await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: `Updated order status to ${status}`, meta: { orderId: order._id } });
    } catch (logErr) {
      console.error('Failed to create log:', logErr);
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders for admin (all users' orders)
router.get("/admin/all-orders", protect, adminOnly, async (req, res) => {
  try {
    // This endpoint can be called by admin only (validation can be added if needed)
    const orders = await Order.find()
      .populate("books.book")
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
