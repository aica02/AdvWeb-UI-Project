import React, { useState } from "react";
import {
  FaUser,
  FaBookOpen,
  FaClock,
  FaBell,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "../css/admin.css";
import DashboardSection from "./dashboard";
import AddBooksSection from "./addBook";
import EditDeleteBooksSection from "./editDeleteBook";


const AdminAccount = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection/>;
      case "addbooks":
        return <AddBooksSection/>;
      case "editbooks":
        return <EditDeleteBooksSection/>;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="logo">L</div>
        <nav className="nav-links">
          <button
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <MdDashboard />
          </button>
          <button
            className={`nav-item ${activeSection === "addbooks" ? "active" : ""}`}
            onClick={() => setActiveSection("addbooks")}
          >
            <FaBookOpen />
          </button>
          <button
            className={`nav-item ${activeSection === "editbooks" ? "active" : ""}`}
            onClick={() => setActiveSection("editbooks")}
          >
            <FaClock />
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="admin-search-bar">
            <input type="text" placeholder="Search Book" />
            <FaSearch className="admin-search-icon" />
          </div>

          <div className="header-right">
            <div className="user-info-icon">
                <div className="user-info">
                <p className="username">Manlapig, Angelo R.</p>
                <span className="role">Admin</span>
                </div>
                <div className="user-avatar">
                <FaUser />
                </div>
            </div>
            <hr className="wall" />

            <div className="notifications">
              <FaBell className="icon" />
              <span className="badge">2</span>
            </div>

            <button className="logout-btn">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        {/* Dynamically Loaded Section */}
        <div className="dashboard-section">{renderSection()}</div>
      </main>
    </div>
  );
};

export default AdminAccount;
