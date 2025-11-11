import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/admin.css";

const API = import.meta.env.VITE_API_URL;

const EditDeleteBooksSection = () => {
  const [books, setBooks] = useState([]);
  const [sortBy, setSortBy] = useState("Price");

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/books`);
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`${API}/admin/books/${id}`);
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

 const sortedBooks = [...books].sort((a, b) => {
  if (sortBy === "Price") {
    const priceA = a.newPrice ?? a.oldPrice;
    const priceB = b.newPrice ?? b.oldPrice;
    return priceA - priceB;
  }
  if (sortBy === "Title") return a.title.localeCompare(b.title);
  if (sortBy === "Category") return a.category.localeCompare(b.category);
  return 0;
});


  return (
    <section className="bookCollection-overview">
      <h2>Book Collection</h2>
      <p>Book Store Inventory</p>

      <div className="book-collection-container">
        <div className="book-header">
          <h3>All Books</h3>
          <div className="sort-container">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Price</option>
              <option>Title</option>
              <option>Category</option>
            </select>
          </div>
        </div>

        <table className="book-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map(({ _id, title, category, oldPrice, newPrice }, index) => (
  <tr key={_id}>
    <td>{index + 1}</td>
    <td>{title}</td>
    <td>{category}</td>
    <td>₱{(newPrice ?? oldPrice).toFixed(2)}</td>
    <td>
      <span className="edit-text">Edit</span>
      <button className="delete-btn" onClick={() => handleDelete(_id)}>
        Delete
      </button>
    </td>
  </tr>
))}

          </tbody>
        </table>
      </div>
    </section>
  );
};

export default EditDeleteBooksSection;
