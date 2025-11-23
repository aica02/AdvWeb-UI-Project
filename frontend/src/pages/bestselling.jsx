import React, { useRef, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../App.css";
import "../css/modals.css";
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

  // sorting
  const [sortType, setSortType] = useState("default"); // default | highest-price | lowest-price
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const carouselRef = useRef(null);
  const location = useLocation();

  // Utility: safely parse numeric sales from a book object
  const getSoldCount = (b) => {
    const raw =
      b.bookSold ??
      b.sales ??
      b.soldCount ??
      b.totalSold ??
      b.sold ??
      b.count ??
      b.orders ??
      0;
    // remove non-numeric characters if any, then parse
    const parsed = Number(String(raw).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getPrice = (b) => {
    // prefer newPrice then oldPrice then price
    const p = b.newPrice ?? b.oldPrice ?? b.price ?? 0;
    const parsed = Number(p);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  // --- Trigger notification ---
  const triggerNotification = (msg, type = "positive") => {
  setNotification(msg);
  setNotificationType(type);
  setShowNotification(true);
  setTimeout(() => setShowNotification(false), 3000);
  };

  // nabago to

  const getImageUrl = (filename) => {
    if (!filename) return `../public/uploads/art1.png`;
    return `../public/uploads/${filename}`;
  };

  // --- fetch books ---
  useEffect(() => {
    let mounted = true;
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API}/api/books`);
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.books)
          ? res.data.books
          : Array.isArray(res.data?.data?.books)
          ? res.data.data.books
          : [];
        if (!mounted) return;
        setBooks(data);
        setFilteredBooks(data); // initial fallback; real filtering happens below
      } catch (err) {
        console.error("Error fetching books:", err);
        if (!mounted) return;
        setBooks([]);
        setFilteredBooks([]);
      }
    };
    fetchBooks();
    return () => {
      mounted = false;
    };
  }, [embedded, location.pathname]);

  // --- fetch cart ---
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const items = (res.data?.books || []).map((item) => ({
          id: item.book?._id || item.book?.id,
          title: item.book?.title,
          author: item.book?.author,
          price: item.price,
          quantity: item.quantity,
          image: getImageUrl(item.book?.coverImage || item.book?.image || ""),
        }));

        setCart(items);
        setTotal(res.data?.totalAmount ?? 0);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart([]);
        setTotal(0);
      }
    };
    fetchCart();
  }, [token]);


  const bestItems = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) return [];

    const soldList = books.map((b) => ({
      book: b,
      sold: getSoldCount(b),
    }));

    const anyNumericSales = soldList.some((s) => s.sold > 0);

    if (anyNumericSales) {
      const sortedBySold = [...soldList].sort((a, b) => b.sold - a.sold);
      return sortedBySold.slice(0, 20).map((o) => o.book);
    }

    const booleanBest = books.filter((b) => b.bestSeller === true || b.isBestSeller === true);
    if (booleanBest.length > 0) return booleanBest.slice(0, 20);

    const byDate = [...books].sort((a, b) => {
      const da = new Date(a.releaseDate ?? a.createdAt ?? a.dateAdded ?? a.addedAt ?? 0).getTime() || 0;
      const db = new Date(b.releaseDate ?? b.createdAt ?? b.dateAdded ?? b.addedAt ?? 0).getTime() || 0;
      return db - da;
    });
    return byDate.slice(0, 20);
  }, [books]);

  //filters + sorting ---
  useEffect(() => {
    let filtered = Array.isArray(bestItems) ? [...bestItems] : [];

    // categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((book) =>
        Array.isArray(book.category)
          ? book.category.some((c) => selectedCategories.includes(c))
          : selectedCategories.includes(book.category)
      );
    }

    // languages
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(
        (book) =>
          Array.isArray(book.bookLanguage) &&
          book.bookLanguage.some((lang) => selectedLanguages.includes(lang))
      );
    }

    // ages
    if (selectedAges.length > 0) {
      filtered = filtered.filter(
        (book) =>
          Array.isArray(book.recommendedAge) &&
          book.recommendedAge.some((age) => selectedAges.includes(age))
      );
    }

    // onSale
    if (onSale === "yes") {
      filtered = filtered.filter((book) => {
        const oldP = Number(book.oldPrice ?? book.price ?? 0) || 0;
        const newP = Number(book.newPrice ?? 0) || 0;
        return newP > 0 && oldP > 0 && newP < oldP;
      });
    } else if (onSale === "no") {
      filtered = filtered.filter((book) => {
        const oldP = Number(book.oldPrice ?? book.price ?? 0) || 0;
        const newP = Number(book.newPrice ?? 0) || 0;
        return !(newP > 0 && oldP > 0 && newP < oldP);
      });
    }

    // Sorting (after all filters)
    if (sortType === "highest-price") {
      filtered.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortType === "lowest-price") {
      filtered.sort((a, b) => getPrice(a) - getPrice(b));
    } else {
      // default = keep bestItems order (already by sold or boolean/date)
    }

    setFilteredBooks(filtered);
  }, [
    selectedCategories,
    selectedLanguages,
    selectedAges,
    onSale,
    bestItems,
    sortType,
  ]);

  // --- helper: toggle filter arrays ---
  const toggleFilter = (value, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));
  };

  // --- toggle like (wishlist) ---
    const toggleLike = async (bookId) => {
    const inWishlist = likedBooks.includes(bookId);
    try {
      if (inWishlist) {
        await axios.delete(`${API}/api/wishlist/remove/${bookId}`, { headers: { Authorization: `Bearer ${token}` } });
        triggerNotification("You removed a book from your wishlist!", "negative");
      } else {
        await axios.post(`${API}/api/wishlist/add`, { bookId }, { headers: { Authorization: `Bearer ${token}` } });
        triggerNotification("You added a new book to your wishlist!", "positive");
      }
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
      setLikedBooks((prev) => (prev.includes(bookId) ? prev.filter((i) => i !== bookId) : [...prev, bookId]));
    } catch (err) {
      console.error('Error toggling wishlist', err);
      if (!token) triggerNotification("Please log in to add items to wishlist!" , "negative");
    }
  };
  
  // --- add to cart ---
  const addToCart = async (book) => {
    if (!token) {
      triggerNotification("Please log in to add books to your cart!", "negative");
      return;
    }

    try {
      const payload = {
        bookId: book._id || book.id,
        price: getPrice(book),
        quantity: 1,
        title: book.title,
        author: book.author,
        image: getImageUrl(book.coverImage ?? book.image ?? ""),
      };

      await axios.post(`${API}/api/cart/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh cart
      const cartRes = await axios.get(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = (cartRes.data?.books || []).map((item) => ({
        id: item.book?._id || item.book?.id,
        title: item.book?.title,
        author: item.book?.author,
        price: item.price,
        quantity: item.quantity,
        image: getImageUrl(item.book?.coverImage || item.book?.image || ""),
      }));

      setCart(items);
      setTotal(cartRes.data?.totalAmount ?? 0);
      window.dispatchEvent(new Event("cartUpdated"));
      triggerNotification(`${book.title} has been added to your cart!`, "positive");
    } catch (err) {
      console.error("Error adding to cart:", err, err?.response?.data);
      alert(err.response?.data?.message || err.message || "Server error: Could not add to cart");
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
                <div className="no-found-labeled">No best sellers found.</div>
              ) : (
                bestItems.map((book) => (
                  <div key={book._id || book.id} className="book-card" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>
                    <div className="book-image">
                      <img src={getImageUrl(book.coverImage || book.image)} alt={book.title} />
                      <span className="badge">Best Seller</span>
                      <div className="heart-overlay" onClick={(e) => { e.stopPropagation(); toggleLike(book._id || book.id); }}>
                        {likedBooks.includes(book._id || book.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                      </div>
                    </div>
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p className="author">{book.author}</p>
                      <p className="price">₱{(getPrice(book)).toFixed(2)}</p>
                      <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(book); }}>Add to Cart</button>
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
              <select id="sort" value={sortType} onChange={(e) => setSortType(e.target.value)}>
                <option value="default">Default</option>
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
                <div className="book-card" key={book._id || book.id}>
                  <div className="book-image">
                    <img src={getImageUrl(book.coverImage || book.image || "")} alt={book.title} />
                    <span className="badge">Best Seller</span>
                    <div className="heart-overlay" onClick={() => toggleLike(book._id || book.id)}>
                      {likedBooks.includes(book._id || book.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                    </div>
                  </div>

                  <div className="book-info">
                    <p className="book-title" onClick={() => navigate(`/bookCard/${book._id || book.id}`)}>{book.title}</p>
                    <p className="book-author">{book.author}</p>

                    <div className="book-sold-price">
                      <div className="sold-only">
                        <p className="book-sold">{getSoldCount(book)} sold</p>
                      </div>
                      <div className="price-only">
                        {Number(book.newPrice ?? 0) > 0 &&
                         Number(book.oldPrice ?? book.price ?? 0) > 0 &&
                         Number(book.newPrice) < Number(book.oldPrice ?? book.price) ? (
                            <>
                              <p className="book-price old">
                                ₱{Number(book.oldPrice ?? book.price).toFixed(2)}
                              </p>
                              <p className="book-price">
                                ₱{Number(book.newPrice).toFixed(2)}
                              </p>
                            </>
                         ) : (
                            <p className="book-price">
                              ₱{Number(book.price ?? book.oldPrice ?? book.newPrice).toFixed(2)}
                            </p>
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
