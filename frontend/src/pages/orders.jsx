import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Orders() {
  const [tab, setTab] = useState("pending");
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
          <h2>MY ORDERS</h2>
          <div className="orders-tabs">
            <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>PENDING</button>
            <button className={tab === "completed" ? "active" : ""} onClick={() => setTab("completed")}>COMPLETED</button>
          </div>
          <div className="orders-list">
            {tab === "pending" ? (
              [1,2,3].map(i => (
                <div className="order-item" key={i}>
                  <img src="https://covers.openlibrary.org/b/id/7984916-L.jpg" alt="Book" style={{ width: 60, height: 80, marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div><strong>Harry Potter and the Prisoner of Azkaban</strong></div>
                    <div>J.K. Rowling</div>
                    <div>Quantity: 1</div>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right' }}>Total: ₱442</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#888' }}>No completed orders.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
