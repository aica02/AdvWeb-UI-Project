import React, { useState } from "react";
import axios from "axios";
import "../css/authpage.css";
import { Navigate, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const AuthPage = () => {
  const navigate = useNavigate(); // ← add this
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setForm({ email: "", password: "", confirmPassword: "" });
    setMessage("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setMessage("Logged in successfully!");
      setTimeout(() => setRedirect(true), 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      await axios.post(`${API}/api/auth/register`, {
        email: form.email,
        password: form.password,
      });
      setMessage("Registered successfully! Please log in.");
      setIsLogin(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  if (redirect) {
    const role = localStorage.getItem("role");
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/"} replace />;
  }

  return (
    <div className={`auth-container ${isLogin ? "login-active" : "signup-active"}`}>
      <div className="back-to-home-button" style={{ padding: "1rem", cursor: "pointer" }} onClick={() => navigate("/")}>
        <FaArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
        Back to Home
      </div>

      <div className="auth-box">
        <div className="auth-image-side">
          <div className="logo-container">
            <img alt="Bookstore Logo" className="auth-logo" />
            <h2 className="brand-name">BooksStore Logo</h2>
          </div>
        </div>

        <div className="auth-form-side">
          {isLogin ? (
            <div className="form-container login-form">
              <h2>Welcome Back!</h2>
              <p>Sign Into your Account</p>

              <form onSubmit={handleLogin}>
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

                <div className="form-options">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                </div>
                
                <p className="toggle-text">
                  <span onClick={() => navigate("/forgot-password")} className="toggle-link">
                    Forgot Password?
                  </span>
                </p>

                <button type="submit" className="auth-btn">Log In</button>
              </form>

              {message && <p className="auth-message">{message}</p>}
              <p className="toggle-text">
                Not a member?{" "}
                <span onClick={toggleForm} className="toggle-link">
                  Signup now
                </span>
              </p>
            </div>
          ) : (
            <div className="form-container signup-form">
              <h2>Logo</h2>
              <p>Sign Up to use all feature’s of the Application</p>

              <form onSubmit={handleSignup}>
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
                <label className="checkbox">
                  <input type="checkbox" required /> By signing up I agree with
                  <span> Terms and Privacy Policy</span>
                </label>
                <button type="submit" className="auth-btn">Create Account</button>
              </form>
              {message && <p className="auth-message">{message}</p>}
              <p className="toggle-text">
                Already have an account?{" "}
                <span onClick={toggleForm} className="toggle-link">
                  Log In
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
