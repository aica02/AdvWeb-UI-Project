import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/forgotPassword.css";
import "../css/authpage.css";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [userOTP, setUserOTP] = useState("");
  const [otpGeneratedAt, setOtpGeneratedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const OTP_DURATION = 2 * 60 * 1000; // 2 minutes

  // Timer countdown
  useEffect(() => {
    if (!otpGeneratedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = otpGeneratedAt + OTP_DURATION - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpGeneratedAt]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const checkEmailExists = async () => {
    if (!email) return setMessage("Please enter your email.");

    setMessage("Verifying email...");
    try {
      const res = await axios.post(`${API}/api/auth/check-email`, { email });
      setEmailVerified(true);
      setMessage("Email verified. Click 'Send OTP' to continue.");
    } catch (err) {
      setEmailVerified(false);
      setMessage(err.response?.data?.message || "Email not found in our system.");
      setGeneratedOTP("");
      setOtpGeneratedAt(null);
    }
  };

  const sendOTP = async () => {
    if (!emailVerified) return setMessage("Please verify your email first.");
    if (!email) return setMessage("Email is missing.");

    setSendingOTP(true);
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setOtpGeneratedAt(Date.now());
    setMessage("Sending OTP...");

    const params = { email, otp_code: otp };

    try {
      // If you want backend to send OTP, replace this with axios.post(`${API}/api/auth/send-otp`, { email })
      await emailjs.send("service_fnv6yy9", "template_nhz1nbo", params, "6_oRF3euZ6rfiEpWB");
      setMessage("OTP sent to your email.");
    } catch (err) {
      setMessage("Failed to send OTP. Try again later.");
      console.error(err);
      setGeneratedOTP("");
      setOtpGeneratedAt(null);
    } finally {
      setSendingOTP(false);
    }
  };

  const verifyOTP = () => {
    if(!generatedOTP) 
      return setMessage("Please request an OTP first.");

    if(timeLeft <= 0){
      return setMessage("OTP expired. Please resend.");
    }

    if(userOTP === generatedOTP){
      setOtpVerified(true);
      setGeneratedOTP(""); // Clear OTP to hide "expired" message
      setOtpGeneratedAt(null);
      setTimeLeft(0);
      return setMessage("OTP verified — you may reset your password now.");
    }

    // If OTP is incorrect
    setMessage("Incorrect OTP. Please try again.");
  };


  const submitPassword = async (e) => {
    e.preventDefault();

    if (!otpVerified) return setMessage("Please verify OTP first.");
    if (newPassword.length < 6) return setMessage("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setMessage("Passwords do not match.");

    try {
      // Backend endpoint — make sure it exists and accepts { email, newPassword }
      await axios.post(`${API}/api/auth/reset-password`, { email, newPassword });
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/auth"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className={`auth-container login-active`}>
      <div className="auth-box">
        <div className="auth-image-side">
          <div className="logo-container">
            <img alt="Bookstore Logo" className="auth-logo" />
            <h2 className="brand-name">BooksStore</h2>
            <p className="auth-hero">Reset your account password securely</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="form-container login-form">
            <h2>Forgot Password</h2>
            <p>Enter your registered email to receive an OTP.</p>

            <div className="form-group">
              <input
                className={emailVerified ? "input-success" : ""}
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); }}
                disabled={emailVerified}
                required
              />
              <div style={{ marginTop: 8 }}>
                {!emailVerified ? (
                  <button className="auth-btn" onClick={checkEmailExists} type="button">Verify Email</button>
                ) : (
                  <button className="auth-btn" onClick={sendOTP} type="button" disabled={sendingOTP}>
                    {sendingOTP ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <input
                className={otpVerified ? "input-success" : ""}
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={userOTP}
                onChange={(e) => setUserOTP(e.target.value)}
                disabled={otpVerified || !generatedOTP}
              />
              <div style={{ marginTop: 8 }}>
                <button className="auth-btn" onClick={verifyOTP} type="button" disabled={!generatedOTP || otpVerified}>Verify OTP</button>
              </div>
              {timeLeft > 0 && !otpVerified && <p className="auth-sub">Expires in: {formatTime(timeLeft)}</p>}
              {timeLeft === 0 && generatedOTP && !otpVerified && <p className="auth-error">OTP expired</p>}
            </div>

            <form onSubmit={submitPassword}>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!otpVerified}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!otpVerified}
                required
              />

              <button type="submit" className="auth-btn" disabled={!otpVerified}>Reset Password</button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <p className="toggle-text">
              <span onClick={() => navigate("/auth")} className="toggle-link">Back to Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}