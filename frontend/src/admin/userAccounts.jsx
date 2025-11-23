import React, { useEffect, useState } from "react";
import "../css/admin.css";
const API = "https://bookwise-5dvu.onrender.com";
const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Do you really want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/admin/useraccountsdelete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
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
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email} <div style={{fontSize: '0.85rem', color:'#666'}}>Orders: {user.totalOrders ?? 0}</div></td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(user._id)}>
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
    </section>
  );
};

export default UserAccounts;