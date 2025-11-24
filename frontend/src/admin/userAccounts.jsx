import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/modals.css";

const API = "https://bookwise-5dvu.onrender.com";
const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const triggerNotification = (msg, type = "positive") => {
    setNotification(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      setError("Access denied. Admins only.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API}/api/admin/useraccountsdelete`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteConfirmed = async () => {
  if (!userToDelete) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/api/admin/useraccountsdelete/${userToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete));
      triggerNotification("User deleted successfully", "positive");
    } else {
      triggerNotification("Failed to delete user", "negative");
    }
  } catch (err) {
    console.error("Delete failed:", err);
    triggerNotification("An error occurred", "negative");
  }

  setShowDeleteModal(false);
  setUserToDelete(null);
};

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
    {/* notification */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}
    <section className="dashboard-overview user-accounts">
      <h2>User Account</h2>
      <p className="subheading">Book Store All User Accounts</p>

      <h3 className="user-table-title">All Accounts</h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>
                  {user.email}
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                    Orders: {user.totalOrders ?? 0}
                  </div>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setUserToDelete(user._id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>

            <div className="logout-modal-buttons">
              <button
                className="cancel-modal-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button className="confirm-modal-btn" onClick={handleDeleteConfirmed}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
    </>
  );
};

export default UserAccounts;
