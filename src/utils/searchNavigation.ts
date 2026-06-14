import type { NavigateFunction } from 'react-router-dom'

/** 店铺 ID：S + 5 位数字，如 S10001 */
export const SHOP_ID_PATTERN = /^S\d{5}$/i

export function normalizeShopIdQuery(query: string): string | null {
  const trimmed = query.trim()
  if (!SHOP_ID_PATTERN.test(trimmed)) return null
  return trimmed.toUpperCase()
}

export function isShopIdQuery(query: string): boolean {
  return normalizeShopIdQuery(query) !== null
}

/** 根据搜索词跳转：店铺 ID → 店铺页，否则 → 商品搜索页 */
export function navigateFromSearchQuery(navigate: NavigateFunction, query: string): void {
  const trimmed = query.trim()
  if (!trimmed) {
    navigate('/products')
    return
  }
  const shopId = normalizeShopIdQuery(trimmed)
  if (shopId) {
    navigate(`/shops/${encodeURIComponent(shopId)}`)
    return
  }
  navigate(`/products?keyword=${encodeURIComponent(trimmed)}`)
}
