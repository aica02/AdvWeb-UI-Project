import React from "react";
import {FaUser, FaBookOpen, FaClock, FaBell, FaSignOutAlt, FaSearch, FaUserMinus, FaBox} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useState } from "react";
import "../css/admin.css";
import "../css/modals.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

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
        <div className="logo">
          <img src="/uploads/logo.png" alt="" 
          style={{
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            objectFit: "cover",
          }} />
        </div>
        <nav className="nav-links">
           <button className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`} onClick={() => navigate("/admin/dashboard")}>
               <MdDashboard />
            </button>

          <button className={`nav-item ${isActive("/admin/addbook") ? "active" : ""}`} onClick={() => navigate("/admin/addbook")}>
            <FaBookOpen />
          </button>

          <button className={`nav-item ${isActive("/admin/editdeletebook") ? "active" : ""}`} onClick={() => navigate("/admin/editdeletebook")}>
            <FaClock />
          </button>

          <button className={`nav-item ${isActive("/admin/useraccountsdelete") ? "active" : ""}`} onClick={() => navigate("/admin/useraccountsdelete")}>
            <FaUserMinus />
          </button>

          <button className={`nav-item ${isActive("/admin/orders") ? "active" : ""}`} onClick={() => navigate("/admin/orders")}>
            <FaBox />
          </button>

          <button className={`nav-item ${isActive("/admin/logs") ? "active" : ""}`} onClick={() => navigate("/admin/logs")}>
            <FaBell />
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
         

          <div className="header-right">
            <div className="user-info-icon">
              <div className="user-info">
                <p className="username">Book Admin</p>
                <span className="role">Admin</span>
              </div>
              <div className="user-avatar">
                <FaUser />
              </div>
            </div>
            <hr className="wall" />

             <button className="logout-btn" onClick={() => setShowModal(true)} aria-label="Logout" >
              <FaSignOutAlt />
            </button>
          </div>
        </header>

         {/* Modal */}
        {showModal && (
          <div className="logout-modal-overlay">
            <div className="logout-modal">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to log out?</p>

              <div className="logout-modal-buttons">
                <button className="cancel-modal-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button className="confirm-modal-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Routes */}
        <div className="dashboard-section">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminAccount;
