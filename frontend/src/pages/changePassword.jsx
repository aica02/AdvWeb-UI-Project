import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPass !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    setMessage("Password changed successfully! (UI only)");
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-menu">
          <Link to="/profile">Account Information</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/auth">Log Out</Link>
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
