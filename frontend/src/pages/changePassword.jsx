import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/changepass.css";
import "../css/modals.css";
import axios from "axios";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  // ---add Trigger notification ---
  const triggerNotification = (msg, type = "positive") => {
  setNotification(msg);
  setNotificationType(type);
  setShowNotification(true);
  setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPass !== confirm) {
      triggerNotification("New password and confirm password do not match", "negative");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { currentPassword: current, newPassword: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      triggerNotification("Password changed successfully", "positive");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || triggerNotification("Failed to change password", "negative")
      );
    }
  };

  return (
    <>
    {/* Notification toast */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}

      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/profile" className="breadcrumb-link">Personal Information</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">Change Password</span>
      </nav>
      
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="changepass-profile-menu">
          <Link to="/profile">Account Information</Link>
          <Link to="/orders">My Orders</Link>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <h2>Change Password</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label>Current Password*</label>
              <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>New Password*</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Confirm Password*</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button className="profile-btn">Save Changes</button>
            
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
