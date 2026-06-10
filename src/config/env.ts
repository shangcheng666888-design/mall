/** 店铺后台根地址（构建时由 VITE_MERCHANT_CONSOLE_URL 注入） */
export function getMerchantConsoleBaseUrl(): string {
  const url = import.meta.env.VITE_MERCHANT_CONSOLE_URL as string | undefined
  return url?.trim().replace(/\/$/, '') ?? ''
}

/** 店铺后台登录页；未配置环境变量时返回 null */
export function getMerchantConsoleLoginUrl(): string | null {
  const base = getMerchantConsoleBaseUrl()
  return base ? `${base}/login` : null
}
