import React, { useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../App.css";

const NewReleaseBooks = () => {
  const scrollRef = useRef(null);
  const [likedBooks, setLikedBooks] = useState([]);

  const toggleLike = (bookId) => {
    setLikedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const books = [
    { id: 1, title: "Harry Potter and the Cursed Child", author: "J.K. Rowling", price: 850, img: "https://covers.openlibrary.org/b/id/11153283-L.jpg" },
    { id: 2, title: "The Ballad of Songbirds and Snakes", author: "Suzanne Collins", price: 720, img: "https://covers.openlibrary.org/b/id/10548559-L.jpg" },
    { id: 3, title: "Fourth Wing", author: "Rebecca Yarros", price: 899, img: "https://covers.openlibrary.org/b/id/13196929-L.jpg" },
    { id: 4, title: "The Fragile Threads of Power", author: "V.E. Schwab", price: 770, img: "https://covers.openlibrary.org/b/id/14462777-L.jpg" },
    { id: 5, title: "Iron Flame", author: "Rebecca Yarros", price: 930, img: "https://covers.openlibrary.org/b/id/14693222-L.jpg" },
    { id: 6, title: "House of Flame and Shadow", author: "Sarah J. Maas", price: 950, img: "https://covers.openlibrary.org/b/id/14693224-L.jpg" },
    { id: 7, title: "Powerless", author: "Lauren Roberts", price: 820, img: "https://covers.openlibrary.org/b/id/14462779-L.jpg" },
    { id: 8, title: "Empire of the Damned", author: "Jay Kristoff", price: 940, img: "https://covers.openlibrary.org/b/id/14693225-L.jpg" },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="new-release-section">
      <div className="section-header">
        <h2>New Release Books</h2>
        <a href="#" className="view-all">View All &gt;</a>
      </div>

      <div className="carousel-container">
        <button className="scroll-btn left" onClick={() => scroll("left")}>❮</button>

        <div className="books-carousel" ref={scrollRef}>
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                <img src={book.img} alt={book.title} />
                <span className="genre-tag">New</span>
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
  );
};

export default NewReleaseBooks;
