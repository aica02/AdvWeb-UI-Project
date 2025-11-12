import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/profileInfo.css";

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      try {
        const { data } = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        setError("Failed to load user info");
      }
    };
    fetchUser();
  }, [navigate]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="info-profile-menu">
          <Link to="/profile">Account Information</Link>
          <Link to="/orders">My Orders</Link>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-section">
            <div className="section-title">Personal Information</div>
            <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <strong>First Name</strong><br />{user.firstName || "-"}
              </div>
              <div>
                <strong>Last Name</strong><br />{user.lastName || "-"}
              </div>
              <div>
                <strong>Birth Date</strong><br />{user.birthDate ? user.birthDate.slice(0,10) : "-"}
              </div>
              <div>
                <strong>Phone Number</strong><br />{user.phone || "-"}
              </div>
              <div style={{ gridColumn: '1 / 2' }}>
                <strong>Gender</strong><br />{user.gender || "-"}
              </div>
              <div style={{ gridColumn: '2 / 3' }}>
                <strong>Email</strong><br />{user.email}
              </div>
            </div>
          </div>
          <div className="profile-section" style={{ marginTop: 24 }}>
            <div className="section-title">Address Information</div>
            <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <strong>Province</strong><br />{user.province || "-"}
              </div>
              <div>
                <strong>Postal Code</strong><br />{user.postalCode || "-"}
              </div>
              <div>
                <strong>City/Municipality</strong><br />{user.city || "-"}
              </div>
              <div>
                <strong>Barangay</strong><br />{user.barangay || "-"}
              </div>
              <div style={{ gridColumn: '1 / 3' }}>
                <strong>Street</strong><br />{user.street || "-"}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 5, marginLeft:35}}>
            <Link to="/profile/edit"><button className="profile-btn">Edit Profile</button></Link>
            <Link to="/profile/change-password"><button className="profile-btn">Change Password</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
