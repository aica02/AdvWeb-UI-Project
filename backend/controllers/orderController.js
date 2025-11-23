import Order from "../models/orderModel.js";
import Book from "../models/bookModel.js";


// USER: Get ALL orders
export const getAllOrdersUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("books.book")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// USER: Mark order as received (COMPLETE)
export const receiveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Complete")
      return res.json({ message: "Already completed", order });

    // check stock
    for (const item of order.books) {
      const book = await Book.findById(item.book);
      if (!book || book.stock < item.quantity)
        return res.status(400).json({ message: `${item.title} stock insufficient` });
    }

    // deduct stock + increase bookSold
    for (const item of order.books) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity, bookSold: item.quantity }
      });
    }

    order.status = "Complete";
    await order.save();

    res.json({ message: "Order completed", order });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
//CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending")
      return res.status(400).json({ message: "Only pending orders can be cancelled" });

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!["Pending", "Complete", "Cancelled"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "Complete" && order.status !== "Complete") {

      for (const item of order.books) {
        const book = await Book.findById(item.book);
        if (!book || book.stock < item.quantity)
          return res.status(400).json({ message: `${item.title} insufficient stock` });
      }

      for (const item of order.books) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: -item.quantity, bookSold: item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ADMIN: Get all orders in system
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("books.book")
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
