import React, { useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../App.css";
import { useNavigate } from "react-router-dom";

const BestSellingBooks = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [likedBooks, setLikedBooks] = useState([]);

  const toggleLike = (bookId) => {
    setLikedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const books = [
    { id: 1, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/10521276-L.jpg" },
    { id: 2, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984916-L.jpg" },
    { id: 3, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/10521273-L.jpg" },
    { id: 4, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984915-L.jpg" },
    { id: 5, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/8228696-L.jpg" },
    { id: 6, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/7984914-L.jpg" },
    { id: 7, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/8318815-L.jpg" },
    { id: 8, title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", price: 675, img: "https://covers.openlibrary.org/b/id/8228695-L.jpg" },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="best-selling-section">
      <div className="section-header">
        <h2>Best Selling Books</h2>
        <a href="/viewAll" className="view-all">View All &gt;</a>
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
                <h3 onClick={() => {
                  navigate("/bookCard");
                }}
                >{book.title}</h3>
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
  );
};

export default BestSellingBooks;