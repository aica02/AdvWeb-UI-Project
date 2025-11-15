import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const AddBooksSection = () => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    trending: false,
    onSale: false,
    oldPrice: "",
    newPrice: "",
    coverImage: null,
    recommendedAge: [],
    bookLanguage: [],
  });

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
        // Multi-checkbox (arrays)
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
        // Append each array value
        value.forEach((val) => formDataToSend.append(key, val));
      } else if (key === "coverImage") {
        // Append file if exists
        if (value) formDataToSend.append("coverImage", value);
      } else if (key === "newPrice") {
        // Append newPrice only if onSale
        if (form.onSale) formDataToSend.append("newPrice", value);
      } else {
        // Append other simple fields
        formDataToSend.append(key, value);
      }
    }

    const response = await axios.post(`${API}/admin/books`, formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Added book:", response.data);
    alert("Book added successfully!");

    // Optionally reset form
    setForm({
      title: "",
      author: "",
      description: "",
      category: "",
      trending: false,
      onSale: false,
      oldPrice: "",
      newPrice: "",
      coverImage: null,
      recommendedAge: [],
      bookLanguage: [],
    });

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Error adding book: " + (err.response?.data?.message || err.message));
  }
};

  return (
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

              {/* Category */}
              <div className="form-group">
                <label>Category<span className="asterisk">*</span></label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Coding">Coding</option>
                </select>
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
  );
};

export default AddBooksSection;
