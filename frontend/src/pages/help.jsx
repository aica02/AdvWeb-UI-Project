import React, { useState } from 'react';
import { FcProcess } from "react-icons/fc";
import { FaLocationDot } from "react-icons/fa6";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { BiPackage } from "react-icons/bi";
import { LiaShippingFastSolid } from "react-icons/lia";
import { FaRegCreditCard } from "react-icons/fa6";
import { MdPrivacyTip } from "react-icons/md";
import { TbTruckReturn } from "react-icons/tb";
import "../css/helpPage.css";

function Category({ title, icon, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`category-card ${open ? 'open' : ''}`}>
        <div className="category-header" onClick={() => setOpen(!open)}>
             <div className="category-icon">{icon}</div>
            <h3>{title}</h3>
        </div>
        <div
            className="category-content"
            style={{
             maxHeight: open ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease',
            }}
        >
        {children}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="help-page">
      <section className="support-hero">
        <h1>Get Support</h1>
        <div className="support-actions">
          <div className="action-card">
            <div className="icon-wrapper"><FaLocationDot /></div>
            <h3>Track Your Order</h3>
          </div>
          <div className="action-card">
            <div className="icon-wrapper"><IoShieldCheckmarkSharp /></div>
            <h3>Process Warranty Claim</h3>
          </div>
          <div className="action-card">
            <div className="icon-wrapper"><FcProcess /></div>
            <h3>Cancel or Edit an Order</h3>
          </div>
        </div>
      </section>

      <section className="more-topics">
        <h2>More Topics</h2>
        

        <div className="help-categories">
          <Category title="ORDER STATUS & TRACKING" icon={<BiPackage />}>
            <h4>How to place an order</h4>
            <p>Browse our catalog, add books to your cart, and proceed to checkout. You'll need to create an account or sign in to complete your purchase.</p>
            <h4>Creating and managing an account</h4>
            <p>Click "Sign Up" in the top navigation to create your account. Once logged in, access your account settings to update preferences and view order history.</p>
            <h4>Tracking an order</h4>
            <p>Visit "My Orders" in your account dashboard to view tracking information. You'll also receive tracking updates via email once your order ships.</p>
            <h4>Editing or cancelling orders</h4>
            <p>Orders can be modified or cancelled within 2 hours of placement. After that, please contact customer support for assistance.</p>
          </Category>

          <Category title="SHIPPING" icon={<LiaShippingFastSolid />}>
            <h4>Shipping options</h4>
            <p>We offer Standard (5-7 business days), Express (2-3 business days), and Next Day delivery options at checkout.</p>
            <h4>Delivery times</h4>
            <p>Delivery times vary by location and shipping method selected. Most orders are processed within 24 hours for business days.</p>
            <h4>Shipping fees</h4>
            <p>Free standard shipping on orders over $35. Express and Next Day shipping rates are calculated at checkout based on weight and destination.</p>
            <h4>Late delivery and tracking</h4>
            <p>If your order hasn't arrived within the estimated timeframe, check your tracking information first, then contact us if the issue persists.</p>
          </Category>

          <Category title="PAYMENT INFORMATION" icon={<FaRegCreditCard />}>
            <h4>Accepted payment methods</h4>
            <p>We accept all major credit cards (Mastercard, Visa, Discover, American Express), BGS, BPI, UNIONBANK, METROBANK.</p>
            <h4>Taxes</h4>
            <p>Taxes are processed at checkout as the designated RAL Codes are your smartbar and cannot be combined with other offers unless specified.</p>
            <h4>Common payment issues</h4>
            <p>Ensure your billing information matches your debit details. If payment fails, try a different payment method or contact your bank to verify the transaction.</p>
          </Category>

          <Category title="ACCOUNT & PRIVACY" icon={<MdPrivacyTip />}>
            <h4>Creating an account</h4>
            <p>Click "Create Password" on the login page. You'll receive a password reset link via email. The link expires after 24 hours for security.</p>
            <h4>Updating personal info</h4>
            <p>Log in to your account and navigate to "Account Settings" to update your name, email, shipping addresses, and payment methods.</p>
            <h4>Privacy and data security</h4>
            <p>We use industry-standard encryption to protect your data. Your information is never shared with third parties without consent. Review our Privacy Policy for details.</p>
          </Category>

          <Category title="RETURNS & EXCHANGES" icon={<TbTruckReturn />}>
            <h4>Return policy</h4>
            <p>We accept returns within 30 days of delivery for most items. Books must be in original condition with all packaging intact for a full refund.</p>
            <h4>Refund processing</h4>
            <p>Refunds are processed within 5-7 business days after we receive your return. The credit will appear in your account's processing time.</p>
            <h4>Exchange process</h4>
            <p>To exchange an item, process a return for the original item and place a new order for the replacement. This ensures faster processing.</p>
          </Category>
        </div>
      </section>
    </div>
  );
}
