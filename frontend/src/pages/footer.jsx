import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section">
          <h2 className="footer-logo">Logo here</h2>
          <p className="footer-text">
            Your trusted online bookstore for quality reads, great deals, and fast delivery across the Philippines.
          </p>
        </div>

        {/* Socials */}
        <div className="footer-section">
          <h3 className="footer-heading">Follow us on</h3>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram" className="social-icon">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Facebook" className="social-icon">
              <FaFacebook />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Featured Books</a></li>
            <li><a href="#">New Arrivals</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h3 className="footer-heading">Legal</h3>
          <ul className="footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      <p className="footer-bottom">2025. All Rights Reserved</p>
    </footer>
  );
}
