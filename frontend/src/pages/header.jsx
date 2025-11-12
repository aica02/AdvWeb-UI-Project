import { useState, useEffect } from "react";
import { FaUser, FaHeart, FaShoppingCart, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/loginmodal.css";

const API = import.meta.env.VITE_API_URL;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Keep isLoggedIn in sync if token changes in other tabs
  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", syncLoginState);
    return () => window.removeEventListener("storage", syncLoginState);
  }, []);

  // Fetch cart count for logged-in users
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(res.data.books?.length || 0);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCart();
  }, [isLoggedIn]);

  const handleCartClick = () => navigate("/cart");

  // Login function
  const handleLogin = async (email, password) => {
    setLoginError("");
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");

      navigate(data.role === "admin" ? "/admin" : "/profile", { replace: true });
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate("/auth");
  };

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <h1>Logo here</h1>
        </div>

        <div className="header-search">
          <div className="search-container">
            <input type="text" placeholder="Search Books" className="search-input" />
            <FiSearch className="search-icon" size={18} />
          </div>
        </div>

        <div className="profile-menu">
          {isLoggedIn && (
            <div className="cart-icon" onClick={handleCartClick}>
              <FaShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
          )}

          <button onClick={() => setIsOpen(!isOpen)} className="profile-button">
            <FaUser className="icon-user" size={20} />
          </button>

          {isOpen && (
            <div className="dropdown">
              <ul>
                {!isLoggedIn ? (
                  <li onClick={() => { setShowLoginModal(true); setIsOpen(false); }}>
                    <FaUserCircle className="dropdown-icon" />
                    <span>Login / Register</span>
                  </li>
                ) : (
                  <>
                    <li onClick={() => navigate("/profile")}>
                      <FaUser className="dropdown-icon" />
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li onClick={() => navigate("/wishlist")}>
                      <FaHeart className="dropdown-icon" />
                      <Link to="/wishlist">Wishlist</Link>
                    </li>
                    <li onClick={handleCartClick}>
                      <FaShoppingCart className="dropdown-icon" />
                      <span>Cart</span>
                    </li>
                    <li onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon"/>
                      <span>Log Out</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* ===== LOGIN MODAL ===== */}
        {showLoginModal && (
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
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

              <button className="modal-btn" onClick={() => handleLogin(loginEmail, loginPassword)}>
                LOGIN
              </button>

              {loginError && <p className="auth-message" style={{color:'red'}}>{loginError}</p>}

              <p className="modal-footer">
                Not a member?{" "}
                <span className="signup-now" onClick={() => { setShowLoginModal(false); navigate("/auth"); }}>
                  Signup now
                </span>
              </p>
            </div>
          </div>
        )}
      </header>

      <nav className="sub-nav">
        <ul>
          <li><Link to="/viewAll">BEST SELLER</Link></li>
          <li><Link to="/viewAll">NEW RELEASES</Link></li>
          <li><Link to="/viewAll">BOOK SALES</Link></li>
        </ul>
      </nav>
    </>
  );
}
