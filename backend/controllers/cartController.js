import User from "../models/userModel.js";
import Order from "../models/orderModel.js";

export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(item => item.bookId.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ bookId, quantity });
    }

    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.bookId");
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


const createOrder = async (req, res) => {
  const { paymentMethod, cardInfo } = req.body;
  const orderStatus = "pending"; 

  const newOrder = new Order({
    userId: req.user._id, 
    paymentMethod,
    cardInfo,
    items: req.body.items,
    status: orderStatus,
    totalAmount: req.body.totalAmount,
  });

  try {
    await newOrder.save();
    res.status(201).json({ message: "Order created", order: newOrder });
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};
// Endpoint to get pending orders
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: "Pending" })
      .populate("books.book"); // Populate the 'book' reference correctly

    res.json(orders); // Return the list of pending orders
  } catch (err) {
    console.error("Error fetching pending orders", err);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// Endpoint to get completed orders
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: "Completed" })
      .populate("books.book"); // Populate the 'book' reference correctly

    res.json(orders);
  } catch (err) {
    console.error("Error fetching completed orders", err);
    res.status(500).json({ message: "Failed to fetch completed orders" });
  }
};


export const updateCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.user.id);

    if (!bookId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid book data" });
    }

    // Ensure bookId is compared as ObjectId
    const bookObjectId = mongoose.Types.ObjectId(bookId);

    // Find the item in the cart
    const item = user.cart.find(item => item.bookId.toString() === bookObjectId.toString());

    if (item) {
      // Update the quantity of the existing item
      item.quantity = quantity;
    } else {
      // If the item doesn't exist in the cart, send an error message
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Save the updated cart
    await user.save();
    res.json({ cart: user.cart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
