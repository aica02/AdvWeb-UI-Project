import { useState } from "react";
import { FaUser, FaHeart, FaShoppingCart, FaUserCircle, FaBell, FaSignOutAlt} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/loginmodal.css";

const API = import.meta.env.VITE_API_URL;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Real login function
  const handleLogin = async (email, password) => {
    setLoginError("");
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <>
      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <h1>Logo here</h1>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Books"
              className="search-input"
            />
            <FiSearch className="search-icon" size={18} />
          </div>
        </div>

        {/* Profile + Notification */}
        <div className="profile-menu">
          {isLoggedIn && (
            <div className="notification-bell">
              <FaBell className="icon-bell" size={20} />
              <span className="notif-count">2</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="profile-button"
          >
            <FaUser className="icon-user" size={20} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="dropdown">
              <ul>
                {isLoggedIn ? (
                  <>
                    <li>
                      <FaUser className="dropdown-icon" />
                      <Link to="/#">Profile</Link>
                    </li>
                    <li>
                      <FaHeart className="dropdown-icon" />
                      <Link to="/#">Wishlist</Link>
                    </li>
                    <li>
                      <FaShoppingCart className="dropdown-icon" />
                      <Link to="/#">Cart</Link>
                    </li>
                    <li>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span onClick={() => {
                        setIsLoggedIn(false);
                        setIsOpen(false);
                        }} style={{ cursor: "pointer" }}>
                        Log out
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <FaUserCircle className="dropdown-icon" />
                      <span
                        onClick={() => {
                          setShowLoginModal(true);
                          setIsOpen(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        Login / Register
                      </span>
                    </li>
                    <li>
                      <FaUser className="dropdown-icon" />
                      <Link to="/#">Profile</Link>
                    </li>
                    <li>
                      <FaHeart className="dropdown-icon" />
                      <Link to="/#">Wishlist</Link>
                    </li>
                    <li>
                      <FaShoppingCart className="dropdown-icon" />
                      <Link to="/#">Cart</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* ===== LOGIN MODAL ===== */}
        {showLoginModal && (
          <div
            className="login-modal-overlay"
            onClick={() => setShowLoginModal(false)}
          >
            <div
              className="login-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Login Form</h2>
              <p>Login here Using Email & Password</p>

              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />

              <button
                className="modal-btn"
                onClick={() => handleLogin(loginEmail, loginPassword)}
              >
                LOGIN
              </button>
              {loginError && <p className="auth-message" style={{color:'red'}}>{loginError}</p>}
              <p className="modal-footer">
                Not a member?{" "}
                <span
                  className="signup-now"
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/auth");
                  }}
                >
                  Signup now
                </span>
              </p>
            </div>
          </div>
        )}
        {/* ===== END MODAL ===== */}
      </header>

      <nav className="sub-nav">
        <ul>
          <li>
            <Link to="/bestseller">BEST SELLER</Link>
          </li>
          <li>
            <Link to="/newrelease">NEW RELEASES</Link>
          </li>
          <li>
            <Link to="/booksales">BOOK SALES</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
