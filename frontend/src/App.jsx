import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ROUTES } from "./utils/routes.js";
import { getAccessToken, clearToken } from "./utils/auth";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PrivateRouter from "./components/PrivateRouter";
import AdminRouter from "./components/AdminRouter";
import { CartProvider } from "./context/CardContext.jsx";
import "./static/App.css";

// --- Lazy-loaded pages (code-split at route level) ---
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const ShippingInfo = lazy(() => import("./pages/ShippingInfo"));
const SavedItems = lazy(() => import("./pages/SavedItems"));
const Login = lazy(() => import("./pages/Login"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheakoutPage = lazy(() => import("./pages/CheakoutPage"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminAddProduct = lazy(() => import("./pages/AdminAddProduct"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Simple loading spinner shown while a chunk is loading. */
const PageLoader = () => (
  <div className="page-loader" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
    <div className="spinner" style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#0058be", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const App = () => {
  const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const verifyToken = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const res = await fetch(`${BASE_URL}/api/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 401 || res.status === 403) {
            clearToken();
          }
        } catch (_error) {
          // Network errors or backend unreachable, ignore
        }
      }
    };
    verifyToken();
  }, [BASE_URL]);

  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <NavBar />
        <main className="animate-fade-in">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public routes ── */}
              <Route path={ROUTES.HOME} element={<LandingPage />} />
              <Route path={ROUTES.SHOP} element={<ProductList />} />
              <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />

              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.SHIPPING_INFO} element={<ShippingInfo />} />
              <Route path={ROUTES.SAVED_ITEMS} element={<SavedItems />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<SignupPage />} />

              {/* ── Protected routes (auth required) ── */}
              <Route element={<PrivateRouter />}>
                <Route path={ROUTES.CART} element={<CartPage />} />
                <Route path={ROUTES.CHECKOUT} element={<CheakoutPage />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
              </Route>

              {/* ── Admin routes ── */}
              <Route element={<AdminRouter />}>
                <Route path={ROUTES.ADMIN_ADD_PRODUCT} element={<AdminAddProduct />} />
              </Route>
              <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

              {/* ── 404 catch-all ── */}
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </CartProvider>
    </Router>
  );
};

export default App;
