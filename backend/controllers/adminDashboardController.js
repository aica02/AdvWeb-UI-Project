import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Visit from "../models/visitModel.js";
import Log from "../models/logModel.js";

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

    // website visits today: sum the visit.count for today's documents
    let visitsToday = 0;
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const agg = await Visit.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
      ]);
      visitsToday = agg[0]?.total || 0;
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
    // Aggregate users with their total orders count
    const usersAgg = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders"
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          totalOrders: { $size: "$orders" }
        }
      }
    ]);

    res.json({ users: usersAgg });
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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
    // Optionally, remove user's orders as well (commented out)
    // await Order.deleteMany({ user: id });

    try {
      await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action: 'Deleted user', meta: { userId: id, email: user.email } });
    } catch (e) { console.error('Log error:', e); }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const period = req.query.period || "daily";

    // Determine date range
    const now = new Date();
    let start;

    if (period === "daily") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      start = new Date();
      start.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      start = new Date();
      start.setMonth(now.getMonth() - 1);
    } else {
      return res.status(400).json({ message: "Invalid period" });
    }

    // Fetch completed orders only
    const sales = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Complete", "complete", "Completed"] },
          createdAt: { $gte: start }
        }
      },
      { $unwind: "$books" },
      {
        $group: {
          _id: "$books.book",
          quantity: { $sum: "$books.quantity" },
          // compute total per book as sum(quantity * price) - fallback to 0 if price missing
          total: {
            $sum: {
              $multiply: [
                { $ifNull: ["$books.quantity", 0] },
                { $ifNull: ["$books.price", 0] }
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 0,
          title: "$book.title",
          quantity: 1,
          total: 1
        }
      },
      { $sort: { quantity: -1 } }
    ]);

    // Debug: log sales results to help verify totals
    try {
      const totalSum = sales.reduce((s, it) => s + (it.total || 0), 0);
      console.log("[getSalesReport] period:", period, "rows:", sales.length, "totalSum:", totalSum);
    } catch (e) {
      console.log("[getSalesReport] logging error:", e);
    }

    res.json(sales);
  } catch (err) {
    console.error("Sales report error:", err);
    res.status(500).json({ message: "Failed to fetch sales report" });
  }
};
