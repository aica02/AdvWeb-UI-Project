import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/editProfile.css";


const API = import.meta.env.VITE_API_URL;

export default function EditProfile() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    gender: "Male",
    email: "",
    province: "",
    postalCode: "",
    city: "",
    barangay: "",
    street: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/auth");
      try {
        const { data } = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({ ...form, ...data.user, birthDate: data.user.birthDate ? data.user.birthDate.slice(0,10) : "" });
      } catch {
        setMessage("Failed to load user info");
      }
    };
    fetchUser();
  }, []);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === "radio" ? value : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${API}/api/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Profile updated!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch {
      setMessage("Failed to update profile");
    }
  };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/profile" className="breadcrumb-link">Personal Information</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">Edit Profile</span>
      </nav>
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="edit-profile-menu">
          <Link to="/profile">Account Information</Link>
          <Link to="/orders">My Orders</Link>

        </div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <h2>Edit Account Information</h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-section">
              <div className="section-title">Personal Information</div>
              <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label>First Name*</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <label>Last Name*</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
                <div>
                  <label>Birth Date*</label>
                  <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
                </div>
                <div>
                  <label>Phone Number*</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div style={{ gridColumn: '1 / 2' }}>
                  <label>Gender*</label><br />
                  <label><input type="radio" name="gender" value="Male" checked={form.gender === "Male"} onChange={handleChange} /> Male</label>
                  <label><input type="radio" name="gender" value="Female" checked={form.gender === "Female"} onChange={handleChange} /> Female</label>
                </div>
                <div style={{ gridColumn: '2 / 3' }}>
                  <label>Email*</label>
                  <input type="email" name="email" value={form.email} readOnly style={{ background: '#f5f5f5' }} />
                </div>
              </div>
            </div>
            <div className="profile-section" style={{ marginTop: 24 }}>
              <div className="section-title">Address Information</div>
              <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label>Province*</label>
                  <input type="text" name="province" value={form.province} onChange={handleChange} required />
                </div>
                <div>
                  <label>Postal Code*</label>
                  <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} required />
                </div>
                <div>
                  <label>City/Municipality*</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <div>
                  <label>Barangay*</label>
                  <input type="text" name="barangay" value={form.barangay} onChange={handleChange} required />
                </div>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label>Street*</label>
                  <input type="text" name="street" value={form.street} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <button className="profile-btn" style={{ marginTop: 24, marginLeft:20, width: 160 }}>Save Profile</button>
            {message && <p style={{ color: message.includes('updated') ? 'green' : 'red', marginTop: 10 }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
