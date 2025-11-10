import React, { useState } from "react";
import "../css/viewall.css";
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom";

const ViewAll = () => {
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
        <Link to="/#" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link className="breadcrumb-link active">
            Best Sellers
        </Link>
    </nav>
    <div className="viewall-container">
    <aside className="sidebar">
        <hr className="line-before-filters"/>
        <h3>Categories</h3>
        <ul className="filter-list">
        <li><input type="checkbox" id="education" /> <label htmlFor="education">Education</label></li>
        <li><input type="checkbox" id="lifestyle" /> <label htmlFor="lifestyle">Lifestyle</label></li>
        <li><input type="checkbox" id="humanities" /> <label htmlFor="humanities">Humanities</label></li>
        <li><input type="checkbox" id="coding" /> <label htmlFor="coding">Coding</label></li>
        <li><input type="checkbox" id="fantasy" /> <label htmlFor="fantasy">Fantasy</label></li>
        </ul>

        <hr className="line-before-filters"/>
        <h3>Book Language</h3>
        <ul className="filter-list">
        <li><input type="checkbox" id="english" /> <label htmlFor="english">English</label></li>
        <li><input type="checkbox" id="tagalog" /> <label htmlFor="tagalog">Tagalog</label></li>
        </ul>

        <hr className="line-before-filters"/>
        <h3>Recommended Age</h3>
        <ul className="filter-list">
        <li><input type="checkbox" id="19+" /> <label htmlFor="19+">19+ Years</label></li>
        <li><input type="checkbox" id="12-18" /> <label htmlFor="12-18">12 - 18 Years</label></li>
        <li><input type="checkbox" id="8-11" /> <label htmlFor="8-11">8 - 11 Years</label></li>
        <li><input type="checkbox" id="3-7" /> <label htmlFor="3-7">3 - 7 Years</label></li>
        </ul>

        <hr className="line-before-filters"/>
        <h3>On Sales</h3>
        <ul className="filter-list">
        <li><input type="radio" name="sales" id="yes" /> <label htmlFor="yes">Yes</label></li>
        <li><input type="radio" name="sales" id="no" /> <label htmlFor="no">No</label></li>
        </ul>
    </aside>

    <section className="main-content">
        <div className="view-all-header">
        <h2>Best Sellers</h2>
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
                <span className="badge">Best Seller</span>
                <div className="heart-overlay" onClick={() => toggleLike(book.id)}>
                    {likedBooks.includes(book.id) ? (
                    <FaHeart className="heart-icon filled" />
                    ) : (
                    <FaRegHeart className="heart-icon" />
                    )}
                </div>
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

        <div className="pagination">
        <button className="page-btn">&lt;</button>
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn">4</button>
        <button className="page-btn">&gt;</button>
        </div>
    </section>
    </div>
    </>
  );
};

export default ViewAll;
