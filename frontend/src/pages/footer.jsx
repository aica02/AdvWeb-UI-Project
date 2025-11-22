import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import "../css/forFooter.css";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 className="footer-logo">BookWise</h2>
            </Link>
            <p className="footer-text">
              Your trusted online bookstore for quality reads, great deals, and fast delivery across the Philippines.
            </p>
          </div>

          {/* Socials */}
          <div className="footer-section">
            <h3 className="footer-heading">Follow us on</h3>
            <div className="footer-socials">
              <a href="https://www.instagram.com" aria-label="Instagram" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com" aria-label="Facebook" className="social-icon">
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/bestSelling">Featured Books</Link></li>
              <li><Link to="/newReleases">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li><button onClick={() => openModal("privacy")} className="link-button">Privacy Policy</button></li>
              <li><button onClick={() => openModal("terms")} className="link-button">Terms & Conditions</button></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />
        <p className="footer-bottom">2025. All Rights Reserved</p>
      </footer>

      {/*  MODAL  */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {modalType === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
            </h2>

            <div className="modal-content">
              {modalType === "privacy" ? (
                <p>
                  We value your privacy. Your data will only be used for processing orders,
                  improving services, and ensuring a secure shopping experience.
                </p>
              ) : (
                <p>
                  By using BookWise, you agree to follow all store policies, respect copyright laws,
                  and comply with Philippine digital commerce regulations.
                </p>
              )}
            </div>

            <button className="modal-close" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
