import React, { useEffect, useState } from "react";
import { 
  FaUser, FaBookOpen, FaBook, FaChartLine, FaBox, 
  FaClock, FaSyncAlt, FaMoneyBillWave 
} from "react-icons/fa";
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

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      setError("Access denied. Admins only.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");

        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
        }

        const data = await response.json();

        setStats({
          productCount: data.productCount || 0,
          totalSales: data.totalSales || 0,
          trendingBooks: data.trendingBooks || 0,
          totalOrders: data.totalOrders || 0,
          websiteVisits: data.websiteVisits || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="dashboard-overview">
      <h2>Dashboard</h2>
      <p className="subheading">Book Store Inventory</p>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="icon-circle"><FaBook /></div>
          <div className="stat-info">
            <h3>{stats.productCount}</h3>
            <p>Products</p>
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
  );
};

export default DashboardSection;
