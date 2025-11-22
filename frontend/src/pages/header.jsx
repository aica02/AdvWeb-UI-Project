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
  // autocomplete results
  const [autoResults, setAutoResults] = useState([]);
  const [showAuto, setShowAuto] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // keep header input synced with `search` query param (so back/forward preserves the term)
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get("search") || "";
      setSearchTerm(q);
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // simple autocomplete fetch
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
        const res = await axios.get(`${API}/api/cart/pending`, {
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

  // listen for in-page cart updates
  useEffect(() => {
    const handler = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      axios.get(`${API}/api/cart/pending`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCartCount(res.data?.books?.length || 0))
        .catch(() => {});
    };

    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  // Fetch stats for header (robust against different book schema variations)
  useEffect(() => {
    const fetchHeaderStats = async () => {
      try {
        const res = await axios.get(`${API}/api/books`);
        const books = Array.isArray(res.data) ? res.data : (res.data?.books ?? []);

        // fallback thresholds and fields
        const now = new Date();
        const NEW_DAYS = 90;
        let best = 0, newly = 0, sales = 0;

        books.forEach((b) => {
          // best seller detection
          const salesCount = Number(b.sales ?? b.soldCount ?? b.totalSold ?? 0);
          if (b.bestSeller === true || salesCount > 50) best += 1;

          // new release detection: createdAt / releaseDate / dateAdded
          const dateStr = b.releaseDate ?? b.createdAt ?? b.dateAdded ?? b.addedAt;
          if (b.isNew === true) {
            newly += 1;
          } else if (dateStr) {
            const d = new Date(dateStr);
            if (!isNaN(d)) {
              const days = (now - d) / (1000 * 60 * 60 * 24);
              if (days <= NEW_DAYS) newly += 1;
            }
          }

          // sale detection: newPrice < oldPrice or newPrice < price
          const oldP = Number(b.oldPrice ?? b.price ?? 0);
          const newP = Number(b.newPrice ?? 0);
          if (newP > 0 && oldP > 0 && newP < oldP) sales += 1;
        });

        setBestCount(best);
        setNewCount(newly);
        setSaleCount(sales);

        // debug output so you can verify
        console.log("Header stats:", { best, newly, sales, fetched: books.length });
      } catch (err) {
        console.error("Error fetching header stats:", err);
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
      navigate(data.role === "admin" ? "/admin" : "/profile", { replace: true });
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

  return (
    <>
      <header className="header">
        <div className="header-logo"><h1>Logo here</h1></div>

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
            }}/>
            <FiSearch 
            className="search-icon" 
            size={18} 
            role="button"
            onClick={() => {
              const q = (searchTerm || "").trim();
              if (q) navigate(`/viewAll?search=${encodeURIComponent(q)}`);
              setShowAuto(false);
            }}/>

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
                    <li onClick={() => navigate("/profile")}><FaUser className="dropdown-icon" /><Link to="/profile">Profile</Link></li>
                    <li onClick={() => navigate("/wishlist")}><FaHeart className="dropdown-icon" /><Link to="/wishlist">Wishlist</Link></li>
                    <li onClick={handleCartClick}><FaShoppingCart className="dropdown-icon" /><span>Cart</span></li>
                    <li onClick={handleLogout}><FaSignOutAlt className="dropdown-icon"/><span>Log Out</span></li>
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
