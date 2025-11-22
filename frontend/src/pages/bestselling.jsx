import React, { useRef, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../App.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

const BestSellingBooks = ({ embedded = false }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [onSale, setOnSale] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const carouselRef = useRef(null);

  // compute best items for embedded carousel - only top 5
  const bestItems = useMemo(() => {
    return books
      .filter((b) => {
        const salesCount = Number(b.bookSold ?? b.sales ?? b.soldCount ?? b.totalSold ?? 0);
        return b.bestSeller === true || salesCount > 0;
      })
      .sort((a, b) => {
        const aSold = Number(a.bookSold ?? a.sales ?? 0);
        const bSold = Number(b.bookSold ?? b.sales ?? 0);
        return bSold - aSold;
      })
      .slice(0, 5);
  }, [books]);

  const getImageUrl = (img, fallback = `${API}/uploads/art1.png`) => {
    if (!img) return fallback;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API}${img}`;
    if (img.startsWith("uploads")) return `${API}/${img}`;
    return `${API}/uploads/${img}`;
  };

  // --- Fetch all books ---
  const location = useLocation();

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

  // --- Fetch current cart ---
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API}/api/cart/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const items = res.data.books.map((item) => ({
          id: item.book._id,
          title: item.book.title,
          author: item.book.author,
          price: item.price,
          quantity: item.quantity,
          image: getImageUrl(item.book.coverImage || item.book.image, `${API}/uploads/default.png`),
        }));

        setCart(items);
        setTotal(res.data.totalAmount || 0);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, [token]);

  // --- Filter toggle ---
  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // --- Apply filters to bestItems only ---
  useEffect(() => {
    let filtered = bestItems;

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

    setFilteredBooks(filtered);
  }, [selectedCategories, selectedLanguages, selectedAges, onSale, bestItems]);

  // --- Toggle like (wishlist) ---
  const toggleLike = async (bookId) => {
    const inWishlist = likedBooks.includes(bookId);
    
    try {
      if (inWishlist) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/api/wishlist/add`, { bookId }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      setLikedBooks((prev) =>
        prev.includes(bookId) ? prev.filter((item) => item !== bookId) : [...prev, bookId]
      );
    } catch (err) {
      console.error('Error toggling wishlist', err);
      if (!token) alert('Please log in to add items to wishlist');
    }
  };

  // --- Add to cart ---
  const addToCart = async (book) => {
    if (!token) {
      alert("Please log in to add books to your cart.");
      return;
    }

    try {
      const payload = {
        bookId: book._id || book.id,
        price: book.newPrice ?? book.oldPrice,
        quantity: 1,
        title: book.title,
        author: book.author,
        image: book.coverImage || book.image || "",
      };

      console.log("Add to cart payload:", payload);

      // ensure backend receives full URL
      payload.image = getImageUrl(payload.image, `${API}/uploads/default.png`);

      await axios.post(`${API}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh cart
      const cartRes = await axios.get(`${API}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = cartRes.data.books.map((item) => ({
        id: item.book._id,
        title: item.book.title,
        author: item.book.author,
        price: item.price,
        quantity: item.quantity,
        image: getImageUrl(item.book.coverImage || item.book.image, `${API}/uploads/default.png`),
      }));

      setCart(items);
      setTotal(cartRes.data.totalAmount || 0);
      window.dispatchEvent(new Event("cartUpdated"));
      alert(`${book.title} has been added to your cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err, err.response?.data);
      alert(err.response?.data?.message || err.message || "Server error: Could not add to cart");
    }
  };

   return (
    <>
      {!embedded && (
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link active">Best Sellers</span>
        </nav>
      )}

      {embedded ? (
        <section className="new-release-section">
          <div className="section-header">
            <h2>Best Sellers</h2>
          </div>

          <div className="carousel-container">
            <button className="scroll-btn left"
              aria-label="Scroll left"
              onClick={() => {
                const el = carouselRef.current;
                if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' });
              }}
            >❮</button>

            <div className="books-carousel" ref={carouselRef}>
              {bestItems.length === 0 ? (
                <div>No best sellers found.</div>
              ) : (
                bestItems.map((book) => (
                  <div key={book._id} className="book-card" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>
                    <div className="book-image">
                      <img src={getImageUrl(book.coverImage || book.image)} alt={book.title} />
                      <span className="badge">Best Seller</span>
                      <div className="heart-overlay" onClick={() => toggleLike(book._id)}>
                        {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                      </div>
                    </div>
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p className="author">{book.author}</p>
                      <p className="price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>
                      <button className="add-btn" onClick={() => addToCart(book)}>Add to Cart</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="scroll-btn right"
              aria-label="Scroll right"
              onClick={() => {
                const el = carouselRef.current;
                if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' });
              }}
            >❯</button>
          </div>
        </section>
      ) : (
      <div className="viewall-container">
        {/* --- Sidebar Filters --- */}
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

        {/* --- Main Content --- */}
        <section className="main-content">
          <div className="view-all-header">
            <h2>Best Sellers</h2>
            <div className="sort-section">
              <label htmlFor="sort">SORT BY</label>
              <select id="sort">
                <option value="in-stock">Default</option>
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
                    <img src={getImageUrl(book.coverImage || book.image, `${API}/uploads/art1.png`)} alt={book.title} />
                    <span className="badge">Best Seller</span>
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
                      <p className="book-price old" >₱{(book.oldPrice)?.toFixed(2)}</p>
                      <p className="book-price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</p>
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

export default BestSellingBooks;