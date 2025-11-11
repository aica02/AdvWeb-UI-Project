import React from "react";
import { FaUser, FaBookOpen , FaBook, FaChartLine, FaBox, FaClock ,FaSyncAlt, FaMoneyBillWave, FaSignOutAlt, FaBell, FaSearch } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "../css/admin.css";

const DashboardSection = () => {
  return (

    <section className="dashboard-overview">
        <h2>Dashboard</h2>
        <p className="subheading">Book Store Inventory</p>

        <div className="stats-grid">
        <div className="stat-card green">
            <div className="icon-circle">
            <FaBook />
            </div>
            <div className="stat-info">
            <h3>20</h3>
            <p>Products</p>
            </div>
        </div>

        <div className="stat-card red">
            <div className="icon-circle">
            <FaMoneyBillWave />
            </div>
            <div className="stat-info">
            <h3>₱302.00</h3>
            <p>Total Sales</p>
            </div>
        </div>

        <div className="stat-card yellow">
            <div className="icon-circle">
            <FaChartLine />
            </div>
            <div className="stat-info">
            <h3>13 (13%)</h3>
            <p>Trending Books</p>
            </div>
        </div>

        <div className="stat-card blue">
            <div className="icon-circle">
            <FaBox />
            </div>
            <div className="stat-info">
            <h3>7</h3>
            <p>Total Orders</p>
            </div>
        </div>

        <div className="stat-card orange">
            <div className="icon-circle">
            <FaSyncAlt />
            </div>
            <div className="stat-info">
            <h3>10</h3>
            <p>Website Visits (today)</p>
            </div>
        </div>
        </div>

        <div className="dashboard-buttons">
        <button className="btn-secondary">Manage Books</button>
        <button className="btn-primary">+ Add New Book</button>
        </div>
    </section>
  );
};

export default DashboardSection;
