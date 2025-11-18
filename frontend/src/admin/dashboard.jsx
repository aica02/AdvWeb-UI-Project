import React, { useEffect, useState } from "react";
import { FaUser, FaBookOpen, FaBook, FaChartLine, FaBox, FaClock, FaSyncAlt, FaMoneyBillWave } from "react-icons/fa";
import "../css/admin.css";
import { useNavigate } from "react-router-dom";

const DashboardSection = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    productCount: 0,
    totalSales: 0,
    trendingBooks: 0,
    totalOrders: 0,
    websiteVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookSales, setBookSales] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      setError("Access denied. Admins only.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");

        // Fetch dashboard stats
        const statsRes = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error(`Failed to fetch dashboard stats: ${statsRes.status}`);
        const statsData = await statsRes.json();
        setStats({
          productCount: statsData.productCount || 0,
          totalSales: statsData.totalSales || 0,
          trendingBooks: statsData.trendingBooks || 0,
          totalOrders: statsData.totalOrders || 0,
          websiteVisits: statsData.websiteVisits || 0,
        });

        // Fetch best selling books
        const booksRes = await fetch("http://localhost:5000/api/admin/booksales", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!booksRes.ok) throw new Error(`Failed to fetch book sales: ${booksRes.status}`);
        const booksData = await booksRes.json();
        setBookSales(booksData.booksSold || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="loading-dashboard">Loading dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <section className="dashboard-overview">
        <h2>Dashboard</h2>
        <p className="subheading">Book Store Inventory</p>

        <div className="stats-grid">
          <div className="stat-card green">
            <div className="icon-circle"><FaBook /></div>
            <div className="stat-info">
              <h3>{stats.productCount}</h3>
              <p>Number of Books</p>
            </div>
          </div>

          <div className="stat-card red">
            <div className="icon-circle"><FaMoneyBillWave /></div>
            <div className="stat-info">
              <h3>₱{stats.totalSales}</h3>
              <p>Total Sales</p>
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="icon-circle"><FaChartLine /></div>
            <div className="stat-info">
              <h3>
                {stats.trendingBooks} (
                {Math.round((stats.trendingBooks / (stats.productCount || 1)) * 100)}%)
              </h3>
              <p>Trending Books</p>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="icon-circle"><FaBox /></div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="icon-circle"><FaSyncAlt /></div>
            <div className="stat-info">
              <h3>{stats.websiteVisits}</h3>
              <p>Website Visits (today)</p>
            </div>
          </div>
        </div>

        <div className="dashboard-buttons">
          <button
            className="btn-secondary"
            onClick={() => navigate("/admin/editdeletebook")}
          >
            Manage Books
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/admin/addbook")}
          >
            + Add New Book
          </button>
        </div>
      </section>

      {/* Best Selling Books Table */}
      <section className="dashboard-overview">
        <h2 className="user-table-title">Best Selling Books</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book Title</th>
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {bookSales.length > 0 ? (
              bookSales.map((book, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{book.title}</td>
                  <td>{book.totalSold}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No books sold yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default DashboardSection;
