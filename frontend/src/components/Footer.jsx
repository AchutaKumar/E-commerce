import { Link } from 'react-router-dom';
import * as Icon from './Icons.jsx';

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert(`Thanks for subscribing with: ${email}`);
      e.target.reset();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>LoyalKart</h2>
          <p>
            Your trusted online store for quality products, rewards, and a seamless shopping experience.
          </p>
        </div>

        <div className="footer-newsletter">
          <h3>Join our loyalty club</h3>
          <p>Get exclusive deals, early access, and reward points.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-links-grid">
        <div className="footer-column">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/">New Arrivals</Link></li>
            <li><Link to="/">Best Sellers</Link></li>
            <li><Link to="/">Electronics</Link></li>
            <li><Link to="/">Fashion</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/">Track Order</Link></li>
            <li><Link to="/">Returns</Link></li>
            <li><Link to="/shipping-info">Shipping Info</Link></li>
            <li><Link to="/">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About LoyalKart</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-column contact-column">
          <h4>Contact Info</h4>
          <ul style={{ color: '#8e8e93', fontSize: '14px', lineHeight: '1.8' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon.MapPinIcon /> 123 Commerce St, Tech City</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon.PhoneIcon /> +1 (800) 123-4567</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon.MailIcon /> support@loyalkart.com</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon.ClockIcon /> Mon - Fri, 9am - 6pm</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} LoyalKart. All rights reserved.</p>

          <div className="footer-socials">
            {['Facebook', 'Twitter', 'Instagram'].map((social) => (
              <a key={social} href="#" aria-label={social}>
                {social[0]}
              </a>
            ))}
          </div>

          <div className="payment-methods">
            <span>We accept:</span>
            {['VISA', 'MC', 'PayPal'].map((method) => (
              <span key={method} className="payment-badge">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
