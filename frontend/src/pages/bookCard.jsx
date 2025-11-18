import React, { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import axios from "axios";
import "../css/bookcard.css";
import Header from './header';
import Footer from './footer';

const API = import.meta.env.VITE_API_URL;

const BookCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [likedBooks, setLikedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const token = localStorage.getItem("token");

    const getImageUrl = (img, fallback = "https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg") => {
      if (!img) return fallback;
      if (img.startsWith("http")) return img;
      if (img.startsWith("/")) return `${API}${img}`;
      if (img.startsWith("uploads")) return `${API}/${img}`;
      return `${API}/uploads/${img}`;
    };

    // Fetch single book details
    useEffect(() => {
      const fetchBook = async () => {
        if (!id) {
          setLoading(false);
          return;
        }
        try {
          const res = await axios.get(`${API}/api/books/${id}`);
          setBook(res.data);
        } catch (err) {
          console.error("Error fetching book:", err);
        }
      };
      fetchBook();
    }, [id]);

    // Fetch related books (same category)
    useEffect(() => {
      const fetchRelated = async () => {
        if (!book) return;
        try {
          const res = await axios.get(`${API}/api/books`);
          const data = Array.isArray(res.data) ? res.data : (res.data?.books ?? []);
          const related = data
            .filter((b) => b.category === book.category && b._id !== book._id)
            .slice(0, 8);
          setRelatedBooks(related);
        } catch (err) {
          console.error("Error fetching related books:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRelated();
    }, [book]);

    const toggleLike = async (bookId) => {
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
          if (!token) alert('Please log in to add items to wishlist');
        }
    };

    const addToCart = async (selectedBook) => {
      if (!token) {
        alert("Please log in to add books to your cart.");
        return;
      }

      try {
        const payload = {
          bookId: selectedBook._id || selectedBook.id,
          price: selectedBook.newPrice ?? selectedBook.oldPrice,
          quantity: 1,
          title: selectedBook.title,
          author: selectedBook.author,
          image: getImageUrl(selectedBook.coverImage || selectedBook.image, `${API}/uploads/default.png`),
        };

        console.log("Add to cart payload:", payload);

        await axios.post(`${API}/api/cart/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert(`${selectedBook.title} has been added to your cart!`);
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Error adding to cart:", err);
        alert(err.response?.data?.message || "Could not add to cart");
      }
    };

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollAmount = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }
    };

    if (loading) return <div className="loading">Loading book details...</div>;
    if (!book) return <div className="error">Book not found.</div>;

  return (
    <>
    <Header />
    <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/viewAll" className="breadcrumb-link">{book.category}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-link active">
          {book.title}
        </span>
    </nav>
    <div className="card-view-book" style={{ "--book-bg": `url('${getImageUrl(book.coverImage || book.image)}')` }} >
      <div className="card-content">
        <div className="book-images">
            <img
            src={getImageUrl(book.coverImage || book.image)}
            alt={book.title}
            className="main-image"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <div className="thumbnail-container">
            <img
              src={getImageUrl(book.coverImage || book.image)}
              alt="Thumbnail 1"
              className="thumbnail"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
              <img
              src={getImageUrl(book.coverImage || book.image)}
              alt="Thumbnail 2"
              className="thumbnail"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className="book-details">
            <div className="wishlist" onClick={() => toggleLike(book._id)} >
                {likedBooks.includes(book._id) ? (
                    <FaHeart className="heart-icon filled" />
                  ) : (
                    <FaRegHeart className="heart-icon" />
                  )}
            </div>
            <div className="details-header">
                <h2>{book.title}</h2>
            </div>

            <p className="author">{book.author}</p>
            <p className="description">
                {book.description}
            </p>

            <div className="rating">
                {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
                ))}
                <span>5 Ratings</span>
            </div>

            <div className="price">₱{(book.newPrice ?? book.oldPrice)?.toFixed(2)}</div>

            <div className="buttons">
                <button className="add-cart" onClick={() => addToCart(book)}>Add to Cart</button>
                <button className="buy-now" onClick={() => navigate("/payment")}>Buy Now</button>
            </div>
        </div>
      </div>
    </div>

    <div className="best-selling-section">
      <div className="section-header">
        <h2>Related Books</h2>
        <a href="#" className="view-all">View All &gt;</a>
      </div>

      <div className="carousel-container">
        <button className="scroll-btn left" onClick={() => scroll("left")}>❮</button>
        <div className="books-carousel" ref={scrollRef}>
          {relatedBooks.length > 0 ? (
            relatedBooks.map((relBook) => (
              <div key={relBook._id} className="book-card">
                <div className="book-image">
                  <img src={getImageUrl(relBook.coverImage || relBook.image)} alt={relBook.title} style={{ maxWidth: '100%', height: 'auto' }} />
                  <span className="genre-tag">{relBook.category}</span>
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
                  <p className="price">₱{(relBook.newPrice ?? relBook.oldPrice)?.toFixed(2)}</p>
                  <button className="add-btn" onClick={() => addToCart(relBook)}>Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <p>No related books found.</p>
          )}
        </div>

        <button className="scroll-btn right" onClick={() => scroll("right")}>❯</button>
      </div>
    </div>
    <Footer />            
    </>
  );
};

export default BookCard;
