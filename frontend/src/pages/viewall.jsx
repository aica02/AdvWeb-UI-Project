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
  const [error, setError] = useState("");

  // FILTER STATES
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);

  // SORT
  const [sortOption, setSortOption] = useState("default");

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

  // AUTO-SELECT CATEGORY FROM QUERY PARAM
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category");
    if (categoryFromURL) setSelectedCategories([categoryFromURL]);
  }, [location.search]);

  // Fetch Books + Search
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(location.search);
    const q = (params.get("search") || "").trim();

    const fetchBooks = async () => {
      setLoading(true);
      setError("");

      try {
        let url = `${API}/api/books`;
        if (q) url = `${API}/api/books/search?q=${encodeURIComponent(q)}`;

        const res = await axios.get(url, { signal: controller.signal });
        const data = Array.isArray(res.data) ? res.data : res.data?.books ?? [];

        setBooks(data);
        setFilteredBooks(data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Error fetching books:", err);
          setError("Failed to load books");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    return () => controller.abort();
  }, [location.search]);

  // TOGGLE FILTER
  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  // FILTER + SORT LOGIC
  useEffect(() => {
    let filtered = books;

    // CATEGORY FILTER
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((book) =>
        Array.isArray(book.category)
          ? book.category.some((c) => selectedCategories.includes(c))
          : selectedCategories.includes(book.category)
      );
    }

    // LANGUAGE FILTER
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((book) =>
        book.bookLanguage?.some((lang) => selectedLanguages.includes(lang))
      );
    }

    // AGE FILTER
    if (selectedAges.length > 0) {
      filtered = filtered.filter((book) =>
        book.recommendedAge?.some((age) => selectedAges.includes(age))
      );
    }

    // SORTING
    if (sortOption === "highest-price") {
      filtered = [...filtered].sort(
        (a, b) => (b.newPrice ?? b.oldPrice) - (a.newPrice ?? a.oldPrice)
      );
    } else if (sortOption === "lowest-price") {
      filtered = [...filtered].sort(
        (a, b) => (a.newPrice ?? a.oldPrice) - (b.newPrice ?? b.oldPrice)
      );
    } else if (sortOption === "in-stock") {
      filtered = [...filtered].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
    }

    setFilteredBooks(filtered);
  }, [selectedCategories, selectedLanguages, selectedAges, sortOption, books]);

  // LIKE / UNLIKE
  const toggleLike = async (bookId) => {
    if (!token) return alert("Please log in to add items to wishlist");

    try {
      const inWishlist = likedBooks.includes(bookId);

      if (inWishlist) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          `${API}/api/wishlist/add`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setLikedBooks((prev) =>
        prev.includes(bookId)
          ? prev.filter((id) => id !== bookId)
          : [...prev, bookId]
      );
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }
  };

  // ADD TO CART
  const addToCart = async (book) => {
    if (!token) return alert("Please log in to add books to your cart.");

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
      alert(`${book.title} has been added to your cart!`);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart.");
    }
  };

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">All Books</span>
      </nav>

      <div className="viewall-container">

        {/* ---------- SIDEBAR FILTERS ---------- */}
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
        </aside>

        {/* ---------- MAIN CONTENT ---------- */}
        <section className="main-content">

          <div className="view-all-header">
            <h2>Books</h2>

            {/* SORT SECTION */}
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

          {/* BOOK GRID */}
          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p>No books found.</p>
            ) : (
              filteredBooks.map((book) => (
                <div className="book-card" key={book._id}>
                  <div className="book-image">
                    <img
                      src={getImageUrl(book.image || book.coverImage)}
                      alt={book.title}
                    />
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
                    <p className="book-price">
                      ₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}
                    </p>

                    <button
                      className="add-to-cart"
                      onClick={() => addToCart(book)}
                    >
                      Add to Cart
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

export default ViewAll;
