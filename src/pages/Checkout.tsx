import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import type { CartItem } from '../cart/CartContext'
import { useToast } from '../components/ToastProvider'
import AddressModal from '../components/AddressModal'
import type { AddressItem } from '../utils/addressList'
import {
  updateOrderStatus,
  getOrderById,
  type OrderAddressSnapshot,
} from '../utils/orderList'
import { api } from '../api/client'
import { COUNTRY_OPTIONS } from '../constants/countries'
import { getRegions, getCities } from '../constants/countryRegions'
import walletIcon from '../assets/qianbao.png'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


function getCountryLabel(code: string) {
  return COUNTRY_OPTIONS.find((c) => c.value === code)?.label ?? code
}
function getRegionLabel(countryCode: string, regionValue: string) {
  const regions = getRegions(countryCode)
  return regions.find((r) => r.value === regionValue)?.label ?? regionValue
}
function getCityLabel(countryCode: string, regionValue: string, cityValue: string) {
  const cities = getCities(countryCode, regionValue)
  return cities.find((c) => c.value === cityValue)?.label ?? cityValue
}

function formatAddress(addr: AddressItem): string {
  const parts = [
    getCountryLabel(addr.country),
    addr.province && addr.province !== '_' ? getRegionLabel(addr.country, addr.province) : '',
    addr.city && addr.city !== '_' ? getCityLabel(addr.country, addr.province || '_', addr.city) : '',
    addr.detail,
  ].filter(Boolean)
  return parts.join(' ')
}

function toAddressSnapshot(addr: AddressItem): OrderAddressSnapshot {
  return {
    recipient: addr.recipient,
    email: addr.email,
    phoneCode: addr.phoneCode,
    phone: addr.phone,
    country: addr.country,
    province: addr.province,
    city: addr.city,
    postal: addr.postal,
    detail: addr.detail,
  }
}

function getInitialAuth(): { id: string | null; balance: number } {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    if (!raw) return { id: null, balance: 0 }
    const p = JSON.parse(raw) as { id?: string; balance?: number }
    return {
      id: p?.id ?? null,
      balance: typeof p?.balance === 'number' ? p.balance : 0,
    }
  } catch {
    return { id: null, balance: 0 }
  }
}

function normalizeAddress(a: unknown): AddressItem | null {
  if (!a || typeof a !== 'object') return null
  const o = a as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  return {
    id,
    recipient: typeof o.recipient === 'string' ? o.recipient : '',
    email: typeof o.email === 'string' ? o.email : '',
    phoneCode: typeof o.phoneCode === 'string' ? o.phoneCode : '+86',
    phone: typeof o.phone === 'string' ? o.phone : '',
    country: typeof o.country === 'string' ? o.country : '',
    province: typeof o.province === 'string' ? o.province : '',
    city: typeof o.city === 'string' ? o.city : '',
    postal: typeof o.postal === 'string' ? o.postal : '',
    detail: typeof o.detail === 'string' ? o.detail : '',
    isDefault: !!o.isDefault,
  }
}

/** 从路由 state 传入的「直接购买」商品，与购物车解耦 */
export type CheckoutDirectItems = CartItem[]

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('orderId')
  const directItems = (location.state as { directItems?: CheckoutDirectItems } | null)?.directItems
  const { showToast } = useToast()
  const { lang } = useLang()
  const { items, updateItemQuantity, removeItem } = useCart()
  const [addressList, setAddressList] = useState<AddressItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [successOrderNumber, setSuccessOrderNumber] = useState('')
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialAuth = getInitialAuth()
  const [userId] = useState<string | null>(initialAuth.id)
  const [balance, setBalance] = useState<number>(initialAuth.balance)

  useEffect(() => {
    if (!userId) {
      navigate('/login', {
        state: { from: { pathname: '/checkout', state: location.state } },
        replace: true,
      })
    }
  }, [userId, navigate, location.state])

  useEffect(() => {
    if (submitSuccess) {
      document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [submitSuccess])

  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[]>(() => directItems ?? [])
  useEffect(() => {
    if (directItems && directItems.length > 0) setDirectCheckoutItems(directItems)
  }, [directItems?.length])

  const orderForPay = orderIdFromUrl ? getOrderById(orderIdFromUrl) : null
  const orderItems = orderForPay?.items ?? []
  const itemsToCheckout: CartItem[] =
    directItems && directItems.length > 0
      ? directCheckoutItems
      : orderIdFromUrl && orderItems.length > 0
        ? (orderItems as CartItem[])
        : items
  const fromCartCheckout = !directItems?.length && !orderIdFromUrl

  const itemSubtotal = itemsToCheckout.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const discount = 0
  const tax = 0
  const total = itemSubtotal - discount + tax

  useEffect(() => {
    const uid = userId
    if (!uid) {
      setAddressList([])
      setSelectedAddress(null)
      return
    }
    let cancelled = false
    api
      .get<{ addresses?: unknown[] }>(`/api/users/${encodeURIComponent(uid)}`)
      .then((res) => {
        if (cancelled) return
        const addrs = (res.addresses ?? []).map((a) => normalizeAddress(a)).filter((a): a is AddressItem => a !== null)
        setAddressList(addrs)
        const def = addrs.find((a) => a.isDefault) ?? addrs[0] ?? null
        setSelectedAddress(def)
      })
      .catch(() => {
        if (!cancelled) {
          setAddressList([])
          setSelectedAddress(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    const uid = userId
    if (!uid) {
      setBalance(0)
      return
    }
    let cancelled = false
    api
      .get<{ balance?: number }>(`/api/users/${encodeURIComponent(uid)}`)
      .then((res) => {
        if (cancelled) return
        const next = Number.isFinite(Number(res.balance)) ? Number(res.balance) : 0
        setBalance(next)
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
          if (raw) {
            const parsed = JSON.parse(raw) as { id?: string; balance?: number }
            const nextAuth = { ...parsed, balance: next }
            window.localStorage.setItem('authUser', JSON.stringify(nextAuth))
          }
        } catch {
          // ignore
        }
      })
      .catch(() => {
        if (!cancelled) {
          // 保持当前 balance，不强制覆盖
        }
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const balanceInsufficient = total > balance
  const canSubmit =
    itemsToCheckout.length > 0 &&
    selectedAddress !== null &&
    !balanceInsufficient

  const handleSubmit = async () => {
    if (itemsToCheckout.length === 0) {
      showToast(tr(lang, { zh: '暂无商品', en: 'No items to checkout', de: 'Keine Artikel zum Auschecken', ja: 'チェックアウトするアイテムがありません', ko: '결제할 항목이 없습니다.', es: 'No hay artículos para pagar', it: 'Nessun articolo da verificare', vi: 'Không có mặt hàng nào để thanh toán', fr: 'Aucun article à commander' }), 'error')
      return
    }
    if (!selectedAddress) {
      showToast(
        tr(lang, { zh: '请选择收件地址', en: 'Please select a shipping address', de: 'Bitte wählen Sie eine Lieferadresse aus', ja: '配送先住所を選択してください', ko: '배송지 주소를 선택해주세요', es: 'Por favor seleccione una dirección de envío', it: 'Seleziona un indirizzo di spedizione', vi: 'Vui lòng chọn địa chỉ giao hàng', fr: 'Veuillez sélectionner une adresse de livraison' }),
        'error',
      )
      return
    }
    if (balanceInsufficient) {
      showToast(
        tr(lang, { zh: '余额不足，请先充值', en: 'Insufficient balance, please recharge first', de: 'Unzureichendes Guthaben, bitte zuerst aufladen', ja: '残高が不足しています。最初にチャージしてください', ko: '잔액이 부족합니다. 먼저 충전해 주세요.', es: 'Saldo insuficiente, recarga primero', it: 'Saldo insufficiente, ricaricare prima', vi: 'Số dư không đủ, vui lòng nạp tiền trước', fr: 'Solde insuffisant, veuillez d\'abord recharger' }),
        'error',
      )
      return
    }
    if (submitting) return
    const addressSnapshot = toAddressSnapshot(selectedAddress)
    const isPayingOrder = !!orderIdFromUrl

    if (isPayingOrder) {
      const order = getOrderById(orderIdFromUrl!)
      if (!order || order.status !== 'pending') {
        showToast(
          tr(lang, { zh: '订单已失效', en: 'Order is no longer valid', de: 'Bestellung ist nicht mehr gültig', ja: '注文はもう無効です', ko: '주문이 더 이상 유효하지 않습니다.', es: 'El pedido ya no es válido', it: 'L\'ordine non è più valido', vi: 'Đơn đặt hàng không còn hiệu lực', fr: 'La commande n\'est plus valable' }),
          'error',
        )
        return
      }
      setSubmitting(true)
      submitTimeoutRef.current = setTimeout(() => {
        submitTimeoutRef.current = null
        updateOrderStatus(orderIdFromUrl!, 'shipping')
        setSuccessOrderNumber(order.orderNumber)
        setSubmitting(false)
        setSubmitSuccess(true)
      }, 4500)
      return
    }

    if (!userId) {
      showToast(
        tr(lang, { zh: '请先登录后再下单', en: 'Please log in before placing an order', de: 'Bitte melden Sie sich an, bevor Sie eine Bestellung aufgeben', ja: 'ご注文前にログインしてください', ko: '주문하기 전에 로그인하세요.', es: 'Por favor inicia sesión antes de realizar un pedido', it: 'Effettua il login prima di effettuare un ordine', vi: 'Vui lòng đăng nhập trước khi đặt hàng', fr: 'Veuillez vous connecter avant de passer une commande' }),
        'error',
      )
      return
    }
    const shopGroups = new Map<string, CartItem[]>()
    for (const it of itemsToCheckout) {
      const sid = it.shopId ?? '001ABC'
      if (!shopGroups.has(sid)) shopGroups.set(sid, [])
      shopGroups.get(sid)!.push(it)
    }
    setSubmitting(true)
    const orderNumbers: string[] = []
    let totalDeduct = 0
    try {
      for (const [shopId, groupItems] of shopGroups) {
        const amount = groupItems.reduce((s, it) => s + it.price * it.quantity, 0)
        const res = await api.post<{ orderNumber?: string; id?: string; message?: string }>('/api/orders', {
          shopId,
          userId,
          amount,
          orderNumber: `ORD${Date.now()}_${shopId}`,
          items: groupItems.map((it) => ({
            id: it.id,
            productId: it.productId,
            title: it.title,
            price: it.price,
            quantity: it.quantity,
            image: it.image,
            spec: it.spec,
          })),
          address: addressSnapshot,
        })
        if (res && (res as { message?: string }).message)
          throw new Error((res as { message: string }).message)
        orderNumbers.push((res as { orderNumber?: string }).orderNumber ?? (res as { id?: string }).id ?? '')
        totalDeduct += amount
      }
      orderNumbers.forEach(() => {})
      if (fromCartCheckout) itemsToCheckout.forEach((it) => removeItem(it.id))
      setSuccessOrderNumber(orderNumbers.join('、'))
      setSubmitting(false)
      setSubmitSuccess(true)
      // 下单成功后，实时刷新一次账户余额
      if (userId) {
        try {
          const res = await api.get<{ balance?: number }>(`/api/users/${encodeURIComponent(userId)}`)
          const next = Number.isFinite(Number(res.balance)) ? Number(res.balance) : 0
          setBalance(next)
          try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string; balance?: number }
              const nextAuth = { ...parsed, balance: next }
              window.localStorage.setItem('authUser', JSON.stringify(nextAuth))
            }
          } catch {
            // ignore
          }
        } catch {
          // ignore refresh error
        }
      }
    } catch (err) {
      setSubmitting(false)
      showToast(
        err instanceof Error
          ? err.message
          : tr(lang, { zh: '下单失败，请重试', en: 'Order failed, please try again', de: 'Die Bestellung ist fehlgeschlagen. Bitte versuchen Sie es erneut', ja: '注文に失敗しました。もう一度お試しください', ko: '주문에 실패했습니다. 다시 시도해 주세요.', es: 'El pedido falló, inténtelo de nuevo', it: 'Ordine fallito, riprova', vi: 'Đặt hàng không thành công, vui lòng thử lại', fr: 'La commande a échoué, veuillez réessayer' }),
        'error',
      )
    }
  }

  const handleCancelSubmit = () => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
      submitTimeoutRef.current = null
    }
    setSubmitting(false)
  }

  if (submitSuccess) {
    return (
      <main className="app-main checkout-page checkout-page--success">
        <div className="checkout-success">
          <div className="checkout-success-icon" aria-hidden>✓</div>
          <h1 className="checkout-success-title">
            {tr(lang, { zh: '订单提交成功', en: 'Order submitted successfully', de: 'Bestellung erfolgreich übermittelt', ja: '注文は正常に送信されました', ko: '주문이 성공적으로 제출되었습니다.', es: 'Pedido enviado con éxito', it: 'Ordine inviato con successo', vi: 'Đơn hàng được gửi thành công', fr: 'Commande soumise avec succès' })}
          </h1>
          {successOrderNumber && (
            <p className="checkout-success-order-no">
              {tr(lang, { zh: '订单号：', en: 'Order No: ', de: 'Bestellnummer:', ja: '注文番号:', ko: '주문 번호:', es: 'Número de pedido:', it: 'N. ordine:', vi: 'Số thứ tự:', fr: 'Numéro de commande :' })}
              {successOrderNumber}
            </p>
          )}
          <p className="checkout-success-desc">
            {tr(lang, { zh: '感谢您的购买，请留意订单状态', en: 'Thank you for your purchase. Please keep an eye on your order status.', de: 'Vielen Dank für Ihren Einkauf. Bitte behalten Sie den Status Ihrer Bestellung im Auge.', ja: 'ご購入いただきありがとうございます。ご注文状況にご注意ください。', ko: '구매해주셔서 감사합니다. 주문 상태를 계속 지켜봐 주시기 바랍니다.', es: 'Gracias por tu compra. Esté atento al estado de su pedido.', it: 'Grazie per il tuo acquisto Tieni d\'occhio lo stato del tuo ordine.', vi: 'Cảm ơn bạn đã mua hàng. Vui lòng theo dõi trạng thái đơn hàng của bạn.', fr: 'Merci pour votre achat. Veuillez garder un œil sur l\'état de votre commande.' })}
          </p>
          <div className="checkout-success-actions">
            <button
              type="button"
              className="checkout-success-btn checkout-success-btn--primary"
              onClick={() => navigate('/account?tab=orders')}
            >
              {tr(lang, { zh: '查看订单', en: 'View orders', de: 'Bestellungen ansehen', ja: '注文を見る', ko: '주문 보기', es: 'Ver pedidos', it: 'Visualizza gli ordini', vi: 'Xem đơn hàng', fr: 'Afficher les commandes' })}
            </button>
            <Link to="/products" className="checkout-success-btn checkout-success-btn--secondary">
              {tr(lang, { zh: '继续购物', en: 'Continue shopping', de: 'Weiter einkaufen', ja: '買い物を続ける', ko: '계속 쇼핑하기', es: 'Continuar comprando', it: 'Continua a fare acquisti', vi: 'Tiếp tục mua sắm', fr: 'Continuer mes achats' })}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (itemsToCheckout.length === 0) {
    return (
      <main className="app-main checkout-page">
        <div className="checkout-empty">
          <p className="checkout-empty-text">
            {tr(lang, { zh: '暂无商品', en: 'No items to checkout', de: 'Keine Artikel zum Auschecken', ja: 'チェックアウトするアイテムがありません', ko: '결제할 항목이 없습니다.', es: 'No hay artículos para pagar', it: 'Nessun articolo da verificare', vi: 'Không có mặt hàng nào để thanh toán', fr: 'Aucun article à commander' })}
          </p>
            <Link to="/products" className="checkout-empty-btn">
              {tr(lang, { zh: '去购物', en: 'Go shopping', de: 'Gehen Sie einkaufen', ja: '買い物に行く', ko: '쇼핑하러 가세요', es: 'Hacer compras', it: 'Vai a fare shopping', vi: 'Đi mua sắm', fr: 'Faire du shopping' })}
          </Link>
        </div>
      </main>
    )
  }

  if (!userId) {
    return (
      <main className="app-main checkout-page">
        <div className="checkout-inner" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>{tr(lang, { zh: '正在跳转到登录页…', en: 'Redirecting to login…', de: 'Weiterleitung zum Login…', ja: 'ログインにリダイレクトしています…', ko: '로그인으로 리디렉션 중…', es: 'Redirigiendo para iniciar sesión…', it: 'Reindirizzamento all\'accesso...', vi: 'Đang chuyển hướng đến đăng nhập…', fr: 'Redirection vers la connexion…' })}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="app-main checkout-page">
      <div className="checkout-inner">
        <h1 className="checkout-title">
          {tr(lang, { zh: '下单', en: 'Checkout', de: 'Kasse', ja: 'チェックアウト', ko: '점검', es: 'Verificar', it: 'Guardare', vi: 'Thanh toán', fr: 'Vérifier' })}
        </h1>

        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {tr(lang, { zh: '收件地址', en: 'Shipping address', de: 'Lieferadresse', ja: 'お届け先の住所', ko: '배송 주소', es: 'Dirección de envío', it: 'Indirizzo di spedizione', vi: 'Địa chỉ giao hàng', fr: 'Adresse de livraison' })}
          </h2>
          <button
            type="button"
            className="checkout-address-row"
            onClick={() => setAddressModalOpen(true)}
            aria-label={
              tr(lang, { zh: '选择或添加收件地址', en: 'Select or add a shipping address', de: 'Wählen Sie eine Lieferadresse aus oder fügen Sie sie hinzu', ja: '配送先住所を選択または追加します', ko: '배송 주소를 선택하거나 추가하세요.', es: 'Seleccione o agregue una dirección de envío', it: 'Seleziona o aggiungi un indirizzo di spedizione', vi: 'Chọn hoặc thêm địa chỉ giao hàng', fr: 'Sélectionnez ou ajoutez une adresse de livraison' })
            }
          >
            <span className="checkout-address-add-icon" aria-hidden>+</span>
            <span className="checkout-address-text">
              {selectedAddress
                ? `${selectedAddress.recipient} ${selectedAddress.phoneCode} ${selectedAddress.phone} ${formatAddress(selectedAddress)}`
                : tr(lang, { zh: '请选择收件地址', en: 'Please select a shipping address', de: 'Bitte wählen Sie eine Lieferadresse aus', ja: '配送先住所を選択してください', ko: '배송지 주소를 선택해주세요', es: 'Por favor seleccione una dirección de envío', it: 'Seleziona un indirizzo di spedizione', vi: 'Vui lòng chọn địa chỉ giao hàng', fr: 'Veuillez sélectionner une adresse de livraison' })}
            </span>
            <span className="checkout-address-arrow" aria-hidden>&gt;</span>
          </button>
        </section>

        <section className="checkout-section">
          <div className="checkout-seller-row">
            <span className="checkout-seller-check" aria-hidden>✓</span>
            <span className="checkout-seller-name">
              {tr(lang, {
                zh: `购买商品 (总计 ${itemsToCheckout.length} 项目)`,
                en: `Items to purchase (total ${itemsToCheckout.length})`,
                de: `Zu kaufende Artikel (insgesamt ${itemsToCheckout.length})`,
                ja: `購入商品（合計 ${itemsToCheckout.length} 件）`,
                ko: `구매 상품 (총 ${itemsToCheckout.length}개)`,
                es: `Artículos a comprar (total ${itemsToCheckout.length})`,
                it: `Articoli da acquistare (totale ${itemsToCheckout.length})`,
                vi: `Sản phẩm mua (tổng ${itemsToCheckout.length})`,
                fr: `Articles à acheter (total ${itemsToCheckout.length})`,
              })}
            </span>
          </div>
          <div className="checkout-items">
            {itemsToCheckout.map((item) => (
              <div key={item.id} className="checkout-item">
                <span className="checkout-item-check" aria-hidden>✓</span>
                <div className="checkout-item-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="checkout-item-thumb-placeholder" />
                  )}
                </div>
                <div className="checkout-item-info">
                  <div className="checkout-item-title">{item.title}</div>
                  <div className="checkout-item-price">${item.price.toFixed(2)}</div>
                </div>
                <div className="checkout-item-qty">
                  {fromCartCheckout ? (
                    <>
                      <button
                        type="button"
                        className="checkout-qty-btn"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="checkout-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="checkout-qty-btn"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </>
                  ) : directItems?.length ? (
                    <>
                      <button
                        type="button"
                        className="checkout-qty-btn"
                        onClick={() => {
                          if (item.quantity <= 1) return
                          setDirectCheckoutItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)),
                          )
                        }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="checkout-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="checkout-qty-btn"
                        onClick={() =>
                          setDirectCheckoutItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
                          )
                        }
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <span className="checkout-qty-value">{item.quantity}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="checkout-payment-section" className="checkout-section checkout-payment">
          <h2 className="checkout-section-title">
            {tr(lang, { zh: '支付方式', en: 'Payment method', de: 'Zahlungsart', ja: '支払方法', ko: '결제수단', es: 'Método de pago', it: 'Metodo di pagamento', vi: 'Phương thức thanh toán', fr: 'Mode de paiement' })}
          </h2>
          <div className="checkout-payment-options">
            <div className={`checkout-payment-option${balanceInsufficient ? ' checkout-payment-option--disabled' : ' checkout-payment-option--selected'}`} aria-disabled={balanceInsufficient ? 'true' : 'false'}>
              <span className="checkout-payment-radio checkout-payment-radio--fake" aria-hidden />
              <span className="checkout-payment-icon checkout-payment-icon--img">
                <img src={walletIcon} alt="" />
              </span>
              <span className="checkout-payment-label">
                {tr(lang, { zh: '余额', en: 'Balance', de: 'Gleichgewicht', ja: 'バランス', ko: '균형', es: 'Balance', it: 'Bilancia', vi: 'Sự cân bằng', fr: 'Équilibre' })} (${balance.toFixed(2)})
                {balanceInsufficient && (
                  <span className="checkout-payment-region-hint">
                    {tr(lang, { zh: '余额不足', en: 'Insufficient balance', de: 'Unzureichendes Gleichgewicht', ja: '残高不足', ko: '잔액 부족', es: 'Saldo insuficiente', it: 'Equilibrio insufficiente', vi: 'Số dư không đủ', fr: 'Solde insuffisant' })}
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        <section className="checkout-section checkout-summary">
          <h2 className="checkout-section-title">
            {tr(lang, { zh: '订单汇总', en: 'Order summary', de: 'Bestellübersicht', ja: '注文概要', ko: '주문 요약', es: 'Resumen del pedido', it: 'Riepilogo dell\'ordine', vi: 'Tóm tắt đơn hàng', fr: 'Récapitulatif de la commande' })}
          </h2>
          <div className="checkout-summary-rows">
            <div className="checkout-summary-row">
              <span>{tr(lang, { zh: '商品金额', en: 'Items subtotal', de: 'Zwischensumme der Elemente', ja: '項目の小計', ko: '항목 소계', es: 'Subtotal de artículos', it: 'Totale parziale degli articoli', vi: 'Tổng phụ các mục', fr: 'Sous-total des articles' })}</span>
              <span>${itemSubtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>{tr(lang, { zh: '折扣', en: 'Discount', de: 'Rabatt', ja: '割引', ko: '할인', es: 'Descuento', it: 'Sconto', vi: 'Giảm giá', fr: 'Rabais' })}</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>{tr(lang, { zh: '税收', en: 'Tax', de: 'Steuer', ja: '税', ko: '세', es: 'Impuesto', it: 'Tassare', vi: 'Thuế', fr: 'Impôt' })}</span>
              <span>+${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="checkout-submit-row">
            <button
              type="button"
              className="checkout-submit-btn"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? tr(lang, { zh: '提交中...', en: 'Submitting...', de: 'Einreichen...', ja: '送信中...', ko: '제출 중...', es: 'Sumisión...', it: 'Invio...', vi: 'Đang gửi...', fr: 'Soumission...' })
                : tr(lang, { zh: '提交订单', en: 'Place order', de: 'Bestellung aufgeben', ja: '注文する', ko: '주문하기', es: 'Realizar pedido', it: 'Effettua l\'ordine', vi: 'Đặt hàng', fr: 'Passer la commande' })}
            </button>
            <span className="checkout-total-label">
              {tr(lang, { zh: '合计', en: 'Total', de: 'Gesamt', ja: '合計', ko: '총', es: 'Total', it: 'Totale', vi: 'Tổng cộng', fr: 'Total' })}
            </span>
            <span className="checkout-total-amount">${total.toFixed(2)}</span>
          </div>
        </section>
      </div>

      {submitting && (
        <div className="checkout-submit-overlay" role="status" aria-live="polite">
          <div className="checkout-submit-loader-wrap">
            <div className="checkout-submit-loader" aria-hidden />
            <span className="checkout-submit-loader-text">
              {tr(lang, { zh: '提交中...', en: 'Submitting...', de: 'Einreichen...', ja: '送信中...', ko: '제출 중...', es: 'Sumisión...', it: 'Invio...', vi: 'Đang gửi...', fr: 'Soumission...' })}
            </span>
            <button
              type="button"
              className="checkout-submit-cancel-btn"
              onClick={handleCancelSubmit}
              >
              {tr(lang, { zh: '取消', en: 'Cancel', de: 'Stornieren', ja: 'キャンセル', ko: '취소', es: 'Cancelar', it: 'Cancellare', vi: 'Hủy bỏ', fr: 'Annuler' })}
            </button>
          </div>
        </div>
      )}

      {addressModalOpen && (
        <div
          className="checkout-address-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-address-modal-title"
          onClick={() => setAddressModalOpen(false)}
        >
          <div className="checkout-address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-address-modal-header">
              <h2 id="checkout-address-modal-title">
                {tr(lang, { zh: '选择收件地址', en: 'Select shipping address', de: 'Lieferadresse auswählen', ja: '配送先住所を選択してください', ko: '배송지 선택', es: 'Seleccionar dirección de envío', it: 'Seleziona l\'indirizzo di spedizione', vi: 'Chọn địa chỉ giao hàng', fr: 'Sélectionnez l\'adresse de livraison' })}
              </h2>
              <button
                type="button"
                className="checkout-address-modal-close"
                aria-label={tr(lang, { zh: '关闭', en: 'Close', de: 'Schließen', ja: '近い', ko: '닫다', es: 'Cerca', it: 'Vicino', vi: 'Đóng', fr: 'Fermer' })}
                onClick={() => setAddressModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="checkout-address-modal-body">
              {addressList.length === 0 ? (
                <p className="checkout-address-modal-empty">
                  {tr(lang, { zh: '暂无地址，请先添加', en: 'No addresses yet, please add one first', de: 'Noch keine Adressen, bitte fügen Sie zuerst eine hinzu', ja: 'まだアドレスがありません。まずアドレスを追加してください', ko: '아직 주소가 없습니다. 먼저 주소를 추가하세요.', es: 'Aún no hay direcciones, por favor agregue una primero', it: 'Ancora nessun indirizzo, aggiungine prima uno', vi: 'Chưa có địa chỉ, vui lòng thêm một địa chỉ trước', fr: 'Aucune adresse pour l\'instant, veuillez d\'abord en ajouter une' })}
                </p>
              ) : (
                <ul className="checkout-address-modal-list">
                  {addressList.map((addr) => (
                    <li key={addr.id}>
                      <button
                        type="button"
                        className={`checkout-address-modal-item${selectedAddress?.id === addr.id ? ' checkout-address-modal-item--active' : ''}`}
                        onClick={() => {
                          setSelectedAddress(addr)
                          setAddressModalOpen(false)
                        }}
                      >
                        <span className="checkout-address-modal-item-name">{addr.recipient}</span>
                        <span className="checkout-address-modal-item-phone">{addr.phoneCode} {addr.phone}</span>
                        <span className="checkout-address-modal-item-addr">{formatAddress(addr)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="checkout-address-modal-add"
                onClick={() => {
                  setAddressModalOpen(false)
                  setAddAddressModalOpen(true)
                }}
              >
                {tr(lang, { zh: '+ 新增地址', en: '+ Add new address', de: '+ Neue Adresse hinzufügen', ja: '+ 新しいアドレスを追加', ko: '+ 새 주소 추가', es: '+ Agregar nueva dirección', it: '+ Aggiungi un nuovo indirizzo', vi: '+ Thêm địa chỉ mới', fr: '+ Ajouter une nouvelle adresse' })}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddressModal
        open={addAddressModalOpen}
        onClose={() => setAddAddressModalOpen(false)}
        onSuccess={(item) => {
          let nextList: AddressItem[] = [...addressList, item]
          if (item.isDefault) {
            nextList = nextList.map((a) => ({ ...a, isDefault: a.id === item.id }))
          }
          if (!userId) {
            showToast(
              tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }),
              'error',
            )
            return
          }
          api
            .patch(`/api/users/${encodeURIComponent(userId)}`, { addresses: nextList })
            .then(() => {
              setAddressList(nextList)
              setSelectedAddress(item)
              showToast(
                tr(lang, { zh: '保存成功', en: 'Saved successfully', de: 'Erfolgreich gespeichert', ja: '正常に保存されました', ko: '성공적으로 저장되었습니다', es: 'Guardado exitosamente', it: 'Salvato con successo', vi: 'Đã lưu thành công', fr: 'Enregistré avec succès' }),
              )
              setAddAddressModalOpen(false)
            })
            .catch((err: unknown) => {
              showToast(
                err instanceof Error
                  ? err.message
                  : tr(lang, { zh: '保存失败', en: 'Save failed', de: 'Speichern fehlgeschlagen', ja: '保存に失敗しました', ko: '저장 실패', es: 'Error al guardar', it: 'Salvataggio non riuscito', vi: 'Lưu không thành công', fr: 'Échec de l\'enregistrement' }),
                'error',
              )
            })
        }}
      />
    </main>
  )
}

export default Checkout
