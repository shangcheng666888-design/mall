/** 店铺后台根地址（构建时由 VITE_MERCHANT_CONSOLE_URL 注入） */
export function getMerchantConsoleBaseUrl(): string {
  const raw = import.meta.env.VITE_MERCHANT_CONSOLE_URL as string | undefined
  const trimmed = raw?.trim().replace(/\/$/, '') ?? ''
  if (!trimmed) return ''
  // 未写 https:// 时浏览器会当成相对路径，例如会跳到 /merchant/xxx.vercel.app/login
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

/** 店铺后台登录页；未配置环境变量时返回 null */
export function getMerchantConsoleLoginUrl(): string | null {
  const base = getMerchantConsoleBaseUrl()
  return base ? `${base}/login` : null
}
