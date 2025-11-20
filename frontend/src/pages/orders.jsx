import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/order.css";
import Header from './header';
import Footer from './footer';

const API = import.meta.env.VITE_API_URL;

const API = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API}/api/cart/orders/complete`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log("Completed Orders:", res.data);
      // Normalize images in orders for display
      const normalized = Array.isArray(res.data)
        ? res.data.map((order) => ({
            ...order,
            books: (order.books || []).map((item) => ({
              ...item,
              image: (item.book && (item.book.coverImage || item.book.image))
                ? (item.book.coverImage?.startsWith('http') ? item.book.coverImage : `${API}/${item.book.coverImage || item.book.image}`)
                : `${API}/uploads/default.png`,
            })),
          }))
        : [];

      setOrders(normalized);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount) => amount.toFixed(2);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <>
    <Header />
    
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
                    <p>Status: <span style={{ color: "green", fontWeight: "bold" }}>Completed</span></p>
                  </div>

                  {order.books && order.books.length > 0 ? (
  order.books.map((item, idx) => (
    <div key={`${order._id}-${idx}`} className="order-item-detail">
      <div className="order-item-media">
        <img
          src={item.image || "https://dummyimage.com/200x280/cccccc/000000&text=No+Image"}
          alt={item.book?.title || "No Title"}
          loading="lazy"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="order-item-info">
        <div className="order-item-title"><strong>{item.book?.title || "No Title"}</strong></div>
        <div className="order-item-author">{item.book?.author || "No Author"}</div>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>      
    </div>
    <Footer />
    </>
  );
}
