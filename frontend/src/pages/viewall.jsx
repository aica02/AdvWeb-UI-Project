import React, { useState, useEffect } from "react";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const ViewAll = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');

  const getImageUrl = (img, fallback = `${API}/uploads/art1.png`) => {
    if (!img) return fallback;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${API}${img}`;
    if (img.startsWith('uploads')) return `${API}/${img}`;
    return `${API}/uploads/${img}`;
  };

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(location.search);
    const q = (params.get('search') || '').trim();

    const fetchBooks = async () => {
      setLoading(true);
      setError("");
      try {
        let url = `${API}/api/books`;
        // If your backend exposes a search endpoint use it. Adjust as necessary:
        if (q) {
          // Option 1: dedicated search endpoint
          url = `${API}/api/books/search?q=${encodeURIComponent(q)}`;
          // Option 2 (if your backend supports query param on listing):
          // url = `${API}/api/books?search=${encodeURIComponent(q)}`;
        }

        const res = await axios.get(url, { signal: controller.signal });
        const data = Array.isArray(res.data) ? res.data : (res.data?.books ?? []);
        setBooks(data);
        setFilteredBooks(data);
      } catch (err) {
        if (err.name === 'CanceledError' || err.message === 'canceled') return;
        console.error('Error fetching books (viewAll):', err);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    return () => controller.abort();
  }, [location.search]);

  const toggleLike = async (bookId) => {
    if (!token) {
      alert('Please log in to add items to wishlist');
      return;
    }
    try {
      const inWishlist = likedBooks.includes(bookId);
      if (inWishlist) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/api/wishlist/add`, { bookId }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setLikedBooks(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
    } catch (err) {
      console.error('Error toggling wishlist', err);
    }
  };

  const addToCart = async (book) => {
    if (!token) {
      alert('Please log in to add books to your cart.');
      return;
    }
    try {
      await axios.post(`${API}/api/cart/add`, {
        bookId: book._id,
        price: book.newPrice ?? book.oldPrice,
        quantity: 1,
        title: book.title,
        author: book.author,
        image: getImageUrl(book.image || book.coverImage, `${API}/uploads/default.png`),
      }, { headers: { Authorization: `Bearer ${token}` } });

      const cartRes = await axios.get(`${API}/api/cart/pending`, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('cartUpdated'));
      alert(`${book.title} has been added to your cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Server error: Could not add to cart');
    }
  };

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">View All</span>
      </nav>

      <div className="viewall-container">
        <section className="main-content">
          <div className="view-all-header">
            <h2>Books</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p>No books found.</p>
            ) : (
              filteredBooks.map((book) => (
                <div className="book-card" key={book._id}>
                  <div className="book-image">
                    <img src={getImageUrl(book.image || book.coverImage, `${API}/uploads/art1.png`)} alt={book.title} style={{ maxWidth: '100%', height: 'auto' }} />
                    <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
                      {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                    </div>
                  </div>

                  <div className="book-info">
                    <p className="book-title" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>{book.title}</p>
                    <p className="book-author">{book.author}</p>
                    <p className="book-price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>
                    <button className="add-to-cart" onClick={() => addToCart(book)}>Add to Cart</button>
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

export default ViewAll;

