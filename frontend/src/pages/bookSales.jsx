import React, { useState, useEffect } from "react";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from './header';
import Footer from './footer';
import InfoBanner from './services';

const API = import.meta.env.VITE_API_URL;

const BookSales = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [sortOption, setSortOption] = useState("in-stock");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getImageUrl = (img, fallback = `${API}/uploads/art1.png`) => {
    if (!img) return fallback;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API}${img}`;
    if (img.startsWith("uploads")) return `${API}/${img}`;
    return `${API}/uploads/${img}`;
  };

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(`${API}/api/books`);
        const data = Array.isArray(res.data) ? res.data : (res.data?.books ?? []);

        const sales = data.filter((book) => {
          const oldP = Number(book.oldPrice ?? book.price ?? 0);
          const newP = Number(book.newPrice ?? 0);
          return oldP > 0 && newP > 0 && newP < oldP;
        });

        setBooks(sales);
        setFilteredBooks(sales);
      } catch (err) {
        console.error("Error fetching sale books:", err);
      }
    };
    fetchSales();
  }, []);

  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    let filtered = books;

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

    // --- Sorting Logic ---
    if (sortOption === "in-stock") {
      filtered = [...filtered].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
    } else if (sortOption === "highest-price") {
      filtered = [...filtered].sort((a, b) => (b.newPrice ?? b.oldPrice) - (a.newPrice ?? a.oldPrice));
    } else if (sortOption === "lowest-price") {
      filtered = [...filtered].sort((a, b) => (a.newPrice ?? a.oldPrice) - (b.newPrice ?? b.oldPrice));
    }

    setFilteredBooks(filtered);
  }, [selectedCategories, selectedLanguages, selectedAges, books, sortOption]);

  const toggleLike = async (bookId) => {
    if (!token) return alert('Please log in to add items to wishlist');
    const inWishlist = likedBooks.includes(bookId);
    try {
      if (inWishlist) {
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

  const addToCart = async (book) => {
    if (!token) return alert("Please log in to add books to your cart.");
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
          image: getImageUrl(book.coverImage || book.image || "", `${API}/uploads/default.png`),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cartRes = await axios.get(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = (cartRes.data.books || []).map((item) => ({
        id: item.book._id,
        title: item.book.title,
        author: item.book.author,
        price: item.price,
        quantity: item.quantity,
        image: getImageUrl(item.book.coverImage || item.book.image || "", `${API}/uploads/default.png`),
      }));

      setCart(items);
      setTotal(cartRes.data.totalAmount || 0);

      window.dispatchEvent(new Event('cartUpdated'));

      alert(`${book.title} has been added to your cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Server error: Could not add to cart");
    }
  };

  const discountPercent = (book) => {
    const oldP = Number(book.oldPrice ?? book.price ?? 0);
    const newP = Number(book.newPrice ?? 0);
    if (!oldP || !newP || newP >= oldP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
  };

  return (
    <>
      <Header />
      <nav className="breadcrumb">
        <Link to="/#" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">Book Sales</span>
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
        </aside>

        <section className="main-content">
          <div className="view-all-header">
            <h2>Book Sales</h2>
            <div className="sort-section">
              <label htmlFor="sort">SORT BY</label>
              <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="in-stock">Default</option>
                <option value="highest-price">Highest → Lowest Price</option>
                <option value="lowest-price">Lowest → Highest Price</option>
              </select>
            </div>
          </div>

          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p>No sale books found.</p>
            ) : (
              filteredBooks.map((book) => (
                <div className="book-card" key={book._id}>
                  <div className="book-image">
                    <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title} style={{ maxWidth: '100%', height: 'auto' }} />
                    <span className="badge">{discountPercent(book)}%</span>
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

      <InfoBanner />
      <Footer />
    </>
  );
};

export default BookSales;
