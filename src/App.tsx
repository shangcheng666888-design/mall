import type React from 'react'
import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './cart/CartContext.tsx'
import { ToastProvider } from './components/ToastProvider'
import { ProductFavoritesProvider } from './context/ProductFavoritesContext'
import './App.css'

const Layout = lazy(() => import('./components/Layout'))

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const MerchantApply = lazy(() => import('./pages/MerchantApply'))
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const AccountCenter = lazy(() => import('./pages/AccountCenter'))
const WalletRecharge = lazy(() => import('./pages/WalletRecharge'))
const WalletWithdraw = lazy(() => import('./pages/WalletWithdraw'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'))
const DeliveryPolicy = lazy(() => import('./pages/DeliveryPolicy'))
const SellerPolicy = lazy(() => import('./pages/SellerPolicy'))
const Categories = lazy(() => import('./pages/Categories'))
const Shop = lazy(() => import('./pages/Shop'))
const CreditService = lazy(() => import('./pages/CreditService'))
const Checkout = lazy(() => import('./pages/Checkout'))

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    document.getElementById('root')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

const PageLoadFallback: React.FC = () => (
  <div className="app-loading-fallback" role="status" aria-label="Loading">
    <span className="app-loading-spinner" aria-hidden />
    <span className="app-loading-text">Loading…</span>
  </div>
)

const App: React.FC = () => (
  <CartProvider>
    <ToastProvider>
      <ProductFavoritesProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoadFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="account" element={<AccountCenter />} />
              <Route path="merchant/apply" element={<MerchantApply />} />
              <Route path="wallet/recharge" element={<WalletRecharge />} />
              <Route path="wallet/withdraw" element={<WalletWithdraw />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="shops/:id" element={<Shop />} />
              <Route path="register" element={<Register />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="return-policy" element={<ReturnPolicy />} />
              <Route path="delivery" element={<DeliveryPolicy />} />
              <Route path="seller-policy" element={<SellerPolicy />} />
              <Route path="credit-service" element={<CreditService />} />
              <Route path="checkout" element={<Checkout />} />
            </Route>
          </Routes>
        </Suspense>
      </ProductFavoritesProvider>
    </ToastProvider>
  </CartProvider>
)

export default App
