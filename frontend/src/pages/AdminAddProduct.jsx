import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/auth";
import "../static/AdminAddProduct.css";

const AdminAddProduct = () => {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        category: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    // Fetch categories on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASEURL}/api/category/`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setCategories(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, [BASEURL]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        if (!form.category) {
            setMsg({ text: "Please select a category", type: "error" });
            setLoading(false);
            return;
        }

        if (parseFloat(form.price) <= 0) {
            setMsg({ text: "Price must be a positive number", type: "error" });
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("description", form.description);
            formData.append("category", form.category);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await authFetch(`${BASEURL}/api/products/create/`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setMsg({ text: "Product created successfully!", type: "success" });
                setForm({ name: "", price: "", description: "", category: "" });
                setImageFile(null);
                setImagePreview(null);
            } else {
                const data = await res.json();
                setMsg({ text: data.error || "Failed to create product", type: "error" });
            }
        } catch (err) {
            console.error("Error creating product:", err);
            setMsg({ text: "A network error occurred. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-dashboard-container">
                <div className="admin-header">
                    <button onClick={() => navigate(-1)} className="admin-back-btn" title="Go back">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Back</span>
                    </button>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                        </div>
                        <div className="admin-title-group">
                            <h2>Add New Product</h2>
                            <p>Publish a new item to the storefront inventory</p>
                        </div>
                    </div>

                    <div className="admin-card-body">
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">Product Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Premium Leather Jacket"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        required
                                        className="admin-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">Price ($)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0.01"
                                        value={form.price}
                                        onChange={handleInputChange}
                                        required
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleInputChange}
                                    required
                                    className="admin-select"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Provide detailed features, materials, and sizing..."
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="admin-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label>Product Image</label>
                                <div className="image-upload-wrapper">
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="image-file-input"
                                        title="Choose a product image"
                                    />
                                    <div className="upload-prompt">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span>Click or drag image file here</span>
                                    </div>
                                </div>
                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="remove-image-btn"
                                            title="Remove image"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {msg.text && (
                                <div className={`admin-msg ${msg.type}`}>
                                    {msg.type === 'success' ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                    )}
                                    <span>{msg.text}</span>
                                </div>
                            )}

                            <div className="admin-actions">
                                <button type="submit" className="admin-submit-btn" disabled={loading}>
                                    {loading ? "Publishing Product..." : "Publish Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAddProduct;
