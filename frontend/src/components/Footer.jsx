import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Mail, Phone, MapPin, Heart, Check } from 'lucide-react';
import { ROUTES } from '../utils/routes.js';
import '../static/Footer.css';

// Newsletter Form Validation Schema
const NewsletterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (values, { setSubmitting, resetForm }) => {
    setTimeout(() => {
      setSubscribed(true);
      setSubmitting(false);
      resetForm();
      setTimeout(() => setSubscribed(false), 5000);
    }, 800);
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Top Row: Brand Info + Newsletter */}
        <div className="footer-top">
          <div className="footer-brand-section">
            <Link to={ROUTES.HOME} className="footer-brand-logo">
              LoyalKart
            </Link>
            <p className="footer-tagline">
              Your premier destination for curated fashion, modern essentials, and effortless shopping. Quality guaranteed.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={16} />
                <span>123 Commerce Way, Tech City, TC 10001</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (800) 555-LOYAL</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>support@loyalkart.com</span>
              </div>
            </div>
          </div>

          <div className="footer-newsletter-section">
            <h3 className="newsletter-heading">Stay in the Loop</h3>
            <p className="newsletter-sub">
              Subscribe for exclusive deals, new arrivals, and special promotions directly in your inbox.
            </p>

            {subscribed ? (
              <div className="subscribe-success">
                <Check size={18} />
                <span>Thank you for subscribing to LoyalKart!</span>
              </div>
            ) : (
              <Formik
                initialValues={{ email: '' }}
                validationSchema={NewsletterSchema}
                onSubmit={handleSubscribe}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="newsletter-form-row">
                    <div className="newsletter-input-wrap">
                      <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="newsletter-field"
                      />
                      {errors.email && touched.email && (
                        <span className="newsletter-error">{errors.email}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="newsletter-cta"
                    >
                      {isSubmitting ? 'Joining...' : 'Subscribe'}
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>

        {/* Middle Row: Quick Navigation Links */}
        <div className="footer-links-row">
          <div className="link-column">
            <h4 className="link-column-title">Explore</h4>
            <Link to={ROUTES.HOME} className="footer-link-item">Home</Link>
            <Link to={ROUTES.SHOP} className="footer-link-item">Shop Products</Link>
            <Link to={ROUTES.SAVED_ITEMS} className="footer-link-item">Saved Items</Link>
          </div>

          <div className="link-column">
            <h4 className="link-column-title">Company</h4>
            <Link to={ROUTES.ABOUT} className="footer-link-item">About Us</Link>
            <Link to={ROUTES.SHIPPING_INFO} className="footer-link-item">Shipping Info</Link>
          </div>

          <div className="link-column">
            <h4 className="link-column-title">Account</h4>
            <Link to={ROUTES.LOGIN} className="footer-link-item">Sign In</Link>
            <Link to={ROUTES.REGISTER} className="footer-link-item">Register</Link>
            <Link to={ROUTES.CART} className="footer-link-item">View Cart</Link>
          </div>

          <div className="link-column">
            <h4 className="link-column-title">Customer Care</h4>
            <span className="footer-link-item">24/7 Support</span>
            <span className="footer-link-item">Easy 30-Day Returns</span>
            <span className="footer-link-item">Secure Checkout</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Credits */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} LoyalKart. All rights reserved.
          </p>
          <div className="footer-badge">
            <span>Crafted with</span>
            <Heart size={14} />
            <span>for seamless commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}