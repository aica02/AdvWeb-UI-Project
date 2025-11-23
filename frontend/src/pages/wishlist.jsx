import React, { useState, useEffect } from "react";
import "../css/wishlists.css";
import "../css/modals.css";
import { FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const Wishlists = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const triggerNotification = (msg, type = "positive") => {
    setNotification(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

 const getImageUrl = (filename) => {
    if (!filename) return `../public/uploads/art1.png`;
    return `/uploads/${filename}`;
  };

  const fetchWishlist = async () => {
    if (!token) {
      setBooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : [];
      setBooks(data);
      setError("");
    } catch (err) {
      console.error('Error fetching wishlist', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (bookId) => {
    try {
      await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      triggerNotification('Book removed from wishlist', 'negative');
    } catch (err) {
      console.error('Error removing from wishlist', err);
      triggerNotification('Could not remove item from wishlist', 'negative');
    }
  };

  const addToCart = async (book) => {
    if (!token) {
      triggerNotification("Please log in to add items to your cart.", "negative");
      return;
    }
    if ((book.stock ?? 0) <= 0) return;

    try {
      const payload = {
        bookId: book._id,
        price: book.newPrice ?? book.oldPrice,
        quantity: 1,
        title: book.title,
        author: book.author,
        image: getImageUrl(book.coverImage || book.image, `${API}/uploads/default.png`),
      };

      await axios.post(`${API}/api/cart/add`, payload, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('cartUpdated'));
      triggerNotification('Book added to cart successfully!', 'positive');
    } catch (err) {
      console.error('Error adding to cart from wishlist', err);
      alert(err.response?.data?.message || triggerNotification('Failed to add book to cart', 'negative'));
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <>
    {/* notification */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}
      
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">Wishlist</span>
      </nav>

      <div className="wishlist-container">
        <section className="main-content">
          <div className="view-all-header">
            <h2>Your Wishlist</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="book-grid">
            {books.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888' }}>Your wishlist is empty.</div>
            ) : (
              books.map((book) => (
                <div className="book-card" key={book._id}>
                  <div className="book-image">
                    <img src={getImageUrl(book.coverImage || book.image)} alt={book.title}/>
                    <span className="trash-badge" onClick={() => removeFromWishlist(book._id)} style={{ cursor: 'pointer' }}><FaTrash/></span>
                  </div>

                  <div className="book-info">
                    <p className="book-title" onClick={() => navigate(`/bookCard/${book._id}`)}>{book.title}</p>
                    <p className="book-author">{book.author}</p>
                    <p className="book-price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>

                    <button
                      className="add-to-cart"
                      onClick={() => addToCart(book)}
                      disabled={(book.stock ?? 0) <= 0}
                      style={(book.stock ?? 0) <= 0
                        ? { background: "#ccc", color: "#888", cursor: "not-allowed" }
                        : { background: "#035c96", color: "#fff", cursor: "pointer" }
                      }
                    >
                      {(book.stock ?? 0) <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Wishlists;
