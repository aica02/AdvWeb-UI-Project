import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/admin.css";
import "../css/modals.css";

const API = import.meta.env.VITE_API_URL;

const EditDeleteBooksSection = () => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("Price");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const triggerNotification = (msg, type = "positive") => {
    setNotification(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");
      const { data } = await axios.get(`${API}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(data);
    } catch (err) {
      console.error(err);
      setBooks([]);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");
      await axios.delete(`${API}/api/books/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (book) => {
    // normalize arrays
    setEditingBook({
      ...book,
      category: Array.isArray(book.category) ? book.category : (book.category ? [book.category] : []),
      recommendedAge: Array.isArray(book.recommendedAge) ? book.recommendedAge : (book.recommendedAge ? [book.recommendedAge] : []),
      bookLanguage: Array.isArray(book.bookLanguage) ? book.bookLanguage : (book.bookLanguage ? [book.bookLanguage] : []),
      coverFile: null,
    });
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "onSale" || name === "trending") {
        setEditingBook((prev) => ({
          ...prev,
          [name]: checked,
          ...(name === "onSale" && !checked ? { newPrice: "" } : {}),
        }));
      } else {
        // Multi-checkbox (arrays)
        setEditingBook((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((v) => v !== value),
        }));
      }
    } else if (type === "file") {
      setEditingBook((prev) => ({ ...prev, coverFile: files[0] }));
    } else {
      setEditingBook((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");
      const formData = new FormData();
      const fields = ["title","author","description","oldPrice","newPrice","stock","trending","onSale"];
      fields.forEach(f => {
        if (editingBook[f] !== undefined && editingBook[f] !== null) formData.append(f, editingBook[f]);
      });
      // categories and arrays
      (editingBook.category || []).forEach(c => formData.append('category', c));
      (editingBook.recommendedAge || []).forEach(a => formData.append('recommendedAge', a));
      (editingBook.bookLanguage || []).forEach(l => formData.append('bookLanguage', l));
      if (editingBook.coverFile) formData.append('coverImage', editingBook.coverFile);

      await axios.put(
        `${API}/api/books/${editingBook._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowModal(false);
      setEditingBook(null);
      fetchBooks();
      triggerNotification('Book updated successfully!', 'positive');
    } catch (err) {
      console.error('Edit failed', err);
      alert("Error updating book: " + (err.response?.data?.message || err.message));
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
    <>
    {/* notification */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}
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
            </select>
          </div>
        </div>

        <table className="book-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Book Title</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Old Price</th>
              <th>New Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((b, index) => (
              <tr key={b._id}>
                <td>{index + 1}</td>
                <td>{b.title}</td>
                <td>{b.stock || 0}</td>
                <td>{Array.isArray(b.category) ? b.category.join(', ') : b.category}</td>
                <td>{b.oldPrice ? `₱${Number(b.oldPrice).toFixed(2)}` : ''}</td>
                <td>{b.onSale ? (b.newPrice ? `₱${Number(b.newPrice).toFixed(2)}` : '') : ''}</td>
                <td>
                  <button className="edit-btn" onClick={() => openEdit(b)}>Edit</button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setBookToDelete(b._id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this book?</p>

            <div className="logout-modal-buttons">
              <button
                className="cancel-modal-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-modal-btn"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await axios.delete(`${API}/api/books/${bookToDelete}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    triggerNotification("Book deleted successfully!", "positive");
                    fetchBooks();
                  } catch (err) {
                    console.error(err);
                    triggerNotification("Failed to delete book", "negative");
                  }

                  setShowDeleteModal(false);
                  setBookToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
            

      {/* EDIT MODAL - Full Form Like Add Book */}
      {showModal && editingBook && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <h3 className="modal-title">Edit Book</h3>
            <form onSubmit={handleEditSubmit} className="book-form modal-edit-form">
              <div className="book-info">
                {/* Title */}
                <div className="form-group">
                  <label>Title<span className="asterisk">*</span></label>
                  <input
                    name="title"
                    type="text"
                    placeholder="Enter book title"
                    value={editingBook.title || ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                {/* Author */}
                <div className="form-group">
                  <label>Author<span className="asterisk">*</span></label>
                  <input
                    name="author"
                    type="text"
                    placeholder="Enter book author"
                    value={editingBook.author || ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description<span className="asterisk">*</span></label>
                  <textarea
                    name="description"
                    placeholder="Enter book description"
                    value={editingBook.description || ''}
                    onChange={handleEditChange}
                    required
                  ></textarea>
                </div>

                {/* Category - allow multiple */}
                <div className="form-group">
                  <label>Category<span className="asterisk">*</span></label>
                  <div>
                    {["Fiction","Non-Fiction","Humanities","Romance","Thriller","Coding"].map(cat => (
                      <label key={cat} style={{display:'inline-block', marginRight:12}}>
                        <input type="checkbox" name="category" value={cat} checked={(editingBook.category || []).includes(cat)} onChange={handleEditChange} /> {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock */}
                <div className="form-group">
                  <label>Stock<span className="asterisk">*</span></label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={editingBook.stock || 0}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                {/* On Sale */}
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={editingBook.onSale || false}
                    onChange={handleEditChange}
                  />
                  <label>On Sale</label>
                </div>

                {/* Trending */}
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    name="trending"
                    checked={editingBook.trending || false}
                    onChange={handleEditChange}
                  />
                  <label>Trending</label>
                </div>

                {/* Old Price */}
                <div className="form-group">
                  <label>Price<span className="asterisk">*</span></label>
                  <input
                    name="oldPrice"
                    type="number"
                    placeholder="Enter price"
                    value={editingBook.oldPrice || ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                {/* New Price - conditionally shown when onSale is checked */}
                {editingBook.onSale && (
                  <div className="form-group">
                    <label>New Price<span className="asterisk">*</span></label>
                    <input
                      name="newPrice"
                      type="number"
                      placeholder="Enter sale price"
                      value={editingBook.newPrice || ''}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                )}

                {/* Cover Image */}
                <div className="form-group">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleEditChange}
                    accept="image/*"
                  />
                  {editingBook.coverImage && <p style={{fontSize:'0.85rem', color:'#666'}}>Current: {editingBook.coverImage}</p>}
                </div>
              </div>

              {/* Additional Info */}
              <div className="additional-info">
                <h3 className="form-header">Additional Information</h3>

                <div className="info-section">
                  <h4>Recommended Age<span className="asterisk">*</span></h4>
                  {["19+ Years","12–18 Years","8–11 Years","3–7 Years"].map((age) => (
                    <div className="form-checkbox" key={age}>
                      <input
                        type="checkbox"
                        name="recommendedAge"
                        value={age}
                        checked={(editingBook.recommendedAge || []).includes(age)}
                        onChange={handleEditChange}
                      />
                      <label>{age}</label>
                    </div>
                  ))}
                </div>

                <div className="info-section">
                  <h4>Book Language<span className="asterisk">*</span></h4>
                  {["English","Tagalog"].map((lang) => (
                    <div className="form-checkbox" key={lang}>
                      <input
                        type="checkbox"
                        name="bookLanguage"
                        value={lang}
                        checked={(editingBook.bookLanguage || []).includes(lang)}
                        onChange={handleEditChange}
                      />
                      <label>{lang}</label>
                    </div>
                  ))}
                </div>

                <div className="modal-actions-footer">
                  <button type="button" className="btn-secondary" onClick={()=>{setShowModal(false); setEditingBook(null);}}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  </>
  );
};

export default EditDeleteBooksSection;
