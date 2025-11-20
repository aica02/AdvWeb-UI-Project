import React from "react";
import {FaUser, FaBookOpen, FaClock, FaBell, FaSignOutAlt, FaSearch, FaUserMinus} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "../css/admin.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear auth token and navigate to auth page
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="logo">L</div>
        <nav className="nav-links">
          <button
            className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            <MdDashboard />
          </button>

          <button
            className={`nav-item ${isActive("/admin/addbook") ? "active" : ""}`}
            onClick={() => navigate("/admin/addbook")}
          >
            <FaBookOpen />
          </button>

          <button
            className={`nav-item ${isActive("/admin/editdeletebook") ? "active" : ""}`}
            onClick={() => navigate("/admin/editdeletebook")}
          >
            <FaClock />
          </button>

          <button
            className={`nav-item ${isActive("/admin/useraccountsdelete") ? "active" : ""}`}
            onClick={() => navigate("/admin/useraccountsdelete")}
          >
            <FaUserMinus />
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

            <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        {/* Render nested routes */}
        <div className="dashboard-section">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminAccount;
