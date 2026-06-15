import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import homeNavIcon from '../assets/home-nav.png'
import footerLogo from '../assets/logo2.png'
import payBinance from '../assets/binance.png'
import payHuobi from '../assets/Huobi.png'
import payOkx from '../assets/okx.png'
import payKraken from '../assets/KraKen.png'
import payCoinbase from '../assets/Coinbase.png'
import payMetamask from '../assets/MetaMask.png'
import payKucoin from '../assets/KuCoin.png'
import payBitfinex from '../assets/Bitfinex.png'
import loginIcon from '../assets/denglu.png'
import serviceIcon from '../assets/kefu.png'
import messageIcon from '../assets/xiaoxi.png'
import cartNavIcon from '../assets/cart-nav.png'
import shopNavIcon from '../assets/shop-nav.png'
import accountNavIcon from '../assets/account-nav.png'
import productsNavIcon from '../assets/products-nav.png'
import zhFlagIcon from '../assets/lang-zh.png'
import enFlagIcon from '../assets/lang-en.png'
import deFlagIcon from '../assets/lang-de.png'
import jaFlagIcon from '../assets/lang-ja.png'
import koFlagIcon from '../assets/lang-ko.png'
import esFlagIcon from '../assets/lang-es.png'
import itFlagIcon from '../assets/lang-it.png'
import viFlagIcon from '../assets/lang-vi.png'
import frFlagIcon from '../assets/lang-fr.png'
import FloatingCart from './FloatingCart.tsx'
import { openCrispChat } from '../utils/crispChat'
import LogoutSuccessModal from './LogoutSuccessModal.tsx'
import CartDrawer from './CartDrawer.tsx'
import { useLang } from '../context/LangContext'
import { navigateFromSearchQuery } from '../utils/searchNavigation'
import { LANG_LABELS, SUPPORTED_LANGS, tr, type Lang } from '../i18n'

const LANG_FLAG_ICONS: Record<Lang, string> = {
  zh: zhFlagIcon,
  tw: zhFlagIcon,
  en: enFlagIcon,
  de: deFlagIcon,
  ja: jaFlagIcon,
  ko: koFlagIcon,
  es: esFlagIcon,
  it: itFlagIcon,
  vi: viFlagIcon,
  fr: frFlagIcon,
}

const Layout: React.FC = () => {
  const { lang, setLang } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const isProductsPage = location.pathname === '/products'
  const isHomePage = location.pathname === '/'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [subscribeError, setSubscribeError] = useState(false)
  const [subscribeSuccessOpen, setSubscribeSuccessOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [logoutSuccessOpen, setLogoutSuccessOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [headerSearchKeyword, setHeaderSearchKeyword] = useState('')
  const langSwitcherRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const TOP_THRESHOLD = 80
    const scrollRoot = document.getElementById('root')
    const handleScroll = () => {
      const y = scrollRoot?.scrollTop ?? window.scrollY
      if (y <= TOP_THRESHOLD) {
        setNavCollapsed(false)
      } else {
        setNavCollapsed(true)
      }
      lastScrollY.current = y
    }
    scrollRoot?.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollRoot?.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('authUser')
      setIsAuthed(!!stored)
    } catch {
      setIsAuthed(false)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langSwitcherRef.current && !langSwitcherRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false)
      }
    }
    if (langDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [langDropdownOpen])

  const handleBackToTop = () => {
    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = () => {
    const trimmed = subscribeEmail.trim()
    if (!trimmed) {
      setSubscribeError(true)
      return
    }
    setSubscribeError(false)
    setSubscribeEmail('')
    setSubscribeSuccessOpen(true)
  }

  const authUser = (() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem('authUser')
      if (!raw) return null
      return JSON.parse(raw) as { type?: 'email' | 'phone'; value?: string; account?: string }
    } catch {
      return null
    }
  })()

  const displayAuthValue = (value: string | undefined) => {
    const s = value != null && typeof value === 'string' ? value : ''
    if (s.length <= 8) return s || (tr(lang, { zh: '账户', en: 'Account', de: 'Konto', ja: 'アカウント', ko: '계정', es: 'Cuenta', it: 'Account', vi: 'Tài khoản', fr: 'Compte' }))
    return `${s.slice(0, 8)}...`
  }

  const handleLogout = () => {
    window.localStorage.removeItem('authUser')
    setIsAuthed(false)
    setLogoutSuccessOpen(true)
  }

  const handleHeaderSearchSubmit = () => {
    navigateFromSearchQuery(navigate, headerSearchKeyword)
  }

  const handleGoAccount = () => {
    if (!authUser) return
    navigate('/account')
  }

  const handleBottomCartClick = () => {
    if (!authUser) {
      navigate('/login')
      return
    }
    setCartOpen(true)
  }

  return (
    <div className={`app-shell${navCollapsed ? ' primary-nav-collapsed' : ''}`}>
      <div className="app-top-fixed">
      <header className={`app-header${!isAuthed ? ' app-header--guest' : ''}`}>
        <div className="app-header-inner">
          <div className="app-header-left">
            <Link to="/" className="logo-wrap">
              <img src={logo} alt="TikTok mall" className="logo-image" />
            </Link>
          </div>
          <div className="app-header-center">
            <div className="search-capsule">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <line
                  x1="15"
                  y1="15"
                  x2="20"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="search-input"
                placeholder={
                  tr(lang, { zh: '找货源/商品/供应商/求购', en: 'Search products / suppliers / requests', de: 'Suche nach Produkten / Lieferanten / Anfragen', ja: '製品・サプライヤー・ご要望を探す', ko: '제품/공급업체/요청 검색', es: 'Buscar productos / proveedores / solicitudes', it: 'Ricerca prodotti/fornitori/richieste', vi: 'Tìm kiếm sản phẩm/nhà cung cấp/yêu cầu', fr: 'Rechercher des produits / fournisseurs / demandes' })
                }
                value={headerSearchKeyword}
                onChange={(e) => setHeaderSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleHeaderSearchSubmit()
                  }
                }}
              />
              <button
                type="button"
                className="search-button"
                onClick={handleHeaderSearchSubmit}
              >
                {tr(lang, { zh: '搜索', en: 'Search', de: 'Suchen', ja: '検索', ko: '찾다', es: 'Buscar', it: 'Ricerca', vi: 'Tìm kiếm', fr: 'Recherche' })}
              </button>
            </div>
          </div>
          <div className="app-header-right">
            {authUser ? (
              <div
                className="header-link header-link--user"
                role="button"
                tabIndex={0}
                onClick={handleGoAccount}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleGoAccount()
                  }
                }}
              >
                <img
                  src={loginIcon}
                  alt={tr(lang, { zh: '账户', en: 'Account', de: 'Konto', ja: 'アカウント', ko: '계정', es: 'Cuenta', it: 'Account', vi: 'Tài khoản', fr: 'Compte' })}
                  className="header-icon"
                />
                <span className="header-link-text">
                  {displayAuthValue(authUser.value ?? authUser.account)}
                  <span className="header-link-divider">
                    {tr(lang, { zh: ' 或者 ', en: ' or ', de: 'oder', ja: 'または', ko: '또는', es: 'o', it: 'O', vi: 'hoặc', fr: 'ou' })}
                  </span>
                  <button
                    type="button"
                    className="header-user-logout"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLogout()
                    }}
                  >
                    {tr(lang, { zh: '退出', en: 'Logout', de: 'Abmelden', ja: 'ログアウト', ko: '로그아웃', es: 'Cerrar sesión', it: 'Esci', vi: 'Đăng xuất', fr: 'Déconnexion' })}
                  </button>
                </span>
              </div>
            ) : (
              <div className="header-link">
                <img
                  src={loginIcon}
                  alt={tr(lang, { zh: '登录 / 注册', en: 'Login / Register', de: 'Anmelden / Registrieren', ja: 'ログイン/登録', ko: '로그인 / 등록', es: 'Iniciar sesión / Registrarse', it: 'Accedi / Registrati', vi: 'Đăng nhập / Đăng ký', fr: 'Connexion / S\'inscrire' })}
                  className="header-icon"
                />
                <span className="header-link-text">
                  <Link to="/login">{tr(lang, { zh: '登录', en: 'Login', de: 'Login', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}</Link>
                  <span className="header-link-divider">
                    {tr(lang, { zh: '或者', en: 'or', de: 'oder', ja: 'または', ko: '또는', es: 'o', it: 'O', vi: 'hoặc', fr: 'ou' })}
                  </span>
                  <Link to="/register">{tr(lang, { zh: '注册', en: 'Register', de: 'Registrieren', ja: '登録する', ko: '등록하다', es: 'Registro', it: 'Registro', vi: 'Đăng ký', fr: 'Registre' })}</Link>
                </span>
              </div>
            )}

            <button
              type="button"
              className="header-icon-button header-icon-button--service"
              aria-label={tr(lang, { zh: '客服', en: 'Customer service', de: 'Kundendienst', ja: '顧客サービス', ko: '고객 서비스', es: 'Servicio al cliente', it: 'Assistenza clienti', vi: 'Dịch vụ khách hàng', fr: 'Service client' })}
              onClick={() => openCrispChat()}
            >
              <img
                src={serviceIcon}
                alt={tr(lang, { zh: '客服', en: 'Customer service', de: 'Kundendienst', ja: '顧客サービス', ko: '고객 서비스', es: 'Servicio al cliente', it: 'Assistenza clienti', vi: 'Dịch vụ khách hàng', fr: 'Service client' })}
                className="header-icon"
              />
            </button>
            {!isAuthed && (
              <div className="header-mobile-auth">
                <Link to="/login" className="header-mobile-auth-btn">
                  {tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}
                </Link>
                <Link to="/register" className="header-mobile-auth-btn">
                  {tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}
                </Link>
              </div>
            )}

            <button
              type="button"
              className="header-icon-button"
              aria-label={tr(lang, { zh: '消息', en: 'Messages', de: 'Nachrichten', ja: 'メッセージ', ko: '메시지', es: 'Mensajes', it: 'Messaggi', vi: 'Tin nhắn', fr: 'Messages' })}
            >
              <img
                src={messageIcon}
                alt={tr(lang, { zh: '消息', en: 'Messages', de: 'Nachrichten', ja: 'メッセージ', ko: '메시지', es: 'Mensajes', it: 'Messaggi', vi: 'Tin nhắn', fr: 'Messages' })}
                className="header-icon"
              />
            </button>

            <div className="lang-switcher" ref={langSwitcherRef}>
              <button
                type="button"
                className="header-flag-button"
                aria-label={tr(lang, { zh: '语言选择', en: 'Language switch', de: 'Sprachauswahl', ja: '言語選択', ko: '언어 선택', es: 'Selector de idioma', it: 'Selezione lingua', vi: 'Chọn ngôn ngữ', fr: 'Sélection de la langue' })}
                aria-expanded={langDropdownOpen}
                onClick={() => setLangDropdownOpen((v) => !v)}
              >
                <span className="lang-flag-circle" aria-hidden="true">
                  <img src={LANG_FLAG_ICONS[lang]} alt="" className="lang-flag-image" />
                </span>
                <span className="header-caret">▾</span>
              </button>
              {langDropdownOpen && (
                <div
                  className="lang-dropdown"
                  role="listbox"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {SUPPORTED_LANGS.map((code) => (
                    <button
                      key={code}
                      type="button"
                      role="option"
                      aria-selected={lang === code}
                      className="lang-dropdown-item"
                      onClick={() => {
                        setLang(code)
                        setLangDropdownOpen(false)
                      }}
                    >
                      <span className="lang-flag-circle">
                        <img src={LANG_FLAG_ICONS[code]} alt="" className="lang-flag-image" />
                      </span>
                      <span className="lang-name">{LANG_LABELS[code]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <LogoutSuccessModal open={logoutSuccessOpen} onClose={() => setLogoutSuccessOpen(false)} />

      <nav className={`primary-nav${navCollapsed ? ' primary-nav--collapsed' : ''}`}>
        <div className="primary-nav-inner">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-item primary-nav-link primary-nav-link-active'
                : 'primary-nav-item primary-nav-link'
            }
          >
            {tr(lang, { zh: '首页', en: 'Home', de: 'Heim', ja: '家', ko: '집', es: 'Hogar', it: 'Casa', vi: 'Trang chủ', fr: 'Maison' })}
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-item primary-nav-link primary-nav-link-active'
                : 'primary-nav-item primary-nav-link'
            }
          >
            {tr(lang, { zh: '分类', en: 'Categories', de: 'Kategorien', ja: 'カテゴリー', ko: '카테고리', es: 'Categorías', it: 'Categorie', vi: 'Thể loại', fr: 'Catégories' })}
          </NavLink>
          <NavLink
            to="/products"
            end
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-item primary-nav-link primary-nav-link-active'
                : 'primary-nav-item primary-nav-link'
            }
          >
            {tr(lang, { zh: '商品', en: 'Products', de: 'Produkte', ja: '製品', ko: '제품', es: 'Productos', it: 'Prodotti', vi: 'Các sản phẩm', fr: 'Produits' })}
          </NavLink>
          <NavLink
            to="/merchant/apply"
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-item primary-nav-link primary-nav-link-active'
                : 'primary-nav-item primary-nav-link'
            }
          >
            {tr(lang, { zh: '商家入驻', en: 'Merchant join', de: 'Händler beitreten', ja: 'マーチャントの参加', ko: '판매자 가입', es: 'Únase al comerciante', it: 'Il commerciante si unisce', vi: 'Thương gia tham gia', fr: 'Rejoindre un marchand' })}
          </NavLink>
          <NavLink
            to="/credit-service"
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-item primary-nav-link primary-nav-link-active'
                : 'primary-nav-item primary-nav-link'
            }
          >
            {tr(lang, { zh: '信贷服务', en: 'Credit service', de: 'Kreditservice', ja: 'クレジットサービス', ko: '신용서비스', es: 'Servicio de crédito', it: 'Servizio di credito', vi: 'Dịch vụ tín dụng', fr: 'Service de crédit' })}
          </NavLink>
        </div>
      </nav>
      </div>

      <main className={`app-main${isProductsPage ? ' app-main--products' : ''}${isHomePage ? ' app-main--home' : ''}`}>
        <Outlet />
      </main>

      {/* 移动端底部导航（首页 / 商品 / 店铺入驻 / 购物车 / 个人中心） */}
      <nav
        className="mobile-bottom-nav"
        aria-label={tr(lang, { zh: '主导航', en: 'Main navigation', de: 'Hauptnavigation', ja: 'メインナビゲーション', ko: '메인 네비게이션', es: 'Navegación principal', it: 'Navigazione principale', vi: 'Điều hướng chính', fr: 'Navigation principale' })}
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'mobile-bottom-nav-item mobile-bottom-nav-item--active' : 'mobile-bottom-nav-item'
          }
        >
          <span className="mobile-bottom-nav-icon" aria-hidden="true">
            <img src={homeNavIcon} alt="" className="mobile-bottom-nav-home-icon" />
          </span>
          <span className="mobile-bottom-nav-label">{tr(lang, { zh: '首页', en: 'Home', de: 'Heim', ja: '家', ko: '집', es: 'Hogar', it: 'Casa', vi: 'Trang chủ', fr: 'Maison' })}</span>
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive
              ? 'mobile-bottom-nav-item mobile-bottom-nav-item--products mobile-bottom-nav-item--active'
              : 'mobile-bottom-nav-item mobile-bottom-nav-item--products'
          }
        >
          <span className="mobile-bottom-nav-icon" aria-hidden="true">
            <img src={productsNavIcon} alt="" className="mobile-bottom-nav-products-icon" />
          </span>
          <span className="mobile-bottom-nav-label">{tr(lang, { zh: '商品', en: 'Products', de: 'Produkte', ja: '製品', ko: '제품', es: 'Productos', it: 'Prodotti', vi: 'Các sản phẩm', fr: 'Produits' })}</span>
        </NavLink>
        <NavLink
          to="/merchant/apply"
          className={({ isActive }) =>
            isActive ? 'mobile-bottom-nav-item mobile-bottom-nav-item--active' : 'mobile-bottom-nav-item'
          }
        >
          <span className="mobile-bottom-nav-icon" aria-hidden="true">
            <img src={shopNavIcon} alt="" className="mobile-bottom-nav-shop-icon" />
          </span>
          <span className="mobile-bottom-nav-label">{tr(lang, { zh: '店铺', en: 'Shops', de: 'Geschäfte', ja: 'ショップ', ko: '상점', es: 'Tiendas', it: 'Negozi', vi: 'Cửa hàng', fr: 'Boutiques' })}</span>
        </NavLink>
        <button
          type="button"
          className={`mobile-bottom-nav-item mobile-bottom-nav-item--cart${cartOpen && isAuthed ? ' mobile-bottom-nav-item--active' : ''}`}
          onClick={handleBottomCartClick}
        >
          <span className="mobile-bottom-nav-icon" aria-hidden="true">
            <img src={cartNavIcon} alt="" className="mobile-bottom-nav-cart-icon" />
          </span>
          <span className="mobile-bottom-nav-label">{tr(lang, { zh: '购物车', en: 'Cart', de: 'Warenkorb', ja: 'カート', ko: '카트', es: 'Carro', it: 'Carrello', vi: 'Xe đẩy', fr: 'Panier' })}</span>
        </button>
        {isAuthed ? (
          <NavLink
            to="/account"
            className={({ isActive }) =>
              isActive
                ? 'mobile-bottom-nav-item mobile-bottom-nav-item--account mobile-bottom-nav-item--active'
                : 'mobile-bottom-nav-item mobile-bottom-nav-item--account'
            }
          >
            <span className="mobile-bottom-nav-icon" aria-hidden="true">
              <img src={accountNavIcon} alt="" className="mobile-bottom-nav-account-icon" />
            </span>
            <span className="mobile-bottom-nav-label">{tr(lang, { zh: '个人中心', en: 'Account', de: 'Konto', ja: 'アカウント', ko: '계정', es: 'Cuenta', it: 'Account', vi: 'Tài khoản', fr: 'Compte' })}</span>
          </NavLink>
        ) : (
          <button
            type="button"
            className="mobile-bottom-nav-item mobile-bottom-nav-item--account"
            onClick={() => navigate('/login')}
          >
            <span className="mobile-bottom-nav-icon" aria-hidden="true">
              <img src={accountNavIcon} alt="" className="mobile-bottom-nav-account-icon" />
            </span>
            <span className="mobile-bottom-nav-label">{tr(lang, { zh: '个人中心', en: 'Account', de: 'Konto', ja: 'アカウント', ko: '계정', es: 'Cuenta', it: 'Account', vi: 'Tài khoản', fr: 'Compte' })}</span>
          </button>
        )}
      </nav>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-left">
              <div className="footer-logo-row">
                <img src={footerLogo} alt="TikTok Mall" className="footer-logo" />
              </div>
              <div className="footer-subscribe">
                <div className="footer-subscribe-title">
                  {tr(lang, { zh: '我想要更多您的服务', en: 'I want to know more about your services', de: 'Ich möchte mehr über Ihre Dienstleistungen erfahren', ja: '貴社のサービスについてもっと知りたいです', ko: '귀하의 서비스에 대해 더 알고 싶습니다.', es: 'Quiero saber más sobre sus servicios.', it: 'Voglio sapere di più sui vostri servizi', vi: 'Tôi muốn biết thêm về dịch vụ của bạn', fr: 'Je veux en savoir plus sur vos services' })}
                </div>
                <div className="footer-subscribe-form">
                  <input
                    className={`footer-subscribe-input${
                      subscribeError ? ' footer-subscribe-input--error' : ''
                    }`}
                    placeholder={
                      subscribeError
                        ? tr(lang, { zh: '请输入邮箱', en: 'Please enter your email', de: 'Bitte geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력해주세요', es: 'Por favor ingrese su correo electrónico', it: 'Per favore inserisci la tua email', vi: 'Vui lòng nhập email của bạn', fr: 'Veuillez entrer votre email' })
                        : tr(lang, { zh: '您的电子邮箱', en: 'Your email', de: 'Ihre E-Mail', ja: 'あなたのメールアドレス', ko: '귀하의 이메일', es: 'Tu correo electrónico', it: 'La tua email', vi: 'Email của bạn', fr: 'Votre email' })
                    }
                    aria-label={tr(lang, { zh: '订阅邮箱', en: 'Subscribe email', de: 'E-Mail abonnieren', ja: 'メールを購読する', ko: '이메일 구독', es: 'Suscribir correo electrónico', it: 'Iscriviti e-mail', vi: 'Đăng ký email', fr: 'E-mail d\'inscription' })}
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    onFocus={() => setSubscribeError(false)}
                  />
                  <button type="button" className="footer-subscribe-button" onClick={handleSubscribe}>
                    {tr(lang, { zh: '订阅', en: 'Subscribe', de: 'Abonnieren', ja: '購読する', ko: '구독하다', es: 'Suscribir', it: 'Iscriviti', vi: 'Đặt mua', fr: 'S\'abonner' })}
                  </button>
                </div>
              </div>
            </div>

            <div className="footer-nav-columns">
              <div className="footer-nav-column">
                <div className="footer-nav-title">
                  {tr(lang, { zh: '客户服务', en: 'Customer service', de: 'Kundendienst', ja: '顧客サービス', ko: '고객 서비스', es: 'Servicio al cliente', it: 'Assistenza clienti', vi: 'Dịch vụ khách hàng', fr: 'Service client' })}
                </div>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => openCrispChat()}
                >
                  {tr(lang, { zh: '在线客服', en: 'Online support', de: 'Online-Support', ja: 'オンラインサポート', ko: '온라인 지원', es: 'Soporte en línea', it: 'Supporto in linea', vi: 'Hỗ trợ trực tuyến', fr: 'Assistance en ligne' })}
                </button>
                <button type="button" className="footer-nav-link">
                  {tr(lang, { zh: '联系我们', en: 'Contact us', de: 'Kontaktieren Sie uns', ja: 'お問い合わせ', ko: '문의하기', es: 'Contáctenos', it: 'Contattaci', vi: 'Liên hệ với chúng tôi', fr: 'Contactez-nous' })}
                </button>
              </div>
              <div className="footer-nav-column">
                <div className="footer-nav-title">
                  {tr(lang, { zh: '退款和换货', en: 'Refund & exchange', de: 'Rückerstattung und Umtausch', ja: '返品・交換', ko: '환불 및 교환', es: 'Reembolso y cambio', it: 'Rimborso e cambio', vi: 'Hoàn tiền và trao đổi', fr: 'Remboursement et échange' })}
                </div>
                <Link to="/privacy" className="footer-nav-link">
                  {tr(lang, { zh: '隐私政策', en: 'Privacy policy', de: 'Datenschutzrichtlinie', ja: 'プライバシーポリシー', ko: '개인 정보 보호 정책', es: 'Política de privacidad', it: 'Politica sulla riservatezza', vi: 'Chính sách bảo mật', fr: 'Politique de confidentialité' })}
                </Link>
                <Link to="/return-policy" className="footer-nav-link">
                  {tr(lang, { zh: '退货政策', en: 'Return policy', de: 'Rückgaberecht', ja: '返品規則', ko: '반품 정책', es: 'Política de devoluciones', it: 'Politica di ritorno', vi: 'Chính sách hoàn trả', fr: 'Politique de retour' })}
                </Link>
                <Link to="/delivery" className="footer-nav-link">
                  {tr(lang, { zh: '送货及取货', en: 'Delivery & pickup', de: 'Lieferung und Abholung', ja: '配送と引き取り', ko: '배달 및 픽업', es: 'Entrega y recogida', it: 'Consegna e ritiro', vi: 'Giao hàng & nhận hàng', fr: 'Livraison et ramassage' })}
                </Link>
                <Link to="/seller-policy" className="footer-nav-link">
                  {tr(lang, { zh: '卖家政策', en: 'Seller policy', de: 'Richtlinien des Verkäufers', ja: '販売者ポリシー', ko: '판매자 정책', es: 'Política del vendedor', it: 'Politica del venditore', vi: 'Chính sách người bán', fr: 'Politique du vendeur' })}
                </Link>
              </div>
              <div className="footer-nav-column">
                <div className="footer-nav-title">
                  {tr(lang, { zh: '用户中心', en: 'User center', de: 'Benutzerzentrum', ja: 'ユーザーセンター', ko: '사용자 센터', es: 'Centro de usuarios', it: 'Centro utenti', vi: 'Trung tâm người dùng', fr: 'Centre utilisateur' })}
                </div>
                {authUser ? (
                  <span className="footer-nav-link">
                    {tr(lang, { zh: '用户注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}
                  </span>
                ) : (
                  <Link to="/register" className="footer-nav-link">
                    {tr(lang, { zh: '用户注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}
                  </Link>
                )}
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => {
                    if (!authUser) {
                      navigate('/login')
                      return
                    }
                    navigate('/account?tab=orders')
                  }}
                >
                  {tr(lang, { zh: '订单查询', en: 'My orders', de: 'Meine Bestellungen', ja: '私の注文', ko: '내 주문', es: 'mis pedidos', it: 'I miei ordini', vi: 'Đơn đặt hàng của tôi', fr: 'Mes commandes' })}
                </button>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => {
                    if (!authUser) {
                      navigate('/login')
                      return
                    }
                    navigate('/account?tab=productFavorites')
                  }}
                >
                  {tr(lang, { zh: '商品收藏', en: 'Favorites', de: 'Favoriten', ja: 'お気に入り', ko: '즐겨찾기', es: 'Favoritos', it: 'Preferiti', vi: 'Yêu thích', fr: 'Favoris' })}
                </button>
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => {
                    if (!authUser) {
                      navigate('/login')
                      return
                    }
                    navigate('/account?tab=wallet')
                  }}
                >
                  {tr(lang, { zh: '我的钱包', en: 'My wallet', de: 'Meine Brieftasche', ja: '私の財布', ko: '내 지갑', es: 'mi billetera', it: 'Il mio portafoglio', vi: 'Ví của tôi', fr: 'Mon portefeuille' })}
                </button>
              </div>
              <div className="footer-nav-column">
                <div className="footer-nav-title">
                  {tr(lang, { zh: '关于我们', en: 'About us', de: 'Über uns', ja: '私たちについて', ko: '회사 소개', es: 'Sobre nosotros', it: 'Chi siamo', vi: 'Về chúng tôi', fr: 'À propos de nous' })}
                </div>
                <a
                  href="https://corporate.sainsburys.co.uk/contact-us/"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-nav-link"
                >
                  {tr(lang, { zh: '关于我们', en: 'About us', de: 'Über uns', ja: '私たちについて', ko: '회사 소개', es: 'Sobre nosotros', it: 'Chi siamo', vi: 'Về chúng tôi', fr: 'À propos de nous' })}
                </a>
                <a
                  href="https://sainsburys.jobs/"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-nav-link"
                >
                  {tr(lang, { zh: '招贤纳士', en: 'Careers', de: 'Karrieren', ja: 'キャリア', ko: '채용', es: 'Carreras', it: 'Carriere', vi: 'Nghề nghiệp', fr: 'Carrières' })}
                </a>
              </div>
            </div>
          </div>

          <div className="footer-middle">
            <div className="footer-payments">
              <div className="footer-payments-title">
                {tr(lang, { zh: '支付方式', en: 'Payment methods', de: 'Zahlungsmethoden', ja: '支払い方法', ko: '결제 방법', es: 'Métodos de pago', it: 'Metodi di pagamento', vi: 'Phương thức thanh toán', fr: 'Modes de paiement' })}
              </div>
              <div
                className="footer-payments-logos"
                aria-label={tr(lang, { zh: '支付方式列表', en: 'Payment methods list', de: 'Liste der Zahlungsmethoden', ja: 'お支払い方法一覧', ko: '결제 방법 목록', es: 'Lista de métodos de pago', it: 'Elenco metodi di pagamento', vi: 'Danh sách phương thức thanh toán', fr: 'Liste des modes de paiement' })}
              >
                <a
                  href="https://www.binance.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="Binance"
                >
                  <img src={payBinance} alt="Binance" className="footer-payment-logo" />
                  <span className="footer-payment-name">Binance</span>
                </a>
                <a
                  href="https://www.huobi.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="Huobi"
                >
                  <img src={payHuobi} alt="Huobi" className="footer-payment-logo" />
                  <span className="footer-payment-name">Huobi</span>
                </a>
                <a
                  href="https://www.okx.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="OKX"
                >
                  <img src={payOkx} alt="OKX" className="footer-payment-logo" />
                  <span className="footer-payment-name">OKX</span>
                </a>
                <a
                  href="https://www.kraken.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="KraKen"
                >
                  <img src={payKraken} alt="KraKen" className="footer-payment-logo" />
                  <span className="footer-payment-name">KraKen</span>
                </a>
                <a
                  href="https://www.coinbase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="Coinbase"
                >
                  <img src={payCoinbase} alt="Coinbase" className="footer-payment-logo" />
                  <span className="footer-payment-name">Coinbase</span>
                </a>
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="MetaMask"
                >
                  <img src={payMetamask} alt="MetaMask" className="footer-payment-logo" />
                  <span className="footer-payment-name">MetaMask</span>
                </a>
                <a
                  href="https://www.kucoin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="KuCoin"
                >
                  <img src={payKucoin} alt="KuCoin" className="footer-payment-logo" />
                  <span className="footer-payment-name">KuCoin</span>
                </a>
                <a
                  href="https://www.bitfinex.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-payment-badge"
                  aria-label="Bitfinex"
                >
                  <img src={payBitfinex} alt="Bitfinex" className="footer-payment-logo" />
                  <span className="footer-payment-name">Bitfinex</span>
                </a>
              </div>
            </div>
            <div className="footer-about">
              <div className="footer-about-title">TikTok</div>
              <p className="footer-about-text">
                {tr(lang, { zh: 'TikTok Mall 是全球短视频购物体验平台，与多家优质供应商合作，面向全球的电子商务平台。我们致力于为用户提供丰富多样的商品选择、安全便捷的支付体验以及贴心的售后服务。', en: 'TikTok Mall is a global short-video shopping platform, working with high‑quality suppliers to serve customers worldwide. We focus on rich product selection, secure and easy payments, and reliable after‑sales service.', de: 'TikTok Mall ist eine globale Kurzvideo-Shopping-Plattform, die mit hochwertigen Lieferanten zusammenarbeitet, um Kunden weltweit zu bedienen. Wir konzentrieren uns auf eine reichhaltige Produktauswahl, sichere und einfache Zahlungen und einen zuverlässigen Kundendienst.', ja: 'TikTok Mall は、世界的なショートビデオ ショッピング プラットフォームであり、高品質のサプライヤーと協力して世界中の顧客にサービスを提供しています。豊富な品揃え、安心・簡単な決済、安心のアフターサービスを重視しております。', ko: 'TikTok Mall은 고품질 공급업체와 협력하여 전 세계 고객에게 서비스를 제공하는 글로벌 단편 비디오 쇼핑 플랫폼입니다. 우리는 풍부한 제품 선택, 안전하고 쉬운 결제, 신뢰할 수 있는 애프터 서비스에 중점을 두고 있습니다.', es: 'TikTok Mall es una plataforma global de compra de videos cortos que trabaja con proveedores de alta calidad para atender a clientes de todo el mundo. Nos centramos en una amplia selección de productos, pagos seguros y sencillos y un servicio posventa confiable.', it: 'TikTok Mall è una piattaforma globale per lo shopping di brevi video, che collabora con fornitori di alta qualità per servire clienti in tutto il mondo. Ci concentriamo su una ricca selezione di prodotti, pagamenti facili e sicuri e un servizio post-vendita affidabile.', vi: 'TikTok Mall là nền tảng mua sắm video ngắn toàn cầu, hợp tác với các nhà cung cấp chất lượng cao để phục vụ khách hàng trên toàn thế giới. Chúng tôi tập trung vào việc lựa chọn sản phẩm phong phú, thanh toán an toàn và dễ dàng cũng như dịch vụ hậu mãi đáng tin cậy.', fr: 'TikTok Mall est une plateforme mondiale d\'achat de courtes vidéos qui travaille avec des fournisseurs de haute qualité pour servir ses clients du monde entier. Nous nous concentrons sur une sélection de produits riche, des paiements sécurisés et faciles et un service après-vente fiable.' })}
              </p>
              <p className="footer-about-text">
                {tr(lang, { zh: '平台覆盖东南亚、欧洲等地区，服务超过 10,000 家商家与用户，并持续拓展中。', en: 'Our platform covers Southeast Asia, Europe and more, already serving over 10,000 merchants and users, and continues to expand.', de: 'Unsere Plattform deckt Südostasien, Europa und weitere Länder ab, bedient bereits über 10.000 Händler und Nutzer und wächst weiter.', ja: '当社のプラットフォームは東南アジア、ヨーロッパなどをカバーしており、すでに 10,000 を超える加盟店やユーザーにサービスを提供しており、拡大し続けています。', ko: '우리 플랫폼은 동남아시아, 유럽 등을 포괄하며 이미 10,000명 이상의 판매자와 사용자에게 서비스를 제공하고 있으며 계속 확장하고 있습니다.', es: 'Nuestra plataforma cubre el Sudeste Asiático, Europa y más, ya atiende a más de 10,000 comerciantes y usuarios, y continúa expandiéndose.', it: 'La nostra piattaforma copre il Sud-Est asiatico, l\'Europa e altro ancora, serve già oltre 10.000 commercianti e utenti e continua ad espandersi.', vi: 'Nền tảng của chúng tôi bao gồm Đông Nam Á, Châu Âu và hơn thế nữa, đã phục vụ hơn 10.000 người bán và người dùng và tiếp tục mở rộng.', fr: 'Notre plateforme couvre l\'Asie du Sud-Est, l\'Europe et plus encore, servant déjà plus de 10 000 commerçants et utilisateurs, et continue de se développer.' })}
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-main">
              {tr(lang, { zh: 'TikTok Mall © 2024 版权所有', en: 'TikTok Mall © 2024 All rights reserved', de: 'TikTok Mall © 2024 Alle Rechte vorbehalten', ja: 'TikTok モール © 2024 無断複写・転載を禁じます', ko: 'TikTok 몰 © 2024 판권 소유', es: 'Centro comercial TikTok © 2024 Todos los derechos reservados', it: 'TikTok Mall © 2024 Tutti i diritti riservati', vi: 'Trung tâm mua sắm TikTok © 2024 Mọi quyền được bảo lưu', fr: 'TikTok Mall © 2024 Tous droits réservés' })}
            </div>
            <div className="footer-bottom-sub">
              Gotushop is headquartered in Ottawa, 151 O&apos;Connor Street, Ground Floor, Canada, and has 6
              office locations.
            </div>
          </div>

          <button
            type="button"
            className="footer-backtop"
            aria-label={tr(lang, { zh: '返回顶部', en: 'Back to top', de: 'Zurück nach oben', ja: 'トップに戻る', ko: '맨 위로 돌아가기', es: 'Volver arriba', it: 'Torna all\'inizio', vi: 'Quay lại đầu trang', fr: 'Retour en haut' })}
            onClick={handleBackToTop}
          >
            ↑
          </button>
        </div>
      </footer>

      {isAuthed && (
        <>
          <FloatingCart onClick={() => setCartOpen(true)} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
      )}

      {subscribeSuccessOpen && (
        <div
          className="subscribe-success-overlay"
          role="dialog"
          aria-label={tr(lang, { zh: '订阅成功', en: 'Subscribed successfully', de: 'Erfolgreich abonniert', ja: '正常に購読されました', ko: '성공적으로 구독되었습니다', es: 'Suscrito exitosamente', it: 'Iscrizione avvenuta con successo', vi: 'Đăng ký thành công', fr: 'Abonné avec succès' })}
          onClick={() => setSubscribeSuccessOpen(false)}
        >
          <div className="subscribe-success-box" onClick={(e) => e.stopPropagation()}>
            <div className="subscribe-success-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </div>
            <p className="subscribe-success-text">
              {tr(lang, { zh: '订阅成功！我们将尽快与您取得联系', en: 'Subscription successful! We will contact you as soon as possible.', de: 'Abonnement erfolgreich! Wir werden uns so schnell wie möglich mit Ihnen in Verbindung setzen.', ja: '購読が成功しました!できるだけ早くご連絡させていただきます。', ko: '구독이 성공했습니다! 최대한 빨리 연락드리겠습니다.', es: '¡Suscripción exitosa! Nos pondremos en contacto con usted lo antes posible.', it: 'Iscrizione riuscita! Ti contatteremo il prima possibile.', vi: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.', fr: 'Inscription réussie ! Nous vous contacterons dans les plus brefs délais.' })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout

