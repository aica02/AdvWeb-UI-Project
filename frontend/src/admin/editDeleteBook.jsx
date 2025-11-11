import React from "react";
import "../css/admin.css";

const EditDeleteBooksSection = () => {
  const books = [
    { id: 1, title: "Hello World", category: "Coding", price: 150 },
    { id: 2, title: "CSS Coding", category: "Coding", price: 151 },
    { id: 3, title: "HTML Coding Skills", category: "Coding", price: 155 },
    { id: 4, title: "Full Course MERN", category: "Coding", price: 350 },
    { id: 5, title: "ABAKADA", category: "Children", price: 450 },
    { id: 6, title: "Harry Potter and the Sorcerer’s Stone", category: "Fantasy", price: 850 },
    { id: 7, title: "Harry Potter and the Goblet of Fire", category: "Fantasy", price: 880 },
    { id: 8, title: "Harry Potter and the Half Blood Prince", category: "Fantasy", price: 900 },
  ];

  return (
    <section className="bookCollection-overview">
      <h2>Book Collection</h2>
      <p>Book Store Inventory</p>

      <div className="book-collection-container">
        <div className="book-header">
          <h3>All Books</h3>
          <div className="sort-container">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" className="sort-select">
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
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.category}</td>
                <td>₱{book.price.toFixed(2)}</td>
                <td>
                  <span className="edit-text">Edit</span>
                  <button className="delete-btn">Delete</button>
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