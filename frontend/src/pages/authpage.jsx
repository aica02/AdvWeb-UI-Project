import React, { useState } from "react";
import axios from "axios";
import "../css/authpage.css";
import "../css/modals.css";
import { Navigate, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/bookwise-nobg.png";

const API = import.meta.env.VITE_API_URL;

const AuthPage = () => {
  const navigate = useNavigate(); // ← add this
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const triggerNotification = (msg, type = "positive") => {
    setNotification(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

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

      triggerNotification("Logged in successfully!", "positive");
      setTimeout(() => setRedirect(true), 500);
    } catch (err) {
      setMessage(triggerNotification("Invalid Credentials", "negative") || triggerNotification("Invalid Credentials", "negative"));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      triggerNotification("Passwords do not match", "negative");
      return;
    }
    try {
      await axios.post(`${API}/api/auth/register`, {
        email: form.email,
        password: form.password,
      });
      triggerNotification("Account created successfully! Please log in.", "positive");
      setIsLogin(true);
    } catch (err) {
      setMessage(triggerNotification("Signup failed", "negative") || triggerNotification("Signup failed", "negative"));
    }
  };

  if (redirect) {
    const role = localStorage.getItem("role");
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/"} replace />;
  }

  return (
    <>
    {/* notification */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}
    <div className={`auth-container ${isLogin ? "login-active" : "signup-active"}`}>
      <div className="back-to-home-button" style={{ padding: "1rem", cursor: "pointer" }} onClick={() => navigate("/")}>
        <FaArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
        Back to Home
      </div>

      <div className="auth-box">
        <div className="auth-image-side">
          <div className="logo-container">
            <img alt="Bookstore Logo" className="auth-logo" src={logo} />
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

{/* nilagay ko lang sa loob ng div yung forget pass */}
                <div className="form-options">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <p>
                    <span onClick={() => navigate("/forgot-password")} className="toggle-link">
                      Forgot Password?
                    </span>
                  </p>
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
              <h2>Sign Up</h2>
              <p>Sign Up to use all feature’s of the Application</p>

              <form onSubmit={handleSignup}>
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
                <label className="checkbox">
                  <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                    />{" "} By signing up I agree with
                  <span
                    className="link-button"
                    onClick={() => {setModalType('terms');
                      setIsModalOpen(true);
                    }}
                  >
                    Terms
                  </span>{' '}
                  and{' '}
                  <span
                    className="link-button"
                    onClick={() => {
                      setModalType('privacy');
                      setIsModalOpen(true);
                     }}
                  >
                    Privacy Policy
                  </span>
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

    {/* Modal */}
    {isModalOpen && modalType === 'terms' && (
      <div className="auth modal-overlay">
        <div className="auth privacy-modal">
          <div className="auth privacy-content">
            <p>
              <p className="date-update">Last Updated: November 23, 2025</p><br /><br />

              These <span className="span-color-red">Terms and Conditions</span> govern your use of BookWise, including our website at http://localhost:5173/ and any services we provide. By accessing or using our services, you agree to be bound by these Terms and Conditions.<br /><br />

              If you do not agree to these terms, please do not use our website or services.<br /><br />

              <strong>Acceptance of Terms</strong><br />
              By using BookWise, you confirm that you understand and agree to comply with these Terms and Conditions. These terms apply to all users of the website, including visitors, registered users, and contributors.<br /><br />

              <strong>User Responsibilities</strong><br />
              As a user, you agree to:<br />
              • Use the services lawfully and in accordance with all applicable regulations.<br />
              • Provide accurate and complete information when creating an account or using the services.<br />
              • Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.<br /><br />

              <strong>Prohibited Conduct</strong><br />
              Users must not:<br />
              • Use the services for any illegal or unauthorized purpose.<br />
              • Interfere with the security or proper functioning of the website or services.<br />
              • Attempt to access other users’ accounts or sensitive information.<br /><br />

              <strong>Limitation of Liability</strong><br />
              BookWise is not responsible for any damages or losses resulting from the use or inability to use our services. Users agree to use the services at their own risk.<br /><br />

              <strong>Modification of Terms</strong><br />
              We reserve the right to modify these Terms and Conditions at any time. Updates will be posted on this page with the effective date. Continued use of the services constitutes acceptance of any changes.<br /><br />

              <strong>Governing Law</strong><br />
              These Terms and Conditions are governed by the laws of the jurisdiction where BookWise operates.
            </p>
          </div>
          <div className="auth modal-footer">
            <button className="auth modal-close" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {isModalOpen && modalType === 'privacy' && (
      <div className="auth modal-overlay">
        <div className="auth privacy-modal">
          <div className="auth privacy-content">
            <p>
              <p className="date-update">Last Updated: November 23, 2025</p><br /><br />

              This <span className="span-color-red">Privacy Policy</span> explains the information collection, use, and sharing practices of BookWise.<br /><br />

              Unless otherwise stated, this Policy describes and governs the information collection, use, and sharing practices of BookWise with respect to your use of our website http://localhost:5173/ and the services we provide and host on our servers.<br /><br />

              Before you use or submit any information through or in connection with the Services, please carefully review this Privacy Policy. By using any part of the Services, you understand that your information will be collected, used, and disclosed as outlined in this Privacy Policy.<br /><br />

              If you do not agree to this privacy policy, please do not use our Services.<br /><br />

              <strong>Our Principles</strong><br />

              <span className="span-color-red">BookWise</span> has designed this policy to be consistent with the following principles:<br />
              • Privacy policies should be human readable and easy to find.<br />
              • Data collection, storage, and processing should be simplified as much as possible to enhance security and consistency.<br />
              • Data practices should meet the reasonable expectations of users.<br /><br />

              <strong>Information We Collect</strong><br />
              We collect information in several ways to provide and improve our services. This includes information you provide directly to us, such as personal details, contact information, and any other data you submit voluntarily. Collecting this information helps us better understand your needs, enhance your experience, and ensure that our services are tailored to you.<br /><br />
              <strong>Information You Provide</strong><br />
              <em>Account Information</em><br />
              When you create an account, we collect personal details like your name, email address, shipping address, and payment information.<br /> 
              <em>Communications</em><br />
              We may collect information from you when you contact us for support, provide feedback, or participate in surveys.<br /><br />

              <strong>Device/Usage Information</strong><br />
              We may automatically collect certain information about the computer or devices you use to access the Services.
            </p>
          </div>
          <div className="auth modal-footer">
            <button className="auth modal-close" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AuthPage;
