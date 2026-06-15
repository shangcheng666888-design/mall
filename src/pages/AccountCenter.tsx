import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import kongtai from '../assets/kongtai.png'
import walletIcon from '../assets/qianbao.png'
import AccountSidebar from '../components/AccountSidebar'
import type { AccountNavKey } from '../components/AccountSidebar'
import ProductCard from '../components/ProductCard'
import { useToast } from '../components/ToastProvider'
import { useProductFavorites } from '../context/ProductFavoritesContext'
import AddressModal from '../components/AddressModal'
import { getRegions, getCities } from '../constants/countryRegions'
import { COUNTRY_OPTIONS } from '../constants/countries'
import type { AddressItem } from '../utils/addressList'

export type { AddressItem }

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
import type { FollowedShop } from '../utils/followedShops'
import { getOrderStatusLabel, type Order, type OrderStatus } from '../utils/orderList'
import {
  formatRecordDate,
  getWalletStatusLabel,
  type WalletRechargeRecord,
  type WalletWithdrawRecord,
} from '../utils/walletRecords'
import LogoutSuccessModal from '../components/LogoutSuccessModal'
import { api } from '../api/client'
import { useCart } from '../cart/CartContext'
import type { CartItem } from '../cart/CartContext'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


const VALID_TABS: AccountNavKey[] = ['wallet', 'orders', 'productFavorites', 'shopFavorites', 'settings']

const LOGIN_PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,22}$/

function getAuthUserId(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    if (!raw) return null
    return (JSON.parse(raw) as { id?: string })?.id ?? null
  } catch { return null }
}

type SettingsView = 'list' | 'loginPwd' | 'tradePwd' | 'tradePwdEdit' | 'address'

type ApiOrderStatus = 'pending' | 'paid' | 'shipped' | 'in_transit' | 'delivered' | 'completed' | 'return_pending' | 'returned' | 'refund_pending' | 'refunded' | 'cancelled'

interface ApiOrder {
  id: string
  orderNumber: string
  shopId: string
  userId: string
  amount: number
  status: ApiOrderStatus
  trackingNo?: string
  createdAt: string
  address?: {
    recipient?: string
    phoneCode?: string
    phone?: string
    country?: string
    province?: string
    city?: string
    postal?: string
    detail?: string
  }
  items?: Array<{ id: string; productId?: string; title: string; price: number; quantity: number; image?: string; spec?: string }>
}

function mapApiStatusToLocal(status: ApiOrderStatus): OrderStatus {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'paid':
      return 'shipping'   // 客户视角：待发货
    case 'shipped':
      return 'outbound'   // 正在出库
    case 'in_transit':
      return 'transit'    // 正在配送
    case 'delivered':
      return 'signed'     // 已签收
    case 'completed':
      return 'completed'
    case 'return_pending':
      return 'return_pending'
    case 'returned':
      return 'returned'
    case 'refund_pending':
      return 'refund_pending'
    case 'refunded':
      return 'refunded'
    case 'cancelled':
    default:
      return 'cancelled'
  }
}

const AccountCenter: React.FC = () => {
  const { lang } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as AccountNavKey | null
  const [activeKey, setActiveKey] = useState<AccountNavKey>(() =>
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'wallet'
  )
  const [settingsView, setSettingsView] = useState<SettingsView>('list')
  const navigate = useNavigate()
  const location = useLocation()
  const [_tradePwdModalOpen] = useState(false) // 占位，已不再使用

  const [loginPwdOld, setLoginPwdOld] = useState('')
  const [loginPwdNew, setLoginPwdNew] = useState('')
  const [loginPwdConfirm, setLoginPwdConfirm] = useState('')
  const [loginPwdShowOld, setLoginPwdShowOld] = useState(false)
  const [loginPwdShowNew, setLoginPwdShowNew] = useState(false)
  const [loginPwdShowConfirm, setLoginPwdShowConfirm] = useState(false)
  const [loginPwdErrors, setLoginPwdErrors] = useState({ old: '', new: '', confirm: '' })
  const [tradePwdOld, setTradePwdOld] = useState('')
  const [tradePwdNew, setTradePwdNew] = useState('')
  const [tradePwdConfirm, setTradePwdConfirm] = useState('')
  const [tradePwdShowOld, setTradePwdShowOld] = useState(false)
  const [tradePwdShowNew, setTradePwdShowNew] = useState(false)
  const [tradePwdShowConfirm, setTradePwdShowConfirm] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressList, setAddressList] = useState<AddressItem[]>([])
  const [settingsProfile, setSettingsProfile] = useState<{ hasTradePassword: boolean; addresses: AddressItem[] } | null>(null)
  // 关注店铺只走后端持久化（不再使用 localStorage 假数据）
  const [followedShops, setFollowedShops] = useState<FollowedShop[]>([])
  const [logoutSuccessOpen, setLogoutSuccessOpen] = useState(false)
  const [walletHistoryTab, setWalletHistoryTab] = useState<'recharge' | 'withdraw'>('recharge')
  const [walletBalance, setWalletBalance] = useState(0)
  const [rechargeRecords, setRechargeRecords] = useState<WalletRechargeRecord[]>([])
  const [withdrawRecords, setWithdrawRecords] = useState<WalletWithdrawRecord[]>([])
  const [productFavPage, setProductFavPage] = useState(1)
  const [shopFavPage, setShopFavPage] = useState(1)
  const [orderList, setOrderList] = useState<Order[]>([])
  /** 订单 Tab：all | 单状态 | 分组(delivered=待收货=出库+配送+签收, refund=退款/售后) */
  const [orderTab, setOrderTab] = useState<'all' | OrderStatus | 'delivered' | 'refund'>('all')
  const { showToast } = useToast()
  const { productFavorites, refetchFavorites } = useProductFavorites()
  const { replaceCart, items: cartItems, totalAmount: cartTotal, clear: clearCart } = useCart()

  const PRODUCT_FAV_PER_PAGE = 8
  const SHOP_FAV_PER_PAGE = 4
  const productFavTotalPages = Math.max(1, Math.ceil(productFavorites.length / PRODUCT_FAV_PER_PAGE))
  const shopFavTotalPages = Math.max(1, Math.ceil(followedShops.length / SHOP_FAV_PER_PAGE))
  const productFavSlice = productFavorites.slice((productFavPage - 1) * PRODUCT_FAV_PER_PAGE, productFavPage * PRODUCT_FAV_PER_PAGE)
  const shopFavSlice = followedShops.slice((shopFavPage - 1) * SHOP_FAV_PER_PAGE, shopFavPage * SHOP_FAV_PER_PAGE)

  useEffect(() => {
    if (!getAuthUserId()) {
      navigate('/login', { replace: true })
      return
    }
  }, [navigate])

  useEffect(() => {
    if (location.pathname === '/account') {
      document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (activeKey !== 'orders') return
    const uid = getAuthUserId()
    if (!uid) {
      setOrderList([])
      return
    }
    let cancelled = false
    api
      .get<{ list: ApiOrder[] }>(`/api/orders?userId=${encodeURIComponent(uid)}`)
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.list) ? res.list : []
        const mapped: Order[] = list.map((o) => {
          const ts = Date.parse(o.createdAt)
          const createdAt = Number.isNaN(ts) ? Date.now() : ts
          const addr = o.address ?? {}
          return {
            id: o.id,
            orderNumber: o.orderNumber || o.id,
            status: mapApiStatusToLocal(o.status),
            items: (o.items ?? []).map((it) => ({
              id: it.id,
              title: it.title,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              spec: it.spec,
            })),
            address: {
              recipient: addr.recipient ?? '',
              email: (addr as { email?: string }).email ?? '',
              phoneCode: addr.phoneCode ?? '',
              phone: addr.phone ?? '',
              country: addr.country ?? '',
              province: addr.province ?? '',
              city: addr.city ?? '',
              postal: addr.postal ?? '',
              detail: addr.detail ?? '',
            },
            total: o.amount,
            createdAt,
          }
        })
        setOrderList(mapped)
      })
      .catch(() => {
        if (!cancelled) setOrderList([])
      })
    return () => {
      cancelled = true
    }
  }, [activeKey])

  useEffect(() => {
    if (activeKey !== 'shopFavorites') return
    try {
      const raw = window.localStorage.getItem('authUser')
      const u = raw ? (JSON.parse(raw) as { id?: string }) : null
      if (u?.id) {
        api.get<{ list: Array<{ shopId: string; shopName: string | null; shopLogo?: string | null }> }>(`/api/users/${u.id}/followed-shops`)
          .then((res) => {
            const list = Array.isArray(res.list) ? res.list.map((s) => ({ id: s.shopId, name: s.shopName ?? s.shopId, logo: s.shopLogo ?? null })) : []
            setFollowedShops(list)
          })
          .catch(() => setFollowedShops([]))
      } else {
        setFollowedShops([])
      }
    } catch {
      setFollowedShops([])
    }
  }, [activeKey])

  useEffect(() => {
    if (activeKey === 'productFavorites') refetchFavorites()
  }, [activeKey, refetchFavorites])

  useEffect(() => {
    if (activeKey === 'productFavorites' && productFavPage > productFavTotalPages) setProductFavPage(1)
  }, [activeKey, productFavPage, productFavTotalPages])

  useEffect(() => {
    if (activeKey === 'shopFavorites' && shopFavPage > shopFavTotalPages) setShopFavPage(1)
  }, [activeKey, shopFavPage, shopFavTotalPages])

  useEffect(() => {
    if (activeKey !== 'settings') return
    const uid = getAuthUserId()
    if (!uid) {
      setSettingsProfile(null)
      setAddressList([])
      return
    }
    let cancelled = false
    api.get<{ hasTradePassword: boolean; addresses: unknown[] }>(`/api/users/${uid}`)
      .then((res) => {
        if (cancelled) return
        const addrs = (res.addresses ?? []).map((a) => normalizeAddress(a)).filter((a): a is AddressItem => a !== null)
        setSettingsProfile({ hasTradePassword: !!res.hasTradePassword, addresses: addrs })
        setAddressList(addrs)
      })
      .catch(() => {
        if (!cancelled) {
          setSettingsProfile(null)
          setAddressList([])
        }
      })
    return () => { cancelled = true }
  }, [activeKey])

  useEffect(() => {
    if (activeKey !== 'wallet') return
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    const authUser = raw
      ? (() => {
          try {
            return JSON.parse(raw) as { id?: string; balance?: number }
          } catch {
            return null
          }
        })()
      : null
    if (!authUser?.id) {
      setWalletBalance(0)
      setRechargeRecords([])
      setWithdrawRecords([])
      return
    }

    let cancelled = false

    const fetchWallet = () => {
      // 最新余额
      api
        .get<{ balance?: number }>(`/api/users/${authUser.id}`)
        .then((res) => {
          if (cancelled) return
          const nextBalance = Number.isFinite(Number(res.balance)) ? Number(res.balance) : 0
          setWalletBalance(nextBalance)
          try {
            const nextAuthUser = { ...authUser, balance: nextBalance }
            window.localStorage.setItem('authUser', JSON.stringify(nextAuthUser))
          } catch {
            // ignore
          }
        })
        .catch(() => {
          if (!cancelled) {
            setWalletBalance(authUser.balance ?? 0)
          }
        })

      // 资金申请记录
      api
        .get<{
          list: Array<{
            id: number
            type: string
            amount: number
            status: 'pending' | 'approved' | 'rejected'
            createdAt: string
            orderNo?: string
            rechargeTxNo?: string | null
            rechargeScreenshotUrl?: string | null
            withdrawAddress?: string | null
          }>
        }>(`/api/users/${authUser.id}/fund-applications?pageSize=100`)
        .then((res) => {
          if (cancelled || !res.list) return
          const list = res.list
          const recharge: WalletRechargeRecord[] = list
            .filter((r) => r.type === 'recharge')
            .map((r) => ({
              id: String(r.id),
              createdAt: r.createdAt,
              orderNo: r.orderNo ?? `RCH${r.id}`,
              amount: String(r.amount),
              currency: 'USDT',
              protocol: 'USDT-TRC20',
              status:
                r.status === 'approved'
                  ? ('completed' as const)
                  : r.status === 'rejected'
                  ? ('failed' as const)
                  : ('pending' as const),
              actualAmount: r.status === 'approved' ? String(r.amount) : '—',
              address: '1231231231231',
              transactionNo: r.rechargeTxNo && r.rechargeTxNo.trim() ? r.rechargeTxNo : '—',
              rechargeScreenshotUrl: r.rechargeScreenshotUrl ?? null,
            }))
          const withdraw: WalletWithdrawRecord[] = list
            .filter((r) => r.type === 'withdraw')
            .map((r) => ({
              id: String(r.id),
              createdAt: r.createdAt,
              orderNo: r.orderNo ?? `WD${r.id}`,
              amount: String(Math.abs(r.amount)),
              currency: 'USDT',
              address: r.withdrawAddress || '—',
              status:
                r.status === 'approved'
                  ? ('completed' as const)
                  : r.status === 'rejected'
                  ? ('failed' as const)
                  : ('pending' as const),
            }))
          setRechargeRecords(recharge)
          setWithdrawRecords(withdraw)
        })
        .catch(() => {
          if (!cancelled) {
            setRechargeRecords([])
            setWithdrawRecords([])
          }
        })
    }

    // 立即拉一次
    fetchWallet()
    // 每 5 秒自动刷新一次，实现实时感知后台审核
    const timer = window.setInterval(fetchWallet, 5000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [activeKey, location.pathname])

  const openAddressModalForNew = () => {
    setEditingAddressId(null)
    setAddressModalOpen(true)
  }

  const openAddressModalForEdit = (item: AddressItem) => {
    setEditingAddressId(item.id)
    setAddressModalOpen(true)
  }

  const handleAddressSuccess = (item: AddressItem) => {
    let nextList: AddressItem[]
    if (editingAddressId) {
      nextList = addressList.map((a) => (a.id === editingAddressId ? item : a))
    } else {
      nextList = [...addressList, item]
    }
    if (item.isDefault) {
      nextList = nextList.map((a) => ({ ...a, isDefault: a.id === item.id }))
    }
    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { addresses: nextList })
      .then(() => {
        setAddressList(nextList)
        setAddressModalOpen(false)
        setEditingAddressId(null)
        showToast(
          editingAddressId
            ? (tr(lang, { zh: '修改成功', en: 'Updated successfully', de: 'Erfolgreich aktualisiert', ja: '正常に更新されました', ko: '업데이트되었습니다.', es: 'Actualizado exitosamente', it: 'Aggiornato con successo', vi: 'Đã cập nhật thành công', fr: 'Mis à jour avec succès' }))
            : (tr(lang, { zh: '保存成功', en: 'Saved successfully', de: 'Erfolgreich gespeichert', ja: '正常に保存されました', ko: '성공적으로 저장되었습니다', es: 'Guardado exitosamente', it: 'Salvato con successo', vi: 'Đã lưu thành công', fr: 'Enregistré avec succès' })),
        )
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '保存失败', en: 'Save failed', de: 'Speichern fehlgeschlagen', ja: '保存に失敗しました', ko: '저장 실패', es: 'Error al guardar', it: 'Salvataggio non riuscito', vi: 'Lưu không thành công', fr: 'Échec de l\'enregistrement' })
        showToast(err instanceof Error ? err.message : fallback, 'error')
      })
  }

  const getCountryLabel = (code: string) => COUNTRY_OPTIONS.find((c) => c.value === code)?.label ?? code
  const getRegionLabel = (countryCode: string, regionValue: string) => {
    const regions = getRegions(countryCode)
    return regions.find((r) => r.value === regionValue)?.label ?? regionValue
  }
  const getCityLabel = (countryCode: string, regionValue: string, cityValue: string) => {
    const cities = getCities(countryCode, regionValue)
    return cities.find((c) => c.value === cityValue)?.label ?? cityValue
  }

  const handleDeleteAddress = (id: string) => {
    const nextList = addressList.filter((a) => a.id !== id)
    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { addresses: nextList })
      .then(() => {
        setAddressList(nextList)
        showToast(tr(lang, { zh: '已删除', en: 'Deleted', de: 'Gelöscht', ja: '削除されました', ko: '삭제됨', es: 'Eliminado', it: 'Eliminato', vi: 'Đã xóa', fr: 'Supprimé' }))
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '删除失败', en: 'Delete failed', de: 'Das Löschen ist fehlgeschlagen', ja: '削除に失敗しました', ko: '삭제 실패', es: 'Error al eliminar', it: 'Eliminazione non riuscita', vi: 'Xóa không thành công', fr: 'Échec de la suppression' })
        showToast(err instanceof Error ? err.message : fallback, 'error')
      })
  }

  const handleSetDefaultAddress = (id: string) => {
    const nextList = addressList.map((a) => ({ ...a, isDefault: a.id === id }))
    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { addresses: nextList })
      .then(() => {
        setAddressList(nextList)
        showToast(tr(lang, { zh: '已设为默认地址', en: 'Set as default address', de: 'Als Standardadresse festlegen', ja: 'デフォルトのアドレスとして設定', ko: '기본 주소로 설정', es: 'Establecer como dirección predeterminada', it: 'Imposta come indirizzo predefinito', vi: 'Đặt làm địa chỉ mặc định', fr: 'Définir comme adresse par défaut' }))
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '设置失败', en: 'Update failed', de: 'Update fehlgeschlagen', ja: 'アップデートに失敗しました', ko: '업데이트 실패', es: 'La actualización falló', it: 'Aggiornamento non riuscito', vi: 'Cập nhật không thành công', fr: 'La mise à jour a échoué' })
        showToast(err instanceof Error ? err.message : fallback, 'error')
      })
  }

  const restrictToSixDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6)

  const handleLoginPwdSubmit = () => {
    const next = { old: '', new: '', confirm: '' }
    if (!loginPwdOld) next.old = tr(lang, { zh: '请输入旧密码', en: 'Please enter your current password', de: 'Bitte geben Sie Ihr aktuelles Passwort ein', ja: '現在のパスワードを入力してください', ko: '현재 비밀번호를 입력해주세요', es: 'Por favor ingrese su contraseña actual', it: 'Inserisci la tua password attuale', vi: 'Vui lòng nhập mật khẩu hiện tại của bạn', fr: 'Veuillez entrer votre mot de passe actuel' })
    if (!loginPwdNew) {
      next.new = tr(lang, { zh: '请输入新密码', en: 'Please enter a new password', de: 'Bitte geben Sie ein neues Passwort ein', ja: '新しいパスワードを入力してください', ko: '새로운 비밀번호를 입력해주세요', es: 'Por favor ingrese una nueva contraseña', it: 'Inserisci una nuova password', vi: 'Vui lòng nhập mật khẩu mới', fr: 'Veuillez entrer un nouveau mot de passe' })
    } else if (!LOGIN_PWD_REGEX.test(loginPwdNew)) {
      next.new =
        tr(lang, { zh: '密码需为 6-22 位字母和数字组合', en: 'Password must be 6–22 characters with letters and numbers', de: 'Das Passwort muss 6–22 Zeichen lang sein und Buchstaben und Zahlen enthalten', ja: 'パスワードは文字と数字を含む 6 ～ 22 文字にする必要があります', ko: '비밀번호는 6~22자 영문, 숫자로 구성되어야 합니다.', es: 'La contraseña debe tener entre 6 y 22 caracteres con letras y números.', it: 'La password deve contenere da 6 a 22 caratteri con lettere e numeri', vi: 'Mật khẩu phải có 6–22 ký tự bao gồm chữ cái và số', fr: 'Le mot de passe doit contenir entre 6 et 22 caractères avec des lettres et des chiffres' })
    }
    if (!loginPwdConfirm) {
      next.confirm =
        tr(lang, { zh: '请再次输入新密码', en: 'Please confirm your new password', de: 'Bitte bestätigen Sie Ihr neues Passwort', ja: '新しいパスワードを確認してください', ko: '새 비밀번호를 확인해 주세요.', es: 'Por favor confirma tu nueva contraseña', it: 'Per favore conferma la tua nuova password', vi: 'Vui lòng xác nhận mật khẩu mới của bạn', fr: 'Veuillez confirmer votre nouveau mot de passe' })
    } else if (loginPwdConfirm !== loginPwdNew) {
      next.confirm =
        tr(lang, { zh: '两次输入的密码不一致', en: 'The two passwords do not match', de: 'Die beiden Passwörter stimmen nicht überein', ja: '2 つのパスワードが一致しません', ko: '두 비밀번호가 일치하지 않습니다.', es: 'Las dos contraseñas no coinciden', it: 'Le due password non corrispondono', vi: 'Hai mật khẩu không khớp', fr: 'Les deux mots de passe ne correspondent pas' })
    }

    setLoginPwdErrors(next)
    if (next.old || next.new || next.confirm) return

    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.post(`/api/users/${uid}/change-password`, { oldPassword: loginPwdOld, newPassword: loginPwdNew })
      .then(() => {
        showToast(tr(lang, { zh: '修改成功', en: 'Password updated successfully', de: 'Passwort erfolgreich aktualisiert', ja: 'パスワードが正常に更新されました', ko: '비밀번호가 성공적으로 업데이트되었습니다.', es: 'Contraseña actualizada exitosamente', it: 'Password aggiornata con successo', vi: 'Đã cập nhật mật khẩu thành công', fr: 'Mot de passe mis à jour avec succès' }))
        setLoginPwdOld('')
        setLoginPwdNew('')
        setLoginPwdConfirm('')
        setLoginPwdErrors({ old: '', new: '', confirm: '' })
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '修改失败', en: 'Update failed', de: 'Update fehlgeschlagen', ja: 'アップデートに失敗しました', ko: '업데이트 실패', es: 'La actualización falló', it: 'Aggiornamento non riuscito', vi: 'Cập nhật không thành công', fr: 'La mise à jour a échoué' })
        const msg = err instanceof Error ? err.message : fallback
        setLoginPwdErrors((e) => ({ ...e, old: msg }))
        showToast(msg, 'error')
      })
  }

  const handleTradePwdSubmit = () => {
    if (tradePwdNew.length !== 6) {
      showToast(
        tr(lang, { zh: '请输入6位数字密码', en: 'Please enter a 6‑digit PIN', de: 'Bitte geben Sie eine 6-stellige PIN ein', ja: '6 桁の PIN を入力してください', ko: '6자리 PIN을 입력하세요.', es: 'Por favor ingrese un PIN de 6 dígitos', it: 'Inserisci un PIN di 6 cifre', vi: 'Vui lòng nhập mã PIN gồm 6 chữ số', fr: 'Veuillez saisir un code PIN à 6 chiffres' }),
        'error',
      )
      return
    }
    if (tradePwdConfirm.length !== 6) {
      showToast(
        tr(lang, { zh: '请输入6位数字密码', en: 'Please enter a 6‑digit PIN', de: 'Bitte geben Sie eine 6-stellige PIN ein', ja: '6 桁の PIN を入力してください', ko: '6자리 PIN을 입력하세요.', es: 'Por favor ingrese un PIN de 6 dígitos', it: 'Inserisci un PIN di 6 cifre', vi: 'Vui lòng nhập mã PIN gồm 6 chữ số', fr: 'Veuillez saisir un code PIN à 6 chiffres' }),
        'error',
      )
      return
    }
    if (tradePwdNew !== tradePwdConfirm) {
      showToast(
        tr(lang, { zh: '两次密码不一致', en: 'The two PIN codes do not match', de: 'Die beiden PIN-Codes stimmen nicht überein', ja: '2 つの PIN コードが一致しません', ko: '두 개의 PIN 코드가 일치하지 않습니다', es: 'Los dos códigos PIN no coinciden', it: 'I due codici PIN non corrispondono', vi: 'Hai mã PIN không khớp nhau', fr: 'Les deux codes PIN ne correspondent pas' }),
        'error',
      )
      return
    }
    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { tradePassword: tradePwdNew })
      .then(() => {
        setSettingsProfile((p) => (p ? { ...p, hasTradePassword: true } : { hasTradePassword: true, addresses: [] }))
        showToast(tr(lang, { zh: '设置成功', en: 'Set successfully', de: 'Erfolgreich eingestellt', ja: '正常に設定されました', ko: '성공적으로 설정되었습니다', es: 'Establecer correctamente', it: 'Impostato correttamente', vi: 'Đặt thành công', fr: 'Définir avec succès' }))
        setTradePwdNew('')
        setTradePwdConfirm('')
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '设置失败', en: 'Operation failed', de: 'Der Vorgang ist fehlgeschlagen', ja: '操作が失敗しました', ko: '작업 실패', es: 'Operación fallida', it: 'Operazione fallita', vi: 'Thao tác không thành công', fr: 'L\'opération a échoué' })
        showToast(err instanceof Error ? err.message : fallback, 'error')
      })
  }

  const handleTradePwdEditSubmit = () => {
    if (tradePwdOld.length !== 6) {
      showToast(
        tr(lang, { zh: '请输入6位数字旧密码', en: 'Please enter your current 6‑digit PIN', de: 'Bitte geben Sie Ihre aktuelle 6-stellige PIN ein', ja: '現在の 6 桁の PIN を入力してください', ko: '현재 6자리 PIN을 입력하세요.', es: 'Ingrese su PIN actual de 6 dígitos', it: 'Inserisci il tuo PIN attuale di 6 cifre', vi: 'Vui lòng nhập mã PIN gồm 6 chữ số hiện tại của bạn', fr: 'Veuillez saisir votre code PIN actuel à 6 chiffres' }),
        'error',
      )
      return
    }
    if (tradePwdNew.length !== 6) {
      showToast(
        tr(lang, { zh: '请输入6位数字新密码', en: 'Please enter a new 6‑digit PIN', de: 'Bitte geben Sie eine neue 6-stellige PIN ein', ja: '新しい 6 桁の PIN を入力してください', ko: '새로운 6자리 PIN을 입력하세요.', es: 'Ingrese un nuevo PIN de 6 dígitos', it: 'Inserisci un nuovo PIN di 6 cifre', vi: 'Vui lòng nhập mã PIN mới gồm 6 chữ số', fr: 'Veuillez saisir un nouveau code PIN à 6 chiffres' }),
        'error',
      )
      return
    }
    if (tradePwdConfirm.length !== 6) {
      showToast(
        tr(lang, { zh: '请再次输入6位数字新密码', en: 'Please confirm your new 6‑digit PIN', de: 'Bitte bestätigen Sie Ihre neue 6-stellige PIN', ja: '新しい 6 桁の PIN を確認してください', ko: '새로운 6자리 PIN을 확인해 주세요.', es: 'Confirme su nuevo PIN de 6 dígitos', it: 'Conferma il tuo nuovo PIN di 6 cifre', vi: 'Vui lòng xác nhận mã PIN 6 chữ số mới của bạn', fr: 'Veuillez confirmer votre nouveau code PIN à 6 chiffres' }),
        'error',
      )
      return
    }
    if (tradePwdNew !== tradePwdConfirm) {
      showToast(
        tr(lang, { zh: '两次密码不一致', en: 'The two PIN codes do not match', de: 'Die beiden PIN-Codes stimmen nicht überein', ja: '2 つの PIN コードが一致しません', ko: '두 개의 PIN 코드가 일치하지 않습니다', es: 'Los dos códigos PIN no coinciden', it: 'I due codici PIN non corrispondono', vi: 'Hai mã PIN không khớp nhau', fr: 'Les deux codes PIN ne correspondent pas' }),
        'error',
      )
      return
    }
    const uid = getAuthUserId()
    if (!uid) {
      showToast(tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }), 'error')
      return
    }
    api.patch(`/api/users/${uid}`, { oldTradePassword: tradePwdOld, tradePassword: tradePwdNew })
      .then(() => {
        showToast(tr(lang, { zh: '修改成功', en: 'PIN updated successfully', de: 'PIN erfolgreich aktualisiert', ja: 'PIN が正常に更新されました', ko: 'PIN이 업데이트되었습니다.', es: 'PIN actualizado correctamente', it: 'PIN aggiornato correttamente', vi: 'Đã cập nhật mã PIN thành công', fr: 'Code PIN mis à jour avec succès' }))
        setTradePwdOld('')
        setTradePwdNew('')
        setTradePwdConfirm('')
      })
      .catch((err: unknown) => {
        const fallback = tr(lang, { zh: '修改失败', en: 'Update failed', de: 'Update fehlgeschlagen', ja: 'アップデートに失敗しました', ko: '업데이트 실패', es: 'La actualización falló', it: 'Aggiornamento non riuscito', vi: 'Cập nhật không thành công', fr: 'La mise à jour a échoué' })
        showToast(err instanceof Error ? err.message : fallback, 'error')
      })
  }

  useEffect(() => {
    const t = searchParams.get('tab') as AccountNavKey | null
    if (t && VALID_TABS.includes(t)) setActiveKey(t)
  }, [searchParams])

  const handleSelect = (key: AccountNavKey) => {
    setActiveKey(key)
    setSearchParams(key === 'wallet' ? {} : { tab: key })
    if (key === 'settings') setSettingsView('list')
  }

  return (
    <div className="account-page">
      <div className="account-inner">
        <AccountSidebar activeKey={activeKey} onSelect={handleSelect} />

        <main className="account-main">
          {activeKey === 'wallet' && (() => {
            return (
            <section className="account-wallet">
              <div className="account-wallet-summary">
                <div className="account-wallet-balance-card">
                  <div className="account-wallet-balance-left">
                    <div className="account-wallet-balance-icon" aria-hidden="true">
                      <img src={walletIcon} alt="" className="account-wallet-balance-icon-img" />
                    </div>
                    <div className="account-wallet-balance-text">
                      <div className="account-wallet-balance-label">
                        {tr(lang, { zh: '账户余额 (USDT)', en: 'Account balance (USDT)', de: 'Kontostand (USDT)', ja: '口座残高 (USDT)', ko: '계좌 잔고(USDT)', es: 'Saldo de cuenta (USDT)', it: 'Saldo del conto (USDT)', vi: 'Số dư tài khoản (USDT)', fr: 'Solde du compte (USDT)' })}
                      </div>
                      <div className="account-wallet-balance-value">{walletBalance.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="account-wallet-balance-actions">
                    <button
                      type="button"
                      className="account-wallet-primary-btn"
                      onClick={() => navigate('/wallet/recharge')}
                    >
                      {tr(lang, { zh: '充值', en: 'Recharge', de: 'Aufladen', ja: 'リチャージ', ko: '재충전', es: 'Recargar', it: 'Ricaricare', vi: 'nạp tiền', fr: 'Recharger' })}
                    </button>
                    <button
                      type="button"
                      className="account-wallet-secondary-btn"
                      onClick={() => navigate('/wallet/withdraw')}
                    >
                      {tr(lang, { zh: '提现', en: 'Withdraw', de: 'Zurückziehen', ja: '撤回する', ko: '철회하다', es: 'Retirar', it: 'Ritirare', vi: 'Rút', fr: 'Retirer' })}
                    </button>
                  </div>
                </div>
              </div>

              <div className="account-wallet-history">
                <div className="account-wallet-history-header">
                  <div className="account-wallet-history-title">
                    {tr(lang, { zh: '钱包历史', en: 'Wallet history', de: 'Wallet-Geschichte', ja: 'ウォレット履歴', ko: '지갑 내역', es: 'Historial de billetera', it: 'Cronologia del portafoglio', vi: 'Lịch sử ví', fr: 'Historique du portefeuille' })}
                  </div>
                  <div className="account-wallet-history-tabs">
                    <button
                      type="button"
                      className={`account-wallet-history-tab${walletHistoryTab === 'recharge' ? ' account-wallet-history-tab--active' : ''}`}
                      onClick={() => setWalletHistoryTab('recharge')}
                    >
                      {tr(lang, { zh: '充值', en: 'Recharge', de: 'Aufladen', ja: 'リチャージ', ko: '재충전', es: 'Recargar', it: 'Ricaricare', vi: 'nạp tiền', fr: 'Recharger' })}
                    </button>
                    <button
                      type="button"
                      className={`account-wallet-history-tab${walletHistoryTab === 'withdraw' ? ' account-wallet-history-tab--active' : ''}`}
                      onClick={() => setWalletHistoryTab('withdraw')}
                    >
                      {tr(lang, { zh: '提现', en: 'Withdraw', de: 'Zurückziehen', ja: '撤回する', ko: '철회하다', es: 'Retirar', it: 'Ritirare', vi: 'Rút', fr: 'Retirer' })}
                    </button>
                  </div>
                </div>

                <div className="account-wallet-table-wrap">
                  <div className="account-wallet-table">
                  {walletHistoryTab === 'recharge' ? (
                    <>
                      <div className="account-wallet-table-head">
                        <span>{tr(lang, { zh: '日期', en: 'Date', de: 'Datum', ja: '日付', ko: '날짜', es: 'Fecha', it: 'Data', vi: 'Ngày', fr: 'Date' })}</span>
                        <span>{tr(lang, { zh: '订单号', en: 'Order No.', de: 'Bestell-Nr.', ja: '注文番号', ko: '주문번호', es: 'Nro. de orden', it: 'Ordine n.', vi: 'Số thứ tự', fr: 'Numéro de commande' })}</span>
                        <span>{tr(lang, { zh: '充值金额', en: 'Recharge amount', de: 'Aufladebetrag', ja: 'チャージ金額', ko: '충전금액', es: 'Monto de recarga', it: 'Importo della ricarica', vi: 'Số tiền nạp', fr: 'Montant de la recharge' })}</span>
                        <span>{tr(lang, { zh: '币种/协议', en: 'Currency / protocol', de: 'Währung/Protokoll', ja: '通貨/プロトコル', ko: '통화/프로토콜', es: 'Moneda / protocolo', it: 'Valuta/protocollo', vi: 'Tiền tệ/giao thức', fr: 'Monnaie/protocole' })}</span>
                        <span>{tr(lang, { zh: '订单状态', en: 'Status', de: 'Status', ja: '状態', ko: '상태', es: 'Estado', it: 'Stato', vi: 'Trạng thái', fr: 'Statut' })}</span>
                        <span>{tr(lang, { zh: '交易截图', en: 'Screenshot', de: 'Screenshot', ja: 'スクリーンショット', ko: '스크린샷', es: 'Captura de pantalla', it: 'Schermata', vi: 'Ảnh chụp màn hình', fr: 'Capture d\'écran' })}</span>
                        <span>{tr(lang, { zh: '实际到账', en: 'Received amount', de: 'Erhaltener Betrag', ja: '受取額', ko: '수령금액', es: 'Monto recibido', it: 'Importo ricevuto', vi: 'Số tiền nhận được', fr: 'Montant reçu' })}</span>
                        <span>{tr(lang, { zh: '充值地址', en: 'Recharge address', de: 'Aufladeadresse', ja: 'リチャージアドレス', ko: '충전 주소', es: 'Dirección de recarga', it: 'Indirizzo di ricarica', vi: 'Địa chỉ nạp tiền', fr: 'Adresse de recharge' })}</span>
                      </div>
                      <div className="account-wallet-table-body">
                        {rechargeRecords.length === 0 ? (
                          <div className="account-wallet-table-body--empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <span className="account-empty-text">
                              {tr(lang, { zh: '暂无数据', en: 'No data', de: 'Keine Daten', ja: 'データなし', ko: '데이터 없음', es: 'Sin datos', it: 'Nessun dato', vi: 'Không có dữ liệu', fr: 'Aucune donnée' })}
                            </span>
                          </div>
                        ) : (
                          rechargeRecords.map((r) => (
                            <div key={r.id} className="account-wallet-table-row">
                              <span>{formatRecordDate(r.createdAt)}</span>
                              <span>{r.orderNo}</span>
                              <span>{r.amount}</span>
                              <span>{r.currency}/{r.protocol}</span>
                              <span>
                                {getWalletStatusLabel(r.status, lang)}
                              </span>
                              <span>
                                {r.rechargeScreenshotUrl ? (
                                  <a href={r.rechargeScreenshotUrl} target="_blank" rel="noopener noreferrer" className="account-wallet-screenshot-link" title={tr(lang, { zh: '查看大图', en: 'View', de: 'Sicht', ja: 'ビュー', ko: '보다', es: 'Vista', it: 'Visualizzazione', vi: 'Xem', fr: 'Voir' })}>
                                    <img src={r.rechargeScreenshotUrl} alt="" className="account-wallet-screenshot-thumb" />
                                  </a>
                                ) : (
                                  r.transactionNo ?? '—'
                                )}
                              </span>
                              <span>{r.actualAmount}</span>
                              <span>{r.address}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="account-wallet-table-head account-wallet-table-head--withdraw">
                        <span>{tr(lang, { zh: '日期', en: 'Date', de: 'Datum', ja: '日付', ko: '날짜', es: 'Fecha', it: 'Data', vi: 'Ngày', fr: 'Date' })}</span>
                        <span>{tr(lang, { zh: '订单号', en: 'Order No.', de: 'Bestell-Nr.', ja: '注文番号', ko: '주문번호', es: 'Nro. de orden', it: 'Ordine n.', vi: 'Số thứ tự', fr: 'Numéro de commande' })}</span>
                        <span>{tr(lang, { zh: '提现金额', en: 'Withdrawal amount', de: 'Auszahlungsbetrag', ja: '出金額', ko: '출금금액', es: 'Monto del retiro', it: 'Importo del prelievo', vi: 'Số tiền rút', fr: 'Montant du retrait' })}</span>
                        <span>{tr(lang, { zh: '币种', en: 'Currency', de: 'Währung', ja: '通貨', ko: '통화', es: 'Divisa', it: 'Valuta', vi: 'Tiền tệ', fr: 'Devise' })}</span>
                        <span>{tr(lang, { zh: '提现地址', en: 'Withdrawal address', de: 'Auszahlungsadresse', ja: '出金アドレス', ko: '출금주소', es: 'dirección de retiro', it: 'Indirizzo di ritiro', vi: 'Địa chỉ rút tiền', fr: 'Adresse de retrait' })}</span>
                        <span>{tr(lang, { zh: '订单状态', en: 'Status', de: 'Status', ja: '状態', ko: '상태', es: 'Estado', it: 'Stato', vi: 'Trạng thái', fr: 'Statut' })}</span>
                      </div>
                      <div className="account-wallet-table-body">
                        {withdrawRecords.length === 0 ? (
                          <div className="account-wallet-table-body--empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <span className="account-empty-text">
                              {tr(lang, { zh: '暂无数据', en: 'No data', de: 'Keine Daten', ja: 'データなし', ko: '데이터 없음', es: 'Sin datos', it: 'Nessun dato', vi: 'Không có dữ liệu', fr: 'Aucune donnée' })}
                            </span>
                          </div>
                        ) : (
                          withdrawRecords.map((w) => (
                            <div key={w.id} className="account-wallet-table-row account-wallet-table-row--withdraw">
                              <span>{formatRecordDate(w.createdAt)}</span>
                              <span>{w.orderNo}</span>
                              <span>{w.amount}</span>
                              <span>{w.currency}</span>
                              <span>{w.address}</span>
                              <span>
                                {getWalletStatusLabel(w.status, lang)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  </div>
                </div>
              </div>
            </section>
            )
          })()}

          {activeKey === 'orders' && (() => {
            const DELIVERED_STATUSES: OrderStatus[] = ['outbound', 'transit', 'signed']
            const REFUND_STATUSES: OrderStatus[] = ['return_pending', 'returned', 'refund_pending', 'refunded']
            let filteredOrders: Order[] =
              orderTab === 'all'
                ? orderList
                : orderTab === 'delivered'
                  ? orderList.filter((o) => DELIVERED_STATUSES.includes(o.status))
                  : orderTab === 'refund'
                    ? orderList.filter((o) => REFUND_STATUSES.includes(o.status))
                    : orderList.filter((o) => o.status === orderTab)
            const cartPlaceholderAddress = {
              recipient: tr(lang, { zh: '请前往结算页选择', en: 'Please choose on checkout page', de: 'Bitte wählen Sie auf der Checkout-Seite aus', ja: '購入手続きページでお選びください', ko: '결제 페이지에서 선택해주세요.', es: 'Por favor elija en la página de pago', it: 'Si prega di scegliere nella pagina di pagamento', vi: 'Vui lòng chọn trên trang thanh toán', fr: 'Veuillez choisir sur la page de paiement' }),
              email: '',
              phoneCode: '',
              phone: '',
              country: '',
              province: '',
              city: '',
              postal: '',
              detail: tr(lang, { zh: '请前往结算页选择收件地址', en: 'Please choose the address on checkout page', de: 'Bitte wählen Sie die Adresse auf der Checkout-Seite aus', ja: 'チェックアウトページで住所を選択してください', ko: '결제 페이지에서 주소를 선택하세요.', es: 'Elija la dirección en la página de pago', it: 'Si prega di scegliere l\'indirizzo nella pagina di pagamento', vi: 'Vui lòng chọn địa chỉ trên trang thanh toán', fr: 'Veuillez choisir l\'adresse sur la page de paiement' }),
            }
            const cartAsOrder: Order | null = cartItems.length > 0
              ? {
                  id: '__cart__',
                  orderNumber: tr(lang, { zh: '购物车', en: 'Cart', de: 'Warenkorb', ja: 'カート', ko: '카트', es: 'Carro', it: 'Carrello', vi: 'Xe đẩy', fr: 'Panier' }),
                  status: 'pending',
                  items: cartItems as Order['items'],
                  address: cartPlaceholderAddress,
                  total: cartTotal,
                  createdAt: Date.now(),
                }
              : null
            if (cartAsOrder && (orderTab === 'all' || orderTab === 'pending')) {
              filteredOrders = [cartAsOrder, ...filteredOrders]
            }
            const orderTabs: { key: 'all' | OrderStatus | 'delivered' | 'refund'; label: string }[] = [
              { key: 'all', label: tr(lang, { zh: '全部', en: 'All', de: 'Alle', ja: '全て', ko: '모두', es: 'Todo', it: 'Tutto', vi: 'Tất cả', fr: 'Tous' }) },
              { key: 'pending', label: tr(lang, { zh: '待支付', en: 'To pay', de: 'Zu bezahlen', ja: '支払う', ko: '지불하다', es: 'para pagar', it: 'Per pagare', vi: 'Để trả tiền', fr: 'Payer' }) },
              { key: 'shipping', label: tr(lang, { zh: '待发货', en: 'To ship', de: 'Zum Versenden', ja: '発送する', ko: '배송하려면', es: 'para enviar', it: 'Da spedire', vi: 'Gửi hàng', fr: 'Pour expédier' }) },
              { key: 'delivered', label: tr(lang, { zh: '待收货', en: 'To receive', de: 'Empfangen', ja: '受け取るには', ko: '받으려면', es: 'para recibir', it: 'Ricevere', vi: 'Để nhận', fr: 'Pour recevoir' }) },
              { key: 'completed', label: tr(lang, { zh: '订单完成', en: 'Completed', de: 'Vollendet', ja: '完了しました', ko: '완전한', es: 'Terminado', it: 'Completato', vi: 'Hoàn thành', fr: 'Complété' }) },
              { key: 'refund', label: tr(lang, { zh: '退款/售后', en: 'Refund / After‑sales', de: 'Rückerstattung / Kundendienst', ja: '返金・アフターサービス', ko: '환불/애프터서비스', es: 'Reembolso / Postventa', it: 'Rimborso/Post-vendita', vi: 'Hoàn tiền/Sau bán hàng', fr: 'Remboursement / Après-vente' }) },
              { key: 'cancelled', label: tr(lang, { zh: '已取消', en: 'Cancelled', de: 'Abgesagt', ja: 'キャンセル', ko: '취소', es: 'Cancelado', it: 'Annullato', vi: 'Đã hủy', fr: 'Annulé' }) },
            ]
            const formatOrderDate = (ts: number) => {
              const d = new Date(ts)
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
            }
            const handlePayOrder = (order: Order) => {
              if (order.id === '__cart__') {
                navigate('/checkout')
                return
              }
              replaceCart(order.items as CartItem[])
              navigate(`/checkout?orderId=${order.id}`)
            }
            const handleCancelOrder = (orderId: string) => {
              if (orderId === '__cart__') {
                clearCart()
                showToast(tr(lang, { zh: '已清空购物车', en: 'Cart cleared', de: 'Warenkorb geleert', ja: 'カートが空になりました', ko: '장바구니가 비워졌습니다.', es: 'Carrito borrado', it: 'Carrello svuotato', vi: 'Đã xóa giỏ hàng', fr: 'Panier vidé' }))
                return
              }
              api
                .patch(`/api/orders/${encodeURIComponent(orderId)}`, { status: 'cancelled' })
                .then(() => {
                  setOrderList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } as Order : o)))
                  showToast(tr(lang, { zh: '订单已取消', en: 'Order cancelled', de: 'Bestellung storniert', ja: '注文がキャンセルされました', ko: '주문이 취소됨', es: 'Orden cancelada', it: 'Ordine annullato', vi: 'Đơn hàng bị hủy', fr: 'Commande annulée' }))
                })
                .catch((e: unknown) => {
                  const fallback = tr(lang, { zh: '取消订单失败', en: 'Failed to cancel the order', de: 'Die Bestellung konnte nicht storniert werden', ja: '注文のキャンセルに失敗しました', ko: '주문을 취소하지 못했습니다.', es: 'No se pudo cancelar el pedido', it: 'Impossibile annullare l\'ordine', vi: 'Không thể hủy đơn hàng', fr: 'Impossible d\'annuler la commande' })
                  showToast(e instanceof Error ? e.message : fallback, 'error')
                })
            }

            const handleConfirmOrder = (orderId: string) => {
              if (orderId === '__cart__') return
              api
                .patch(`/api/orders/${encodeURIComponent(orderId)}`, { status: 'completed' })
                .then(() => {
                  setOrderList((prev) =>
                    prev.map((o) =>
                      o.id === orderId ? ({ ...o, status: 'completed' } as Order) : o,
                    ),
                  )
                  showToast(tr(lang, { zh: '已确认收货', en: 'Order confirmed received', de: 'Bestellung bestätigt erhalten', ja: '注文確認済み', ko: '주문 확인됨', es: 'Pedido confirmado recibido', it: 'Ordine confermato ricevuto', vi: 'Đơn hàng được xác nhận đã nhận', fr: 'Commande confirmée reçue' }))
                })
                .catch((e: unknown) => {
                  const fallback = tr(lang, { zh: '确认收货失败', en: 'Failed to confirm receipt', de: 'Der Empfang konnte nicht bestätigt werden', ja: '受信確認に失敗しました', ko: '영수증 확인 실패', es: 'No se pudo confirmar la recepción', it: 'Impossibile confermare la ricezione', vi: 'Không thể xác nhận đã nhận', fr: 'Échec de la confirmation de la réception' })
                  showToast(e instanceof Error ? e.message : fallback, 'error')
                })
            }

            const handleRequestReturn = (orderId: string) => {
              if (orderId === '__cart__') return
              api
                .patch(`/api/orders/${encodeURIComponent(orderId)}`, { status: 'return_pending' })
                .then(() => {
                  setOrderList((prev) =>
                    prev.map((o) =>
                      o.id === orderId ? ({ ...o, status: 'return_pending' } as Order) : o,
                    ),
                  )
                  showToast(tr(lang, { zh: '已提交退货申请', en: 'Return request submitted', de: 'Rückgabeantrag eingereicht', ja: '返品リクエストが送信されました', ko: '반품 요청이 제출되었습니다.', es: 'Solicitud de devolución enviada', it: 'Richiesta di reso inviata', vi: 'Đã gửi yêu cầu trả lại', fr: 'Demande de retour soumise' }))
                })
                .catch((e: unknown) => {
                  const fallback = tr(lang, { zh: '申请退货失败', en: 'Failed to submit return request', de: 'Rücksendeantrag konnte nicht gesendet werden', ja: '返品リクエストの送信に失敗しました', ko: '반품 요청을 제출하지 못했습니다.', es: 'No se pudo enviar la solicitud de devolución', it: 'Impossibile inviare la richiesta di reso', vi: 'Không thể gửi yêu cầu trả lại', fr: 'Échec de la soumission de la demande de retour' })
                  showToast(e instanceof Error ? e.message : fallback, 'error')
                })
            }
            return (
              <section className="account-orders">
                <h1 className="account-orders-title">
                  {tr(lang, { zh: '我的订单', en: 'My orders', de: 'Meine Bestellungen', ja: '私の注文', ko: '내 주문', es: 'mis pedidos', it: 'I miei ordini', vi: 'Đơn đặt hàng của tôi', fr: 'Mes commandes' })}
                </h1>
                <div className="account-orders-tabs">
                  {orderTabs.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={`account-orders-tab${orderTab === key ? ' account-orders-tab--active' : ''}`}
                      onClick={() => setOrderTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="account-orders-empty">
                    <img
                      src={kongtai}
                      alt={tr(lang, { zh: '暂无订单', en: 'No orders yet', de: 'Noch keine Bestellungen', ja: 'まだ注文はありません', ko: '아직 주문이 없습니다', es: 'Aún no hay pedidos', it: 'Nessun ordine ancora', vi: 'Chưa có đơn đặt hàng nào', fr: 'Aucune commande pour l\'instant' })}
                      className="account-empty-img"
                    />
                    <div className="account-empty-text">
                      {orderTab === 'all'
                        ? (tr(lang, { zh: '暂无订单', en: 'No orders yet', de: 'Noch keine Bestellungen', ja: 'まだ注文はありません', ko: '아직 주문이 없습니다', es: 'Aún no hay pedidos', it: 'Nessun ordine ancora', vi: 'Chưa có đơn đặt hàng nào', fr: 'Aucune commande pour l\'instant' }))
                        : tr(lang, {
                            zh: `暂无${orderTabs.find((t) => t.key === orderTab)?.label ?? ''}订单`,
                            en: 'No orders under this filter',
                            de: 'Keine Bestellungen unter diesem Filter',
                            ja: 'このフィルターに該当する注文はありません',
                            ko: '이 필터에 해당하는 주문이 없습니다',
                            es: 'No hay pedidos con este filtro',
                            it: 'Nessun ordine con questo filtro',
                            vi: 'Không có đơn hàng theo bộ lọc này',
                            fr: 'Aucune commande pour ce filtre',
                          })}
                    </div>
                  </div>
                ) : (
                  <ul className="account-orders-list">
                    {filteredOrders.map((order) => (
                      <li key={order.id} className="account-order-card">
                        <div className="account-order-card-header">
                          <span className="account-order-card-no">
                            {order.id === '__cart__'
                              ? (tr(lang, { zh: '购物车', en: 'Cart', de: 'Warenkorb', ja: 'カート', ko: '카트', es: 'Carro', it: 'Carrello', vi: 'Xe đẩy', fr: 'Panier' }))
                              : tr(lang, {
                                  zh: `订单号：${order.orderNumber}`,
                                  en: `Order No: ${order.orderNumber}`,
                                  de: `Bestellnr.: ${order.orderNumber}`,
                                  ja: `注文番号：${order.orderNumber}`,
                                  ko: `주문 번호: ${order.orderNumber}`,
                                  es: `N.º de pedido: ${order.orderNumber}`,
                                  it: `N. ordine: ${order.orderNumber}`,
                                  vi: `Mã đơn: ${order.orderNumber}`,
                                  fr: `N° de commande : ${order.orderNumber}`,
                                })}
                          </span>
                          {order.id !== '__cart__' && (
                            <span className="account-order-card-date">{formatOrderDate(order.createdAt)}</span>
                          )}
                          <span className={`account-order-card-status account-order-card-status--${order.status}`}>
                            {getOrderStatusLabel(order.status, lang)}
                          </span>
                        </div>
                        <div className="account-order-card-body">
                          <div className="account-order-card-items">
                            {order.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="account-order-card-item">
                                {item.image ? (
                                  <img src={item.image} alt="" className="account-order-card-item-img" />
                                ) : (
                                  <div className="account-order-card-item-placeholder" />
                                )}
                                <span className="account-order-card-item-title">{item.title}</span>
                                <span className="account-order-card-item-qty">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="account-order-card-more">等{order.items.length}件</span>
                            )}
                          </div>
                          <div className="account-order-card-summary">
                            <div className="account-order-card-addr">
                              {order.id === '__cart__'
                                ? (tr(lang, { zh: '请前往结算页选择收件地址', en: 'Please choose the address on checkout page', de: 'Bitte wählen Sie die Adresse auf der Checkout-Seite aus', ja: 'チェックアウトページで住所を選択してください', ko: '결제 페이지에서 주소를 선택하세요.', es: 'Elija la dirección en la página de pago', it: 'Si prega di scegliere l\'indirizzo nella pagina di pagamento', vi: 'Vui lòng chọn địa chỉ trên trang thanh toán', fr: 'Veuillez choisir l\'adresse sur la page de paiement' }))
                                : `${order.address.recipient} ${order.address.phoneCode} ${order.address.phone} ${order.address.detail}`}
                            </div>
                            <div className="account-order-card-total">
                              {tr(lang, { zh: '合计：', en: 'Total: ', de: 'Gesamt:', ja: '合計：', ko: '총:', es: 'Total:', it: 'Totale:', vi: 'Tổng cộng:', fr: 'Total:' })}
                              <strong>${order.total.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="account-order-card-actions">
                          {order.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="account-order-card-btn account-order-card-btn--primary"
                                onClick={() => handlePayOrder(order)}
                              >
                                {order.id === '__cart__'
                                  ? (tr(lang, { zh: '去结算', en: 'Go to checkout', de: 'Gehen Sie zur Kasse', ja: 'チェックアウトに行く', ko: '결제로 이동', es: 'Ir a pagar', it: 'Vai alla cassa', vi: 'Đi đến thanh toán', fr: 'Passer à la caisse' }))
                                  : (tr(lang, { zh: '去支付', en: 'Pay now', de: 'Bezahlen Sie jetzt', ja: '今すぐお支払いください', ko: '지금 결제', es: 'Paga ahora', it: 'Paga adesso', vi: 'Thanh toán ngay', fr: 'Payez maintenant' }))}
                              </button>
                              <button
                                type="button"
                                className="account-order-card-btn account-order-card-btn--secondary"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                {order.id === '__cart__'
                                  ? (tr(lang, { zh: '清空购物车', en: 'Clear cart', de: 'Warenkorb leeren', ja: 'カートをクリアする', ko: '장바구니 지우기', es: 'Limpiar carrito', it: 'Svuota carrello', vi: 'Xóa giỏ hàng', fr: 'Vider le panier' }))
                                  : (tr(lang, { zh: '取消订单', en: 'Cancel order', de: 'Bestellung stornieren', ja: '注文をキャンセルする', ko: '주문 취소', es: 'Cancelar pedido', it: 'Annulla l\'ordine', vi: 'Hủy đơn hàng', fr: 'Annuler la commande' }))}
                              </button>
                            </>
                          )}
                          {(order.status === 'shipping' || order.status === 'outbound' || order.status === 'transit') && (
                            <button type="button" className="account-order-card-btn account-order-card-btn--secondary">
                              {tr(lang, { zh: '查看物流', en: 'Track shipment', de: 'Sendung verfolgen', ja: '出荷を追跡する', ko: '배송 추적', es: 'Seguimiento del envío', it: 'Traccia la spedizione', vi: 'Theo dõi lô hàng', fr: 'Suivre l\'expédition' })}
                            </button>
                          )}
                          {order.status === 'signed' && (
                            <button
                              type="button"
                              className="account-order-card-btn account-order-card-btn--primary"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              {tr(lang, { zh: '确认收货', en: 'Confirm received', de: 'Bestätigen Sie den Empfang', ja: '受信を確認する', ko: '수신 확인', es: 'Confirmar recibido', it: 'Conferma ricevuta', vi: 'Xác nhận đã nhận', fr: 'Confirmer reçu' })}
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <button
                              type="button"
                              className="account-order-card-btn account-order-card-btn--secondary"
                              onClick={() => handleRequestReturn(order.id)}
                            >
                              {tr(lang, { zh: '申请退货', en: 'Request return', de: 'Rücksendung anfordern', ja: '返品のリクエスト', ko: '반품요청', es: 'Solicitar devolución', it: 'Richiedi il reso', vi: 'Yêu cầu trả lại', fr: 'Demander un retour' })}
                            </button>
                          )}
                          {(order.status === 'return_pending' || order.status === 'returned' || order.status === 'refund_pending' || order.status === 'refunded') && (
                            <button type="button" className="account-order-card-btn account-order-card-btn--secondary">
                              {tr(lang, { zh: '查看详情', en: 'View details', de: 'Details anzeigen', ja: '詳細を見る', ko: '세부정보 보기', es: 'Ver detalles', it: 'Visualizza i dettagli', vi: 'Xem chi tiết', fr: 'Afficher les détails' })}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })()}

          {activeKey === 'productFavorites' && (
            <section className="account-fav-products">
              <header className="account-fav-products-header">
                <span className="account-fav-products-back" aria-hidden="true">
                  &lt;
                </span>
                <h1 className="account-fav-products-title">商品收藏</h1>
              </header>
              {productFavorites.length === 0 ? (
                <div className="account-fav-products-empty">
                  <img
                    src={kongtai}
                    alt={tr(lang, { zh: '暂无商品收藏', en: 'No favorite products yet', de: 'Noch keine Lieblingsprodukte', ja: 'お気に入りの商品はまだありません', ko: '아직 마음에 드는 제품이 없습니다.', es: 'Aún no hay productos favoritos', it: 'Nessun prodotto preferito ancora', vi: 'Chưa có sản phẩm yêu thích', fr: 'Aucun produit favori pour l\'instant' })}
                    className="account-empty-img"
                  />
                  <div className="account-empty-text">
                    {tr(lang, { zh: '暂无数据', en: 'No data', de: 'Keine Daten', ja: 'データなし', ko: '데이터 없음', es: 'Sin datos', it: 'Nessun dato', vi: 'Không có dữ liệu', fr: 'Aucune donnée' })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mall-product-grid account-fav-products-grid card-grid">
                    {productFavSlice.map((item) => (
                      <Link
                        key={String(item.id)}
                        to={`/products/${item.id}`}
                        className="product-card-link"
                      >
                        <ProductCard
                          id={item.id}
                          image={item.image}
                          price={item.price}
                          title={item.title}
                          subtitle={item.subtitle}
                          discount={item.discount}
                          shopId={item.shopId}
                        />
                      </Link>
                    ))}
                  </div>
                  {productFavTotalPages > 1 && (
                    <div className="account-fav-pagination">
                      <button
                        type="button"
                        className="account-fav-pagination-btn"
                        disabled={productFavPage <= 1}
                        onClick={() => setProductFavPage((p) => p - 1)}
                      >
                        {tr(lang, { zh: '上一页', en: 'Previous', de: 'Vorherige', ja: '前の', ko: '이전의', es: 'Anterior', it: 'Precedente', vi: 'Trước', fr: 'Précédent' })}
                      </button>
                      <span className="account-fav-pagination-info">
                        {tr(lang, {
                          zh: `第 ${productFavPage} / ${productFavTotalPages} 页`,
                          en: `Page ${productFavPage} / ${productFavTotalPages}`,
                          de: `Seite ${productFavPage} / ${productFavTotalPages}`,
                          ja: `${productFavPage} / ${productFavTotalPages} ページ`,
                          ko: `${productFavPage} / ${productFavTotalPages} 페이지`,
                          es: `Página ${productFavPage} / ${productFavTotalPages}`,
                          it: `Pagina ${productFavPage} / ${productFavTotalPages}`,
                          vi: `Trang ${productFavPage} / ${productFavTotalPages}`,
                          fr: `Page ${productFavPage} / ${productFavTotalPages}`,
                        })}
                      </span>
                      <button
                        type="button"
                        className="account-fav-pagination-btn"
                        disabled={productFavPage >= productFavTotalPages}
                        onClick={() => setProductFavPage((p) => p + 1)}
                      >
                        {tr(lang, { zh: '下一页', en: 'Next', de: 'Nächste', ja: '次', ko: '다음', es: 'Próximo', it: 'Prossimo', vi: 'Kế tiếp', fr: 'Suivant' })}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {activeKey === 'shopFavorites' && (
            <section className="account-fav-shops">
              <header className="account-fav-shops-header">
                <span className="account-fav-shops-back" aria-hidden="true">
                  &lt;
                </span>
                <h1 className="account-fav-shops-title">
                  {tr(lang, { zh: '关注店铺', en: 'Followed shops', de: 'Gefolgte Geschäfte', ja: 'フォローしたお店', ko: '팔로우한 상점', es: 'Tiendas seguidas', it: 'Negozi seguiti', vi: 'Cửa hàng đã theo dõi', fr: 'Boutiques suivies' })}
                </h1>
              </header>
              {followedShops.length === 0 ? (
                <div className="account-fav-shops-empty">
                  <img
                    src={kongtai}
                    alt={tr(lang, { zh: '暂无关注店铺', en: 'No followed shops yet', de: 'Noch keine Shops, denen ich gefolgt bin', ja: 'まだフォローしているショップはありません', ko: '아직 팔로우한 매장이 없습니다.', es: 'Aún no hay tiendas seguidas', it: 'Nessun negozio seguito ancora', vi: 'Chưa có cửa hàng nào được theo dõi', fr: 'Aucune boutique suivie pour l\'instant' })}
                    className="account-empty-img"
                  />
                  <div className="account-empty-text">
                    {tr(lang, { zh: '暂无数据', en: 'No data', de: 'Keine Daten', ja: 'データなし', ko: '데이터 없음', es: 'Sin datos', it: 'Nessun dato', vi: 'Không có dữ liệu', fr: 'Aucune donnée' })}
                  </div>
                </div>
              ) : (
                <>
                  <ul className="account-fav-shops-list">
                    {shopFavSlice.map((shop) => (
                      <li key={shop.id} className="account-fav-shops-item">
                        <Link to={`/shops/${shop.id}`} className="account-fav-shops-item-link">
                          <span className="account-fav-shops-item-avatar" aria-hidden="true">
                            {shop.logo ? (
                              <img src={shop.logo} alt="" className="account-fav-shops-item-avatar-img" />
                            ) : (
                              shop.name.charAt(0)
                            )}
                          </span>
                          <div className="account-fav-shops-item-info">
                            <span className="account-fav-shops-item-name">{shop.name}</span>
                            <span className="account-fav-shops-item-enter">
                              {tr(lang, { zh: '进入店铺', en: 'Enter shop', de: 'Laden betreten', ja: '店に入る', ko: '가게에 들어가세요', es: 'Entrar a la tienda', it: 'Entra nel negozio', vi: 'Vào cửa hàng', fr: 'Entrez dans la boutique' })}
                            </span>
                          </div>
                          <span className="account-fav-shops-item-arrow" aria-hidden="true">›</span>
                        </Link>
                        <button
                          type="button"
                          className="account-fav-shops-item-unfollow"
                          onClick={(e) => {
                            e.preventDefault()
                            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
                            const u = raw ? (() => { try { return JSON.parse(raw) as { id?: string } } catch { return null } })() : null
                            if (u?.id) {
                              api.delete(`/api/users/${u.id}/followed-shops/${encodeURIComponent(shop.id)}`)
                                .then(() => {
                                  setFollowedShops((prev) => prev.filter((s) => s.id !== shop.id))
                                  showToast(tr(lang, { zh: '已取消关注', en: 'Unfollowed', de: 'Nicht verfolgt', ja: 'フォローされていません', ko: '팔로우하지 않음', es: 'No seguido', it: 'Non seguito', vi: 'Đã hủy theo dõi', fr: 'Non suivi' }))
                                })
                                .catch(() =>
                                  showToast(
                                    tr(lang, { zh: '操作失败', en: 'Operation failed', de: 'Der Vorgang ist fehlgeschlagen', ja: '操作が失敗しました', ko: '작업 실패', es: 'Operación fallida', it: 'Operazione fallita', vi: 'Thao tác không thành công', fr: 'L\'opération a échoué' }),
                                    'error',
                                  ),
                                )
                            }
                          }}
                        >
                          {tr(lang, { zh: '取消关注', en: 'Unfollow', de: 'Nicht mehr folgen', ja: 'フォローを解除する', ko: '언팔로우', es: 'Dejar de seguir', it: 'Smetti di seguire', vi: 'Hủy theo dõi', fr: 'Ne plus suivre' })}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {shopFavTotalPages > 1 && (
                    <div className="account-fav-pagination">
                      <button
                        type="button"
                        className="account-fav-pagination-btn"
                        disabled={shopFavPage <= 1}
                        onClick={() => setShopFavPage((p) => p - 1)}
                      >
                        {tr(lang, { zh: '上一页', en: 'Previous', de: 'Vorherige', ja: '前の', ko: '이전의', es: 'Anterior', it: 'Precedente', vi: 'Trước', fr: 'Précédent' })}
                      </button>
                      <span className="account-fav-pagination-info">
                        {tr(lang, {
                          zh: `第 ${shopFavPage} / ${shopFavTotalPages} 页`,
                          en: `Page ${shopFavPage} / ${shopFavTotalPages}`,
                          de: `Seite ${shopFavPage} / ${shopFavTotalPages}`,
                          ja: `${shopFavPage} / ${shopFavTotalPages} ページ`,
                          ko: `${shopFavPage} / ${shopFavTotalPages} 페이지`,
                          es: `Página ${shopFavPage} / ${shopFavTotalPages}`,
                          it: `Pagina ${shopFavPage} / ${shopFavTotalPages}`,
                          vi: `Trang ${shopFavPage} / ${shopFavTotalPages}`,
                          fr: `Page ${shopFavPage} / ${shopFavTotalPages}`,
                        })}
                      </span>
                      <button
                        type="button"
                        className="account-fav-pagination-btn"
                        disabled={shopFavPage >= shopFavTotalPages}
                        onClick={() => setShopFavPage((p) => p + 1)}
                      >
                        {tr(lang, { zh: '下一页', en: 'Next', de: 'Nächste', ja: '次', ko: '다음', es: 'Próximo', it: 'Prossimo', vi: 'Kế tiếp', fr: 'Suivant' })}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {activeKey === 'settings' && (
            <section className="account-settings">
              {settingsView === 'list' ? (
                <>
                  <h1 className="account-settings-title">
                    {tr(lang, { zh: '设置', en: 'Settings', de: 'Einstellungen', ja: '設定', ko: '설정', es: 'Ajustes', it: 'Impostazioni', vi: 'Cài đặt', fr: 'Paramètres' })}
                  </h1>
                  <div className="account-settings-list">
                    <button
                      type="button"
                      className="account-settings-item"
                      onClick={() => setSettingsView('loginPwd')}
                    >
                      {tr(lang, { zh: '登录密码', en: 'Login password', de: 'Login-Passwort', ja: 'ログインパスワード', ko: '로그인 비밀번호', es: 'Contraseña de inicio de sesión', it: 'Password di accesso', vi: 'Mật khẩu đăng nhập', fr: 'Mot de passe de connexion' })}
                    </button>
                    <button
                      type="button"
                      className="account-settings-item"
                      onClick={() => setSettingsView(settingsProfile?.hasTradePassword ? 'tradePwdEdit' : 'tradePwd')}
                    >
                      {tr(lang, { zh: '交易密码', en: 'Payment PIN', de: 'Zahlungs-PIN', ja: '支払い暗証番号', ko: '결제 PIN', es: 'PIN de pago', it: 'PIN di pagamento', vi: 'Mã PIN thanh toán', fr: 'Code PIN de paiement' })}
                    </button>
                    <button
                      type="button"
                      className="account-settings-item"
                      onClick={() => setSettingsView('address')}
                    >
                      {tr(lang, { zh: '收件地址', en: 'Shipping addresses', de: 'Versandadressen', ja: '配送先住所', ko: '배송 주소', es: 'Direcciones de envío', it: 'Indirizzi di spedizione', vi: 'Địa chỉ giao hàng', fr: 'Adresses de livraison' })}
                    </button>
                    <button
                      type="button"
                      className="account-settings-item account-settings-item--danger"
                      onClick={() => {
                        try {
                          window.localStorage.removeItem('authUser')
                        } catch {}
                        setLogoutSuccessOpen(true)
                      }}
                    >
                      {tr(lang, { zh: '账号注销', en: 'Log out', de: 'Abmelden', ja: 'ログアウト', ko: '로그아웃', es: 'Finalizar la sesión', it: 'Esci', vi: 'Đăng xuất', fr: 'Se déconnecter' })}
                    </button>
                  </div>
                </>
              ) : settingsView === 'address' ? (
                <>
                  <header className="account-address-header">
                    <button
                      type="button"
                      className="wallet-recharge-back"
                      aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
                      onClick={() => setSettingsView('list')}
                    >
                      &lt;
                    </button>
                    <h1 className="account-address-title">
                      {tr(lang, { zh: '收件地址', en: 'Shipping addresses', de: 'Versandadressen', ja: '配送先住所', ko: '배송 주소', es: 'Direcciones de envío', it: 'Indirizzi di spedizione', vi: 'Địa chỉ giao hàng', fr: 'Adresses de livraison' })}
                    </h1>
                    <button
                      type="button"
                      className="account-address-add-btn"
                      onClick={openAddressModalForNew}
                    >
                      <span className="account-address-add-icon" aria-hidden>+</span>
                      {tr(lang, { zh: '新增地址', en: 'Add address', de: 'Adresse hinzufügen', ja: 'アドレスを追加', ko: '주소 추가', es: 'Agregar dirección', it: 'Aggiungi indirizzo', vi: 'Thêm địa chỉ', fr: 'Ajouter une adresse' })}
                    </button>
                  </header>
                  {addressList.length === 0 ? (
                    <div className="account-address-empty">
                      <img src={kongtai} alt="" className="account-empty-img" />
                      <div className="account-empty-text">
                        {tr(lang, { zh: '暂无数据', en: 'No data', de: 'Keine Daten', ja: 'データなし', ko: '데이터 없음', es: 'Sin datos', it: 'Nessun dato', vi: 'Không có dữ liệu', fr: 'Aucune donnée' })}
                      </div>
                    </div>
                  ) : (
                    <ul className="account-address-list">
                      {addressList.map((addr) => (
                        <li key={addr.id} className="account-address-card">
                          {addr.isDefault && (
                            <span className="account-address-default-badge">
                              {tr(lang, { zh: '默认', en: 'Default', de: 'Standard', ja: 'デフォルト', ko: '기본', es: 'Por defecto', it: 'Predefinito', vi: 'Mặc định', fr: 'Défaut' })}
                            </span>
                          )}
                          <div className="account-address-card-body">
                            <p className="account-address-card-name">{addr.recipient}</p>
                            <p className="account-address-card-phone">{addr.phoneCode} {addr.phone}</p>
                            <p className="account-address-card-addr">
                              {getCountryLabel(addr.country)}
                              {addr.province && addr.province !== '_' && ` ${getRegionLabel(addr.country, addr.province)}`}
                              {addr.city && addr.city !== '_' && ` ${getCityLabel(addr.country, addr.province || '_', addr.city)}`}
                              {addr.detail && ` ${addr.detail}`}
                            </p>
                          </div>
                          <div className="account-address-card-actions">
                            <button
                              type="button"
                              className="account-address-card-btn"
                              onClick={() => openAddressModalForEdit(addr)}
                            >
                              {tr(lang, { zh: '编辑', en: 'Edit', de: 'Bearbeiten', ja: '編集', ko: '편집하다', es: 'Editar', it: 'Modificare', vi: 'Biên tập', fr: 'Modifier' })}
                            </button>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                className="account-address-card-btn"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                              >
                                {tr(lang, { zh: '设为默认', en: 'Set as default', de: 'Als Standard festlegen', ja: 'デフォルトとして設定', ko: '기본값으로 설정', es: 'Establecer como predeterminado', it: 'Imposta come predefinito', vi: 'Đặt làm mặc định', fr: 'Définir par défaut' })}
                              </button>
                            )}
                            <button
                              type="button"
                              className="account-address-card-btn account-address-card-btn--danger"
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              {tr(lang, { zh: '删除', en: 'Delete', de: 'Löschen', ja: '消去', ko: '삭제', es: 'Borrar', it: 'Eliminare', vi: 'Xóa bỏ', fr: 'Supprimer' })}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <header className="account-settings-form-header">
                    <button
                      type="button"
                      className="account-settings-back"
                      aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
                      onClick={() => setSettingsView('list')}
                    >
                      &lt;
                    </button>
                    <h1 className="account-settings-form-title">
                      {settingsView === 'loginPwd'
                        ? (tr(lang, { zh: '修改登录密码', en: 'Change login password', de: 'Login-Passwort ändern', ja: 'ログインパスワードを変更する', ko: '로그인 비밀번호 변경', es: 'Cambiar contraseña de inicio de sesión', it: 'Cambia password di accesso', vi: 'Thay đổi mật khẩu đăng nhập', fr: 'Changer le mot de passe de connexion' }))
                        : settingsView === 'tradePwdEdit'
                          ? (tr(lang, { zh: '修改交易密码', en: 'Change payment PIN', de: 'Zahlungs-PIN ändern', ja: '支払い暗証番号の変更', ko: '결제 PIN 변경', es: 'Cambiar PIN de pago', it: 'Modifica PIN di pagamento', vi: 'Thay đổi mã PIN thanh toán', fr: 'Modifier le code PIN de paiement' }))
                          : (tr(lang, { zh: '交易密码设置', en: 'Set payment PIN', de: 'Zahlungs-PIN festlegen', ja: '支払い暗証番号を設定する', ko: '결제 PIN 설정', es: 'Establecer PIN de pago', it: 'Imposta il PIN di pagamento', vi: 'Đặt mã PIN thanh toán', fr: 'Définir le code PIN de paiement' }))}
                    </h1>
                  </header>
                  {settingsView === 'loginPwd' ? (
                    <div className="account-settings-form">
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '旧密码', en: 'Current password', de: 'Aktuelles Passwort', ja: '現在のパスワード', ko: '현재 비밀번호', es: 'Contraseña actual', it: 'Password attuale', vi: 'Mật khẩu hiện tại', fr: 'Mot de passe actuel' })}
                        </label>
                        <div className={`account-settings-input-wrap${loginPwdErrors.old ? ' account-settings-input-wrap--error' : ''}`}>
                          <input
                            type={loginPwdShowOld ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={tr(lang, { zh: '请输入当前密码', en: 'Please enter your current password', de: 'Bitte geben Sie Ihr aktuelles Passwort ein', ja: '現在のパスワードを入力してください', ko: '현재 비밀번호를 입력해주세요', es: 'Por favor ingrese su contraseña actual', it: 'Inserisci la tua password attuale', vi: 'Vui lòng nhập mật khẩu hiện tại của bạn', fr: 'Veuillez entrer votre mot de passe actuel' })}
                            value={loginPwdOld}
                            onChange={(e) => {
                              setLoginPwdOld(e.target.value)
                              if (loginPwdErrors.old) setLoginPwdErrors((prev) => ({ ...prev, old: '' }))
                            }}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                loginPwdShowOld
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide password', de: 'Passwort verbergen', ja: 'パスワードを隠す', ko: '비밀번호 숨기기', es: 'Ocultar contraseña', it: 'Nascondi la password', vi: 'Ẩn mật khẩu', fr: 'Masquer le mot de passe' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show password', de: 'Passwort anzeigen', ja: 'パスワードを表示', ko: '비밀번호 표시', es: 'Mostrar contraseña', it: 'Mostra password', vi: 'Hiển thị mật khẩu', fr: 'Afficher le mot de passe' }))
                              }
                            onClick={() => setLoginPwdShowOld((v) => !v)}
                          >
                            {loginPwdShowOld ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="login-error-slot">
                          {loginPwdErrors.old && <p className="login-error-text">{loginPwdErrors.old}</p>}
                        </div>
                      </div>
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '新密码', en: 'New password', de: 'Neues Passwort', ja: '新しいパスワード', ko: '새 비밀번호', es: 'Nueva contraseña', it: 'Nuova password', vi: 'Mật khẩu mới', fr: 'Nouveau mot de passe' })}
                        </label>
                        <div className={`account-settings-input-wrap${loginPwdErrors.new ? ' account-settings-input-wrap--error' : ''}`}>
                          <input
                            type={loginPwdShowNew ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请设置密码（6-22 位字母和数字组合）', en: '6–22 characters with letters and numbers', de: '6–22 Zeichen mit Buchstaben und Zahlen', ja: '文字と数字を含む 6 ～ 22 文字', ko: '6~22자(문자와 숫자 포함)', es: '6 a 22 caracteres con letras y números', it: '6–22 caratteri con lettere e numeri', vi: '6–22 ký tự có chữ cái và số', fr: '6 à 22 caractères avec lettres et chiffres' })
                            }
                            value={loginPwdNew}
                            onChange={(e) => {
                              setLoginPwdNew(e.target.value)
                              if (loginPwdErrors.new) setLoginPwdErrors((prev) => ({ ...prev, new: '' }))
                            }}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                loginPwdShowNew
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide password', de: 'Passwort verbergen', ja: 'パスワードを隠す', ko: '비밀번호 숨기기', es: 'Ocultar contraseña', it: 'Nascondi la password', vi: 'Ẩn mật khẩu', fr: 'Masquer le mot de passe' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show password', de: 'Passwort anzeigen', ja: 'パスワードを表示', ko: '비밀번호 표시', es: 'Mostrar contraseña', it: 'Mostra password', vi: 'Hiển thị mật khẩu', fr: 'Afficher le mot de passe' }))
                              }
                            onClick={() => setLoginPwdShowNew((v) => !v)}
                          >
                            {loginPwdShowNew ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="login-error-slot">
                          {loginPwdErrors.new && <p className="login-error-text">{loginPwdErrors.new}</p>}
                        </div>
                      </div>
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '确认密码', en: 'Confirm password', de: 'Passwort bestätigen', ja: 'パスワードを認証する', ko: '비밀번호 확인', es: 'Confirmar Contraseña', it: 'Conferma password', vi: 'Xác nhận mật khẩu', fr: 'Confirmez le mot de passe' })}
                        </label>
                        <div className={`account-settings-input-wrap${loginPwdErrors.confirm ? ' account-settings-input-wrap--error' : ''}`}>
                          <input
                            type={loginPwdShowConfirm ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请再次输入密码', en: 'Please enter the password again', de: 'Bitte geben Sie das Passwort erneut ein', ja: 'パスワードをもう一度入力してください', ko: '비밀번호를 다시 입력해주세요', es: 'Por favor ingrese la contraseña nuevamente', it: 'Inserisci nuovamente la password', vi: 'Vui lòng nhập lại mật khẩu', fr: 'Veuillez saisir à nouveau le mot de passe' })
                            }
                            value={loginPwdConfirm}
                            onChange={(e) => {
                              setLoginPwdConfirm(e.target.value)
                              if (loginPwdErrors.confirm) setLoginPwdErrors((prev) => ({ ...prev, confirm: '' }))
                            }}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                loginPwdShowConfirm
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide password', de: 'Passwort verbergen', ja: 'パスワードを隠す', ko: '비밀번호 숨기기', es: 'Ocultar contraseña', it: 'Nascondi la password', vi: 'Ẩn mật khẩu', fr: 'Masquer le mot de passe' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show password', de: 'Passwort anzeigen', ja: 'パスワードを表示', ko: '비밀번호 표시', es: 'Mostrar contraseña', it: 'Mostra password', vi: 'Hiển thị mật khẩu', fr: 'Afficher le mot de passe' }))
                              }
                            onClick={() => setLoginPwdShowConfirm((v) => !v)}
                          >
                            {loginPwdShowConfirm ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="login-error-slot">
                          {loginPwdErrors.confirm && <p className="login-error-text">{loginPwdErrors.confirm}</p>}
                        </div>
                      </div>
                      <button type="button" className="account-settings-submit" onClick={handleLoginPwdSubmit}>
                        {tr(lang, { zh: '确认', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
                      </button>
                    </div>
                  ) : settingsView === 'tradePwdEdit' ? (
                    <div className="account-settings-form">
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '旧密码', en: 'Current PIN', de: 'Aktuelle PIN', ja: '現在のPIN', ko: '현재 PIN', es: 'PIN actual', it: 'PIN attuale', vi: 'Mã PIN hiện tại', fr: 'Code PIN actuel' })}
                        </label>
                        <div className="account-settings-input-wrap">
                          <input
                            type={tradePwdShowOld ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请输入6位数字旧密码', en: 'Please enter your current 6‑digit PIN', de: 'Bitte geben Sie Ihre aktuelle 6-stellige PIN ein', ja: '現在の 6 桁の PIN を入力してください', ko: '현재 6자리 PIN을 입력하세요.', es: 'Ingrese su PIN actual de 6 dígitos', it: 'Inserisci il tuo PIN attuale di 6 cifre', vi: 'Vui lòng nhập mã PIN gồm 6 chữ số hiện tại của bạn', fr: 'Veuillez saisir votre code PIN actuel à 6 chiffres' })
                            }
                            value={tradePwdOld}
                            onChange={(e) => setTradePwdOld(restrictToSixDigits(e.target.value))}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                tradePwdShowOld
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide PIN', de: 'PIN ausblenden', ja: 'PINを隠す', ko: 'PIN 숨기기', es: 'Ocultar PIN', it: 'Nascondi PIN', vi: 'Ẩn mã PIN', fr: 'Masquer le code PIN' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show PIN', de: 'PIN anzeigen', ja: 'PINを表示', ko: 'PIN 표시', es: 'Mostrar PIN', it: 'Mostra PIN', vi: 'Hiển thị mã PIN', fr: 'Afficher le code PIN' }))
                              }
                            onClick={() => setTradePwdShowOld((v) => !v)}
                          >
                            {tradePwdShowOld ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '新密码', en: 'New PIN', de: 'Neue PIN', ja: '新しいPIN', ko: '새 PIN', es: 'Nuevo PIN', it: 'Nuovo PIN', vi: 'Mã PIN mới', fr: 'Nouveau code PIN' })}
                        </label>
                        <div className="account-settings-input-wrap">
                          <input
                            type={tradePwdShowNew ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请输入6位数字密码', en: 'Please enter a new 6‑digit PIN', de: 'Bitte geben Sie eine neue 6-stellige PIN ein', ja: '新しい 6 桁の PIN を入力してください', ko: '새로운 6자리 PIN을 입력하세요.', es: 'Ingrese un nuevo PIN de 6 dígitos', it: 'Inserisci un nuovo PIN di 6 cifre', vi: 'Vui lòng nhập mã PIN mới gồm 6 chữ số', fr: 'Veuillez saisir un nouveau code PIN à 6 chiffres' })
                            }
                            value={tradePwdNew}
                            onChange={(e) => setTradePwdNew(restrictToSixDigits(e.target.value))}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                tradePwdShowNew
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide PIN', de: 'PIN ausblenden', ja: 'PINを隠す', ko: 'PIN 숨기기', es: 'Ocultar PIN', it: 'Nascondi PIN', vi: 'Ẩn mã PIN', fr: 'Masquer le code PIN' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show PIN', de: 'PIN anzeigen', ja: 'PINを表示', ko: 'PIN 표시', es: 'Mostrar PIN', it: 'Mostra PIN', vi: 'Hiển thị mã PIN', fr: 'Afficher le code PIN' }))
                              }
                            onClick={() => setTradePwdShowNew((v) => !v)}
                          >
                            {tradePwdShowNew ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '确认密码', en: 'Confirm PIN', de: 'PIN bestätigen', ja: 'PINの確認', ko: 'PIN 확인', es: 'Confirmar PIN', it: 'Conferma il PIN', vi: 'Xác nhận mã PIN', fr: 'Confirmer le code PIN' })}
                        </label>
                        <div className="account-settings-input-wrap">
                          <input
                            type={tradePwdShowConfirm ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请再次输入6位数字密码', en: 'Please confirm the 6‑digit PIN', de: 'Bitte bestätigen Sie die 6-stellige PIN', ja: '6桁のPINをご確認ください', ko: '6자리 PIN을 확인해 주세요.', es: 'Confirme el PIN de 6 dígitos', it: 'Conferma il PIN di 6 cifre', vi: 'Vui lòng xác nhận mã PIN gồm 6 chữ số', fr: 'Veuillez confirmer le code PIN à 6 chiffres' })
                            }
                            value={tradePwdConfirm}
                            onChange={(e) => setTradePwdConfirm(restrictToSixDigits(e.target.value))}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                tradePwdShowConfirm
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide PIN', de: 'PIN ausblenden', ja: 'PINを隠す', ko: 'PIN 숨기기', es: 'Ocultar PIN', it: 'Nascondi PIN', vi: 'Ẩn mã PIN', fr: 'Masquer le code PIN' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show PIN', de: 'PIN anzeigen', ja: 'PINを表示', ko: 'PIN 표시', es: 'Mostrar PIN', it: 'Mostra PIN', vi: 'Hiển thị mã PIN', fr: 'Afficher le code PIN' }))
                              }
                            onClick={() => setTradePwdShowConfirm((v) => !v)}
                          >
                            {tradePwdShowConfirm ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <button type="button" className="account-settings-submit" onClick={handleTradePwdEditSubmit}>
                        {tr(lang, { zh: '确认', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
                      </button>
                    </div>
                  ) : (
                    <div className="account-settings-form">
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '新密码', en: 'New PIN', de: 'Neue PIN', ja: '新しいPIN', ko: '새 PIN', es: 'Nuevo PIN', it: 'Nuovo PIN', vi: 'Mã PIN mới', fr: 'Nouveau code PIN' })}
                        </label>
                        <div className="account-settings-input-wrap">
                          <input
                            type={tradePwdShowNew ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请输入6位数字密码', en: 'Please enter a new 6‑digit PIN', de: 'Bitte geben Sie eine neue 6-stellige PIN ein', ja: '新しい 6 桁の PIN を入力してください', ko: '새로운 6자리 PIN을 입력하세요.', es: 'Ingrese un nuevo PIN de 6 dígitos', it: 'Inserisci un nuovo PIN di 6 cifre', vi: 'Vui lòng nhập mã PIN mới gồm 6 chữ số', fr: 'Veuillez saisir un nouveau code PIN à 6 chiffres' })
                            }
                            value={tradePwdNew}
                            onChange={(e) => setTradePwdNew(restrictToSixDigits(e.target.value))}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                tradePwdShowNew
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide PIN', de: 'PIN ausblenden', ja: 'PINを隠す', ko: 'PIN 숨기기', es: 'Ocultar PIN', it: 'Nascondi PIN', vi: 'Ẩn mã PIN', fr: 'Masquer le code PIN' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show PIN', de: 'PIN anzeigen', ja: 'PINを表示', ko: 'PIN 표시', es: 'Mostrar PIN', it: 'Mostra PIN', vi: 'Hiển thị mã PIN', fr: 'Afficher le code PIN' }))
                              }
                            onClick={() => setTradePwdShowNew((v) => !v)}
                          >
                            {tradePwdShowNew ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="account-settings-field">
                        <label className="account-settings-label">
                          <span className="account-settings-required">*</span>
                          {tr(lang, { zh: '确认密码', en: 'Confirm PIN', de: 'PIN bestätigen', ja: 'PINの確認', ko: 'PIN 확인', es: 'Confirmar PIN', it: 'Conferma il PIN', vi: 'Xác nhận mã PIN', fr: 'Confirmer le code PIN' })}
                        </label>
                        <div className="account-settings-input-wrap">
                          <input
                            type={tradePwdShowConfirm ? 'text' : 'password'}
                            className="account-settings-input"
                            placeholder={
                              tr(lang, { zh: '请再次输入6位数字密码', en: 'Please confirm the 6‑digit PIN', de: 'Bitte bestätigen Sie die 6-stellige PIN', ja: '6桁のPINをご確認ください', ko: '6자리 PIN을 확인해 주세요.', es: 'Confirme el PIN de 6 dígitos', it: 'Conferma il PIN di 6 cifre', vi: 'Vui lòng xác nhận mã PIN gồm 6 chữ số', fr: 'Veuillez confirmer le code PIN à 6 chiffres' })
                            }
                            value={tradePwdConfirm}
                            onChange={(e) => setTradePwdConfirm(restrictToSixDigits(e.target.value))}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="account-settings-pwd-toggle"
                              aria-label={
                                tradePwdShowConfirm
                                  ? (tr(lang, { zh: '隐藏密码', en: 'Hide PIN', de: 'PIN ausblenden', ja: 'PINを隠す', ko: 'PIN 숨기기', es: 'Ocultar PIN', it: 'Nascondi PIN', vi: 'Ẩn mã PIN', fr: 'Masquer le code PIN' }))
                                  : (tr(lang, { zh: '显示密码', en: 'Show PIN', de: 'PIN anzeigen', ja: 'PINを表示', ko: 'PIN 표시', es: 'Mostrar PIN', it: 'Mostra PIN', vi: 'Hiển thị mã PIN', fr: 'Afficher le code PIN' }))
                              }
                            onClick={() => setTradePwdShowConfirm((v) => !v)}
                          >
                            {tradePwdShowConfirm ? (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l1.66 1.66c.57-.23 1.18-.36 1.83-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 21 21 19.73 4.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                              </svg>
                            ) : (
                              <svg className="account-settings-pwd-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <button type="button" className="account-settings-submit" onClick={handleTradePwdSubmit}>
                        {tr(lang, { zh: '确定', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>

      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => { setAddressModalOpen(false); setEditingAddressId(null) }}
        initialAddress={editingAddressId ? addressList.find((a) => a.id === editingAddressId) ?? null : null}
        onSuccess={handleAddressSuccess}
      />
      <LogoutSuccessModal
        open={logoutSuccessOpen}
        onClose={() => {
          setLogoutSuccessOpen(false)
          navigate('/')
        }}
      />
    </div>
  )
}

export default AccountCenter

