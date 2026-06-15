import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import productImage from '../assets/new-arrival-bag.png'
import reviewsEmpty from '../assets/reviews-empty.png'
import { useCart } from '../cart/CartContext.tsx'
import AddToCartSuccessModal from '../components/AddToCartSuccessModal'
import { useToast } from '../components/ToastProvider'
import { api } from '../api/client'
import { getCategoryNameZh } from '../constants/categoryNameZh'
import { formatSkuAttrsDisplay, getAttrOptionsFromSkus, findSkuByAttrs, getSkuAttrEntries } from '../constants/skuAttrDisplay'
import SkuAttrSelect from '../components/SkuAttrSelect'
import { useLang } from '../context/LangContext'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import { tr } from '../i18n'
import { translateSubcategoryName } from './Categories'


interface ListingSku {
  sku_id: string
  product_id: string
  attrs: Record<string, string> | string | null
  purchase_price: number | null
  selling_price: number | null
  cover_img: string | null
  images: string[] | null
}

interface ShopInfo {
  id: string
  name: string
  logo: string | null
  creditScore: number
  followers: number
  goodRate?: number
  productCount?: number
}

interface ShopRecommendedProduct {
  listingId: string
  productId: string
  title: string
  image: string
  price: number
}

interface ListingDetail {
  id: string
  listingId: string
  shopId: string
  productId: string
  title: string
  image: string
  images: string[]
  price: number
  purchasePrice?: number
  category: string
  subCategory: string
  descriptionHtml?: string
  detailHtml?: string
  listedAt?: string
  skus: ListingSku[]
}

function toPrice(v: unknown): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const ProductDetail: React.FC = () => {
  const { lang } = useLang()
  const { id } = useParams<{ id: string }>()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [qtyInputValue, setQtyInputValue] = useState('1')
  const [isGalleryPaused, setIsGalleryPaused] = useState(false)
  const [addSuccessOpen, setAddSuccessOpen] = useState(false)
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<ListingSku | null>(null)
  /** 规格选择：属性标签 -> 原始值，用于下拉框 */
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null)
  const [shopRecommendations, setShopRecommendations] = useState<ShopRecommendedProduct[]>([])
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const thumbsWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError(tr(lang, { zh: '缺少商品 ID', en: 'Missing product ID', de: 'Fehlende Produkt-ID', ja: '製品IDがありません', ko: '제품 ID가 누락되었습니다.', es: 'Falta ID de producto', it: 'ID prodotto mancante', vi: 'Thiếu ID sản phẩm', fr: 'ID de produit manquant' }))
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setShopInfo(null)
    setShopRecommendations([])
    api
      .get<ListingDetail>(`/api/listings/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return
        const mainImages = Array.isArray((res as { images?: string[] }).images)
          ? (res as { images: string[] }).images.filter((s): s is string => typeof s === 'string')
          : (res as { image?: string }).image
            ? [(res as { image: string }).image]
            : []
        const skus = Array.isArray((res as { skus?: unknown[] }).skus) ? (res as { skus: ListingSku[] }).skus : []
        setListing({
          ...res,
          images: mainImages.length > 0 ? mainImages : (res as { image?: string }).image ? [(res as { image: string }).image] : [],
          skus,
        })
        if (skus.length === 1 && getSkuAttrEntries(skus[0].attrs).length === 0) {
          const single = skus[0] as ListingSku & { skuId?: string }
          setSelectedSku({ ...single, sku_id: single.sku_id ?? single.skuId ?? '' })
        } else {
          setSelectedSku(null)
        }
        setSelectedAttrs({})
        const sid = (res as { shopId?: string }).shopId
        if (sid) {
          api
            .get<ShopInfo & { productCount?: number }>(`/api/shops/${encodeURIComponent(sid)}`)
            .then((s) => {
              if (!cancelled)
                setShopInfo({
                  id: s.id,
                  name: s.name,
                  logo: s.logo ?? null,
                  creditScore: Number(s.creditScore) || 0,
                  followers: Number(s.followers) || 0,
                  goodRate: s.goodRate != null ? Number(s.goodRate) : undefined,
                  productCount: s.productCount,
                })
            })
            .catch(() => {
              if (!cancelled) setShopInfo(null)
            })
          api
            .get<{ list?: ShopRecommendedProduct[] }>(
              `/api/shops/${encodeURIComponent(sid)}/recommendations`,
            )
            .then((r) => {
              if (cancelled) return
              const list = Array.isArray(r.list) ? r.list : []
              setShopRecommendations(list)
            })
            .catch(() => {
              if (!cancelled) setShopRecommendations([])
            })
        } else {
          setShopInfo(null)
          setShopRecommendations([])
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败')
          setListing(null)
          setShopInfo(null)
          setShopRecommendations([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const images = (() => {
    if (selectedSku) {
      const cover = selectedSku.cover_img ?? (selectedSku as { coverImg?: string }).coverImg
      const skuImages = selectedSku.images ?? (selectedSku as { images?: string[] }).images
      const arr = Array.isArray(skuImages) ? skuImages.filter((s): s is string => typeof s === 'string') : []
      const combined = cover && typeof cover === 'string' ? [cover, ...arr.filter((u) => u !== cover)] : arr
      const seen = new Set<string>()
      return combined.filter((u) => {
        if (seen.has(u)) return false
        seen.add(u)
        return true
      })
    }
    if (listing?.images?.length) return listing.images
    if (listing?.image) return [listing.image]
    return [productImage]
  })()
  useEffect(() => {
    setActiveImage(0)
  }, [selectedSku?.sku_id])

  const unitPrice = (() => {
    // 始终以当前上架记录的店铺售价为准，规格切换不改变店铺定价
    return toPrice(listing?.price)
  })()

  useEffect(() => {
    if (isGalleryPaused || images.length <= 1) return
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length, isGalleryPaused])

  useEffect(() => {
    const wrap = thumbsWrapRef.current
    const el = thumbRefs.current[activeImage]
    if (!wrap || !el) return
    const wrapRect = wrap.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const scrollLeft = wrap.scrollLeft + (elRect.left - wrapRect.left) - wrapRect.width / 2 + elRect.width / 2
    wrap.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
  }, [activeImage])

  const handleQuantityChange = (type: 'dec' | 'inc') => {
    setQuantity((q) => {
      const next = type === 'dec' ? Math.max(1, q - 1) : q + 1
      setQtyInputValue(String(next))
      return next
    })
  }

  const handleQtyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '')
    setQtyInputValue(v)
    const n = v === '' ? 1 : Math.max(1, parseInt(v, 10) || 1)
    setQuantity(n)
  }

  const handleQtyInputBlur = () => {
    setQtyInputValue(String(quantity))
  }

  const handleAddToCart = (goCheckout: boolean) => {
    if (!listing) return
    const needsSpec = attrSelectors.length > 0 && !selectedSku
    if (needsSpec) {
      showToast(
        tr(lang, { zh: '请先选择规格', en: 'Please select a variant first', de: 'Bitte wählen Sie zunächst eine Variante aus', ja: '最初にバリエーションを選択してください', ko: '먼저 변형을 선택하세요.', es: 'Por favor seleccione una variante primero', it: 'Seleziona prima una variante', vi: 'Vui lòng chọn một biến thể trước', fr: 'Veuillez d\'abord sélectionner une variante' }),
        'error',
      )
      return
    }
    if (goCheckout) {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
        const uid = raw ? (JSON.parse(raw) as { id?: string })?.id : null
        if (!uid) {
          showToast(
            tr(lang, { zh: '请先登录后再购买', en: 'Please log in before purchasing', de: 'Bitte melden Sie sich vor dem Kauf an', ja: '購入する前にログインしてください', ko: '구매 전 로그인해주세요', es: 'Por favor inicia sesión antes de comprar', it: 'Effettua il login prima dell\'acquisto', vi: 'Vui lòng đăng nhập trước khi mua', fr: 'Veuillez vous connecter avant d\'acheter' }),
            'error',
          )
          navigate('/login', { state: { from: '/checkout' } })
          return
        }
      } catch {
        showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
        navigate('/login', { state: { from: '/checkout' } })
        return
      }
    }
    const spec = selectedSku ? formatSkuAttrsDisplay(selectedSku.attrs) : ''
    const cartId = selectedSku ? `${listing.listingId ?? listing.id}-${selectedSku.sku_id}` : (listing.listingId ?? listing.id)
    const item = {
      id: cartId,
      shopId: listing.shopId,
      productId: listing.productId,
      title: listing.title,
      price: unitPrice,
      quantity,
      image: listing.image || images[0],
      spec: spec || undefined,
    }
    if (goCheckout) {
      navigate('/checkout', { state: { directItems: [item] } })
    } else {
      addItem(item)
      setAddSuccessOpen(true)
    }
  }

  const description = (listing?.descriptionHtml || listing?.detailHtml || '').trim()

  const attrSelectors = listing?.skus?.length
    ? getAttrOptionsFromSkus(listing.skus as Parameters<typeof getAttrOptionsFromSkus>[0])
    : []

  const handleAttrChange = (label: string, rawValue: string) => {
    const next = { ...selectedAttrs, [label]: rawValue }
    setSelectedAttrs(next)
    const found = findSkuByAttrs(
      listing!.skus as unknown as Array<{ attrs: unknown; sku_id: string; [k: string]: unknown }>,
      next
    )
    setSelectedSku((found ?? null) as ListingSku | null)
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/products')
    }
  }

  if (loading) {
    return (
      <div className="page product-detail-page">
        <button
          type="button"
          className="product-detail-mobile-back"
          onClick={handleBack}
          aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
        >
          <span className="product-detail-mobile-back-icon" aria-hidden>←</span>
          <span className="product-detail-mobile-back-text">
            {tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
          </span>
        </button>
        <div className="product-detail-main" style={{ padding: '2rem', textAlign: 'center' }}>
          {tr(lang, { zh: '加载中…', en: 'Loading…', de: 'Laden…', ja: '読み込み中…', ko: '로드 중…', es: 'Cargando…', it: 'Caricamento…', vi: 'Đang tải…', fr: 'Chargement…' })}
        </div>
      </div>
    )
  }

  const displayedRecommendations = shopRecommendations.slice(0, 5)

  if (error || !listing) {
    return (
      <div className="page product-detail-page">
        <button
          type="button"
          className="product-detail-mobile-back"
          onClick={handleBack}
          aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
        >
          <span className="product-detail-mobile-back-icon" aria-hidden>←</span>
          <span className="product-detail-mobile-back-text">
            {tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
          </span>
        </button>
        <div className="product-detail-main" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>
            {error ||
              (tr(lang, { zh: '商品不存在或已下架', en: 'Product does not exist or has been removed', de: 'Das Produkt existiert nicht oder wurde entfernt', ja: '製品が存在しないか、削除されました', ko: '제품이 존재하지 않거나 제거되었습니다.', es: 'El producto no existe o ha sido eliminado', it: 'Il prodotto non esiste o è stato rimosso', vi: 'Sản phẩm không tồn tại hoặc đã bị xóa', fr: 'Le produit n\'existe pas ou a été supprimé' }))}
          </p>
          <Link to="/products" className="product-detail-back-link">
            {tr(lang, { zh: '< 返回商品列表', en: '< Back to product list', de: '< Zurück zur Produktliste', ja: '< 製品一覧に戻る', ko: '< 상품목록으로 돌아가기', es: '< Volver a la lista de productos', it: '< Torna all\'elenco dei prodotti', vi: '< Quay lại danh sách sản phẩm', fr: '< Retour à la liste des produits' })}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page product-detail-page">
      <AddToCartSuccessModal open={addSuccessOpen} onClose={() => setAddSuccessOpen(false)} />
      <button
        type="button"
        className="product-detail-mobile-back"
        onClick={handleBack}
        aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
      >
        <span className="product-detail-mobile-back-icon" aria-hidden>←</span>
        <span className="product-detail-mobile-back-text">
          {tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
        </span>
      </button>
      <div className="product-detail-main">
        <div
          className="product-detail-gallery"
          onMouseEnter={() => setIsGalleryPaused(true)}
          onMouseLeave={() => setIsGalleryPaused(false)}
        >
          <div className="product-detail-image-main">
            <img src={images[activeImage] || productImage} alt={listing.title} />
          </div>
          {images.length > 1 && (
            <div className="product-detail-thumbs-wrap" ref={thumbsWrapRef}>
              <div className="product-detail-thumbs">
                {images.map((img, index) => (
                  <button
                    key={index}
                    ref={(el) => { thumbRefs.current[index] = el }}
                    type="button"
                    className={`product-detail-thumb${activeImage === index ? ' product-detail-thumb--active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${listing.title} 图 ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{listing.title}</h1>
          <div className="product-detail-subtitle">
            {lang === 'zh' || lang === 'tw'
              ? getCategoryNameZh(listing.subCategory) ||
                getCategoryNameZh(listing.category) ||
                listing.subCategory ||
                listing.category
              : (() => {
                  const first = listing.subCategory || listing.category
                  if (!first) return ''
                  const hasChinese = /[\u4e00-\u9fa5]/.test(first)
                  return hasChinese ? translateSubcategoryName(lang, first) : first
                })()}
          </div>

          <div className="product-detail-field-list">
            <div className="product-detail-field">
              <span className="product-detail-field-label">
                {tr(lang, { zh: '零售价', en: 'Retail price', de: 'Verkaufspreis', ja: '小売価格', ko: '소매가', es: 'Precio al por menor', it: 'Prezzo al dettaglio', vi: 'Giá bán lẻ', fr: 'Prix ​​en détail' })}
              </span>
              <span className="product-detail-price-value">${unitPrice.toFixed(2)}</span>
            </div>
            <div className="product-detail-field">
              <span className="product-detail-field-label">
                {tr(lang, { zh: '发货', en: 'Shipping time', de: 'Lieferzeit', ja: '配送時間', ko: '배송 시간', es: 'Tiempo de envío', it: 'Tempo di spedizione', vi: 'thời gian vận chuyển', fr: 'Délai d\'expédition' })}
              </span>
              <span className="product-detail-field-value">
                {tr(lang, { zh: '商品下单后，24 小时内发货。如下单存在物流管控，订单可能被延时发货，请留意订单物流信息或联系客服', en: 'Orders are shipped within 24 hours after payment. If there are logistics controls, delivery may be delayed — please follow the tracking info or contact support.', de: 'Bestellungen werden innerhalb von 24 Stunden nach Zahlungseingang versendet. Bei Logistikkontrollen kann sich die Lieferung verzögern. Bitte befolgen Sie die Informationen zur Sendungsverfolgung oder wenden Sie sich an den Support.', ja: '注文は支払い後24時間以内に発送されます。物流管理がある場合、配送が遅れる可能性があります。追跡情報に従うか、サポートにお問い合わせください。', ko: '주문은 결제 후 24시간 이내에 배송됩니다. 물류 통제가 있는 경우 배송이 지연될 수 있습니다. 추적 정보를 따르거나 지원팀에 문의하세요.', es: 'Los pedidos se envían dentro de las 24 horas posteriores al pago. Si hay controles logísticos, la entrega puede retrasarse; siga la información de seguimiento o comuníquese con el soporte.', it: 'Gli ordini vengono spediti entro 24 ore dal pagamento. Se sono presenti controlli logistici, la consegna potrebbe subire ritardi: segui le informazioni di tracciamento o contatta l\'assistenza.', vi: 'Đơn đặt hàng được vận chuyển trong vòng 24 giờ sau khi thanh toán. Nếu có biện pháp kiểm soát hậu cần, việc giao hàng có thể bị trì hoãn - vui lòng làm theo thông tin theo dõi hoặc liên hệ với bộ phận hỗ trợ.', fr: 'Les commandes sont expédiées dans les 24 heures après le paiement. S\'il y a des contrôles logistiques, la livraison peut être retardée — veuillez suivre les informations de suivi ou contacter l\'assistance.' })}
              </span>
            </div>
            <div className="product-detail-field">
              <span className="product-detail-field-label">
                {tr(lang, { zh: '运费', en: 'Shipping fee', de: 'Versandkosten', ja: '送料', ko: '배송비', es: 'Tarifa de envío', it: 'Spese di spedizione', vi: 'Phí vận chuyển', fr: 'Frais d\'expédition' })}
              </span>
              <span className="product-detail-field-value product-detail-freight">
                {tr(lang, { zh: '免运费', en: 'Free shipping', de: 'Kostenloser Versand', ja: '送料無料', ko: '무료 배송', es: 'Envío gratis', it: 'Spedizione gratuita', vi: 'miễn phí vận chuyển', fr: 'Livraison gratuite' })}
                <span className="product-detail-info-icon-wrapper">
                  <span className="product-detail-info-icon" aria-hidden="true">i</span>
                  <div className="product-detail-info-tooltip">
                    {lang === 'zh' || lang === 'tw' ? (
                      <>
                        1、跨境商品运费构成：运费=派送费+长途运费+送货费<br />
                        2、如不满足包邮条件，按实际收取运费产品<br />
                        3、最终解释权归平台所有
                      </>
                    ) : (
                      <>
                        1. Cross‑border shipping fee = delivery fee + long‑distance fee + door‑to‑door
                        fee
                        <br />
                        2. If free‑shipping conditions are not met, shipping will be charged as shown on
                        the product page
                        <br />
                        3. The platform reserves the final right of interpretation
                      </>
                    )}
                  </div>
                </span>
              </span>
            </div>
            {attrSelectors.some((s) => s.label !== '颜色') && (
              attrSelectors
                .filter((s) => s.label !== '颜色')
                .map(({ label, options }) => (
                  <div key={label} className="product-detail-field">
                    <span className="product-detail-field-label">{label}</span>
                    <div className="product-detail-field-value">
                      <SkuAttrSelect
                        label=""
                        options={options}
                        value={selectedAttrs[label] ?? ''}
                        onChange={(raw) => handleAttrChange(label, raw)}
                      />
                    </div>
                  </div>
                ))
            )}
            {attrSelectors.some((s) => s.label === '颜色') && (
              <div className="product-detail-field product-detail-sku-color-field">
                <span className="product-detail-field-label" aria-hidden="true" />
                <div className="product-detail-sku-color-grid">
                  {attrSelectors
                    .filter((s) => s.label === '颜色')
                    .flatMap(({ label, options }) =>
                      options.map((opt) => {
                        const isSelected = selectedAttrs[label] === opt.raw
                          return (
                            <button
                              key={opt.raw}
                              type="button"
                              className={`product-detail-sku-color-swatch${isSelected ? ' product-detail-sku-color-swatch--active' : ''}`}
                              onClick={() => handleAttrChange(label, opt.raw)}
                              title={opt.display}
                              aria-label={opt.display}
                            >
                              {opt.image ? (
                                <img src={opt.image} alt={opt.display} />
                              ) : (
                                <span className="product-detail-sku-color-swatch-text">{opt.display}</span>
                              )}
                            </button>
                          )
                      }))
                  }
                </div>
              </div>
            )}
            <div className="product-detail-field">
              <span className="product-detail-field-label">
                {tr(lang, { zh: '数量', en: 'Quantity', de: 'Menge', ja: '量', ko: '수량', es: 'Cantidad', it: 'Quantità', vi: 'Số lượng', fr: 'Quantité' })}
              </span>
              <div className="product-detail-field-value">
                <div className="product-detail-qty-control">
                  <button type="button" className="product-detail-qty-btn" onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1}>-</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="product-detail-qty-value"
                    style={{ border: 'none', background: 'transparent', outline: 'none', padding: 0 }}
                    value={qtyInputValue}
                    onChange={handleQtyInputChange}
                    onBlur={handleQtyInputBlur}
                    min={1}
                    aria-label={tr(lang, { zh: '数量', en: 'Quantity', de: 'Menge', ja: '量', ko: '수량', es: 'Cantidad', it: 'Quantità', vi: 'Số lượng', fr: 'Quantité' })}
                  />
                  <button type="button" className="product-detail-qty-btn" onClick={() => handleQuantityChange('inc')}>+</button>
                </div>
              </div>
            </div>
            <div className="product-detail-field">
              <span className="product-detail-field-label">
                {tr(lang, { zh: '总价', en: 'Total', de: 'Gesamt', ja: '合計', ko: '총', es: 'Total', it: 'Totale', vi: 'Tổng cộng', fr: 'Total' })}
              </span>
              <span className="product-detail-field-value product-detail-total">
                ${(unitPrice * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="product-detail-buttons">
            <button
              type="button"
              className="product-detail-btn product-detail-btn-primary"
              onClick={() => handleAddToCart(true)}
            >
              {tr(lang, { zh: '立即购买', en: 'Buy now', de: 'Jetzt kaufen', ja: '今すぐ購入', ko: '지금 구매', es: 'Comprar ahora', it: 'Acquista ora', vi: 'Mua ngay', fr: 'Acheter maintenant' })}
            </button>
            <button
              type="button"
              className="product-detail-btn product-detail-btn-secondary"
              onClick={() => handleAddToCart(false)}
            >
              {tr(lang, { zh: '添加购物车', en: 'Add to cart', de: 'In den Warenkorb legen', ja: 'カートに追加', ko: '장바구니에 추가', es: 'Añadir a la cesta', it: 'Aggiungi al carrello', vi: 'Thêm vào giỏ hàng', fr: 'Ajouter au panier' })}
            </button>
          </div>
        </div>
      </div>

      {description && (
        <section className="product-detail-desc">
          <h2 className="product-detail-desc-title">
            {tr(lang, { zh: '商品描述', en: 'Product description', de: 'Produktbeschreibung', ja: '製品説明', ko: '상품 설명', es: 'Descripción del Producto', it: 'Descrizione del prodotto', vi: 'Mô tả sản phẩm', fr: 'Description du produit' })}
          </h2>
          <div
            className="product-detail-desc-body"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </section>
      )}

      <section className="product-detail-reviews">
        <div className="product-detail-reviews-header">
          <h2 className="product-detail-reviews-title">
            {tr(lang, { zh: '用户评价 (0)', en: 'Reviews (0)', de: 'Bewertungen (0)', ja: 'レビュー (0)', ko: '리뷰 (0)', es: 'Reseñas (0)', it: 'Recensioni (0)', vi: 'Đánh giá (0)', fr: 'Avis (0)' })}
          </h2>
        </div>
        <div className="product-detail-reviews-body">
          <img
            src={reviewsEmpty}
            alt={tr(lang, { zh: '暂无评价', en: 'No reviews yet', de: 'Noch keine Bewertungen', ja: 'まだレビューはありません', ko: '아직 리뷰가 없습니다', es: 'Aún no hay reseñas', it: 'Nessuna recensione ancora', vi: 'Chưa có đánh giá nào', fr: 'Aucun avis pour l\'instant' })}
            className="product-detail-reviews-empty-icon"
          />
          <div className="product-detail-reviews-empty-text">
            {tr(lang, { zh: '暂无评价', en: 'No reviews yet', de: 'Noch keine Bewertungen', ja: 'まだレビューはありません', ko: '아직 리뷰가 없습니다', es: 'Aún no hay reseñas', it: 'Nessuna recensione ancora', vi: 'Chưa có đánh giá nào', fr: 'Aucun avis pour l\'instant' })}
          </div>
        </div>
      </section>

      <aside className="product-detail-shop-card">
        <div className="product-detail-shop-header">
          {shopInfo?.logo ? (
            <img src={shopInfo.logo} alt={shopInfo.name} className="product-detail-shop-logo-img" />
          ) : (
            <div className="product-detail-shop-logo">{shopInfo?.name?.slice(0, 1) ?? listing.shopId?.slice(0, 1) ?? '?'}</div>
          )}
          <div className="product-detail-shop-title">{shopInfo?.name ?? listing.shopId ?? '—'}</div>
          <div className="product-detail-shop-score">{shopInfo != null ? String(shopInfo.creditScore) : '—'}</div>
        </div>
        <div className="product-detail-shop-stats">
          <div className="product-detail-shop-stat">
            <div className="product-detail-shop-stat-value">{shopInfo?.productCount ?? '—'}</div>
            <div className="product-detail-shop-stat-label">
              {tr(lang, { zh: '全部商品', en: 'All products', de: 'Alle Produkte', ja: 'すべての製品', ko: '모든 제품', es: 'Todos los productos', it: 'Tutti i prodotti', vi: 'Tất cả sản phẩm', fr: 'Tous les produits' })}
            </div>
          </div>
          <div className="product-detail-shop-stat">
            <div className="product-detail-shop-stat-value">
              {shopInfo?.goodRate != null ? `${shopInfo.goodRate}%` : '—'}
            </div>
            <div className="product-detail-shop-stat-label">
              {tr(lang, { zh: '好评率', en: 'Good rate', de: 'Guter Preis', ja: '良いレート', ko: '좋은 요금', es: 'Buen precio', it: 'Buon prezzo', vi: 'Tỷ lệ tốt', fr: 'Bon tarif' })}
            </div>
          </div>
          <div className="product-detail-shop-stat">
            <div className="product-detail-shop-stat-value">{shopInfo != null ? String(shopInfo.followers) : '—'}</div>
            <div className="product-detail-shop-stat-label">
              {tr(lang, { zh: '关注度', en: 'Followers', de: 'Anhänger', ja: 'フォロワー', ko: '추종자', es: 'Seguidores', it: 'Seguaci', vi: 'Người theo dõi', fr: 'Abonnés' })}
            </div>
          </div>
        </div>
        <Link to={`/shops/${listing.shopId}`} className="product-detail-shop-btn">
          {tr(lang, { zh: '访问商店 >', en: 'Visit shop >', de: 'Besuchen Sie den Shop >', ja: 'ショップにアクセス >', ko: '매장 방문 >', es: 'Visitar tienda >', it: 'Visita il negozio >', vi: 'Ghé thăm cửa hàng >', fr: 'Visitez la boutique >' })}
        </Link>
        <div className="product-detail-shop-recommend">
          <h3 className="product-detail-shop-recommend-title">
            {tr(lang, { zh: '推荐产品', en: 'Recommended products', de: 'Empfohlene Produkte', ja: 'おすすめ商品', ko: '추천상품', es: 'Productos recomendados', it: 'Prodotti consigliati', vi: 'Sản phẩm được đề xuất', fr: 'Produits recommandés' })}
          </h3>
          <div className="product-detail-shop-recommend-list">
            {displayedRecommendations.length > 0 ? (
              displayedRecommendations.map((p) => (
                <Link
                  key={p.listingId}
                  to={`/products/${encodeURIComponent(p.listingId)}`}
                  className="product-detail-shop-recommend-item"
                >
                  <div className="product-detail-shop-recommend-thumb">
                    <img src={p.image || productImage} alt={p.title} />
                  </div>
                  <div className="product-detail-shop-recommend-info">
                    <div className="product-detail-shop-recommend-name">
                      {p.title || (tr(lang, { zh: '商品', en: 'Product', de: 'Produkt', ja: '製品', ko: '제품', es: 'Producto', it: 'Prodotto', vi: 'Sản phẩm', fr: 'Produit' }))}
                    </div>
                    <div className="product-detail-shop-recommend-price">
                      {p.price > 0 ? `$${p.price.toFixed(2)}` : '—'}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <Link to="/products" className="product-detail-shop-recommend-item">
                <div className="product-detail-shop-recommend-thumb">
                  <img src={productImage} alt="" />
                </div>
                <div className="product-detail-shop-recommend-info">
                  <div className="product-detail-shop-recommend-name">
                    {tr(lang, { zh: '更多商品请返回列表', en: 'For more products please go back to the list', de: 'Für weitere Produkte gehen Sie bitte zurück zur Liste', ja: 'その他の製品については、リストに戻ってください', ko: '더 많은 제품을 보려면 목록으로 돌아가세요.', es: 'Para más productos por favor regrese a la lista', it: 'Per ulteriori prodotti torna all\'elenco', vi: 'Để xem thêm sản phẩm vui lòng quay lại danh sách', fr: 'Pour plus de produits, veuillez revenir à la liste' })}
                  </div>
                  <div className="product-detail-shop-recommend-price">—</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </aside>

      <div className="product-detail-back">
        <Link to="/products" className="product-detail-back-link">
          {tr(lang, { zh: '< 返回商品列表', en: '< Back to product list', de: '< Zurück zur Produktliste', ja: '< 製品一覧に戻る', ko: '< 상품목록으로 돌아가기', es: '< Volver a la lista de productos', it: '< Torna all\'elenco dei prodotti', vi: '< Quay lại danh sách sản phẩm', fr: '< Retour à la liste des produits' })}
        </Link>
      </div>
    </div>
  )
}

export default ProductDetail
