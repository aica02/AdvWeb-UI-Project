import { FaTruck, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import "../App.css";

export default function InfoBanner() {
  return (
    <>
        <div className="info-banner">
        <div className="info-item">
            <FaTruck className="info-icon" />
            <div>
            <h4 className="info-title">FREE SHIPPING</h4>
            <p className="info-text">
                Shop Php 799 and above to get your order delivered for free!
            </p>
            </div>
        </div>

        <div className="info-item">
            <FaCreditCard className="info-icon" />
            <div>
            <h4 className="info-title">MEMBERSHIP DISCOUNT</h4>
            <p className="info-text">
                Cardholders enjoy an additional 5% off on D-coded items.
            </p>
            </div>
        </div>

        <div className="info-item">
            <FaMoneyBillWave className="info-icon" />
            <div>
            <h4 className="info-title">CASH ON DELIVERY</h4>
            <p className="info-text">
                COD available for orders worth Php 799 and above.
            </p>
            </div>
        </div>
        </div>

        <div className="email-signup">
            <form className="signup-form">
                <h3 className="signup-title">Sign up to receive email updates</h3>
                <input
                    type="email"
                    placeholder="Enter your email address"
                    className="signup-input"
                />
                <button type="submit" className="signup-button">Send</button>
            </form>
        </div>
    </>
  );
}
