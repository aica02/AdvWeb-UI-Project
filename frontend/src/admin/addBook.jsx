import React, { useState } from "react";
import axios from "axios";
import "../css/modals.css";

const API = import.meta.env.VITE_API_URL;

const AddBooksSection = () => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: [],
    trending: false,
    onSale: false,
    oldPrice: "",
    newPrice: "",
    coverImage: null,
    recommendedAge: [],
    bookLanguage: [],
    stock: 0,
  });

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("positive");

  const triggerNotification = (msg, type = "positive") => {
    setNotification(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "onSale" || name === "trending") {
        setForm((prev) => ({
          ...prev,
          [name]: checked,
          // Clear newPrice if onSale is unchecked
          ...(name === "onSale" && !checked ? { newPrice: "" } : {}),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((v) => v !== value),
        }));
      }
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, coverImage: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formDataToSend = new FormData();

    // Append all fields conditionally
    for (const key in form) {
      const value = form[key];

      if (key === "recommendedAge" || key === "bookLanguage") {
        value.forEach((val) => formDataToSend.append(key, val));
      } else if (key === "category") {
        value.forEach((val) => formDataToSend.append(key, val));
      } else if (key === "coverImage") {
        if (value) formDataToSend.append("coverImage", value);
      } else if (key === "newPrice") {
        if (form.onSale) formDataToSend.append("newPrice", value);
      } else {
        formDataToSend.append(key, value);
      }
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      triggerNotification("No authentication token found. Please log in again.", "negative");
      return;
    }

    console.log("FormData entries before send:", Array.from(formDataToSend.entries()));

    const response = await axios.post(
      `${API}/api/books`,
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Added book:", response.data);
    triggerNotification("Book added successfully!", "positive");

    // Optionally reset form
    setForm({
      title: "",
      author: "",
      description: "",
      category: [],
      trending: false,
      onSale: false,
      oldPrice: "",
      newPrice: "",
      coverImage: null,
      recommendedAge: [],
      bookLanguage: [],
      stock: 0,
    });

  } catch (err) {
    console.error("Error response:", err.response?.data || err);
    console.error("Full error:", err);
    alert("Error adding book: " + (err.response?.data?.message || err.message));
  }
};


  return (
    <>
    {/* notification */}
    {showNotification && (
      <div className={`top-popup ${notificationType}`}>
        {notification}
      </div>
    )}
    <section className="addbook-overview">
      <h2>Add Books</h2>
      <p>Here you can add books.</p>

      <div className="add-books-container">
        <div className="add-book-form">
          <form className="book-form" onSubmit={handleSubmit}>
            <div className="book-info">
            {/* Title */}
            <h3 className="form-header">Add New Book</h3>
              <div className="form-group">
                <label>Title<span className="asterisk">*</span></label>
                <input
                  name="title"
                  type="text"
                  placeholder="Enter book title"
                  value={form.title}
                  onChange={handleChange}
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
                  value={form.author}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description<span className="asterisk">*</span></label>
                <textarea
                  name="description"
                  placeholder="Enter book description"
                  value={form.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Category - allow multiple */}
              <div className="form-group">
                <label>Category<span className="asterisk">*</span></label>
                <div className="form-checkbox">
                  {["Fiction","Non-Fiction","Humanities","Romance","Thriller","Coding"].map(cat => (
                    <label key={cat}>
                      <input type="checkbox" name="category" value={cat} checked={form.category.includes(cat)} onChange={handleChange} /> {cat}
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
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Trending */}
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  name="trending"
                  checked={form.trending}
                  onChange={handleChange}
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
                  value={form.oldPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* On Sale */}
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  name="onSale"
                  checked={form.onSale}
                  onChange={handleChange}
                />
                <label>On Sale</label>
              </div>

              {/* New Price */}
              {form.onSale && (
                <div className="form-group">
                  <label>New Price<span className="asterisk">*</span></label>
                  <input
                    name="newPrice"
                    type="number"
                    placeholder="Enter new price"
                    value={form.newPrice}
                    onChange={handleChange}
                    required={form.onSale}
                  />
                </div>
              )}

              {/* Cover Image */}
              <div className="form-group">
                <label>Cover Image<span className="asterisk">*</span></label>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleChange}
                  accept="image/*"
                  required
                />
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
                      checked={form.recommendedAge.includes(age)}
                      onChange={handleChange}
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
                      checked={form.bookLanguage.includes(lang)}
                      onChange={handleChange}
                    />
                    <label>{lang}</label>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-submit">Add Book</button>
            </div>
          </form>
        </div>
      </div>
    </section>
    </>
  );
};

export default AddBooksSection;
