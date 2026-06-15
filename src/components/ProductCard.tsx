import type React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductFavorites } from '../context/ProductFavoritesContext'
import { useToast } from '../components/ToastProvider'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


export interface ProductCardProps {
  id: number | string
  image: string
  price: string
  title: string
  subtitle: string
  discount?: string
  /** 店铺 ID，从 API 列表传入便于下单按店拆单 */
  shopId?: string
  /** 商品仓库中的商品 ID（products.product_id），用于订单明细展示 */
  productId?: string | number
}

/** 价格展示：若无金额符号则前缀 ¥ */
function formatPriceDisplay(price: string): string {
  const s = String(price).trim()
  if (/^[¥$€]/.test(s)) return s
  return `¥${s}`
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  price,
  title,
  subtitle,
  discount,
  shopId,
  productId,
}) => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { isProductFavorited, toggleProductFavorite } = useProductFavorites()
  const { showToast } = useToast()
  const favorited = isProductFavorited(id)

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    const uid = raw ? (() => { try { return (JSON.parse(raw) as { id?: string }).id } catch { return undefined } })() : undefined
    if (!uid) {
      showToast(
        tr(lang, { zh: '请先登录后再收藏', en: 'Please log in before adding to favorites', de: 'Bitte melden Sie sich an, bevor Sie den Favoriten hinzufügen', ja: 'お気に入りに追加する前にログインしてください', ko: '즐겨찾기에 추가하기 전에 로그인하세요', es: 'Por favor inicia sesión antes de agregar a favoritos', it: 'Effettua il login prima di aggiungere ai preferiti', vi: 'Vui lòng đăng nhập trước khi thêm vào mục yêu thích', fr: 'Veuillez vous connecter avant d\'ajouter aux favoris' }),
        'error',
      )
      return
    }
    toggleProductFavorite({ id, image, price, title, subtitle, discount, shopId })
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    const uid = raw ? (() => { try { return (JSON.parse(raw) as { id?: string }).id } catch { return undefined } })() : undefined
    if (!uid) {
      showToast(
        tr(lang, { zh: '请先登录后再购买', en: 'Please log in before purchasing', de: 'Bitte melden Sie sich vor dem Kauf an', ja: '購入する前にログインしてください', ko: '구매 전 로그인해주세요', es: 'Por favor inicia sesión antes de comprar', it: 'Effettua il login prima dell\'acquisto', vi: 'Vui lòng đăng nhập trước khi mua', fr: 'Veuillez vous connecter avant d\'acheter' }),
        'error',
      )
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0
    const directItem = {
      id: String(id),
      shopId,
      productId: productId != null ? String(productId) : undefined,
      title,
      price: priceNum,
      quantity: 1,
      image,
      spec: undefined,
    }
    navigate('/checkout', { state: { directItems: [directItem] } })
  }

  return (
    <div className="mall-product-card new-arrival-card">
      {discount && (
        <div className="product-discount-badge">{discount}</div>
      )}
      <div className="new-arrival-image-wrap">
        <img src={image} alt={title} className="new-arrival-image" />
      </div>
      <div className="new-arrival-body">
        <div className="new-arrival-price">{formatPriceDisplay(price)}</div>
        <div className="new-arrival-title" title={title}>
          {title}
        </div>
        <div className="new-arrival-subtitle" title={subtitle}>
          {subtitle}
        </div>
      </div>
      <div className="new-arrival-footer">
        <button type="button" className="new-arrival-buy" onClick={handleBuyClick}>
          <span className="new-arrival-cart-icon">🛒</span>
          <span>{tr(lang, { zh: '立即购买', en: 'Buy now', de: 'Jetzt kaufen', ja: '今すぐ購入', ko: '지금 구매', es: 'Comprar ahora', it: 'Acquista ora', vi: 'Mua ngay', fr: 'Acheter maintenant' })}</span>
        </button>
        <button
          type="button"
          className={`new-arrival-fav${favorited ? ' new-arrival-fav--active' : ''}`}
          aria-label={
            favorited
              ? tr(lang, { zh: '取消收藏', en: 'Remove from favorites', de: 'Aus Favoriten entfernen', ja: 'お気に入りから削除', ko: '즐겨찾기에서 제거', es: 'Quitar de favoritos', it: 'Rimuovi dai preferiti', vi: 'Xóa khỏi mục yêu thích', fr: 'Supprimer des favoris' })
              : tr(lang, { zh: '收藏', en: 'Add to favorites', de: 'Zu Favoriten hinzufügen', ja: 'お気に入りに追加', ko: '즐겨찾기에 추가', es: 'Añadir a favoritos', it: 'Aggiungi ai preferiti', vi: 'Thêm vào mục yêu thích', fr: 'Ajouter aux favoris' })
          }
          onClick={handleFavClick}
        >
          {favorited ? '★' : '☆'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard

