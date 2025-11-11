import React, { useState, useEffect } from "react";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ViewAll = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);

  // filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [onSale, setOnSale] = useState(""); // "yes" | "no" | "all"

  const navigate = useNavigate();

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/books");
        setBooks(res.data);
        setFilteredBooks(res.data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };
    fetchBooks();
  }, []);

  // Handle checkbox toggles
  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Apply filters realtme
  useEffect(() => {
    let filtered = books;

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((book) =>
        selectedCategories.includes(book.category)
      );
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((book) =>
        book.bookLanguage?.some((lang) => selectedLanguages.includes(lang))
      );
    }

    // Recommended Age filter
    if (selectedAges.length > 0) {
      filtered = filtered.filter((book) =>
        book.recommendedAge?.some((age) => selectedAges.includes(age))
      );
    }

    // On Sale filter
    if (onSale === "yes") {
      filtered = filtered.filter(
        (book) =>
          book.newPrice &&
          book.newPrice < book.oldPrice &&
          book.newPrice !== 0
      );
    } else if (onSale === "no") {
      filtered = filtered.filter(
        (book) =>
          !book.newPrice ||
          book.newPrice >= book.oldPrice
      );
    }

    setFilteredBooks(filtered);
  }, [selectedCategories, selectedLanguages, selectedAges, onSale, books]);

  const toggleLike = (bookId) => {
    setLikedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/#" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link className="breadcrumb-link active">Best Sellers</Link>
      </nav>

      <div className="viewall-container">
        <aside className="sidebar">
          {/* --- CATEGORY FILTER --- */}
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

          {/* --- LANGUAGE FILTER --- */}
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

          {/* --- AGE FILTER --- */}
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

          {/* --- SALE FILTER --- */}
          <hr className="line-before-filters" />
          <h3>On Sale</h3>
          <ul className="filter-list">
            <li>
              <input
                type="radio"
                name="sales"
                id="yes"
                checked={onSale === "yes"}
                onChange={() => setOnSale("yes")}
              />
              <label htmlFor="yes">Yes</label>
            </li>
            <li>
              <input
                type="radio"
                name="sales"
                id="no"
                checked={onSale === "no"}
                onChange={() => setOnSale("no")}
              />
              <label htmlFor="no">No</label>
            </li>
            <li>
              <input
                type="radio"
                name="sales"
                id="all"
                checked={onSale === ""}
                onChange={() => setOnSale("")}
              />
              <label htmlFor="all">All Books</label>
            </li>
          </ul>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <section className="main-content">
          <div className="view-all-header">
            <h2>Best Sellers</h2>
            <div className="sort-section">
              <label htmlFor="sort">SORT BY</label>
              <select id="sort">
                <option value="in-stock">In Stock</option>
                <option value="highest-price">Highest-Lowest Price</option>
                <option value="lowest-price">Lowest-Highest Price</option>
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
                    <img src={`https://covers.openlibrary.org/b/id/10521276-L.jpg`} alt={book.title}  />
                    <span className="badge">Best Seller</span>
                    <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
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
                      onClick={() => navigate("/bookCard")}
                    >
                      {book.title}
                    </p>
                    <p className="book-author">{book.author}</p>
                    <p className="book-price">
                      ₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}
                    </p>
                    <button className="add-to-cart">Add to Cart</button>
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
