import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import axios from "axios";
import "../css/bookcard.css";

const API = import.meta.env.VITE_API_URL;

const BookCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  const getImageUrl = (img, fallback = `${API}/uploads/art1.png`) => {
    if (!img) return fallback;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API}${img}`;
    if (img.startsWith("uploads")) return `${API}/${img}`;
    return `${API}/uploads/${img}`;
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`${API}/api/books/${id}`);
        setBook(data);

        const { data: allBooks } = await axios.get(`${API}/api/books`);
        const related = allBooks.filter(
          (b) =>
            b._id !== data._id &&
            b.category.some((cat) => data.category.includes(cat))
        );
        setRelatedBooks(related);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id]);

  const addToCart = async (bookToAdd) => {
    if (!token) return alert("Please log in to add books to your cart.");
    if ((bookToAdd.stock ?? 0) <= 0) return;

    try {
      await axios.post(
        `${API}/api/cart/add`,
        {
          bookId: bookToAdd._id,
          price: bookToAdd.newPrice ?? bookToAdd.oldPrice,
          quantity: 1,
          title: bookToAdd.title,
          author: bookToAdd.author,
          image: getImageUrl(bookToAdd.coverImage || bookToAdd.image),
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
        image: getImageUrl(item.book.coverImage || item.book.image),
      }));
      setCart(items);
      alert(`${bookToAdd.title} has been added to your cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Server error: Could not add to cart");
    }
  };

  const toggleLike = async (bookId) => {
    if (!token) return alert("Please log in to add items to wishlist");
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
      console.error("Error toggling wishlist", err);
    }
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const discountPercent = (b) => {
    const oldP = Number(b.oldPrice ?? 0);
    const newP = Number(b.newPrice ?? 0);
    if (!oldP || !newP || newP >= oldP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
  };

  if (!book) return <p>Loading book...</p>;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        {book.category.map((cat, idx) => (
          <React.Fragment key={cat}>
            <Link to={`/viewAll?category=${encodeURIComponent(cat)}`} className="breadcrumb-link">
              {cat}
            </Link>
            {idx < book.category.length - 1 && <span className="breadcrumb-separator">, </span>}
          </React.Fragment>
        ))}
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">{book.title}</span>
      </nav>

      <div className="card-view-book" style={{ "--book-bg": `url('${getImageUrl(book.coverImage)}')` }}>
        <div className="card-content">
          <div className="book-images">
            <img src={getImageUrl(book.coverImage)} alt={book.title} className="main-image" />
          </div>
          <div className="book-details">
            <div className="wishlist" onClick={() => toggleLike(book._id)}>
              {likedBooks.includes(book._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
            </div>
            <h2>{book.title}</h2>
            <p className="author">{book.author}</p>
            <p className="description">{book.description}</p>

            <div className="book-sold-price">
              <div className="sold-count">Book Sold: {book.bookSold || 0}</div>
              <div className="price">
                {book.onSale && book.newPrice < book.oldPrice ? (
                  <>
                    <span className="old-price">₱{Number(book.oldPrice).toFixed(2)}</span>
                    <span className="new-price">₱{Number(book.newPrice).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="normal-price">₱{Number(book.oldPrice).toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button className={`add-cart ${book.stock === 0 ? "out-of-stock" : ""}`}
                      disabled={book.stock === 0} onClick={() => addToCart(book)}>
                {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button className={`buy-now ${book.stock === 0 ? "out-of-stock" : ""}`}
                      disabled={book.stock === 0} onClick={() => addToCart(book)}>
                {book.stock === 0 ? "Not Available" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="best-selling-section">
        <div className="section-header"><h2>Related Books</h2></div>
        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll("left")}>❮</button>
          <div className="books-carousel" ref={scrollRef}>
            {relatedBooks.length > 0 ? relatedBooks.map((relBook) => (
              <div key={relBook._id} className="book-card">
                <div className="book-image">
                  <img src={getImageUrl(relBook.coverImage)} alt={relBook.title} />
                  {relBook.onSale && relBook.newPrice < relBook.oldPrice && (
                    <span className="badge">{discountPercent(relBook)}%</span>
                  )}
                  <div className="heart-overlay" onClick={() => toggleLike(relBook._id)}>
                    {likedBooks.includes(relBook._id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
                  </div>
                </div>
                <div className="book-details">
                  <h3 onClick={() => navigate(`/bookCard/${relBook._id}`)}>{relBook.title}</h3>
                  <p className="author">{relBook.author}</p>
                  <div className="book-sold-price">
                    <div className="sold-only">{relBook.bookSold || 0} sold</div>
                    <div className="price-only">
                      {relBook.onSale && relBook.newPrice < relBook.oldPrice ? (
                        <>
                          <span className="old-price">₱{Number(relBook.oldPrice).toFixed(2)}</span>
                          <span className="new-price">₱{Number(relBook.newPrice).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="normal-price">₱{Number(relBook.oldPrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button className={`add-btn ${relBook.stock === 0 ? "out-of-stock" : ""}`}
                          disabled={relBook.stock === 0} onClick={() => addToCart(relBook)}>
                    {relBook.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            )) : <p>No related books found.</p>}
          </div>
          <button className="scroll-btn right" onClick={() => scroll("right")}>❯</button>
        </div>
      </div>
    </>
  );
};

export default BookCard;
