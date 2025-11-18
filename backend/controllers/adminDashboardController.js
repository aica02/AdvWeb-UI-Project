import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Visit from "../models/visitModel.js";

export const getAdminStats = async (req, res) => {
  try {
    // total products
    const productCount = await Book.countDocuments();

    // total sales and total orders (accepts different field names)
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Complete", "complete", "Completed"] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $ifNull: ["$totalAmount", "$totalPrice", "$total", 0]
            }
          },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalSales = (salesAgg[0] && salesAgg[0].totalSales) || 0;
    const totalOrders = (salesAgg[0] && salesAgg[0].totalOrders) || 0;

    // trending / best selling books (top 5 by quantity)
    const trendingAgg = await Order.aggregate([
      { $match: { status: { $in: ["Complete", "complete", "Completed"] } } },
      { $unwind: "$books" },
      { $group: { _id: "$books.book", totalSold: { $sum: "$books.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, bookId: "$book._id", title: "$book.title", totalSold: 1 } }
    ]);

    // website visits today (if Visit model exists)
    let visitsToday = 0;
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      visitsToday = await Visit.countDocuments({ date: { $gte: startOfDay } });
    } catch (e) {
      visitsToday = 0;
    }

    res.json({
      productCount,
      totalSales,
      totalOrders,
      trendingBooks: trendingAgg.length,
      websiteVisits: visitsToday,
      bestSelling: trendingAgg
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $ne: "admin" } },
      "firstName lastName email role"
    );

    res.json({ users });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getBookSales = async (req, res) => {
  try {
    const booksSold = await Order.aggregate([
      { $unwind: "$books" }, // each book in order
      { $group: { 
          _id: "$books.book", 
          totalSold: { $sum: "$books.quantity" } 
      }},
      { $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookInfo"
      }},
      { $unwind: "$bookInfo" },
      { $project: { _id: 0, title: "$bookInfo.title", totalSold: 1 } },
      { $sort: { totalSold: -1 } } // highest sold first
    ]);

    res.json({ booksSold });
  } catch (err) {
    console.error("Error fetching book sales:", err);
    res.status(500).json({ message: "Failed to fetch book sales" });
  }
};
