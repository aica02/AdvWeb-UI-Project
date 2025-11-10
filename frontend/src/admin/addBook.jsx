import React from "react";

const AddBooksSection = () => {
  return (
    <section className="addbook-overview">
      <h2>Add Books</h2>
      <p>Here you can add books.</p>

      <div className="add-books-container">
        {/* Left Panel — Add New Book */}
        <div className="add-book-form">
          <h3 className="form-header">Add New Book</h3>

          <form className="book-form">
            <div className="form-group">
              <label>Title<span className="asterisk">*</span></label>
              <input type="text" placeholder="Enter book title" />
            </div>

            <div className="form-group">
              <label>Author<span className="asterisk">*</span></label>
              <input type="text" placeholder="Enter book author" />
            </div>

            <div className="form-group">
              <label>Description<span className="asterisk">*</span></label>
              <textarea placeholder="Enter book description"></textarea>
            </div>

            <div className="form-group">
              <label>Category<span className="asterisk">*</span></label>
              <select>
                <option>Choose a category</option>
                <option>Fiction</option>
                <option>Non-Fiction</option>
                <option>Romance</option>
                <option>Thriller</option>
              </select>
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="trending" />
              <label htmlFor="trending">Trending</label>
            </div>

            <div className="form-group">
              <label>Price<span className="asterisk">*</span></label>
              <input type="text" placeholder="Enter price" />
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="onsale" />
              <label htmlFor="onsale">OnSale</label>
            </div>

            <div className="form-group">
              <label>Cover Image<span className="asterisk">*</span></label>
              <input type="file" />
            </div>
          </form>
        </div>

        {/* Right Panel — Additional Information */}
        <div className="additional-info">
          <h3 className="form-header">Additional Information</h3>

          <div className="info-section">
            <h4>Recommended Age<span className="asterisk">*</span></h4>
            <div className="form-checkbox">
              <input type="checkbox" id="age19" />
              <label htmlFor="age19">19+ Years</label>
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="age12" />
              <label htmlFor="age12">12–18 Years</label>
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="age8" />
              <label htmlFor="age8">8–11 Years</label>
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="age3" />
              <label htmlFor="age3">3–7 Years</label>
            </div>
          </div>

          <div className="info-section">
            <h4>Book Language<span className="asterisk">*</span></h4>
            <div className="form-checkbox">
              <input type="checkbox" id="english" />
              <label htmlFor="english">English</label>
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="english" />
              <label htmlFor="tagalog">Tagalog</label>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Add Book
          </button>
        </div>
      </div>
    </section>
  );
};

export default AddBooksSection;
