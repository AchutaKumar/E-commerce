import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../static/About.css";

const About = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page-wrap">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <button 
                    onClick={() => navigate('/')}
                    className="back-btn"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Shopping
                </button>
            </div>
            <section className="about-hero">
                <div className="about-hero-content">
                    <h1>About LoyalKart</h1>
                    <p>Redefining your online shopping experience with premium quality products and unparalleled customer service.</p>
                </div>
            </section>

            <section className="about-container">
                <div className="about-section">
                    <div className="about-text">
                        <h2>Our Story</h2>
                        <p>
                            Founded with a passion for excellence, LoyalKart began as a simple idea: to create a curated marketplace where quality meets affordability. We noticed that online shopping was often overwhelming and impersonal, so we set out to build a platform that feels like your neighborhood boutique, but with global reach.
                        </p>
                        <p>
                            Today, we serve thousands of customers worldwide, continually expanding our catalog with the latest electronics, fashion, and everyday essentials. Our dedicated team works around the clock to ensure every product meets our strict quality standards before it reaches your door.
                        </p>
                    </div>
                    <div className="about-image-grid">
                        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1470&auto=format&fit=crop" alt="Team meeting" className="tall" />
                        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1470&auto=format&fit=crop" alt="Customer service" />
                        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1470&auto=format&fit=crop" alt="Warehouse" />
                    </div>
                </div>

                <div className="about-section reverse">
                    <div className="about-text">
                        <h2>Our Mission</h2>
                        <p>
                            Our mission is to empower our customers by providing access to high-quality products without the premium price tag. We believe that everyone deserves to experience the joy of discovering well-crafted items that enhance their daily lives.
                        </p>
                        <p>
                            We are committed to sustainable sourcing, ethical partnerships, and a shopping experience that prioritizes your satisfaction above all else. Every decision we make is guided by our core values of transparency, integrity, and innovation.
                        </p>
                    </div>
                    <div className="about-image-grid">
                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1469&auto=format&fit=crop" alt="Office space" className="tall" />
                        <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1484&auto=format&fit=crop" alt="Collaboration" />
                        <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop" alt="Presentation" />
                    </div>
                </div>
            </section>

            <section className="about-values">
                <div className="about-values-container">
                    <h2>Why Choose Us</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">💎</div>
                            <h3>Premium Quality</h3>
                            <p>Every item in our store is carefully vetted to ensure it meets our rigorous standards for durability and design.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🚀</div>
                            <h3>Fast Shipping</h3>
                            <p>We partner with top-tier logistics providers to get your orders to you as quickly and securely as possible.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🛡️</div>
                            <h3>Secure Shopping</h3>
                            <p>Your privacy and security are our top priorities. We use state-of-the-art encryption to protect your data.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
