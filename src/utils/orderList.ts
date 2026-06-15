import type { Lang } from '../i18n/lang'
import { tr, type TrMap } from '../i18n/tr'
export type OrderItemSnapshot = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
  spec?: string
}

/** 订单状态（用户端展示） */
export type OrderStatus =
  | 'pending'         // 待支付
  | 'shipping'        // 待发货
  | 'outbound'        // 正在出库
  | 'transit'         // 正在配送
  | 'signed'          // 已签收
  | 'completed'       // 订单完成
  | 'return_pending'  // 申请退货
  | 'returned'        // 已退货
  | 'refund_pending'  // 正在退款
  | 'refunded'        // 已退款
  | 'cancelled'       // 已取消

/** 收件地址快照（下单时保存） */
export type OrderAddressSnapshot = {
  recipient: string
  email: string
  phoneCode: string
  phone: string
  country: string
  province: string
  city: string
  postal: string
  detail: string
}

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItemSnapshot[]
  address: OrderAddressSnapshot
  total: number
  createdAt: number
}

const ORDERS_KEY = 'accountOrders'

function loadRaw(): Order[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ORDERS_KEY) : null
    if (!raw) return []
    const parsed = JSON.parse(raw) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRaw(orders: Order[]) {
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  } catch {}
}

export function loadOrders(): Order[] {
  return loadRaw()
}

export function saveOrder(order: Order) {
  const list = loadRaw()
  const idx = list.findIndex((o) => o.id === order.id)
  if (idx >= 0) {
    list[idx] = order
  } else {
    list.unshift(order)
  }
  saveRaw(list)
}

export function createOrder(params: {
  items: OrderItemSnapshot[]
  address: OrderAddressSnapshot
  total: number
}): Order {
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const order: Order = {
    id,
    orderNumber: `ORD${Date.now()}`,
    status: 'pending',
    items: params.items,
    address: params.address,
    total: params.total,
    createdAt: Date.now(),
  }
  saveOrder(order)
  return order
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const list = loadRaw()
  const order = list.find((o) => o.id === orderId)
  if (!order) return null
  order.status = status
  saveRaw(list)
  return order
}

export function getOrderById(orderId: string): Order | null {
  return loadRaw().find((o) => o.id === orderId) ?? null
}

const ORDER_STATUS_TEXT: Record<OrderStatus, TrMap> = {
  pending: { zh: '待支付', en: 'To pay', de: 'Zu zahlen', ja: '支払い待ち', ko: '결제 대기', es: 'Por pagar', it: 'Da pagare', vi: 'Chờ thanh toán', fr: 'À payer' },
  shipping: { zh: '待发货', en: 'To ship', de: 'Zu versenden', ja: '発送待ち', ko: '발송 대기', es: 'Por enviar', it: 'Da spedire', vi: 'Chờ giao hàng', fr: 'À expédier' },
  outbound: { zh: '正在出库', en: 'Preparing shipment', de: 'Versand wird vorbereitet', ja: '出庫処理中', ko: '출고 중', es: 'Preparando envío', it: 'Preparazione spedizione', vi: 'Đang xuất kho', fr: 'Préparation de l\'expédition' },
  transit: { zh: '正在配送', en: 'In transit', de: 'Unterwegs', ja: '配送中', ko: '배송 중', es: 'En tránsito', it: 'In transito', vi: 'Đang giao', fr: 'En cours de livraison' },
  signed: { zh: '已签收', en: 'Delivered', de: 'Zugestellt', ja: '受取済み', ko: '수령 완료', es: 'Entregado', it: 'Consegnato', vi: 'Đã nhận', fr: 'Livré' },
  completed: { zh: '订单完成', en: 'Completed', de: 'Abgeschlossen', ja: '完了', ko: '완료', es: 'Completado', it: 'Completato', vi: 'Hoàn tất', fr: 'Terminé' },
  return_pending: { zh: '申请退货', en: 'Return requested', de: 'Rückgabe beantragt', ja: '返品申請中', ko: '반품 신청', es: 'Devolución solicitada', it: 'Reso richiesto', vi: 'Yêu cầu trả hàng', fr: 'Retour demandé' },
  returned: { zh: '已退货', en: 'Returned', de: 'Zurückgegeben', ja: '返品済み', ko: '반품 완료', es: 'Devuelto', it: 'Restituito', vi: 'Đã trả hàng', fr: 'Retourné' },
  refund_pending: { zh: '正在退款', en: 'Refund pending', de: 'Rückerstattung ausstehend', ja: '返金処理中', ko: '환불 처리 중', es: 'Reembolso pendiente', it: 'Rimborso in attesa', vi: 'Đang hoàn tiền', fr: 'Remboursement en cours' },
  refunded: { zh: '已退款', en: 'Refunded', de: 'Erstattet', ja: '返金済み', ko: '환불 완료', es: 'Reembolsado', it: 'Rimborsato', vi: 'Đã hoàn tiền', fr: 'Remboursé' },
  cancelled: { zh: '已取消', en: 'Cancelled', de: 'Storniert', ja: 'キャンセル済み', ko: '취소됨', es: 'Cancelado', it: 'Annullato', vi: 'Đã hủy', fr: 'Annulé' },
}

export function getOrderStatusLabel(status: OrderStatus, lang: Lang): string {
  const labels = ORDER_STATUS_TEXT[status]
  return labels ? tr(lang, labels) : status
}
