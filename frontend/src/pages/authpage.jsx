import React, { useState } from "react";
import axios from "axios";
import "../css/authpage.css"

const API = import.meta.env.VITE_API_URL;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

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
      setMessage("Logged in successfully!");
      // Optionally: save token, redirect, etc.
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
      const { data } = await axios.post(`${API}/api/auth/register`, {
        email: form.email,
        password: form.password,
      });
      setMessage("Registered successfully! Please log in.");
      setIsLogin(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className={`auth-container ${isLogin ? "login-active" : "signup-active"}`}>
      <div className="auth-box">
        {/* Left Side (Image & Logo) */}
        <div className="auth-image-side">
          <div className="logo-container">
            <img 
              alt="Bookstore Logo"
              className="auth-logo"
            />
            <h2 className="brand-name">BooksStore Logo</h2>
          </div>
        </div>

        {/* Right Side (Form) */}
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
