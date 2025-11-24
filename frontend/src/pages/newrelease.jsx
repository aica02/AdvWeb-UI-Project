import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../css/viewall.css";
import "../css/modals.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";

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

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // --- Trigger notification ---
  const triggerNotification = (msg,  type = "positive") => {
  setNotification(msg);
  setNotificationType(type);
  setShowNotification(true);
  setTimeout(() => setShowNotification(false), 3000);
  };

  const getImageUrl = (filename) => {
    if (!filename) return `../public/uploads/art1.png`;
    return `/uploads/${filename}`;
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

  // sort and filter ang nagloop dito
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
  }, [selectedCategories, selectedLanguages, selectedAges, onSale, sortOption, books]);

  // Toggle wishlist
  const toggleLike = async (bookId) => {
    if (!token) return triggerNotification("Please log in to add items to wishlist!", "negative");
    try {
      if (likedBooks.includes(bookId)) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
        triggerNotification("You removed a book from your wishlist!", "negative");
      } else {
        await axios.post(`${API}/api/wishlist/add`, { bookId }, { headers: { Authorization: `Bearer ${token}` } });
        triggerNotification("You added a new book to your wishlist!", "positive");    
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
    if (!token) return triggerNotification("Please log in to add books to your cart!", "negative");
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
      triggerNotification(`${book.title} has been added to your cart!`, "positive");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Server error: Could not add to cart");
    }
  };

  return (
    <>

      {/* Notification toast */}
      {showNotification && (
        <div className={`top-popup ${notificationType}`}>
          {notification}
        </div>
      )}

      {!embedded && (
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link active">New Released Books</span>
        </nav>
      )}

      {embedded ? (
        <section className="new-release-section">
          <div className="section-header">
            <h3>New Releases</h3>
          </div>

          <div className="carousel-container">
            <button className="scroll-btn left"
              aria-label="Scroll left"
              onClick={() => { const el = carouselRef.current; if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' }); }}
            >❮</button>

            <div ref={carouselRef} className="books-carousel">
              {newItems.length === 0 ? (
                <div className="no-found-labeled">No new releases found.</div>
              ) : (
                newItems.map((book) => (
                  <div key={book._id} className="book-card" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>
                    <div className="book-image">
                      <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title} />
                      <span className="badge">New Release</span>
                      <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
                        {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                      </div>
                    </div>
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p className="author">{book.author}</p>
                      <p className="price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>
                      <button className="add-btn">Add to Cart</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="scroll-btn right"
              aria-label="Scroll right"
              onClick={() => { const el = carouselRef.current; if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' }); }}
            >❯</button>
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
                  <option value="highest-price">Highest → Lowest Price</option>
                  <option value="lowest-price">Lowest → Highest Price</option>
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
                      <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title}/>
                      <span className="badge">New Release</span>
                      <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
                        {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                      </div>
                    </div>

                    <div className="book-info">
                      <p className="book-title" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>{book.title}</p>
                      <p className="book-author">{book.author}</p>
                      
                      <div className="book-sold-price">
                        <div className="sold-only">
                          <p className="book-sold">{book.bookSold || 0} sold</p>
                        </div>
                        <div className="price-only">
                          {book.newPrice && book.newPrice < book.oldPrice && (
                            <p className="book-price old">₱{book.oldPrice.toFixed(2)}</p>
                          )}
                          <p className="book-price">₱{(book.newPrice ?? book.oldPrice).toFixed(2)}</p>
                        </div>
                      </div>


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
    </>
  );
};

export default NewReleaseBooks;
