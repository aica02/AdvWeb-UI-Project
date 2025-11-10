import { useState } from "react";
import { FaUser, FaHeart, FaShoppingCart, FaUserCircle, FaBell, FaSignOutAlt} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../css/loginmodal.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Mock login function
  const handleLogin = (email, password) => {
    if (email === "user@example.com" && password === "1234") {
      setIsLoggedIn(true);
      setShowLoginModal(false);
    } else {
      alert("Invalid credentials");
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
                    <li onClick={() => { navigate("/wishlist")}}>
                      <FaHeart className="dropdown-icon" />
                      <Link to="/wishlist">Wishlist</Link>
                    </li>
                    <li>
                      <FaShoppingCart className="dropdown-icon" />
                      <Link to="/#">Cart</Link>
                    </li>
                    <li onClick={() => {setIsLoggedIn(false); setIsOpen(false); navigate("/")}} style={{ cursor: "pointer" }}>
                      <FaSignOutAlt className="dropdown-icon"/>
                      <span>Log out</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li onClick={() => { setShowLoginModal(true); setIsOpen(false); }}>
                      <FaUserCircle className="dropdown-icon" />
                      <span>Login / Register</span>
                    </li>
                    <li>
                      <FaUser className="dropdown-icon" />
                      <Link to="/#">Profile</Link>
                    </li>
                    <li onClick={() => { navigate("/wishlist")}}>
                      <FaHeart className="dropdown-icon" />
                      <Link to="/wishlist">Wishlist</Link>
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

              <input id="emailInput" type="email" placeholder="Email" />
              <input id="passwordInput" type="password" placeholder="Password" />

              <button
                className="modal-btn"
                onClick={() => {
                  const email = document.getElementById("emailInput").value;
                  const password = document.getElementById("passwordInput").value;
                  handleLogin(email, password);
                }}
              >
                LOGIN
              </button>

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
            <Link to="/#">BEST SELLER</Link>
          </li>
          <li>
            <Link to="/#">NEW RELEASES</Link>
          </li>
          <li>
            <Link to="/#">BOOK SALES</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
