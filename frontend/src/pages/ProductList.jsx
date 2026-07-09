import { useSearchParams } from "react-router-dom";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import ProductCard from '../components/ProductCard';
import '../static/ProductList.css';
import { ProductListSkeleton } from '../components/SkeletonLoader';

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || 'All';

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    // Fetch categories with SWR
    const { data: categories = [], error: categoriesError } = useSWR(
        `${BASEURL}/api/category/`,
        fetcher,
        {
            fallbackData: (() => {
                try {
                    const cached = sessionStorage.getItem('cachedCategories');
                    return cached ? JSON.parse(cached) : [];
                } catch (e) {
                    return [];
                }
            })(),
            onSuccess: (data) => sessionStorage.setItem('cachedCategories', JSON.stringify(data)),
        }
    );

    // Fetch products with SWR Infinite
    const getKey = (pageIndex, previousPageData) => {
        // Reached the end
        if (previousPageData && !previousPageData.next) return null;
        
        const params = new URLSearchParams({
            page: pageIndex + 1,
            ...(query && { q: query }),
            ...(selectedCategory !== 'All' && { category: selectedCategory })
        });
        
        return `${BASEURL}/api/products/?${params.toString()}`;
    };

    const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
        revalidateFirstPage: false,
    });

    const products = data ? data.flatMap(page => page?.results || []) : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
    const hasMore = data && data[data.length - 1]?.next != null;

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
                {isLoadingInitialData ? (
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
            
            {hasMore && products.length > 0 && !isLoadingInitialData && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', paddingBottom: '30px' }}>
                    <button 
                        onClick={() => setSize(size + 1)} 
                        disabled={isLoadingMore || isValidating}
                        className="category-pill active"
                        style={{ padding: '12px 30px', fontSize: '16px' }}
                    >
                        {isLoadingMore || isValidating ? 'Loading...' : 'Load More Products'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductList;