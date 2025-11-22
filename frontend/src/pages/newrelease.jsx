import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import Header from './header';
import Footer from './footer';
import InfoBanner from './services';

const API = import.meta.env.VITE_API_URL;

const NewReleaseBooks = ({ embedded = false }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [onSale, setOnSale] = useState("");
  const [sortOption, setSortOption] = useState("");

  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const getImageUrl = (img, fallback = `${API}/uploads/art1.png`) => {
    if (!img) return fallback;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API}${img}`;
    if (img.startsWith("uploads")) return `${API}/${img}`;
    return `${API}/uploads/${img}`;
  };

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API}/api/books`);
        const data = Array.isArray(res.data) ? res.data : (res.data?.books ?? []);
        setBooks(data);
        setFilteredBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };
    fetchBooks();
  }, [embedded, location.pathname]);

  // Compute new items (last 90 days or isNew)
  const newItems = books.filter((b) => {
    if (b.isNew) return true;
    const dateStr = b.releaseDate ?? b.createdAt ?? b.dateAdded ?? b.addedAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d)) return false;
    const now = new Date();
    const NEW_DAYS = 90;
    const days = (now - d) / (1000 * 60 * 60 * 24);
    return days <= NEW_DAYS;
  });

  // Toggle filter helper
  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Apply filters + sorting
  useEffect(() => {
    let filtered = newItems;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((book) => 
        Array.isArray(book.category) 
          ? book.category.some(c => selectedCategories.includes(c))
          : selectedCategories.includes(book.category)
      );
    }

    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((book) =>
        book.bookLanguage?.some((lang) => selectedLanguages.includes(lang))
      );
    }

    if (selectedAges.length > 0) {
      filtered = filtered.filter((book) =>
        book.recommendedAge?.some((age) => selectedAges.includes(age))
      );
    }

    if (onSale === "yes") {
      filtered = filtered.filter(
        (book) => book.newPrice && book.newPrice < book.oldPrice && book.newPrice !== 0
      );
    } else if (onSale === "no") {
      filtered = filtered.filter(
        (book) => !book.newPrice || book.newPrice >= book.oldPrice
      );
    }

    // --- Sorting Logic ---
    if (sortOption === "in-stock") {
      filtered = [...filtered].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
    } else if (sortOption === "highest-price") {
      filtered = [...filtered].sort((a, b) => (b.newPrice ?? b.oldPrice) - (a.newPrice ?? a.oldPrice));
    } else if (sortOption === "lowest-price") {
      filtered = [...filtered].sort((a, b) => (a.newPrice ?? a.oldPrice) - (b.newPrice ?? b.oldPrice));
    }

    setFilteredBooks(filtered);
  }, [selectedCategories, selectedLanguages, selectedAges, onSale, sortOption, newItems]);

  // Toggle wishlist
  const toggleLike = async (bookId) => {
    if (!token) return alert('Please log in to add items to wishlist');
    try {
      if (likedBooks.includes(bookId)) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/api/wishlist/add`, { bookId }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setLikedBooks((prev) =>
        prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
      );
    } catch (err) {
      console.error('Error toggling wishlist', err);
    }
  };

  // Add to cart
  const addToCart = async (book) => {
    if (!token) return alert("Please log in to add books to your cart.");
    if ((book.stock ?? 0) <= 0) return;

    try {
      await axios.post(`${API}/api/cart/add`, {
        bookId: book._id,
        price: book.newPrice ?? book.oldPrice,
        quantity: 1,
        title: book.title,
        author: book.author,
        image: getImageUrl(book.image || "", `${API}/uploads/default.png`),
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Refresh cart
      const cartRes = await axios.get(`${API}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const items = cartRes.data.books.map((item) => ({
        id: item.book._id,
        title: item.book.title,
        author: item.book.author,
        price: item.price,
        quantity: item.quantity,
        image: getImageUrl(item.book.image || "", `${API}/uploads/default.png`),
      }));
      setCart(items);
      setTotal(cartRes.data.totalAmount || 0);
      alert(`${book.title} has been added to your cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Server error: Could not add to cart");
    }
  };

  return (
    <>
      {!embedded && <Header />}
      {!embedded && (
        <nav className="breadcrumb">
          <Link to="/#" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link active">New Released Books</span>
        </nav>
      )}

      {embedded ? (
        <section style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 10px' }}>
            <h3 style={{ margin: 0 }}>New Releases</h3>
          </div>
          <div style={{ position: 'relative', marginTop: 12 }}>
            <button
              aria-label="Scroll left"
              onClick={() => { const el = carouselRef.current; if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' }); }}
              style={{ position: 'absolute', left: 0, top: '40%', zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer' }}
            >◀</button>

            <div
              ref={carouselRef}
              style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '12px 40px', scrollBehavior: 'smooth' }}
            >
              {newItems.length === 0 ? (
                <div style={{ padding: 20 }}>No new releases found.</div>
              ) : (
                newItems.map((book) => (
                  <div key={book._id} style={{ minWidth: 200, maxWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 315, padding: 15, border: '1px solid #ddd', borderRadius: 5, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', cursor: 'pointer' }} className="book-card" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>
                    <div className="book-image" style={{ position: 'relative', marginBottom: 10 }}>
                      <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 3 }} />
                    </div>
                    <div className="book-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                      <p className="book-title" style={{ fontWeight: 'bold', fontSize: '0.8rem', margin: '0.3rem 0', cursor: 'pointer' }}>{book.title}</p>
                      <p className="book-author" style={{ color: '#555', fontSize: '0.7rem', flexGrow: 1 }}>{book.author}</p>
                      <p style={{ color: '#ff7043', fontSize: '0.75rem', fontWeight: 500, margin: '0.2rem 0' }}>Book Sold: {book.bookSold || 0}</p>
                      <p className="book-price" style={{ textDecoration: "line-through", color:"gray", fontSize:"13px"}}>₱{(book.oldPrice)?.toFixed(2)}</p>
                      <p className="book-price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>
                      <button style={{ backgroundColor: '#035c96', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: 3, cursor: 'pointer', transition: 'background-color 0.3s ease' }} className="add-to-cart" onMouseEnter={(e) => e.target.style.backgroundColor = '#01203f'} onMouseLeave={(e) => e.target.style.backgroundColor = '#035c96'}>Add to Cart</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              aria-label="Scroll right"
              onClick={() => { const el = carouselRef.current; if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' }); }}
              style={{ position: 'absolute', right: 0, top: '40%', zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer' }}
            >▶</button>
          </div>
        </section>
      ) : (
        <div className="viewall-container">
          {/* Sidebar Filters */}
          <aside className="sidebar">
            <hr className="line-before-filters" />
            <h3>Categories</h3>
            <ul className="filter-list">
              {["Fiction", "Non-Fiction", "Humanities", "Romance", "Thriller", "Coding"].map((cat) => (
                <li key={cat}>
                  <input
                    type="checkbox"
                    id={cat.toLowerCase()}
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleFilter(cat, setSelectedCategories)}
                  />
                  <label htmlFor={cat.toLowerCase()}>{cat}</label>
                </li>
              ))}
            </ul>

            <hr className="line-before-filters" />
            <h3>Book Language</h3>
            <ul className="filter-list">
              {["English", "Tagalog"].map((lang) => (
                <li key={lang}>
                  <input
                    type="checkbox"
                    id={lang.toLowerCase()}
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => toggleFilter(lang, setSelectedLanguages)}
                  />
                  <label htmlFor={lang.toLowerCase()}>{lang}</label>
                </li>
              ))}
            </ul>

            <hr className="line-before-filters" />
            <h3>Recommended Age</h3>
            <ul className="filter-list">
              {["19+ Years", "12–18 Years", "8–11 Years", "3–7 Years"].map((age) => (
                <li key={age}>
                  <input
                    type="checkbox"
                    id={age}
                    checked={selectedAges.includes(age)}
                    onChange={() => toggleFilter(age, setSelectedAges)}
                  />
                  <label htmlFor={age}>{age}</label>
                </li>
              ))}
            </ul>

            <hr className="line-before-filters" />
            <h3>On Sale</h3>
            <ul className="filter-list">
              <li>
                <input type="radio" name="sales" id="yes" checked={onSale === "yes"} onChange={() => setOnSale("yes")} />
                <label htmlFor="yes">Yes</label>
              </li>
              <li>
                <input type="radio" name="sales" id="no" checked={onSale === "no"} onChange={() => setOnSale("no")} />
                <label htmlFor="no">No</label>
              </li>
              <li>
                <input type="radio" name="sales" id="all" checked={onSale === ""} onChange={() => setOnSale("")} />
                <label htmlFor="all">All Books</label>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <section className="main-content">
            <div className="view-all-header">
              <h2>New Released Books</h2>
              <div className="sort-section">
                <label htmlFor="sort">SORT BY</label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="highest-price">Highest Price</option>
                  <option value="lowest-price">Lowest Price</option>
                </select>
              </div>
            </div>

            <div className="book-grid">
              {filteredBooks.length === 0 ? (
                <p>No books found.</p>
              ) : (
                filteredBooks.map((book) => (
                  <div className="book-card" key={book._id}>
                    <div className="book-image">
                      <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title} style={{ maxWidth: '100%', height: 'auto' }} />
                      <span className="badge">New Release</span>
                      <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
                        {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                      </div>
                    </div>

                    <div className="book-info">
                      <p className="book-title" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>{book.title}</p>
                      <p className="book-author">{book.author}</p>
                      <p style={{ color: "gray", fontSize: '0.75rem', fontWeight: 500, margin: '0.2rem 0' }}>{book.bookSold || 0} sold</p>

                      <p className="book-price" style={{ textDecoration: "line-through", color:"gray", fontSize:"13px"}}>₱{(book.oldPrice)?.toFixed(2)}</p>
                      <p className="book-price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>

                      

                      <button
                        className="add-to-cart"
                        disabled={(book.stock ?? 0) <= 0}
                        style={(book.stock ?? 0) <= 0 ? { background: "#ccc", cursor: "not-allowed" } : {}}
                        onClick={() => addToCart(book)}
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
      )}
      {!embedded && <InfoBanner />}
      {!embedded && <Footer />}
    </>
  );
};

export default NewReleaseBooks;
