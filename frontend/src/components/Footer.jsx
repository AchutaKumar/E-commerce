import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/routes";
import { Mail, Phone, MapPin, Heart } from "lucide-react";
import "../static/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribeError("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    setSubscribeError("");
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;

    try {
      const res = await fetch(`${BASE_URL}/api/newsletter/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        const data = await res.json();
        setSubscribeError(data.error || "Subscription failed. Try again.");
      }
    } catch {
      setSubscribeError("Network error. Please try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* ── Top row: Brand + Newsletter ── */}
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link to={ROUTES.HOME} className="footer-brand-logo">
              LoyalKart
            </Link>
            <p className="footer-tagline">
              Premium products curated for those who appreciate quality,
              delivered with care.
            </p>
            <div className="footer-contact">
              <span className="contact-item">
                <Mail size={14} />
                support@loyalkart.com
              </span>
              <span className="contact-item">
                <Phone size={14} />
                +1 (800) 555-LOYAL
              </span>
              <span className="contact-item">
                <MapPin size={14} />
                123 Commerce St, New York, NY
              </span>
            </div>
          </div>

          <div className="footer-newsletter-col">
            <h4 className="newsletter-heading">Stay in the Loop</h4>
            <p className="newsletter-sub">
              Get early access to new arrivals, exclusive deals, and member-only
              events.
            </p>
            {subscribed ? (
              <div className="subscribe-success">
                <Heart size={18} />
                <span>You&apos;re on the list! Welcome to the LoyalKart family.</span>
              </div>
            ) : (
              <form className="newsletter-form-row" onSubmit={handleSubscribe}>
                <div className="newsletter-input-wrap">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subscribeError) setSubscribeError("");
                    }}
                    className="newsletter-field"
                  />
                  {subscribeError && (
                    <span className="newsletter-error">{subscribeError}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="newsletter-cta"
                >
                  {subscribing ? "Sending…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Middle row: Link columns ── */}
        <div className="footer-links-row">
          <div className="link-column">
            <h5 className="link-column-title">Shop</h5>
            <Link to={ROUTES.HOME} className="footer-link-item">
              All Products
            </Link>
          </div>

          <div className="link-column">
            <h5 className="link-column-title">Support</h5>
            <Link to={ROUTES.SHIPPING_INFO} className="footer-link-item">
              Shipping Info
            </Link>
            <Link to={ROUTES.CART} className="footer-link-item">
              Your Cart
            </Link>
            <Link to={ROUTES.PROFILE} className="footer-link-item">
              My Account
            </Link>
          </div>

          <div className="link-column">
            <h5 className="link-column-title">Company</h5>
            <Link to={ROUTES.ABOUT} className="footer-link-item">
              About Us
            </Link>
          </div>

          <div className="link-column">
            <h5 className="link-column-title">Legal</h5>
            <Link to={ROUTES.HOME} className="footer-link-item">
              Privacy Policy
            </Link>
            <Link to={ROUTES.HOME} className="footer-link-item">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom-bar">
          <span className="footer-copy">
            &copy; {new Date().getFullYear()} LoyalKart. All rights reserved.
          </span>
          <div className="footer-badge">
            <Heart size={14} />
            <span>Made with care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;