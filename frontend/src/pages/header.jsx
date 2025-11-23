import React, { useState, useEffect } from "react";
import { FaUser, FaHeart, FaShoppingCart, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/loginmodal.css";

const API = import.meta.env.VITE_API_URL;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // dynamic counters
  const [bestCount, setBestCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [saleCount, setSaleCount] = useState(0);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [autoResults, setAutoResults] = useState([]);
  const [showAuto, setShowAuto] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search") || "";
    setSearchTerm(prev => (prev === q ? prev : q));
  }, [location.search]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setAutoResults([]);
      setShowAuto(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/api/books/search?q=${encodeURIComponent(q)}`);
        setAutoResults(Array.isArray(res.data) ? res.data : (res.data?.books || []));
        setShowAuto(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    const syncLoginState = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncLoginState);
    return () => window.removeEventListener("storage", syncLoginState);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await axios.get(`${API}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(res.data?.books?.length || 0);
      } catch (err) {
        console.error("Header fetch cart error:", err);
        setCartCount(0);
      }
    };
    if (isLoggedIn) fetchCart();
    else setCartCount(0);
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      axios.get(`${API}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCartCount(res.data?.books?.length || 0))
        .catch(() => {});
    };

    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  // Fetch stats
useEffect(() => {
  const fetchHeaderStats = async () => {
    try {
      const res = await axios.get(`${API}/api/books`);
      // robustly find the array of books across common response shapes
      const books =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.books)
          ? res.data.books
          : Array.isArray(res.data?.data?.books)
          ? res.data.data.books
          : [];

      console.debug("Header stats: fetched books length =", books.length);

      // ---- configuration ----
      const NEW_DAYS = 90;
      const SALES_THRESHOLD = 5; // change this to whatever you want
      const topN = null; // set to a number (e.g. 10) to count only top N sellers; otherwise keep null to use threshold

      // ---- prepare arrays ----
      const now = new Date();
      let newly = 0;
      let sales = 0;

      // build array of objects { book, sold } for computing best sellers
      const soldList = books.map((b) => {
        // try multiple fields (string/number) and coerce to number
        const raw = b.sales ?? b.soldCount ?? b.totalSold ?? b.sold ?? b.count ?? 0;
        const sold = Number(String(raw || 0).replace(/[^0-9.-]+/g, "")) || 0;
        return { book: b, sold };
      });

      // ----- count best sellers ----
      let best = 0;
      if (topN && Number(topN) > 0) {

        const sorted = [...soldList].sort((a, b) => b.sold - a.sold);
        const top = sorted.slice(0, Number(topN));
        best = top.filter((o) => o.sold > 5).length;
        console.debug(`Header stats: using topN = ${topN}, best counted = ${best}`, top.map(t => t.sold));
      } else {
        best = soldList.filter((o) => o.sold > SALES_THRESHOLD).length;
        const anyNumericSales = soldList.some((o) => o.sold > 0);
        if (!anyNumericSales) {
          best = books.filter((b) => b.bestSeller === true || b.isBestSeller === true).length;
          console.debug("Header stats: no numeric sales found, falling back to boolean bestSeller, count =", best);
        } else {
          console.debug(`Header stats: using threshold ${SALES_THRESHOLD}, numeric best count =`, best);
        }
      }

      // ---- count new arrivals ----
      soldList.forEach(({ book: b }) => {
        const dateStr = b.releaseDate ?? b.createdAt ?? b.dateAdded ?? b.addedAt ?? b.publishedAt;
        if (b.isNew === true) {
          newly++;
        } else if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d)) {
            const days = (now - d) / (1000 * 60 * 60 * 24);
            if (days <= NEW_DAYS) newly++;
          }
        }
      });

      // ---- count sale items ----
      books.forEach((b) => {
        const oldP = Number(b.oldPrice ?? b.price ?? 0) || 0;
        const newP = Number(b.newPrice ?? 0) || Number(b.salePrice ?? 0) || 0;
        if (newP > 0 && oldP > 0 && newP < oldP) sales++;
      });

      // ---- set state ----
      setBestCount(best);
      setNewCount(newly);
      setSaleCount(sales);

    } catch (err) {
      console.error("Error fetching header stats:", err);
      // ensure counts reset on failure
      setBestCount(0);
      setNewCount(0);
      setSaleCount(0);
    }
  };

  fetchHeaderStats();
}, []);



  const handleCartClick = () => navigate("/cart");

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

      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        setShowPrivacyModal(true); // show modal for non-admin
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate("/auth");
  };

  // Privacy Modal Component
  const PrivacyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          className="modal-content"
          style={{
            background: "#fff",
            padding: "2rem",
            width: "80%",
            maxHeight: "90%",
            overflowY: "auto",
            borderRadius: "8px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Privacy Policy & Terms of Use</h2>
          <p>
            Welcome to BookWise! This Privacy Policy outlines how we collect, use, 
            and protect your personal information when you use our website.
          </p>
          <h3>Privacy Policy</h3>
          <p>
            We collect information to provide better services. Your email, name, 
            and purchase history are kept secure and used only to improve your experience.
          </p>
          <h3>Terms & Conditions</h3>
          <p>
            By using BookWise, you agree to our terms. All purchases are subject 
            to our sales policies. Unauthorized use of our content or website is prohibited.
          </p>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              zIndex: 9999,
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>BookWise</h1>
          </Link>
        </div>

        <div className="header-search">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search Books" 
              className="search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (searchTerm || "").trim();
                  if (q) navigate(`/viewAll?search=${encodeURIComponent(q)}`);
                  setShowAuto(false);
                }
              }}
            />
            <FiSearch 
              className="search-icon" 
              size={18} 
              role="button"
              onClick={() => {
                const q = (searchTerm || "").trim();
                if (q) navigate(`/viewAll?search=${encodeURIComponent(q)}`);
                setShowAuto(false);
              }}
            />

            {showAuto && autoResults.length > 0 && (
              <ul className="auto-dropdown">
                {autoResults.map((b) => (
                  <li 
                    key={b._id}
                    onClick={() => {
                      navigate(`/viewAll?search=${encodeURIComponent(b.title)}`);
                      setShowAuto(false);
                    }}
                  >
                    {b.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="profile-menu">
          {isLoggedIn && (
            <div className="cart-button" onClick={handleCartClick}>
              <FaShoppingCart className="icon-cart" size={20} />
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
                    <li onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                      <FaUser className="dropdown-icon" />
                      <span>Profile</span>
                    </li>

                    <li onClick={() => { navigate("/wishlist"); setIsOpen(false); }}>
                      <FaHeart className="dropdown-icon" />
                      <span>Wishlist</span>
                    </li>

                    <li onClick={() => { navigate("/cart"); setIsOpen(false); }}>
                      <FaShoppingCart className="dropdown-icon" />
                      <span>Cart</span>
                    </li>

                    <li onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Log Out</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {showLoginModal && (
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Login Form</h2>
              <p>Login here Using Email & Password</p>
              <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button className="modal-btn" onClick={() => handleLogin(loginEmail, loginPassword)}>LOGIN</button>
              {loginError && <p className="auth-message" style={{color:'red'}}>{loginError}</p>}
              <p className="modal-footer">Not a member? <span className="signup-now" onClick={() => { setShowLoginModal(false); navigate("/auth"); }}>Signup now</span></p>
            </div>
          </div>
        )}

        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </header>

      <nav className="sub-nav">
        <ul>
          <li><Link to="/bestSelling">BEST SELLER {bestCount > 0 && <span className="nav-count">({bestCount})</span>}</Link></li>
          <li><Link to="/newReleases">NEW RELEASES {newCount > 0 && <span className="nav-count">({newCount})</span>}</Link></li>
          <li><Link to="/bookSales">BOOK SALES {saleCount > 0 && <span className="nav-count">({saleCount})</span>}</Link></li>
        </ul>
      </nav>
    </>
  );
}
