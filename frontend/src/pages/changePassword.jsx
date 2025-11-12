import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/changepass.css";
import axios from "axios";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPass !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { currentPassword: current, newPassword: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password changed successfully!");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
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
            {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
