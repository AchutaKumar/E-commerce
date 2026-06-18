import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../static/ShippingInfo.css";

const ShippingInfo = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="info-page-wrap">
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px', paddingLeft: '20px' }}>
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
            <div className="info-container">
                <div className="info-header">
                    <h1>Shipping Information</h1>
                    <p>Everything you need to know about our delivery process.</p>
                </div>

                <div className="info-section">
                    <h2><span className="icon">📦</span> Processing Time</h2>
                    <p>
                        We strive to get your orders out as quickly as possible. All orders are processed within <strong>1-2 business days</strong> (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
                    </p>
                </div>

                <div className="info-section">
                    <h2><span className="icon">🚚</span> Shipping Rates & Delivery Estimates</h2>
                    <p>Shipping charges for your order will be calculated and displayed at checkout. We offer several shipping options:</p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> 5-7 business days (Free on orders over $50)</li>
                        <li><strong>Expedited Shipping:</strong> 2-3 business days ($12.99)</li>
                        <li><strong>Next Day Delivery:</strong> 1 business day ($24.99)</li>
                    </ul>
                    <p>
                        <em>Note: Delivery delays can occasionally occur due to extreme weather or carrier issues.</em>
                    </p>
                </div>

                <div className="info-section">
                    <h2><span className="icon">🌍</span> International Shipping</h2>
                    <p>
                        We currently ship to over 50 countries worldwide. International shipping rates vary by destination and will be calculated at checkout. Please note that your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. LoyalKart is not responsible for these charges if they are applied and are your responsibility as the customer.
                    </p>
                </div>

                <div className="info-section">
                    <h2><span className="icon">📍</span> How do I check the status of my order?</h2>
                    <p>
                        When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                    </p>
                    <p>
                        If you haven’t received your order within 10 days of receiving your shipping confirmation email, please contact us at support@loyalkart.com with your name and order number, and we will look into it for you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShippingInfo;
