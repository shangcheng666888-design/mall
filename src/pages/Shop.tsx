import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useToast } from '../components/ToastProvider'
import { api } from '../api/client'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

function getAuthUserId(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    if (!raw) return null
    return (JSON.parse(raw) as { id?: string })?.id ?? null
  } catch { return null }
}

interface ShopInfo {
  id: string
  name: string
  logo: string | null
  banner: string | null
  productCount?: number
}

interface ShopProduct {
  listingId: string
  productId: string
  title: string
  image: string
  price: number
}

const Shop: React.FC = () => {
  const { lang } = useLang()
  const { showToast } = useToast()
  const { id } = useParams<{ id: string }>()
  const shopId = id ?? ''
  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [recommendations, setRecommendations] = useState<ShopProduct[]>([])
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recommend' | 'all'>('recommend')
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    if (!shopId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<ShopInfo & { productCount?: number }>(`/api/shops/${shopId}`),
      api.get<{ list: ShopProduct[] }>(`/api/shops/${shopId}/recommendations`),
      api.get<{ list: ShopProduct[] }>(`/api/shops/${shopId}/products`),
    ])
      .then(([shopRes, recRes, prodRes]) => {
        if (cancelled) return
        const shopData = shopRes as ShopInfo
        const recData = recRes as { list?: ShopProduct[] }
        const prodData = prodRes as { list?: ShopProduct[] }
        setShop(shopData)
        setRecommendations(Array.isArray(recData.list) ? recData.list : [])
        setAllProducts(Array.isArray(prodData.list) ? prodData.list : [])
      })
      .catch(() => {
        if (!cancelled) {
          setShop(null)
          setRecommendations([])
          setAllProducts([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [shopId])

  // 进入店铺页时记录一次访问量（后端 shops.visits +1）
  useEffect(() => {
    if (!shopId) return
    api.post(`/api/shops/${encodeURIComponent(shopId)}/visit`).catch(() => {})
  }, [shopId])

  useEffect(() => {
    const uid = getAuthUserId()
    if (uid && shopId) {
      api.get<{ list: Array<{ shopId: string }> }>(`/api/users/${uid}/followed-shops`)
        .then((res) => {
          const list = Array.isArray(res.list) ? res.list : []
          setFollowed(list.some((s) => s.shopId === shopId))
        })
        .catch(() => setFollowed(false))
    } else {
      setFollowed(false)
    }
  }, [shopId])

  const handleFollowToggle = () => {
    const uid = getAuthUserId()
    if (uid) {
      if (followed) {
        api
          .delete(`/api/users/${uid}/followed-shops/${encodeURIComponent(shopId)}`)
          .then(() => setFollowed(false))
          .catch(() => {})
      } else {
        api
          .post(`/api/users/${uid}/followed-shops`, {
            shopId,
            shopName: shop?.name ?? tr(lang, {
              zh: `店铺 ${shopId}`,
              en: `Shop ${shopId}`,
              de: `Shop ${shopId}`,
              ja: `ショップ ${shopId}`,
              ko: `매장 ${shopId}`,
              es: `Tienda ${shopId}`,
              it: `Negozio ${shopId}`,
              vi: `Cửa hàng ${shopId}`,
              fr: `Boutique ${shopId}`,
            }),
          })
          .then(() => setFollowed(true))
          .catch(() => {})
      }
    } else {
      showToast(
        tr(lang, {
          zh: '请先登录后再关注店铺',
          en: 'Please log in before following a shop',
          de: 'Bitte melden Sie sich an, bevor Sie einem Shop folgen',
          ja: 'ショップをフォローする前にログインしてください',
          ko: '매장을 팔로우하려면 먼저 로그인하세요',
          es: 'Inicie sesión antes de seguir una tienda',
          it: 'Accedi prima di seguire un negozio',
          vi: 'Vui lòng đăng nhập trước khi theo dõi cửa hàng',
          fr: 'Veuillez vous connecter avant de suivre une boutique',
        }),
        'error',
      )
    }
  }

  const displayProducts = activeTab === 'recommend' ? recommendations : allProducts
  const bannerUrl = (shop?.banner && String(shop.banner).trim()) || null

  return (
    <div className="page shop-page">
      <div
        className="shop-hero-banner"
        style={
          bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="shop-hero-overlay">
          <div className="shop-hero-left">
            <div className="shop-hero-left-card">
              <div className="shop-hero-avatar" aria-hidden="true">
                {shop?.logo ? (
                  <img src={shop.logo} alt="" className="shop-hero-avatar-img" />
                ) : (
                  (shop?.name ?? tr(lang, { zh: '店', en: 'S', de: 'S', ja: '店', ko: '점', es: 'T', it: 'N', vi: 'C', fr: 'B' })).charAt(0)
                )}
              </div>
              <div className="shop-hero-meta">
                <div className="shop-hero-name">
                  {loading
                    ? tr(lang, { zh: '加载中...', en: 'Loading...', de: 'Laden...', ja: '読み込み中...', ko: '로딩 중...', es: 'Cargando...', it: 'Caricamento...', vi: 'Đang tải...', fr: 'Chargement...' })
                    : (shop?.name ?? tr(lang, {
                        zh: `店铺 ${shopId}`,
                        en: `Shop ${shopId}`,
                        de: `Shop ${shopId}`,
                        ja: `ショップ ${shopId}`,
                        ko: `매장 ${shopId}`,
                        es: `Tienda ${shopId}`,
                        it: `Negozio ${shopId}`,
                        vi: `Cửa hàng ${shopId}`,
                        fr: `Boutique ${shopId}`,
                      }))}
                </div>
                <div className="shop-hero-welcome">
                  {tr(lang, { zh: '欢迎光临！', en: 'Welcome!', de: 'Willkommen!', ja: 'ようこそ！', ko: '환영합니다!', es: '¡Bienvenido!', it: 'Benvenuto!', vi: 'Chào mừng!', fr: 'Bienvenue !' })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`shop-hero-follow-btn${followed ? ' shop-hero-follow-btn--active' : ''}`}
          onClick={handleFollowToggle}
        >
          {followed
            ? tr(lang, { zh: '★ 已关注', en: '★ Following', de: '★ Folge ich', ja: '★ フォロー中', ko: '★ 팔로잉', es: '★ Siguiendo', it: '★ Seguito', vi: '★ Đang theo dõi', fr: '★ Abonné' })
            : tr(lang, { zh: '☆ 关注店铺', en: '☆ Follow shop', de: '☆ Shop folgen', ja: '☆ ショップをフォロー', ko: '☆ 매장 팔로우', es: '☆ Seguir tienda', it: '☆ Segui negozio', vi: '☆ Theo dõi cửa hàng', fr: '☆ Suivre la boutique' })}
        </button>
      </div>

      <div className="shop-tabs">
        <button
          type="button"
          className={`shop-tab${activeTab === 'recommend' ? ' shop-tab--active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          {tr(lang, { zh: '推荐', en: 'Recommended', de: 'Empfohlen', ja: 'おすすめ', ko: '추천', es: 'Recomendado', it: 'Consigliati', vi: 'Đề xuất', fr: 'Recommandé' })}
        </button>
        <button
          type="button"
          className={`shop-tab${activeTab === 'all' ? ' shop-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          {tr(lang, { zh: '所有产品', en: 'All products', de: 'Alle Produkte', ja: 'すべての商品', ko: '모든 상품', es: 'Todos los productos', it: 'Tutti i prodotti', vi: 'Tất cả sản phẩm', fr: 'Tous les produits' })}
        </button>
      </div>

      <div className="mall-product-grid card-grid shop-products-grid">
        {loading ? (
          <p className="products-empty">
            {tr(lang, { zh: '加载中...', en: 'Loading...', de: 'Laden...', ja: '読み込み中...', ko: '로딩 중...', es: 'Cargando...', it: 'Caricamento...', vi: 'Đang tải...', fr: 'Chargement...' })}
          </p>
        ) : displayProducts.length === 0 ? (
          <p className="products-empty">
            {activeTab === 'recommend'
              ? tr(lang, { zh: '暂无推荐商品', en: 'No recommended products', de: 'Keine empfohlenen Produkte', ja: 'おすすめ商品はありません', ko: '추천 상품이 없습니다', es: 'No hay productos recomendados', it: 'Nessun prodotto consigliato', vi: 'Không có sản phẩm đề xuất', fr: 'Aucun produit recommandé' })
              : tr(lang, { zh: '暂无商品', en: 'No products yet', de: 'Noch keine Produkte', ja: '商品はまだありません', ko: '아직 상품이 없습니다', es: 'Aún no hay productos', it: 'Nessun prodotto ancora', vi: 'Chưa có sản phẩm', fr: 'Pas encore de produits' })}
          </p>
        ) : (
          displayProducts.map((item) => (
            <Link key={item.listingId} to={`/products/${item.listingId}`} className="product-card-link">
              <ProductCard
                id={item.listingId}
                image={item.image || ''}
                price={`$${item.price.toFixed(2)}`}
                title={item.title}
                subtitle=""
                shopId={shopId}
                productId={item.productId}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default Shop
