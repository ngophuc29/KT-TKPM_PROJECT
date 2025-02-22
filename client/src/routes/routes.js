import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import Signup from "@/pages/Signup/Signup";
import Cart from "../pages/Cart/Cart";
import CheckoutPage from "../pages/CheckOut/CheckoutPage";
 
import ProductDetailsAll from "../components/ProductDetails/ProductDetailsAll";
const publicRoutes = [
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/cart", component: Cart },
  { path: "/checkout", component: CheckoutPage },
  { path: "/details", component: ProductDetailsAll},



];

// Đăng nhập mới xem được (Login)
const privateRoutes = [];

export { publicRoutes, privateRoutes };
