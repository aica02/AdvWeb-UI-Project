import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/admin.css";

const API = import.meta.env.VITE_API_URL;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterUserName, setFilterUserName] = useState("");
  const [filterBookTitle, setFilterBookTitle] = useState("");

  const fetchAllOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API}/api/cart/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrichedOrders = Array.isArray(res.data)
        ? res.data.map((order) => ({
            ...order,
            userName: order.user
              ? `${order.user.firstName} ${order.user.lastName}`
              : "Unknown User",
          }))
        : [];

      setOrders(enrichedOrders);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(
        err.response?.data?.message || "Failed to fetch orders. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const userNameMatch = filterUserName
      ? (order.userName || "").toLowerCase().includes(filterUserName.toLowerCase())
      : true;

    const bookTitleMatch = filterBookTitle
      ? (order.books || [])
          .map((b) => b.title || "")
          .join(" ")
          .toLowerCase()
          .includes(filterBookTitle.toLowerCase())
      : true;

    return userNameMatch && bookTitleMatch;
  });

  return (
    <section className="admin-section">
      <h2 style={{ margin: 30 }}>All Orders</h2>

      <div className="filters-container" style={{ marginBottom: "20px" }}>
        <div className="filter-group">
          <label htmlFor="filterUserName">Filter by User Name</label>
          <input
            id="filterUserName"
            type="text"
            placeholder="Enter user name..."
            value={filterUserName}
            onChange={(e) => setFilterUserName(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filterBookTitle">Filter by Book Title</label>
          <input
            id="filterBookTitle"
            type="text"
            placeholder="Enter book title..."
            value={filterBookTitle}
            onChange={(e) => setFilterBookTitle(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Name</th>
              <th>Book Titles</th>
              <th>Total Qty</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const titles = (order.books || [])
                  .map((b) => b.title)
                  .join(", ");

                const totalQty = (order.books || []).reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0
                );

                const totalPrice =
                  order.totalAmount ||
                  (order.books || []).reduce(
                    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                    0
                  );

                return (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userName}</td>
                    <td style={{ maxWidth: 300 }}>{titles}</td>
                    <td>{totalQty}</td>
                    <td>₱{(totalPrice || 0).toFixed(2)}</td>
                    <td
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="error-message" style={{ marginTop: "12px", color: "red" }}>
          {error}
        </div>
      )}
    </section>
  );
};

export default AdminOrders;
