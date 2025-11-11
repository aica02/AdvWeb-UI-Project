import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Visit from "../models/visitModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const productCount = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;
    const trendingBooks = await Book.countDocuments({ trending: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitsDoc = await Visit.findOne({ date: today });
    const websiteVisits = todayVisitsDoc?.count || 0;

    res.json({
      productCount,
      totalUsers,
      totalOrders,
      totalSales,
      trendingBooks,
      websiteVisits,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
