import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Truck, RotateCcw, Star, Award, Users, ThumbsUp } from 'lucide-react';
import { ROUTES } from '../utils/routes';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import '../static/LandingPage.css';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch landing page data');
  return res.json();
};

// Newsletter Schema
const NewsletterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function LandingPage() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;

  // Fetch dynamic landing data from Django backend
  const { data, isLoading, error } = useSWR(`${BASE_URL}/api/landing/data/`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleSubscribe = async (values, { setSubmitting, resetForm }) => {
    setNewsletterStatus(null);
    try {
      const res = await fetch(`${BASE_URL}/api/newsletter/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const result = await res.json();

      if (res.ok) {
        setNewsletterStatus({ type: 'success', text: result.message || 'Subscribed successfully!' });
        resetForm();
      } else {
        setNewsletterStatus({ type: 'error', text: result.error || 'Subscription failed. Please try again.' });
      }
    } catch (_err) {
      setNewsletterStatus({ type: 'error', text: 'Network error. Please check backend connection.' });
    } finally {
      setSubmitting(false);
    }
  };

  const heroSlide = data?.hero_slides?.[0] || {
    title: 'The Art of Refined Shopping',
    subtitle: 'Discover an exclusive curation of premium technology, fashion gear, and lifestyle products.',
  };

  const categories = data?.categories || [];
  const trendingProducts = data?.trending_products || [];
  const featuredProduct = data?.flash_deal?.product || trendingProducts[0];
  const flashDeal = data?.flash_deal;
  const testimonials = data?.testimonials || [
    { id: 1, name: 'Sophia R.', role: 'Verified Buyer', content: 'LoyalKart delivers exceptional quality and incredibly fast shipping! Highly recommended.', rating: 5 },
    { id: 2, name: 'Marcus T.', role: 'Tech Enthusiast', content: 'Authentic products with top-tier customer service. Always my first choice.', rating: 5 },
    { id: 3, name: 'Elena V.', role: 'VIP Member', content: 'The curated collections are unmatched in design and value.', rating: 5 }
  ];

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <section className="lp-hero">
        <div className="lp-hero-overlay" />
        <div
          className="lp-hero-bg"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="lp-hero-container">
          <h1 className="lp-hero-title">{heroSlide.title}</h1>
          <p className="lp-hero-subtitle">{heroSlide.subtitle}</p>
          <div className="lp-hero-actions">
            <Link to={ROUTES.SHOP} className="lp-btn lp-btn-primary">
              Shop Collection <ArrowRight size={18} />
            </Link>
            <a href="#categories" className="lp-btn lp-btn-outline">
              Explore Categories
            </a>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges Bar */}
      <section className="lp-trust-bar">
        <div className="lp-container lp-trust-grid">
          <div className="lp-trust-item">
            <div className="lp-trust-icon"><Truck size={24} /></div>
            <div>
              <h4>Free Express Shipping</h4>
              <p>On all orders over $50</p>
            </div>
          </div>
          <div className="lp-trust-item">
            <div className="lp-trust-icon"><ShieldCheck size={24} /></div>
            <div>
              <h4>100% Authentic</h4>
              <p>Direct from verified brands</p>
            </div>
          </div>
          <div className="lp-trust-item">
            <div className="lp-trust-icon"><RotateCcw size={24} /></div>
            <div>
              <h4>30-Day Easy Returns</h4>
              <p>Hassle-free money back</p>
            </div>
          </div>
          <div className="lp-trust-item">
            <div className="lp-trust-icon"><ShoppingBag size={24} /></div>
            <div>
              <h4>Secure VIP Checkout</h4>
              <p>256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dynamic Categories Grid */}
      <section className="lp-section" id="categories">
        <div className="lp-container">
          <div className="lp-header-center">
            <span className="lp-sub-tag">CURATED SELECTION</span>
            <h2 className="lp-title">Explore Popular Categories</h2>
            <p className="lp-desc">Find top-rated items tailored for your lifestyle.</p>
          </div>

          <div className="lp-categories-grid">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`${ROUTES.SHOP}?category=${cat.id}`}
                  className="lp-category-card"
                >
                  <div
                    className="lp-category-bg"
                    style={{
                      backgroundImage: `url('${cat.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"}')`,
                    }}
                  />
                  <div className="lp-category-overlay" />
                  <div className="lp-category-content">
                    <span className="lp-category-count">{cat.product_count || 0} Products</span>
                    <h3 className="lp-category-title">{cat.name}</h3>
                    <div className="lp-category-link">
                      <span>Explore Shop</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="lp-empty">Loading categories...</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Featured Release Banner */}
      {featuredProduct && (
        <section className="lp-section lp-featured-bg">
          <div className="lp-container">
            <div className="lp-featured-card">
              <div className="lp-featured-image-wrap" onClick={() => navigate(`/products/${featuredProduct.id}`)}>
                <img
                  src={featuredProduct.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop'}
                  alt={featuredProduct.name}
                  className="lp-featured-img"
                />
                {flashDeal && (
                  <div className="lp-discount-badge">
                    <span>SPECIAL DEAL</span>
                    <strong>-{flashDeal.discount_percentage}% OFF</strong>
                  </div>
                )}
              </div>

              <div className="lp-featured-info">
                <span className="lp-sub-tag">SPOTLIGHT RELEASE</span>
                <h2 className="lp-featured-title">{featuredProduct.name}</h2>
                <div className="lp-price-tag">
                  <span className="lp-current-price">${parseFloat(featuredProduct.price).toFixed(2)}</span>
                  {flashDeal && (
                    <span className="lp-original-price">
                      ${(parseFloat(featuredProduct.price) * 1.25).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="lp-featured-desc">
                  {featuredProduct.description || 'Crafted with premium materials and precise engineering for superior performance and everyday reliability.'}
                </p>

                <div className="lp-featured-actions">
                  <Link to={`/products/${featuredProduct.id}`} className="lp-btn lp-btn-primary">
                    View Product Details <ArrowRight size={18} />
                  </Link>
                  <Link to={ROUTES.SHOP} className="lp-btn lp-btn-outline">
                    Browse All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Trending Products Catalog */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-header-flex">
            <div>
              <span className="lp-sub-tag">TRENDING NOW</span>
              <h2 className="lp-title">Best Selling Products</h2>
            </div>
            <Link to={ROUTES.SHOP} className="lp-see-all">
              <span>View Full Shop</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {isLoading ? (
            <div className="lp-products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="lp-products-grid">
              {trendingProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="lp-empty">No products available at the moment.</div>
          )}
        </div>
      </section>

      {/* 6. Stats Showcase */}
      <section className="lp-stats-section">
        <div className="lp-container lp-stats-grid">
          <div className="lp-stat-card">
            <Users className="lp-stat-icon" size={32} />
            <h3>10,000+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="lp-stat-card">
            <ThumbsUp className="lp-stat-icon" size={32} />
            <h3>99.8%</h3>
            <p>Positive Feedback</p>
          </div>
          <div className="lp-stat-card">
            <Award className="lp-stat-icon" size={32} />
            <h3>100%</h3>
            <p>Guaranteed Quality</p>
          </div>
          <div className="lp-stat-card">
            <Sparkles className="lp-stat-icon" size={32} />
            <h3>24/7</h3>
            <p>Dedicated Support</p>
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials */}
      <section className="lp-section lp-testimonial-bg">
        <div className="lp-container">
          <div className="lp-header-center">
            <span className="lp-sub-tag">TESTIMONIALS</span>
            <h2 className="lp-title">What Our Buyers Say</h2>
          </div>

          <div className="lp-testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="lp-testimonial-card">
                <div className="lp-stars">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="lp-testimonial-quote">"{t.content}"</p>
                <div className="lp-testimonial-user">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Brand Story Section */}
      <section className="lp-section">
        <div className="lp-container lp-story-grid">
          <div className="lp-story-content">
            <span className="lp-sub-tag">OUR PHILOSOPHY</span>
            <h2 className="lp-title">Craftsmanship Without Compromise</h2>
            <p className="lp-story-text">
              At LoyalKart, we believe in curating items designed to elevate your lifestyle. Every product in our store undergoes rigorous inspection for quality, durability, and aesthetics.
            </p>
            <Link to={ROUTES.ABOUT} className="lp-story-link">
              <span>Learn More About Us</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="lp-story-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop"
              alt="Craftsmanship"
              className="lp-story-img"
            />
          </div>
        </div>
      </section>

      {/* 9. Newsletter Section */}
      <section className="lp-section lp-newsletter-bg">
        <div className="lp-newsletter-box">
          <h2 className="lp-title text-center">Join the Inner Circle</h2>
          <p className="lp-desc text-center">
            Subscribe to receive private sale invitations, secret discount codes, and early access alerts.
          </p>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={NewsletterSchema}
            onSubmit={handleSubscribe}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="lp-newsletter-form">
                <div className="lp-field-group">
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your email address..."
                    className={`lp-newsletter-input ${errors.email && touched.email ? 'error' : ''}`}
                  />
                  <ErrorMessage name="email" component="div" className="lp-error-text" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lp-btn lp-btn-primary lp-newsletter-btn"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </Form>
            )}
          </Formik>

          {newsletterStatus && (
            <div className={`lp-newsletter-alert ${newsletterStatus.type}`}>
              {newsletterStatus.text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}