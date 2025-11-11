import Book from "../models/bookModel.js";
import User from "../models/userModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const productCount = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = 37; // placeholder until you add Orders model
    const totalSales = 56000; // demo number
    const trendingBooks = await Book.countDocuments({ trending: true });
    const websiteVisits = Math.floor(Math.random() * 100) + 1;

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
