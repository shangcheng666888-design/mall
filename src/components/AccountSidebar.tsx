import React, { useState, useCallback } from 'react'
import walletIcon from '../assets/qianbao.png'
import orderIcon from '../assets/dingdan.png'
import favoriteIcon from '../assets/shngpinshoucang.png'
import shopFavIcon from '../assets/dianpu.png'
import settingsIcon from '../assets/shezhi.png'
import { useToast } from './ToastProvider'
import { AVATAR_STORAGE_KEY, AVATAR_OPTIONS } from '../utils/avatarOptions'
import { api } from '../api/client'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


type AccountNavKey =
  | 'wallet'
  | 'orders'
  | 'productFavorites'
  | 'shopFavorites'
  | 'settings'

interface AccountSidebarProps {
  activeKey?: AccountNavKey
  onSelect?: (key: AccountNavKey) => void
}

const getStoredAvatar = (): string | null => {
  if (typeof window === 'undefined') return null
  const url = window.localStorage.getItem(AVATAR_STORAGE_KEY)
  return url && AVATAR_OPTIONS.includes(url) ? url : null
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeKey = 'wallet', onSelect }) => {
  const { showToast } = useToast()
  const { lang } = useLang()
  const authUser = (() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem('authUser')
      if (!raw) return null
      return JSON.parse(raw) as { id?: string; account?: string; avatar?: string | null; type?: 'email' | 'phone'; value?: string }
    } catch {
      return null
    }
  })()
  const initialAvatar = (authUser?.avatar && AVATAR_OPTIONS.includes(authUser.avatar)) ? authUser.avatar : getStoredAvatar()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)

  const handleSelectAvatar = useCallback((url: string) => {
    const uid = authUser?.id
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { avatar: url })
      .then(() => {
        const next = { ...authUser, avatar: url }
        window.localStorage.setItem('authUser', JSON.stringify(next))
        window.localStorage.setItem(AVATAR_STORAGE_KEY, url)
        setAvatarUrl(url)
        setAvatarPickerOpen(false)
        showToast(tr(lang, { zh: '头像已更换', en: 'Avatar updated', de: 'Avatar aktualisiert', ja: 'アバターが更新されました', ko: '아바타가 업데이트되었습니다.', es: 'Avatar actualizado', it: 'Avatar aggiornato', vi: 'Đã cập nhật hình đại diện', fr: 'Avatar mis à jour' }))
      })
      .catch(() => showToast(tr(lang, { zh: '头像保存失败', en: 'Failed to save avatar', de: 'Avatar konnte nicht gespeichert werden', ja: 'アバターの保存に失敗しました', ko: '아바타를 저장하지 못했습니다.', es: 'No se pudo guardar el avatar', it: 'Impossibile salvare l\'avatar', vi: 'Không lưu được hình đại diện', fr: 'Échec de l\'enregistrement de l\'avatar' }), 'error'))
  }, [showToast, authUser, lang])

  const displayAuthValue = (v: string | undefined) => (v && typeof v === 'string' ? v : '')

  // 商城登录存 value，商家登录存 account
  const userLabel = authUser
    ? displayAuthValue(authUser.value ?? authUser.account)
    : (tr(lang, { zh: '未登录用户', en: 'Guest user', de: 'Gastbenutzer', ja: 'ゲストユーザー', ko: '게스트 사용자', es: 'Usuario invitado', it: 'Utente ospite', vi: 'Người dùng khách', fr: 'Utilisateur invité' }))

  const userId = authUser?.id ?? ''
  const displayId = userId || (authUser?.account ?? authUser?.value) || '—'
  const handleCopyId = () => {
    const toCopy = userId || authUser?.account || authUser?.value
    if (!toCopy) return
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(toCopy)
        .then(() => {
          showToast(tr(lang, { zh: '复制成功', en: 'Copied', de: 'Kopiert', ja: 'コピーされました', ko: '복사됨', es: 'Copiado', it: 'Copiato', vi: 'Đã sao chép', fr: 'Copié' }))
        })
        .catch(() => {
          showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
        })
    } else {
      showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
    }
  }

  const handleSelect = (key: AccountNavKey) => {
    if (onSelect) {
      onSelect(key)
    }
  }

  const navItemClass = (key: AccountNavKey) =>
    `account-nav-item${activeKey === key ? ' account-nav-item--active' : ''}`

  return (
    <aside className="account-sidebar">
      <div className="account-profile">
        <button
          type="button"
          className="account-avatar account-avatar-btn"
          onClick={() => setAvatarPickerOpen(true)}
          aria-label={tr(lang, { zh: '更换头像', en: 'Change avatar', de: 'Avatar ändern', ja: 'アバターの変更', ko: '아바타 변경', es: 'Cambiar avatar', it: 'Cambia avatar', vi: 'Thay đổi hình đại diện', fr: 'Changer d\'avatar' })}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="account-avatar-img" />
          ) : (
            <span className="account-avatar-text">
              {userLabel && /[0-9]/.test(userLabel[0]) ? 'U' : userLabel[0] || 'U'}
            </span>
          )}
        </button>
        <div className="account-profile-main">
          <div className="account-profile-name">
            {userLabel || (tr(lang, { zh: '账户', en: 'Account', de: 'Konto', ja: 'アカウント', ko: '계정', es: 'Cuenta', it: 'Account', vi: 'Tài khoản', fr: 'Compte' }))}
          </div>
          <div className="account-profile-id">
            <span className="account-profile-id-label">
              {tr(lang, { zh: '账户ID：', en: 'Account ID: ', de: 'Konto-ID:', ja: 'アカウントID:', ko: '계정 ID:', es: 'ID de cuenta:', it: 'ID conto:', vi: 'ID tài khoản:', fr: 'Identifiant du compte :' })}
            </span>
            <span className="account-profile-id-value">{displayId}</span>
            <button
              type="button"
              className="account-id-copy"
              aria-label={tr(lang, { zh: '复制账户ID', en: 'Copy account ID', de: 'Konto-ID kopieren', ja: 'アカウントIDをコピーする', ko: '계정 ID 복사', es: 'Copiar ID de cuenta', it: 'Copia l\'ID dell\'account', vi: 'Sao chép ID tài khoản', fr: 'Copier l\'identifiant du compte' })}
              onClick={handleCopyId}
              disabled={!displayId || displayId === '—'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect
                  x="7"
                  y="7"
                  width="11"
                  height="13"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <rect
                  x="5"
                  y="4"
                  width="11"
                  height="13"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity="0.6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav className="account-nav">
        <button
          type="button"
          className={navItemClass('wallet')}
          onClick={() => handleSelect('wallet')}
        >
          <span className="account-nav-icon account-nav-icon--wallet">
            <img
              src={walletIcon}
              alt={tr(lang, { zh: '我的钱包', en: 'My wallet', de: 'Meine Brieftasche', ja: '私の財布', ko: '내 지갑', es: 'mi billetera', it: 'Il mio portafoglio', vi: 'Ví của tôi', fr: 'Mon portefeuille' })}
              className="account-nav-wallet-img"
            />
          </span>
          <span className="account-nav-label">
            {tr(lang, { zh: '我的钱包', en: 'My wallet', de: 'Meine Brieftasche', ja: '私の財布', ko: '내 지갑', es: 'mi billetera', it: 'Il mio portafoglio', vi: 'Ví của tôi', fr: 'Mon portefeuille' })}
          </span>
        </button>
        <button
          type="button"
          className={navItemClass('orders')}
          onClick={() => handleSelect('orders')}
        >
          <span className="account-nav-icon account-nav-icon--order">
            <img
              src={orderIcon}
              alt={tr(lang, { zh: '我的订单', en: 'My orders', de: 'Meine Bestellungen', ja: '私の注文', ko: '내 주문', es: 'mis pedidos', it: 'I miei ordini', vi: 'Đơn đặt hàng của tôi', fr: 'Mes commandes' })}
              className="account-nav-order-img"
            />
          </span>
          <span className="account-nav-label">
            {tr(lang, { zh: '我的订单', en: 'My orders', de: 'Meine Bestellungen', ja: '私の注文', ko: '내 주문', es: 'mis pedidos', it: 'I miei ordini', vi: 'Đơn đặt hàng của tôi', fr: 'Mes commandes' })}
          </span>
        </button>
        <button
          type="button"
          className={navItemClass('productFavorites')}
          onClick={() => handleSelect('productFavorites')}
        >
          <span className="account-nav-icon account-nav-icon--favorite">
            <img
              src={favoriteIcon}
              alt={tr(lang, { zh: '商品收藏', en: 'Product favorites', de: 'Produktfavoriten', ja: '製品のお気に入り', ko: '제품 즐겨찾기', es: 'Productos favoritos', it: 'Preferiti dei prodotti', vi: 'Sản phẩm yêu thích', fr: 'Produits favoris' })}
              className="account-nav-favorite-img"
            />
          </span>
          <span className="account-nav-label">
            {tr(lang, { zh: '商品收藏', en: 'Product favorites', de: 'Produktfavoriten', ja: '製品のお気に入り', ko: '제품 즐겨찾기', es: 'Productos favoritos', it: 'Preferiti dei prodotti', vi: 'Sản phẩm yêu thích', fr: 'Produits favoris' })}
          </span>
        </button>
        <button
          type="button"
          className={navItemClass('shopFavorites')}
          onClick={() => handleSelect('shopFavorites')}
        >
          <span className="account-nav-icon account-nav-icon--shop-fav">
            <img
              src={shopFavIcon}
              alt={tr(lang, { zh: '关注店铺', en: 'Followed shops', de: 'Gefolgte Geschäfte', ja: 'フォローしたお店', ko: '팔로우한 상점', es: 'Tiendas seguidas', it: 'Negozi seguiti', vi: 'Cửa hàng đã theo dõi', fr: 'Boutiques suivies' })}
              className="account-nav-shop-fav-img"
            />
          </span>
          <span className="account-nav-label">
            {tr(lang, { zh: '关注店铺', en: 'Followed shops', de: 'Gefolgte Geschäfte', ja: 'フォローしたお店', ko: '팔로우한 상점', es: 'Tiendas seguidas', it: 'Negozi seguiti', vi: 'Cửa hàng đã theo dõi', fr: 'Boutiques suivies' })}
          </span>
        </button>
        <button
          type="button"
          className={navItemClass('settings')}
          onClick={() => handleSelect('settings')}
        >
          <span className="account-nav-icon account-nav-icon--settings">
            <img
              src={settingsIcon}
              alt={tr(lang, { zh: '设置', en: 'Settings', de: 'Einstellungen', ja: '設定', ko: '설정', es: 'Ajustes', it: 'Impostazioni', vi: 'Cài đặt', fr: 'Paramètres' })}
              className="account-nav-settings-img"
            />
          </span>
          <span className="account-nav-label">
            {tr(lang, { zh: '设置', en: 'Settings', de: 'Einstellungen', ja: '設定', ko: '설정', es: 'Ajustes', it: 'Impostazioni', vi: 'Cài đặt', fr: 'Paramètres' })}
          </span>
        </button>
      </nav>

      {avatarPickerOpen && (
        <>
          <div
            className="account-avatar-picker-overlay"
            onClick={() => setAvatarPickerOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
          <div
            className="account-avatar-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-avatar-picker-title"
          >
            <div className="account-avatar-picker-head">
              <h2 id="account-avatar-picker-title" className="account-avatar-picker-title">
                {tr(lang, { zh: '选择头像', en: 'Choose avatar', de: 'Wählen Sie Avatar', ja: 'アバターを選択', ko: '아바타 선택', es: 'Elige avatar', it: 'Scegli l\'avatar', vi: 'Chọn hình đại diện', fr: 'Choisir un avatar' })}
              </h2>
              <button
                type="button"
                className="account-avatar-picker-close"
                onClick={() => setAvatarPickerOpen(false)}
                aria-label={tr(lang, { zh: '关闭', en: 'Close', de: 'Schließen', ja: '近い', ko: '닫다', es: 'Cerca', it: 'Vicino', vi: 'Đóng', fr: 'Fermer' })}
              >
                ×
              </button>
            </div>
            <div className="account-avatar-picker-grid">
              {AVATAR_OPTIONS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`account-avatar-option${avatarUrl === url ? ' account-avatar-option--selected' : ''}`}
                  onClick={() => handleSelectAvatar(url)}
                  aria-label={tr(lang, { zh: '选择头像', en: 'Choose avatar', de: 'Wählen Sie Avatar', ja: 'アバターを選択', ko: '아바타 선택', es: 'Elige avatar', it: 'Scegli l\'avatar', vi: 'Chọn hình đại diện', fr: 'Choisir un avatar' })}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}

export type { AccountNavKey, AccountSidebarProps }
export default AccountSidebar

