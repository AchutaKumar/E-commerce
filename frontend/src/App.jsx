import {HashRouter as Router, Routes, Route} from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetails";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import CartPage from "./pages/CartPage";
import CheakoutPage from "./pages/CheakoutPage";
import Login from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import PrivateRouter from "./components/PrivateRouter";
import AdminRouter from "./components/AdminRouter";
import AdminAddProduct from "./pages/AdminAddProduct";
import ScrollToTop from "./components/ScrollToTop";
import './static/App.css'
import Profile from "./pages/Profile";
import About from "./pages/About";
import ShippingInfo from "./pages/ShippingInfo";
import SavedItems from "./pages/SavedItems";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CardContext.jsx";
import { useEffect } from "react";
import { getAccessToken, clearToken } from "./utils/auth";

const App = () => {
  const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const verifyToken = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const res = await fetch(`${BASE_URL}/api/profile/`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.status === 401 || res.status === 403) {
            clearToken();
            window.location.reload(); // Reload to update NavBar state
          }
        } catch (error) {
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
			<Routes>
				<Route path="/" element={<ProductList />} />
				<Route path="/products/:id" element={<ProductDetail />} />
				<Route path="/about" element={<About />} />
				<Route path="/shipping-info" element={<ShippingInfo />} />
				<Route path="/saved-items" element={<SavedItems />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<SignupPage />} />
				
				<Route element={<PrivateRouter />}>
					<Route path="/cart" element={<CartPage />} />
					<Route path="/checkout" element={<CheakoutPage />} />
					<Route path="/profile" element={<Profile />} />
				</Route>

				<Route element={<AdminRouter />}>
					<Route path="/admin/add-product" element={<AdminAddProduct />} />
				</Route>

				<Route path="*" element={<NotFound />} />
			</Routes>
      <Footer />
		</CartProvider>
	</Router>
  )
}

export default App
