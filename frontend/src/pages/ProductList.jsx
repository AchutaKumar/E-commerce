import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from '../components/ProductCard';
import '../static/ProductList.css';
import { ProductListSkeleton } from '../components/SkeletonLoader';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(() => {
        try {
            const cached = sessionStorage.getItem('cachedCategories');
            const parsed = cached ? JSON.parse(cached) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || 'All';

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    // Fetch categories on mount
    useEffect(() => {
        let isMounted = true;
        
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${BASEURL}/api/category/`);
                if (!res.ok) throw new Error("Failed to fetch categories");
                
                const data = await res.json();
                
                if (isMounted && Array.isArray(data)) {
                    setCategories(data);
                    sessionStorage.setItem('cachedCategories', JSON.stringify(data));
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                if (isMounted && categories.length === 0) {
                    setCategories([]); // Fallback to empty array
                }
            }
        };

        if (categories.length === 0) {
            fetchCategories();
        }

        return () => {
            isMounted = false;
        };
    }, [BASEURL]); // Intentionally omitting categories.length to avoid unnecessary re-fetches

    // Reset page and products when search/category changes
    useEffect(() => {
        setPage(1);
        setProducts([]);
        setHasMore(true);
        setLoading(true);
    }, [query, selectedCategory]);

    // Fetch products based on page, query, and category
    useEffect(() => {
        let isMounted = true;
        
        const fetchProducts = async () => {
            if (page === 1 && products.length === 0) setLoading(true);
            else setLoadingMore(true);

            try {
                const params = new URLSearchParams({
                    page: page,
                    ...(query && { q: query }),
                    ...(selectedCategory !== 'All' && { category: selectedCategory })
                });

                const res = await fetch(`${BASEURL}/api/products/?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch products");
                
                const data = await res.json();
                
                if (isMounted) {
                    if (page === 1) {
                        setProducts(data.results);
                    } else {
                        setProducts(prev => {
                            const newItems = data.results.filter(d => !prev.some(p => p.id === d.id));
                            return [...prev, ...newItems];
                        });
                    }
                    setHasMore(data.next !== null);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        };

        const timeoutId = setTimeout(fetchProducts, 50);
        return () => { 
            isMounted = false; 
            clearTimeout(timeoutId);
        };
    }, [page, query, selectedCategory, BASEURL]);

    const handleCategorySelect = (catId) => {
        const params = {};
        if (catId !== 'All') params.category = catId;
        if (query) params.q = query; // preserve search query
        setSearchParams(params);
    };

    if (error) {
        return (
            <div className="products-container">
                <div className="products-catalog-header">
                    <div className="error-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h3>Oops! Something went wrong</h3>
                        <p>We couldn't load the products at this time. Please check your connection or try again later.</p>
                        <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="products-container">
            <div className="products-catalog-header">
                {query ? (
                    <h1 className="products-title">Search results for "{query}"</h1>
                ) : (
                    <div className="hero-banner">
                        <div className="hero-content">
                            <h1>New Arrivals</h1>
                            <p>Discover premium quality products curated just for you.</p>
                        </div>
                    </div>
                )}

                {/* Category Filtering pills row */}
                <div className="category-filter-bar">
                    <button
                        className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                        onClick={() => handleCategorySelect('All')}
                    >
                        All Items
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id.toString() || selectedCategory === cat.name ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(cat.id.toString())}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="products-grid">
                {loading ? (
                    <ProductListSkeleton count={8} />
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="no-products">
                        <h3>No products found</h3>
                        <p>We couldn't find matches. Try adjusting your query or category filter.</p>
                    </div>
                )}
            </div>
            
            {hasMore && products.length > 0 && !loading && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', paddingBottom: '30px' }}>
                    <button 
                        onClick={() => setPage(p => p + 1)} 
                        disabled={loadingMore}
                        className="category-pill active"
                        style={{ padding: '12px 30px', fontSize: '16px' }}
                    >
                        {loadingMore ? 'Loading...' : 'Load More Products'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductList;