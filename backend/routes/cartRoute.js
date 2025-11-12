import express from "express";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
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
// Checkout cart
router.post("/checkout", protect, async (req, res) => {
  const userId = req.user._id;

  try {
    // Step 1: Find the user's pending order
    const order = await Order.findOne({ user: userId, status: "Pending" });
    if (!order || order.books.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Step 2: Get user shipping info
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const shippingInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      province: user.province,
      city: user.city,
      barangay: user.barangay,
      street: user.street,
      postalCode: user.postalCode,
    };

    // Step 3: Calculate the total amount (including shipping)
    const subtotal = order.books.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 100; // Assuming a fixed shipping fee
    order.shippingInfo = shippingInfo;
    order.totalAmount = subtotal + shippingFee;
    order.paymentMethod = req.body.paymentMethod || "Card";
    order.status = "Complete"; // Update status to 'Complete' after successful checkout

    // Save the order with updated details
    await order.save();

    // Step 4: Clear the cart (remove all items from the user's cart)
    user.cart = []; // Clear the user's cart
    await user.save(); // Save the updated user (with an empty cart)

    // Step 5: Return the response
    res.status(200).json({ message: "Order placed successfully!", order });

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
// Get current pending cart
router.get("/orders/pending", protect, getPendingOrders); // Fetch pending orders
router.get("/orders/complete", protect, getCompletedOrders); // Fetch completed orders


export default router;
