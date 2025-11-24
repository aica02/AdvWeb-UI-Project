import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
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

// Build a reliable API base URL that works whether VITE_API_URL includes `/api` or not
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const DashboardSection = () => {
  const navigate = useNavigate();

  // Hooks MUST be inside the component
  const [pdfPeriod, setPdfPeriod] = useState("daily");

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");
    const url = `${API_BASE}/api/admin/sales?period=${encodeURIComponent(pdfPeriod)}`;

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
      const doc = new jsPDF("p", "pt", "a4"); // portrait, points, A4

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const now = new Date();
      const formattedDate = now.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila"
      });

      const headerHeight = 90;
      const headerPaddingX = 40;
      const headerPaddingY = 30;

      // dark blue bar
      doc.setFillColor(1, 32, 63); // #070F2B
      doc.rect(0, 0, pageWidth, headerHeight + 10, "F");

      // light text
      doc.setTextColor(255, 49, 49);

      // "Report | <date>"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Report | ${formattedDate}`,
        headerPaddingX,
        headerPaddingY
      );

      // "Summary Report"
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(
        "Summary Report",
        headerPaddingX,
        headerPaddingY + 25
      );

      // Right side: Company name (you can add logo via addImage if you want)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const companyText = "Book Store";
      const companyTextWidth =
        doc.getTextWidth(companyText) || 0;
      doc.text(
        companyText,
        pageWidth - headerPaddingX - companyTextWidth,
        headerPaddingY + 10
      );

      // === Subtitle / Period under header ===
      const contentStartY = headerHeight + 30; // first content line
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Overview", headerPaddingX, contentStartY);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const prettyPeriod =
        pdfPeriod.charAt(0).toUpperCase() + pdfPeriod.slice(1);
      doc.text(
        `Sales Period: ${prettyPeriod}`,
        headerPaddingX,
        contentStartY + 16
      );

      // === TABLE DATA ===
      // Use 'PHP' text instead of the '₱' glyph (some PDF fonts substitute it with ±)
      const tableData = sales.map((sale, idx) => [
        idx + 1,
        sale.title,
        sale.quantity,
        `PHP ${Number(sale.total || 0).toFixed(2)}`
      ]);

      const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

      // === autoTable with header & zebra rows ===
      autoTable(doc, {
        startY: contentStartY + 30,
        head: [["#", "Item", "Quantity", "Total"]],
        body: tableData,
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 6
        },
        headStyles: {
          fillColor: [1, 32, 63], // dark bar color
          textColor: [255, 255, 255],
          halign: "center"
        },
        bodyStyles: { halign: "center", valign: "middle" },
        columnStyles: {
          0: { halign: "center", cellWidth: 30 },
          1: { halign: "left" },
          2: { halign: "center", cellWidth: 70 },
          3: { halign: "center", cellWidth: 90 }
        },
        margin: { left: headerPaddingX, right: 40 },
        didDrawPage: (data) => {
          // Re-draw header on each page (like thead in template)
          if (data.pageNumber > 1) {
            doc.setFillColor(1, 32, 63);
            doc.rect(0, 0, pageWidth, headerHeight + 10, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Report | ${formattedDate}`, headerPaddingX, headerPaddingY);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("Summary Report", headerPaddingX, headerPaddingY + 25);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            const companyTextWidth2 = doc.getTextWidth(companyText) || 0;
            doc.text(companyText, pageWidth - headerPaddingX - companyTextWidth2, headerPaddingY + 10);
            doc.setTextColor(0, 0, 0);
          }

          // Footer: page X of Y
          const str = `Page ${data.pageNumber}`;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const strWidth = doc.getTextWidth(str);
          doc.text(str, pageWidth - strWidth - headerPaddingX, pageHeight - 20);
        }
      });

      // === TOTAL SALES TEXT AFTER TABLE ===
      const finalY = doc.lastAutoTable?.finalY || (contentStartY + 30);
      if (finalY + 30 < pageHeight - 40) {
        // still on same page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          `Total Sales: PHP ${totalAmount.toFixed(2)}`,
          headerPaddingX,
          finalY + 20
        );
      } else {
        // new page if no space
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          `Total Sales: PHP ${totalAmount.toFixed(2)}`,
          headerPaddingX,
          60
        );
      }

      // === SAVE PDF (same filename style) ===
      doc.save(`Book Wise Sales-${pdfPeriod}.pdf`);
    } catch (err) {
      console.error("Download PDF error:", err);
      alert("Failed to download PDF: " + (err.message || err));
    }
  };

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
        // Local filtering: trim input and perform case-insensitive match
        const q = (searchTerm || "").toString().trim().toLowerCase();
        const filtered = bookSales
          .filter((book) => (book.title || "").toLowerCase().includes(q))
          .slice()
          .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
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
        const statsRes = await fetch(`${API_BASE}/api/admin/dashboard`, {
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
        const booksRes = await fetch(`${API_BASE}/api/admin/booksales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!booksRes.ok)
          throw new Error(`Failed to fetch book sales: ${booksRes.status}`);

        const booksData = await booksRes.json();
        // sort best-selling books by totalSold desc for consistent display
        const loaded = (booksData.booksSold || []).slice();
        loaded.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        setBookSales(loaded);
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

          {/* <div className="stat-card orange">
            <div className="icon-circle">
              <FaSyncAlt />
            </div>
            <div className="stat-info">
              <h3>{stats.websiteVisits}</h3>
              <p>Website Visits (today)</p>
            </div>
          </div> */}
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
       {/* Book Search Bar */}
        <div
          style={{
            margin: "24px 0 16px 40px",
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
                  // select first suggestion on Enter
                  e.preventDefault();
                  const first = searchResults[0];
                  if (first) {
                    setSearchTerm(first.title || "");
                    setSearchResults([first]);
                  }
                  setShowSuggestions(false);
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
                top: 8,
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
                    onMouseDown={(e) => {
                      // select this book title into the input and hide suggestions
                      e.preventDefault();
                      setSearchTerm(book.title || "");
                      setSearchResults([book]);
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
