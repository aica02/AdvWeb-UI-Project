import React, { useState, useRef} from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import "../css/bookcard.css";

const BookCard = () => {
    const [likedBooks, setLikedBooks] = useState([]);
    const scrollRef = useRef(null);

    const toggleLike = (bookId) => {
        setLikedBooks((prev) =>
        prev.includes(bookId)
            ? prev.filter((id) => id !== bookId)
            : [...prev, bookId]
        );
    };

    const books = [
      { id: 1, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984916-L.jpg" },
      { id: 2, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/10521273-L.jpg" },
      { id: 3, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984915-L.jpg" },
      { id: 4, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/8228696-L.jpg" },
      { id: 5, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984914-L.jpg" },
      { id: 6, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/8228695-L.jpg" },
      { id: 1, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984916-L.jpg" },
      { id: 2, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/10521273-L.jpg" }
    ];

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollAmount = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }
    };

  return (
    <>
    <nav className="breadcrumb">
        <Link to="/#" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/#" className="breadcrumb-link">Fantasy</Link>
        <span className="breadcrumb-separator">/</span>
        <Link className="breadcrumb-link active">
          Descriptions
        </Link>
    </nav>
    <div className="card-view-book" style={{ "--book-bg": `url('https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg')` }} >
      <div className="card-content">
        <div className="book-images">
          <img
            src="https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg"
            alt="Harry Potter Book"
            className="main-image"
          />
          <div className="thumbnail-container">
            <img
              src="https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg"
              alt="Thumbnail 1"
              className="thumbnail"
            />
            <img
              src="https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg"
              alt="Thumbnail 2"
              className="thumbnail"
            />
          </div>
        </div>

        <div className="book-details">
            <div className="wishlist" onClick={() => toggleLike(books.id)} >
                {likedBooks.includes(books.id) ? (
                    <FaHeart className="heart-icon filled" />
                  ) : (
                    <FaRegHeart className="heart-icon" />
                  )}
            </div>
            <div className="details-header">
                <h2>Harry Potter and the Chamber of Secrets</h2>
            </div>

            <p className="author">J.K. Rowling</p>
            <p className="description">
                Step beyond the world you know. Discover realms filled with magic,
                mystery, and ancient legends. Every page is a portal — dare to
                enter...
            </p>

            <div className="rating">
                {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
                ))}
                <span>5 Ratings</span>
            </div>

            <div className="price">₱675.00</div>

            <div className="buttons">
                <button className="add-cart">Add to Cart</button>
                <button className="buy-now">Buy Now</button>
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
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                <img src={book.img} alt={book.title} />
                <span className="genre-tag">Fantasy</span>
                <div className="heart-overlay" onClick={() => toggleLike(book.id)}>
                  {likedBooks.includes(book.id) ? (
                    <FaHeart className="heart-icon filled" />
                  ) : (
                    <FaRegHeart className="heart-icon" />
                  )}
                </div>
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>
                <p className="price">₱{book.price.toFixed(2)}</p>
                <button className="add-btn">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

        <button className="scroll-btn right" onClick={() => scroll("right")}>❯</button>
      </div>
    </div>            
    </>
  );
};

export default BookCard;
