import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  FaUser,
  FaBookOpen,
  FaBook,
  FaChartLine,
  FaBox,
  FaClock,
  FaSyncAlt,
  FaMoneyBillWave
} from "react-icons/fa";
import "../css/admin.css";
import { useNavigate } from "react-router-dom";

const DashboardSection = () => {
  const navigate = useNavigate();

  // Hooks MUST be inside the component
  const [pdfPeriod, setPdfPeriod] = useState("daily");

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:5000/api/admin/sales?period=" + pdfPeriod;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch sales data");

      const sales = await res.json();
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text(
        `Sales Report (${pdfPeriod.charAt(0).toUpperCase() + pdfPeriod.slice(1)})`,
        10,
        15
      );

      doc.setFontSize(12);
      let y = 30;

      sales.forEach((sale, idx) => {
        doc.text(
          `${idx + 1}. ${sale.title} - Qty: ${sale.quantity} - ₱${sale.total}`,
          10,
          y
        );
        y += 8;
      });

      doc.save(`sales-${pdfPeriod}.pdf`);
    } catch (err) {
      alert("Failed to download PDF: " + (err.message || err));
    }
  };

  // Dashboard states
  const [stats, setStats] = useState({
    productCount: 0,
    totalSales: 0,
    trendingBooks: 0,
    totalOrders: 0,
    websiteVisits: 0
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

        // Fetch stats
        const statsRes = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!statsRes.ok)
          throw new Error(`Failed to fetch dashboard stats: ${statsRes.status}`);

        const statsData = await statsRes.json();
        setStats({
          productCount: statsData.productCount || 0,
          totalSales: statsData.totalSales || 0,
          trendingBooks: statsData.trendingBooks || 0,
          totalOrders: statsData.totalOrders || 0,
          websiteVisits: statsData.websiteVisits || 0
        });

        // Fetch best-selling books
        const booksRes = await fetch(
          "http://localhost:5000/api/admin/booksales",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!booksRes.ok)
          throw new Error(`Failed to fetch book sales: ${booksRes.status}`);

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
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <section className="dashboard-overview">
        {/* PDF Download UI */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16
          }}
        >
          <label htmlFor="pdf-period">Download Sales PDF:</label>

          <select
            id="pdf-period"
            value={pdfPeriod}
            onChange={(e) => setPdfPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button
            onClick={handleDownloadPDF}
            style={{
              background: "#035c96",
              color: "white",
              border: "none",
              padding: "6px 16px",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Download PDF
          </button>
        </div>

        <h2>Dashboard</h2>
        <p className="subheading">Book Store Inventory</p>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="icon-circle">
              <FaBook />
            </div>
            <div className="stat-info">
              <h3>{stats.productCount}</h3>
              <p>Number of Books</p>
            </div>
          </div>

          <div className="stat-card red">
            <div className="icon-circle">
              <FaMoneyBillWave />
            </div>
            <div className="stat-info">
              <h3>₱{stats.totalSales}</h3>
              <p>Total Sales</p>
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="icon-circle">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>
                {stats.trendingBooks} (
                {Math.round(
                  (stats.trendingBooks / (stats.productCount || 1)) * 100
                )}
                %)
              </h3>
              <p>Trending Books</p>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="icon-circle">
              <FaBox />
            </div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="icon-circle">
              <FaSyncAlt />
            </div>
            <div className="stat-info">
              <h3>{stats.websiteVisits}</h3>
              <p>Website Visits (today)</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
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

      {/* Best Selling Books */}
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
