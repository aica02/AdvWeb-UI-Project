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
  FaMoneyBillWave,
  FaSearch
} from "react-icons/fa";
import "../css/admin.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DashboardSection = () => {
  const navigate = useNavigate();

  // Hooks MUST be inside the component
  const [pdfPeriod, setPdfPeriod] = useState("daily");

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");
    const url = `${API}/admin/sales?period=${encodeURIComponent(pdfPeriod)}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        let errMsg = `Status ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body.message || JSON.stringify(body);
        } catch (e) {}
        throw new Error(errMsg);
      }

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
      console.error("Download PDF error:", err);
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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchTimeout = React.useRef();

  // Debounced search
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setShowSuggestions(false);
      setSearchError("");
      return;
    }
    setSearchLoading(true);
    setSearchError("");
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        // Filter bookSales based on search term (local filtering)
        const filtered = bookSales.filter(book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
        setShowSuggestions(true);
        console.log("[ADMIN SEARCH] Filtered results:", filtered);
      } catch (err) {
        console.error("[ADMIN SEARCH] Error:", err.message);
        setSearchError(err.message || "Error searching books");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, bookSales]);

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
        const statsRes = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
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

        {/* Book Search Bar */}
        <div
          style={{
            margin: "24px 0 16px 0",
            position: "relative",
            maxWidth: 400
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Search books by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() =>
                searchResults.length > 0 && setShowSuggestions(true)
              }
              onBlur={() =>
                setTimeout(() => setShowSuggestions(false), 150)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchResults.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              style={{
                width: "100%",
                padding: "8px 36px 8px 12px",
                borderRadius: 4,
                border: "1px solid #ccc"
              }}
            />
            <FaSearch
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                color: "#888"
              }}
            />
          </div>
          {showSuggestions && (
            <ul
              style={{
                position: "absolute",
                top: 38,
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                zIndex: 10,
                maxHeight: 200,
                overflowY: "auto",
                listStyle: "none",
                margin: 0,
                padding: 0
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <li
                    key={book._id || book.id}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee"
                    }}
                    onMouseDown={() => {
                      setShowSuggestions(false);
                    }}
                  >
                    {book.title}
                  </li>
                ))
              ) : (
                <li style={{ padding: "8px 12px", color: "#888" }}>
                  No results found
                </li>
              )}
            </ul>
          )}
          {searchLoading && (
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 2
              }}
            >
              Searching...
            </div>
          )}
          {searchError && (
            <div
              style={{
                fontSize: 12,
                color: "#c0392b",
                marginTop: 2
              }}
            >
              {searchError}
            </div>
          )}
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book Title</th>
              <th>Total Sold</th>
            </tr>
          </thead>

          <tbody>
            {searchTerm ? (
              searchResults.length > 0 ? (
                searchResults.map((book, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{book.title}</td>
                    <td>{book.totalSold}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No matching books found.</td>
                </tr>
              )
            ) : bookSales.length > 0 ? (
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
