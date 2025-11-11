import React, { useState } from "react";
import "../css/wishlists.css";
import { FaTrash} from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom";

const Wishlists = () => {
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

  const navigate = useNavigate();
  const [likedBooks, setLikedBooks] = useState([]);

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
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link className="breadcrumb-link active">
                Wishlist
            </Link>
        </nav>
        <div className="wishlist-container">
        <section className="main-content">
            <div className="view-all-header">
            <h2>Your Wishlists</h2>
            <div className="sort-section">
                <label htmlFor="sort">SORT BY</label>
                <select id="sort">
                <option value="in-stock">In Stock</option>
                <option value="in-stock">Highest-Lowest Price</option>
                <option value="in-stock">Lowest-Highest Price</option>
                </select>
            </div>
            </div>

            <div className="book-grid">
            {books.map((book, index) => (
                <div className="book-card" key={index}>
                <div className="book-image">
                    <img src={book.img} alt={book.title} />
                    <span className="trash-badge"><FaTrash/></span>
                </div>
                <div className="book-info">
                    <p className="book-title" onClick={() => {
                         navigate("/bookCard");
                    }}
                    >{book.title}</p>
                    <p className="book-author">{book.author}</p>
                    <p className="book-price">₱{book.price.toFixed(2)}</p>
                    <button className="add-to-cart">Add to Cart</button>
                </div>
                </div>
            ))}
            </div>
        </section>
        </div>
    </>
  );
};

export default Wishlists;
