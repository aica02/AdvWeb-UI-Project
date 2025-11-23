import React, { useState, useEffect } from "react";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const ViewAll = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [onSale, setOnSale] = useState("");  // added onSale state here
  const [sortOption, setSortOption] = useState("default");

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // --- Trigger notification ---
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
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category");
    if (categoryFromURL) setSelectedCategories([categoryFromURL]);
  }, [location.search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(location.search);
    const q = (params.get("search") || "").trim();

    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `${API}/api/books`;
        if (q) url = `${API}/api/books/search?q=${encodeURIComponent(q)}`;
        const res = await axios.get(url, { signal: controller.signal });
        const data = Array.isArray(res.data) ? res.data : res.data?.books ?? [];
        setBooks(data);
        setFilteredBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    return () => controller.abort();
  }, [location.search]);

  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    let filtered = books;

    if (selectedCategories.length)
      filtered = filtered.filter((book) =>
        Array.isArray(book.category)
          ? book.category.some((c) => selectedCategories.includes(c))
          : selectedCategories.includes(book.category)
      );

    if (selectedLanguages.length)
      filtered = filtered.filter((book) =>
        book.bookLanguage?.some((lang) => selectedLanguages.includes(lang))
      );

    if (selectedAges.length)
      filtered = filtered.filter((book) =>
        book.recommendedAge?.some((age) => selectedAges.includes(age))
      );

    // Add onSale filter logic here:
    if (onSale === "yes") {
      filtered = filtered.filter(
        (book) => book.newPrice && book.newPrice < book.oldPrice && book.newPrice !== 0
      );
    } else if (onSale === "no") {
      filtered = filtered.filter(
        (book) => !book.newPrice || book.newPrice >= book.oldPrice
      );
    }

    if (sortOption === "highest-price")
      filtered = [...filtered].sort(
        (a, b) => (b.newPrice ?? b.oldPrice) - (a.newPrice ?? a.oldPrice)
      );
    else if (sortOption === "lowest-price")
      filtered = [...filtered].sort(
        (a, b) => (a.newPrice ?? a.oldPrice) - (b.newPrice ?? b.oldPrice)
      );
    else if (sortOption === "in-stock")
      filtered = [...filtered].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));

    setFilteredBooks(filtered);
  }, [books, selectedCategories, selectedLanguages, selectedAges, onSale, sortOption]);

  const toggleLike = async (bookId) => {
    if (!token) return triggerNotification("Please log in to manage your wishlist.", "negative");
    try {
      const inWishlist = likedBooks.includes(bookId);
      if (inWishlist) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        triggerNotification("Book removed from your wishlist.", "negative");
      } else {
        await axios.post(
          `${API}/api/wishlist/add`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        triggerNotification("Book added to your wishlist!", "positive");
      }
      setLikedBooks((prev) =>
        prev.includes(bookId)
          ? prev.filter((id) => id !== bookId)
          : [...prev, bookId]
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (book) => {
    if (!token) return triggerNotification("Please log in to add items to your cart.", "negative");
    if ((book.stock ?? 0) <= 0) return;

    try {
      await axios.post(
        `${API}/api/cart/add`,
        {
          bookId: book._id,
          price: book.newPrice ?? book.oldPrice,
          quantity: 1,
          title: book.title,
          author: book.author,
          image: getImageUrl(book.image || book.coverImage),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("cartUpdated"));
      triggerNotification(`${book.title} has been added to your cart!`, "positive");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart.");
    }
  };

  const discountPercent = (book) => {
    const oldP = Number(book.oldPrice ?? book.price ?? 0);
    const newP = Number(book.newPrice ?? 0);
    if (!oldP || !newP || newP >= oldP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
  };

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <>

    {/* Notification toast */}
      {showNotification && (
        <div className={`top-popup ${notificationType}`}>
          {notification}
        </div>
      )}
      
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">All Books</span>
      </nav>

      <div className="viewall-container">
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

        <section className="main-content">
          <div className="view-all-header">
            <h2>Books</h2>
            <div className="sort-section">
              <label htmlFor="sort">SORT BY</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="highest-price">Highest → Lowest Price</option>
                <option value="lowest-price">Lowest → Highest Price</option>
                <option value="in-stock">In Stock First</option>
              </select>
            </div>
          </div>

          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p>No books found.</p>
            ) : (
              filteredBooks.map((book) => {
                const isOnSale = book.oldPrice && book.newPrice && book.newPrice < book.oldPrice;
                return (
                  <div className="book-card" key={book._id}>
                    <div className="book-image">
                      <img
                        src={getImageUrl(book.image || book.coverImage)}
                        alt={book.title}
                      />
                      {isOnSale && <span className="badge">{discountPercent(book)}%</span>}
                      <div
                        className="heart-overlay"
                        onClick={() => toggleLike(book._id)}
                      >
                        {likedBooks.includes(book._id) ? (
                          <FaHeart className="heart-icon filled" />
                        ) : (
                          <FaRegHeart className="heart-icon" />
                        )}
                      </div>
                    </div>

                    <div className="book-info">
                      <p
                        className="book-title"
                        onClick={() => navigate(`/bookCard/${book._id}`)}
                      >
                        {book.title}
                      </p>
                      <p className="book-author">{book.author}</p>
                      <div className="book-sold-price">
                        <div className="sold-only">
                          <p className="book-sold">{book.bookSold ?? 0} sold</p>
                        </div>
                        <div className="price-only">
                          {isOnSale ? (
                            <>
                              <p className="book-price old">₱{book.oldPrice.toFixed(2)}</p>
                              <p className="book-price">₱{book.newPrice.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="book-price">₱{(book.newPrice ?? book.oldPrice).toFixed(2)}</p>
                          )}
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
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ViewAll;
