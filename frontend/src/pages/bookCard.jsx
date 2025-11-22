import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useCart } from "../context/cartContext";
import axios from "axios";
import "../css/bookcard.css";

const API = import.meta.env.VITE_API_URL;

const BookCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  // const { cartItems setCartItems, fetchCart } = useCart();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);

  // Fetch single book
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`${API}/api/books/${id}`);
        setBook(data);

        // Fetch related books by category
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

  const getImageUrl = (filename) => {
    if (!filename) return "/placeholder.jpg";
    return `${API}/uploads/${filename}`;
  };

  const addToCart = async (bookToAdd) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/cart/add`,
        { bookId: bookToAdd._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const toggleLike = (bookId) => {
    setLikedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!book) return <p>Loading book...</p>;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/viewAll" className="breadcrumb-link">{book.category.join(", ")}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">{book.title}</span>
      </nav>

      <div
        className="card-view-book"
        style={{ "--book-bg": `url('${getImageUrl(book.coverImage)}')` }}
      >
        <div className="card-content">
          <div className="book-images">
            <img src={getImageUrl(book.coverImage)} alt={book.title} className="main-image" />
          </div>

          <div className="book-details">
            <div className="wishlist" onClick={() => toggleLike(book._id)}>
              {likedBooks.includes(book._id) ? (
                <FaHeart className="heart-icon filled" />
              ) : (
                <FaRegHeart className="heart-icon" />
              )}
            </div>

            <h2>{book.title}</h2>
            <p className="author">{book.author}</p>
            <p className="description">{book.description}</p>

            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
              ))}
              <span>5 Ratings</span>
            </div>
            
            <div className="book-sold-price">
              <div className="sold-count">Book Sold: {book.bookSold || 0}</div>

              <div className="price">
                {book.onSale ? (
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
              <button
                className={`add-cart ${book.stock === 0 ? "out-of-stock" : ""}`}
                onClick={() => addToCart(book)}
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button
                className={`buy-now ${book.stock === 0 ? "out-of-stock" : ""}`}
                onClick={() => addToCart(book)}
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? 'Not Available' : 'Buy Now'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Related Books */}
      <div className="best-selling-section">
        <div className="section-header">
          <h2>Related Books</h2>
        </div>

        <div className="carousel-container">
          <button className="scroll-btn left" onClick={() => scroll("left")}>❮</button>
          <div className="books-carousel" ref={scrollRef}>
            {relatedBooks.length > 0 ? relatedBooks.map((relBook) => (
              <div key={relBook._id} className="book-card">
                <div className="book-image">
                  <img src={getImageUrl(relBook.coverImage)} alt={relBook.title} />
                  <span className="genre-tag">{relBook.category.join(", ")}</span>
                  <div className="heart-overlay" onClick={() => toggleLike(relBook._id)}>
                    {likedBooks.includes(relBook._id) ? (
                      <FaHeart className="heart-icon filled" />
                    ) : (
                      <FaRegHeart className="heart-icon" />
                    )}
                  </div>
                </div>
                <div className="book-details">
                  <h3 onClick={() => navigate(`/bookCard/${relBook._id}`)}>{relBook.title}</h3>
                  <p className="author">{relBook.author}</p>
                  <p className="price">
                    {relBook.onSale ? (
                      <>
                        <span className="old-price">₱{Number(relBook.oldPrice).toFixed(2)}</span>
                        <span className="new-price">₱{Number(relBook.newPrice).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="normal-price">₱{Number(relBook.oldPrice).toFixed(2)}</span>
                    )}
                  </p>
                  
                  <button
                    className={`add-btn ${relBook.stock === 0 ? "out-of-stock" : ""}`}
                    onClick={() => addToCart(relBook)}
                    disabled={relBook.stock === 0}
                  >
                    {relBook.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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