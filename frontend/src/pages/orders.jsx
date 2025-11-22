import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/order.css";

const API = import.meta.env.VITE_API_URL;

const API = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [receivedOrders, setReceivedOrders] = useState({});
  const [enabledReceiveButtons, setEnabledReceiveButtons] = useState({});
  const [enabledCancelButtons, setEnabledCancelButtons] = useState({});

  const fetchOrders = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");

      // Fetch all orders (both Pending and Complete statuses)
      const res = await axios.get(`${API}/api/cart/orders/all`, {
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log("Orders:", res.data);
      // Normalize images in orders for display
      const normalized = Array.isArray(res.data)
        ? res.data.map((order) => ({
            ...order,
            books: (order.books || []).map((item) => ({
              ...item,
              image: item.image || (item.book && (item.book.coverImage || item.book.image))
                ? (item.image && item.image.startsWith('http') ? item.image : `${API}/${item.image || item.book.coverImage || item.book.image}`)
                : `${API}/uploads/default.png`,
            })),
          }))
        : [];

      setOrders(normalized);

      // Enable receive buttons for orders older than 1 minute
      const now = Date.now();
      const enabledMap = {};
      const cancelMap = {};
      normalized.forEach((order) => {
        const createdTime = new Date(order.createdAt).getTime();
        const timeDiff = now - createdTime;
        enabledMap[order._id] = timeDiff >= 60000; // 60000ms = 1 minute
        cancelMap[order._id] = timeDiff <= 10000; // within 10 seconds allowed to cancel
      });
      setEnabledReceiveButtons(enabledMap);
      setEnabledCancelButtons(cancelMap);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set interval to check and enable buttons after 1 minute
    const interval = setInterval(() => {
      setEnabledReceiveButtons((prev) => {
        const now = Date.now();
        const updated = { ...prev };
        orders.forEach((order) => {
          if (!prev[order._id]) {
            const createdTime = new Date(order.createdAt).getTime();
            const timeDiff = now - createdTime;
            updated[order._id] = timeDiff >= 60000;
          }
        });
        return updated;
      });
      setEnabledCancelButtons((prev) => {
        const now = Date.now();
        const updated = { ...prev };
        orders.forEach((order) => {
          const createdTime = new Date(order.createdAt).getTime();
          const timeDiff = now - createdTime;
          updated[order._id] = timeDiff <= 10000;
        });
        return updated;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleReceiveOrder = async (orderId) => {
    try {
      await axios.put(`${API}/api/cart/orders/receive/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReceivedOrders((prev) => ({ ...prev, [orderId]: true }));
      fetchOrders(); // Refresh orders to show updated status
    } catch (err) {
      console.error("Error receiving order:", err);
      alert("Failed to receive order. Please try again.");
    }
  };

const handleCancelOrder = async (orderId) => {
  try {
    await axios.put(`${API}/api/cart/orders/cancel/${orderId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update local state to mark the order as cancelled
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: "Cancelled" } : order
      )
    );

    // Remove the cancel button for this order
    setEnabledCancelButtons((prev) => ({ ...prev, [orderId]: false }));

  } catch (err) {
    console.error("Error cancelling order:", err);
    alert(err.response?.data?.message || "Failed to cancel order.");
  }
};

  const formatCurrency = (amount) => amount.toFixed(2);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <>
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

          {error && <div className="error-message">{error}</div>}

          <div className="orders-list">
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", color: "#888" }}>
                No orders found.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <h3>Order #{order._id}</h3>
                    <p>Status: <span style={{ color: order.status === "Complete" ? "green" : "orange", fontWeight: "bold" }}>{order.status || "Pending"}</span></p>
                  </div>

                  {order.books && order.books.length > 0 ? (
  order.books.map((item, idx) => (
    <div key={`${order._id}-${idx}`} className="order-item-detail">
      <div className="order-item-media">
        <img
          src={item.image || "https://dummyimage.com/200x280/cccccc/000000&text=No+Image"}
          alt={item.title || "No Title"}
          loading="lazy"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="order-item-info">
        <div className="order-item-title"><strong>{item.title || "No Title"}</strong></div>
        <div className="order-item-author">{item.author || "No Author"}</div>
        <div className="order-item-qty">Quantity: {item.quantity}</div>
      </div>

      <div className="order-item-price">
        ₱{formatCurrency(item.price * item.quantity)}
      </div>
    </div>
  ))
) : (
  <div>No books in this order</div>
)}

                  {/* Receive Order Button */}
                  {order.status === "Pending" && !receivedOrders[order._id] && (
                    <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={() => handleReceiveOrder(order._id)}
                          disabled={!enabledReceiveButtons[order._id]}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: enabledReceiveButtons[order._id] ? "#007bff" : "#ccc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: enabledReceiveButtons[order._id] ? "pointer" : "not-allowed",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {enabledReceiveButtons[order._id] ? "Receive Order" : "Order Received (Enable in 1 min)"}
                        </button>

                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={!enabledCancelButtons[order._id]}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: enabledCancelButtons[order._id] ? "#dc3545" : "#eee",
                            color: enabledCancelButtons[order._id] ? "white" : "#999",
                            border: "none",
                            borderRadius: "4px",
                            cursor: enabledCancelButtons[order._id] ? "pointer" : "not-allowed",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  )}

                  {(receivedOrders[order._id] || order.status === "Complete") && (
                    <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd", color: "green", fontWeight: "600" }}>
                      ✓ Order Received
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>      
    </div>
    </>
  );
}
