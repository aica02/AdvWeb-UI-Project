import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/profile.css";

const API = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const [receivedOrders, setReceivedOrders] = useState({});
  const [enabledReceiveButtons, setEnabledReceiveButtons] = useState({});
  const [enabledCancelButtons, setEnabledCancelButtons] = useState({});
  const [receiveCountdown, setReceiveCountdown] = useState({});
  const [cancelCountdown, setCancelCountdown] = useState({});


  const fetchOrders = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API}/api/cart/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = Array.isArray(res.data)
        ? res.data.map((order) => ({
            ...order,
            books: (order.books || []).map((item) => ({
              ...item,
              image:
                item.image ||
                (item.book && (item.book.coverImage || item.book.image))
                  ? item.image?.startsWith("http")
                    ? item.image
                    : `../public/uploads/${item.image || item.book.coverImage || item.book.image}`
                  : `${API}/uploads/default.png`,
            })),
          }))
        : [];

      setOrders(normalized);

      const now = Date.now();
      const receiveMap = {};
      const cancelMap = {};

      normalized.forEach((order) => {
        const created = new Date(order.createdAt).getTime();
        const diff = now - created;

        receiveMap[order._id] = diff >= 60000;
        cancelMap[order._id] = diff <= 10000;
      });

      setEnabledReceiveButtons(receiveMap);
      setEnabledCancelButtons(cancelMap);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const receiveMap = {};
      const cancelMap = {};
      const receiveTime = {};
      const cancelTime = {};

      orders.forEach((order) => {
        const created = new Date(order.createdAt).getTime();
        const diff = now - created;

        // Receive (60s)
        const receiveRemaining = Math.max(0, 60000 - diff);
        receiveMap[order._id] = receiveRemaining === 0;
        receiveTime[order._id] = Math.ceil(receiveRemaining / 1000);

        // Cancel (10s)
        const cancelRemaining = Math.max(0, 10000 - diff);
        cancelMap[order._id] = cancelRemaining > 0;
        cancelTime[order._id] = Math.ceil(cancelRemaining / 1000);
      });

      setEnabledReceiveButtons(receiveMap);
      setEnabledCancelButtons(cancelMap);
      setReceiveCountdown(receiveTime);
      setCancelCountdown(cancelTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  
  const handleReceiveOrder = async (orderId) => {
    try {
      await axios.put(`${API}/api/cart/orders/receive/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReceivedOrders((prev) => ({ ...prev, [orderId]: true }));
      fetchOrders();
    } catch {
      alert("Failed to receive order.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`${API}/api/cart/orders/cancel/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      setEnabledCancelButtons((prev) => ({ ...prev, [orderId]: false }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  const formatCurrency = (amount) => amount.toFixed(2);


  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <>
      <nav className="breadcrumb">
      <Link to="/" className="breadcrumb-link">Home</Link>
      <span className="breadcrumb-separator">/</span>
      <span className="breadcrumb-link active">My Order</span>
    </nav>
    
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="info-profile-menu">
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
                <div style={{ textAlign: "center", color: "#888" }}>No orders found.</div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <h3>Order #{order._id}</h3>

                      <p>
                        Status:{" "}
                        <span
                          style={{
                            color:
                              order.status === "Complete"
                                ? "green"
                                : order.status === "Cancelled"
                                ? "red"
                                : "orange",
                            fontWeight: "bold",
                         }}
                        >
                          {order.status || "Pending"}
                        </span>

                      </p>
                    </div>

                    {order.books.map((item, idx) => (
                      <div key={`${order._id}-${idx}`} className="order-item-detail">
                        <div className="order-item-media">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            style={{ maxWidth: "100%", height: "auto" }}
                          />
                        </div>

                        <div className="order-item-info">
                          <div className="order-item-title">
                            <strong>{item.title}</strong>
                          </div>
                          <div className="order-item-author">{item.author}</div>
                          <div className="order-item-qty">Quantity: {item.quantity}</div>
                        </div>

                        <div className="order-item-price">
                          ₱{formatCurrency(item.price * item.quantity + 100)}
                        </div>
                      </div>
                    ))}

                    {/* ACTION BUTTONS */}
                    {order.status === "Pending" && !receivedOrders[order._id] && (
                      <div className="order-actions">
                        {/* CANCEL BUTTON: disappears when the timer ends */}
                        {enabledCancelButtons[order._id] && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel Order ({cancelCountdown[order._id]}s)
                          </button>
                        )}

                        {/* RECEIVE BUTTON */}
                        <button
                          className={`receive-btn ${enabledReceiveButtons[order._id] ? "" : "disabled"}`}
                          onClick={() => handleReceiveOrder(order._id)}
                          disabled={!enabledReceiveButtons[order._id]}
                        >
                          {enabledReceiveButtons[order._id]
                            ? "Receive Order"
                            : `Enable in ${receiveCountdown[order._id]}s`}
                        </button>
                      </div>
                    )}

                    {(receivedOrders[order._id] || order.status === "Complete") && (
                      <div className="order-received-label">
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
