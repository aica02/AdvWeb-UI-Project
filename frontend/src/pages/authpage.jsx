import React, { useState } from "react";
import "../css/authpage.css"

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
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

              <form>
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <div className="form-options">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="auth-btn">Log In</button>
              </form>

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

              <form>
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <input type="password" placeholder="Confirm Password" required />
                <label className="checkbox">
                  <input type="checkbox" /> By signing up I agree with
                  <span> Terms and Privacy Policy</span>
                </label>
                <button type="submit" className="auth-btn">Create Account</button>
              </form>

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
