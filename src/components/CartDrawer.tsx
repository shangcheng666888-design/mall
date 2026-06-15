import type React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import cartEmpty from '../assets/cart-empty.png'
import { useCart } from '../cart/CartContext.tsx'
import { useLang } from '../context/LangContext'
import { useToast } from './ToastProvider'
import { tr } from '../i18n'


interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

function getAuthUserId(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    if (!raw) return null
    return (JSON.parse(raw) as { id?: string })?.id ?? null
  } catch { return null }
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, totalCount, updateItemQuantity, removeItem } = useCart()

  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((it) => it.id))

  useEffect(() => {
    setSelectedIds((prev) => {
      const nextIds = items.map((it) => it.id)
      // 初次进入或购物车清空：默认全选
      if (prev.length === 0) return nextIds
      // 保留之前存在且仍在列表中的选中状态
      const stillSelected = prev.filter((id) => nextIds.includes(id))
      // 新增的商品默认选中
      nextIds.forEach((id) => {
        if (!stillSelected.includes(id)) {
          stillSelected.push(id)
        }
      })
      return stillSelected
    })
  }, [items])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectedItems = items.filter((it) => selectedIds.includes(it.id))
  const selectedAmount = selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const hasSelected = selectedItems.length > 0

  if (!open) return null

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <header className="cart-drawer-header">
          <div className="cart-drawer-title-left">
            <span className="cart-drawer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="10" cy="19" r="1.6" fill="currentColor" />
                <circle cx="17" cy="19" r="1.6" fill="currentColor" />
                <path
                  d="M3 4h2l1.5 11h11l1.5-8H7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="cart-drawer-count">
              {tr(lang, {
                zh: `${totalCount} 件商品`,
                en: `${totalCount} item${totalCount === 1 ? '' : 's'}`,
                de: `${totalCount} Artikel`,
                ja: `${totalCount} 点`,
                ko: `${totalCount}개 상품`,
                es: `${totalCount} artículo${totalCount === 1 ? '' : 's'}`,
                it: `${totalCount} articolo${totalCount === 1 ? '' : 'i'}`,
                vi: `${totalCount} sản phẩm`,
                fr: `${totalCount} article${totalCount === 1 ? '' : 's'}`,
              })}
            </span>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label={tr(lang, { zh: '关闭购物车', en: 'Close cart', de: 'Warenkorb schließen', ja: 'カートを閉じる', ko: '장바구니 닫기', es: 'Cerrar carrito', it: 'Chiudi il carrello', vi: 'Đóng giỏ hàng', fr: 'Fermer le panier' })}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="cart-drawer-subtitle">
          {tr(lang, { zh: '我的购物车', en: 'My cart', de: 'Mein Warenkorb', ja: '私のカート', ko: '내 장바구니', es: 'mi carrito', it: 'Il mio carrello', vi: 'Giỏ hàng của tôi', fr: 'Mon panier' })}
        </div>

        <div className="cart-drawer-body">
          {totalCount <= 0 ? (
            <div className="cart-drawer-empty">
              <img
                src={cartEmpty}
                alt={tr(lang, { zh: '购物车还没有商品', en: 'Your cart is empty', de: 'Ihr Warenkorb ist leer', ja: 'カートは空です', ko: '장바구니가 비어 있습니다.', es: 'Tu carrito está vacío', it: 'Il tuo carrello è vuoto', vi: 'Giỏ hàng của bạn trống', fr: 'Votre panier est vide' })}
                className="cart-drawer-empty-img"
              />
              <div className="cart-drawer-empty-text">
                {tr(lang, { zh: '购物车还没有商品', en: 'Your cart has no items yet', de: 'Ihr Warenkorb enthält noch keine Artikel', ja: 'カートにはまだ商品がありません', ko: '장바구니에 아직 항목이 없습니다.', es: 'Su carrito aún no tiene artículos', it: 'Il tuo carrello non ha ancora articoli', vi: 'Giỏ hàng của bạn chưa có mặt hàng nào', fr: 'Votre panier ne contient pas encore d\'articles' })}
              </div>
              <button
                type="button"
                className="cart-drawer-go-btn"
                onClick={() => {
                  onClose()
                  navigate('/products')
                }}
              >
                {tr(lang, { zh: '去购物', en: 'Go shopping', de: 'Gehen Sie einkaufen', ja: '買い物に行く', ko: '쇼핑하러 가세요', es: 'Hacer compras', it: 'Vai a fare shopping', vi: 'Đi mua sắm', fr: 'Faire du shopping' })}
              </button>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {items.map((item) => (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item-main">
                    <input
                      type="checkbox"
                      className="cart-drawer-item-check"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <div className="cart-drawer-item-thumb">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="cart-drawer-item-thumb-placeholder" />
                      )}
                    </div>
                    <div className="cart-drawer-item-info">
                      <div className="cart-drawer-item-title" title={item.title}>
                        {item.title}
                      </div>
                      {item.spec && (
                        <div className="cart-drawer-item-spec">{item.spec}</div>
                      )}
                      <div className="cart-drawer-item-qty">
                        <div className="product-detail-qty-control">
                          <button
                            type="button"
                            className="product-detail-qty-btn"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="product-detail-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="product-detail-qty-btn"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="cart-drawer-item-price">
                      ${item.price.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      className="cart-drawer-item-remove"
                      aria-label={tr(lang, { zh: '移除商品', en: 'Remove item', de: 'Artikel entfernen', ja: 'アイテムを削除する', ko: '항목 삭제', es: 'Quitar elemento', it: 'Rimuovi l\'articolo', vi: 'Xóa mục', fr: 'Supprimer l\'élément' })}
                      onClick={() => removeItem(item.id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 7h14M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer
          className={`cart-drawer-footer${!hasSelected ? ' cart-drawer-footer--disabled' : ''}`}
          onClick={() => {
            if (!hasSelected) return
            if (!getAuthUserId()) {
              showToast(
                tr(lang, { zh: '请先登录后再下单', en: 'Please log in before checkout', de: 'Bitte melden Sie sich vor dem Bezahlen an', ja: 'チェックアウト前にログインしてください', ko: '결제하기 전에 로그인하세요.', es: 'Por favor inicia sesión antes de realizar el pago', it: 'Effettua il login prima del checkout', vi: 'Vui lòng đăng nhập trước khi thanh toán', fr: 'Veuillez vous connecter avant de procéder au paiement' }),
                'error',
              )
              onClose()
              navigate('/login', { state: { from: '/checkout' } })
              return
            }
            onClose()
            navigate('/checkout')
          }}
        >
          <span className="cart-drawer-footer-label">
            {tr(lang, { zh: '下单', en: 'Checkout', de: 'Kasse', ja: 'チェックアウト', ko: '점검', es: 'Verificar', it: 'Guardare', vi: 'Thanh toán', fr: 'Vérifier' })}
          </span>
          <span className="cart-drawer-footer-amount">${selectedAmount.toFixed(2)}</span>
        </footer>
      </div>
    </div>
  )
}

export default CartDrawer

