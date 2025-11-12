import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/order.css";

const API = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [tab, setTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // To store any error message
  const token = localStorage.getItem("token");

  // Fetch orders based on the active tab
  const fetchOrders = async (status) => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
try {
  setLoading(true);
  setError(""); // Reset error message on new fetch

  const res = status === "pending"
    ? await axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
    : await axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });

  console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} Orders Response:`, res.data); // Debugging output

  setOrders(res.data); // Set orders based on status
} catch (err) {
  console.error("Error fetching orders:", err.response ? err.response.data : err.message);
  setError("Failed to fetch orders. Please try again later.");
  alert(err.response ? err.response.data : "Something went wrong");
} finally {
  setLoading(false); // Stop the loading state
}
  };


  // Handle marking the order as complete
  const handleCompleteOrder = async (orderId) => {
  try {
    const res = await axios.patch(
      `${API}/orders/complete/${orderId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Remove the completed order from the current list of pending orders
    setOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));

    // Refetch pending orders (no need to refetch completed orders)
    fetchOrders("pending");

    alert(res.data.message); // Show success message
  } catch (err) {
    console.error("Error completing order:", err.response ? err.response.data : err.message);
    alert("Failed to mark order as complete.");
  }
};
  // Refetch orders when tab changes
  useEffect(() => {
    fetchOrders(tab); // Pass current tab to fetchOrders
  }, [tab]);


  const formatCurrency = (amount) => amount.toFixed(2);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="order-profile-menu">
          <Link to="/profile">Account Information</Link>
          <Link to="/orders">My Orders</Link>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <h2>MY ORDERS</h2>
          <div className="orders-tabs">
            <button
              className={tab === "pending" ? "active" : ""}
              onClick={() => setTab("pending")} // Only update tab, fetching is handled by useEffect
            >
              PENDING
            </button>
            <button
              className={tab === "completed" ? "active" : ""}
              onClick={() => setTab("completed")} // Only update tab, fetching is handled by useEffect
            >
              COMPLETED
            </button>
          </div>

          {/* Show error message if any */}
          {error && <div className="error-message">{error}</div>}

          <div className="orders-list">
            {orders.length === 0 ? (
  <div style={{ textAlign: "center", color: "#888" }}>
    {tab === "pending" ? "No pending orders." : "No completed orders."}
  </div>
) : (
  orders.map((order) => (
    <div key={order._id} className="order-item">
      <div className="order-header">
        <h3>Order #{order._id}</h3>
        <p>Status: {order.status}</p>
      </div>

      {/* Check that the books field exists and map over it */}
      {order.books && order.books.length > 0 ? (
        order.books.map((item, idx) => (
          <div key={`${order._id}-${idx}`} className="order-item-detail">
            <img
              src={item.book ? item.book.image : "https://dummyimage.com/200x280/cccccc/000000&text=No+Image"}
              alt={item.book ? item.book.title : "No Title"}
              loading="lazy"
            />
            <div style={{ flex: 1 }}>
              <div><strong>{item.book ? item.book.title : "No Title"}</strong></div>
              <div>{item.book ? item.book.author : "No Author"}</div>
              <div>Quantity: {item.quantity}</div>
            </div>
            <div style={{ minWidth: 80, textAlign: "right" }}>
              Total: ₱{formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))
      ) : (
        <div>No books in this order</div>
      )}

      {/* Show the "Mark as Complete" button only for pending orders */}
      {tab === "pending" && (
        <button 
          onClick={() => handleCompleteOrder(order._id)} 
          className="complete-order-btn"
        >
          Mark as Complete
        </button>
      )}
    </div>
  ))
)}

          </div>
        </div>
      </div>      
    </div>
  );
}

