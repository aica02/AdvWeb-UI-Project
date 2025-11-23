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
        <div className="footer modal-overlay" onClick={closeModal}>
          <div className="footer privacy-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="footer modal-title">
              {modalType === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
            </h2>
            <div className="footer privacy-content-container">
              {modalType === "terms" ? (
                <div className="footer privacy-content">
                  <p>
                    <p className="date-update">Last Updated: November 23, 2025</p><br /><br />

                    This <span className="span-color-red">Privacy Policy</span> explains the information collection, use, and sharing practices of BookWise.<br /><br />

                    Unless otherwise stated, this Policy describes and governs the information collection, use, and sharing practices of BookWise with respect to your use of our website http://localhost:5173/ and the services we provide and host on our servers.<br /><br />

                    Before you use or submit any information through or in connection with the Services, please carefully review this Privacy Policy. By using any part of the Services, you understand that your information will be collected, used, and disclosed as outlined in this Privacy Policy.<br /><br />

                    If you do not agree to this privacy policy, please do not use our Services.<br /><br />

                    <strong>Our Principles</strong><br />

                    BookWise has designed this policy to be consistent with the following principles:<br />
                    • Privacy policies should be human readable and easy to find.<br />
                    • Data collection, storage, and processing should be simplified as much as possible to enhance security and consistency.<br />
                    • Data practices should meet the reasonable expectations of users.<br /><br />

                      <strong>Information We Collect</strong><br />
                      We collect information in several ways to provide and improve our services. This includes information you provide directly to us, such as personal details, contact information, and any other data you submit voluntarily. Collecting this information helps us better understand your needs, enhance your experience, and ensure that our services are tailored to you.<br /><br />
                      <strong>Information You Provide</strong><br />
                      <em>Account Information</em><br />
                      When you create an account, we collect personal details like your name, email address, shipping address, and payment information.<br /> 
                      <em>Communications</em><br />
                      We may collect information from you when you contact us for support, provide feedback, or participate in surveys.<br /><br />
                  
                    <strong>Device/Usage Information</strong><br />
                    We may automatically collect certain information about the computer or devices you use to access the Services.
                  </p>
                </div>
              ) : (
                <div className="footer privacy-content">
                  <p>
                    <p className="date-update">Last Updated: November 23, 2025</p><br /><br />

                    These <span className="span-color-red">Terms and Conditions</span> govern your use of BookWise, including our website at http://localhost:5173/ and any services we provide. By accessing or using our services, you agree to be bound by these Terms and Conditions.<br /><br />

                    If you do not agree to these terms, please do not use our website or services.<br /><br />

                    <strong>Acceptance of Terms</strong><br />
                    By using BookWise, you confirm that you understand and agree to comply with these Terms and Conditions. These terms apply to all users of the website, including visitors, registered users, and contributors.<br /><br />

                    <strong>User Responsibilities</strong><br />
                    As a user, you agree to:<br />
                    • Use the services lawfully and in accordance with all applicable regulations.<br />
                    • Provide accurate and complete information when creating an account or using the services.<br />
                    • Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.<br /><br />

                    <strong>Prohibited Conduct</strong><br />
                    Users must not:<br />
                    • Use the services for any illegal or unauthorized purpose.<br />
                    • Interfere with the security or proper functioning of the website or services.<br />
                    • Attempt to access other users’ accounts or sensitive information.<br /><br />

                    <strong>Limitation of Liability</strong><br />
                    BookWise is not responsible for any damages or losses resulting from the use or inability to use our services. Users agree to use the services at their own risk.<br /><br />

                    <strong>Modification of Terms</strong><br />
                    We reserve the right to modify these Terms and Conditions at any time. Updates will be posted on this page with the effective date. Continued use of the services constitutes acceptance of any changes.<br /><br />

                    <strong>Governing Law</strong><br />
                    These Terms and Conditions are governed by the laws of the jurisdiction where BookWise operates.
                  </p>
                </div>
              )}
            </div>

            <div className="footer close-button">
              <button className="footer modal-close-button" onClick={closeModal}>Close</button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
