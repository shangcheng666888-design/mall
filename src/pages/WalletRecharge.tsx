import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountSidebar from '../components/AccountSidebar'
import { useToast } from '../components/ToastProvider'
import { api } from '../api/client'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


function getAuthUserId(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
    if (!raw) return null
    return (JSON.parse(raw) as { id?: string })?.id ?? null
  } catch {
    return null
  }
}

const WalletRecharge: React.FC = () => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/account')
    }
  }
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'USDT' | 'BTC' | 'ETH'>('USDT')
  const [network, setNetwork] = useState<'ETH' | 'BTC' | 'TRC20'>('TRC20')
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [screenshotUploading, setScreenshotUploading] = useState(false)
  const screenshotInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const [tradePwdModalOpen, setTradePwdModalOpen] = useState(false)
  const [tradePwd, setTradePwd] = useState('')
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)
  type PlatformPaymentConfig = {
    receiveAddress: string
    receiveQrUrl: string
    ethAddress?: string
    btcAddress?: string
    trc20Address?: string
    ethQrUrl?: string
    btcQrUrl?: string
    trc20QrUrl?: string
  }
  const [platformPayment, setPlatformPayment] = useState<PlatformPaymentConfig>({
    receiveAddress: '',
    receiveQrUrl: '',
  })

  useEffect(() => {
    api
      .get<PlatformPaymentConfig>('/api/platform-payment-config')
      .then((data) => {
        setPlatformPayment({
          receiveAddress: data.receiveAddress ?? '',
          receiveQrUrl: data.receiveQrUrl ?? '',
          ethAddress: data.ethAddress ?? '',
          btcAddress: data.btcAddress ?? '',
          trc20Address: data.trc20Address ?? '',
          ethQrUrl: data.ethQrUrl ?? '',
          btcQrUrl: data.btcQrUrl ?? '',
          trc20QrUrl: data.trc20QrUrl ?? '',
        })
      })
      .catch(() => {})
  }, [])

  const depositAddress = (() => {
    if (network === 'ETH') return platformPayment.ethAddress || platformPayment.receiveAddress
    if (network === 'BTC') return platformPayment.btcAddress || platformPayment.receiveAddress
    // 默认 TRC20
    return platformPayment.trc20Address || platformPayment.receiveAddress
  })()

  const depositQrUrl = (() => {
    if (network === 'ETH') return platformPayment.ethQrUrl || platformPayment.receiveQrUrl
    if (network === 'BTC') return platformPayment.btcQrUrl || platformPayment.receiveQrUrl
    return platformPayment.trc20QrUrl || platformPayment.receiveQrUrl
  })()

  const tradePwdChars = tradePwd.padEnd(6, ' ').slice(0, 6).split('')
  const amountNum = parseFloat(amount)
  const isAmountFilled = amount.trim() !== '' && !Number.isNaN(amountNum) && amountNum > 0
  const submitDisabled = !isAmountFilled || !screenshotUrl
  const confirmPwdDisabled = tradePwd.length < 6

  const handleTradePwdChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const digit = raw.replace(/\D/g, '').slice(-1)
    setTradePwd((prev) => {
      const chars = prev.split('')
      chars[index] = digit
      return chars.join('').slice(0, 6)
    })

    if (digit && index < 5) {
      const next = e.target.nextElementSibling as HTMLInputElement | null
      next?.focus()
    }
  }

  const handleTradePwdKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return
    e.preventDefault()

    const currentHasValue = !!tradePwdChars[index]?.trim()
    if (currentHasValue) {
      // 删除当前格子的数字，但不跳格
      setTradePwd((prev) => {
        const chars = prev.split('')
        chars[index] = ''
        return chars.join('').slice(0, 6)
      })
      return
    }
    if (index > 0) {
      // 当前为空，再退一格并清除上一格
      setTradePwd((prev) => {
        const chars = prev.split('')
        chars[index - 1] = ''
        return chars.join('').slice(0, 6)
      })
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement | null
      prevInput?.focus()
    }
  }

  const handleCopyAddress = () => {
    const addr = depositAddress
    if (!addr) {
      showToast(tr(lang, { zh: '暂无收款地址', en: 'No deposit address', de: 'Keine Einzahlungsadresse', ja: '入金アドレスがありません', ko: '입금주소 없음', es: 'Sin dirección de depósito', it: 'Nessun indirizzo di deposito', vi: 'Không có địa chỉ gửi tiền', fr: 'Aucune adresse de dépôt' }), 'error')
      return
    }
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(addr)
        .then(() => {
          showToast(tr(lang, { zh: '复制成功', en: 'Copied', de: 'Kopiert', ja: 'コピーされました', ko: '복사됨', es: 'copiado', it: 'Copiato', vi: 'Đã sao chép', fr: 'Copié' }))
        })
        .catch(() => {
          showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
        })
    } else {
      showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
    }
  }

  const handleCopyQrcode = () => {
    const canvas = qrCanvasRef.current
    if (!canvas || typeof navigator === 'undefined' || !(navigator.clipboard as any)) {
      showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
      return
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
        return
      }
      const ClipboardItemCtor = (window as any).ClipboardItem
      if (!ClipboardItemCtor) {
        showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
        return
      }
      const item = new ClipboardItemCtor({ [blob.type]: blob })
      ;(navigator.clipboard as any)
        .write([item])
        .then(() => {
          showToast(tr(lang, { zh: '二维码已复制', en: 'QR code copied', de: 'QR-Code kopiert', ja: 'QRコードをコピーしました', ko: 'QR 코드가 복사되었습니다.', es: 'Código QR copiado', it: 'Codice QR copiato', vi: 'Đã sao chép mã QR', fr: 'Code QR copié' }))
        })
        .catch(() => {
          showToast(tr(lang, { zh: '复制失败', en: 'Copy failed', de: 'Das Kopieren ist fehlgeschlagen', ja: 'コピーに失敗しました', ko: '복사 실패', es: 'Copia fallida', it: 'Copia non riuscita', vi: 'Sao chép không thành công', fr: 'Échec de la copie' }), 'error')
        })
    }, 'image/png')
  }

  useEffect(() => {
    if (depositQrUrl) return
    const canvas = qrCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 160
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#000000'
    const block = 36
    const margin = 10
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x, y, block, block)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + 4, y + 4, block - 8, block - 8)
      ctx.fillStyle = '#000000'
      ctx.fillRect(x + 10, y + 10, block - 20, block - 20)
    }
    drawFinder(margin, margin)
    drawFinder(size - margin - block, margin)
    drawFinder(margin, size - margin - block)
  }, [depositQrUrl])

  return (
    <div className="account-page">
      <div className="account-inner">
        <AccountSidebar activeKey="wallet" />

        <main className="account-main">
          <section className="wallet-recharge">
            <header className="wallet-recharge-header">
              <button
                type="button"
                className="wallet-recharge-back"
                aria-label={tr(lang, { zh: '返回', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
                onClick={goBack}
              >
                &lt;
              </button>
              <h1 className="wallet-recharge-title">
                {tr(lang, { zh: '我的钱包/充值', en: 'My wallet / Recharge', de: 'Mein Portemonnaie / Aufladen', ja: 'マイウォレット / リチャージ', ko: '내 지갑 / 충전', es: 'Mi billetera / Recargar', it: 'Il mio portafoglio/Ricarica', vi: 'Ví của tôi / Nạp tiền', fr: 'Mon portefeuille / Recharger' })}
              </h1>
            </header>

            <div className="wallet-recharge-form">
              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  {tr(lang, { zh: '充值币种', en: 'Top‑up currency', de: 'Aufladewährung', ja: 'チャージ通貨', ko: '충전 통화', es: 'Moneda de recarga', it: 'Valuta di ricarica', vi: 'Tiền tệ nạp thêm', fr: 'Devise de recharge' })}
                </label>
                <div className="wallet-recharge-select-wrap">
                  <select
                    className="wallet-recharge-select"
                    value={currency}
                    onChange={(e) => {
                      const v = e.target.value as 'USDT' | 'BTC' | 'ETH'
                      setCurrency(v)
                      if (v === 'BTC') setNetwork('BTC')
                      else if (v === 'ETH') setNetwork('ETH')
                      else setNetwork('TRC20')
                    }}
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <span className="wallet-recharge-select-caret" aria-hidden>
                    ▾
                  </span>
                </div>
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  {tr(lang, { zh: '区块链网络', en: 'Blockchain network', de: 'Blockchain-Netzwerk', ja: 'ブロックチェーンネットワーク', ko: '블록체인 네트워크', es: 'Red de cadena de bloques', it: 'Rete blockchain', vi: 'Mạng chuỗi khối', fr: 'Réseau blockchain' })}
                </label>
                <div className="wallet-recharge-select-wrap">
                  <select
                    className="wallet-recharge-select"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as 'ETH' | 'BTC' | 'TRC20')}
                  >
                    <option value="ETH">{tr(lang, { zh: 'ETH 网络', en: 'ETH network', de: 'ETH-Netzwerk', ja: 'ETHネットワーク', ko: 'ETH 네트워크', es: 'red ETH', it: 'Rete dell\'ETH', vi: 'mạng ETH', fr: 'Réseau EPF' })}</option>
                    <option value="BTC">{tr(lang, { zh: 'BTC 网络', en: 'BTC network', de: 'BTC-Netzwerk', ja: 'BTCネットワーク', ko: 'BTC 네트워크', es: 'red BTC', it: 'Rete Bitcoin', vi: 'Mạng BTC', fr: 'Réseau BTC' })}</option>
                    <option value="TRC20">{tr(lang, { zh: 'USDT‑TRC20 网络', en: 'USDT‑TRC20 network', de: 'USDT-TRC20-Netzwerk', ja: 'USDT‑TRC20ネットワーク', ko: 'USDT‑TRC20 네트워크', es: 'Red USDT‑TRC20', it: 'Rete USDT‑TRC20', vi: 'Mạng USDT‑TRC20', fr: 'Réseau USDT‑TRC20' })}</option>
                  </select>
                  <span className="wallet-recharge-select-caret" aria-hidden>
                    ▾
                  </span>
                </div>
              </div>

              <div className="wallet-recharge-qrcode-row">
                <div className="wallet-recharge-qrcode-box">
                  {depositQrUrl ? (
                    <img src={depositQrUrl} alt="" className="wallet-recharge-qrcode-placeholder wallet-recharge-qrcode-img" />
                  ) : (
                    <canvas ref={qrCanvasRef} className="wallet-recharge-qrcode-placeholder" aria-hidden="true" />
                  )}
                </div>
                {!depositQrUrl && (
                  <button
                    type="button"
                    className="wallet-recharge-qrcode-save-btn"
                    onClick={handleCopyQrcode}
                  >
                    {tr(lang, { zh: '保存二维码', en: 'Save QR code', de: 'QR-Code speichern', ja: 'QRコードを保存する', ko: 'QR 코드 저장', es: 'Guardar código QR', it: 'Salva il codice QR', vi: 'Lưu mã QR', fr: 'Enregistrer le code QR' })}
                  </button>
                )}
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  {tr(lang, { zh: '充值地址', en: 'Deposit address', de: 'Einzahlungsadresse', ja: '入金アドレス', ko: '입금주소', es: 'Dirección de depósito', it: 'Indirizzo di deposito', vi: 'Địa chỉ gửi tiền', fr: 'Adresse de dépôt' })}
                </label>
                <div className="wallet-recharge-address-row">
                  <input
                    className="wallet-recharge-address-input"
                    value={depositAddress || (tr(lang, { zh: '暂无收款地址', en: 'No deposit address', de: 'Keine Einzahlungsadresse', ja: '入金アドレスがありません', ko: '입금주소 없음', es: 'Sin dirección de depósito', it: 'Nessun indirizzo di deposito', vi: 'Không có địa chỉ gửi tiền', fr: 'Aucune adresse de dépôt' }))}
                    readOnly
                  />
                  <button
                    type="button"
                    className="wallet-recharge-copy-btn"
                    onClick={handleCopyAddress}
                  >
                    {tr(lang, { zh: '复制', en: 'Copy', de: 'Kopie', ja: 'コピー', ko: '복사', es: 'Copiar', it: 'Copia', vi: 'Sao chép', fr: 'Copie' })}
                  </button>
                </div>
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  <span className="wallet-recharge-required">*</span>
                  {tr(lang, { zh: '数量', en: 'Amount', de: 'Menge', ja: '額', ko: '양', es: 'Cantidad', it: 'Quantità', vi: 'Số lượng', fr: 'Montant' })}
                </label>
                <input
                  className="wallet-recharge-input wallet-recharge-input--short"
                  placeholder={
                    tr(lang, { zh: '请输入充值金额', en: 'Please enter the recharge amount', de: 'Bitte geben Sie den Aufladebetrag ein', ja: 'チャージ金額を入力してください', ko: '충전금액을 입력해주세요', es: 'Por favor ingresa el monto de la recarga', it: 'Inserisci l\'importo della ricarica', vi: 'Vui lòng nhập số tiền nạp', fr: 'Veuillez saisir le montant de la recharge' })
                  }
                  value={amount}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d.]/g, '')
                    const parts = v.split('.')
                    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
                    setAmount(v)
                  }}
                />
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  <span className="wallet-recharge-required">*</span>
                  {tr(lang, { zh: '交易截图', en: 'Transaction screenshot', de: 'Screenshot der Transaktion', ja: 'トランザクションのスクリーンショット', ko: '거래 스크린샷', es: 'Captura de pantalla de la transacción', it: 'Schermata della transazione', vi: 'Ảnh chụp màn hình giao dịch', fr: 'Capture d\'écran de la transaction' })}
                </label>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="wallet-recharge-upload-input"
                  aria-label={tr(lang, { zh: '上传交易截图', en: 'Upload transaction screenshot', de: 'Laden Sie den Screenshot der Transaktion hoch', ja: 'トランザクションのスクリーンショットをアップロードする', ko: '거래 스크린샷 업로드', es: 'Cargar captura de pantalla de la transacción', it: 'Carica lo screenshot della transazione', vi: 'Tải lên ảnh chụp màn hình giao dịch', fr: 'Télécharger une capture d\'écran de la transaction' })}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setScreenshotUploading(true)
                    try {
                      const { url } = await api.uploadImage(file)
                      setScreenshotUrl(url)
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : (tr(lang, { zh: '上传失败', en: 'Upload failed', de: 'Der Upload ist fehlgeschlagen', ja: 'アップロードに失敗しました', ko: '업로드 실패', es: 'Error al subir', it: 'Caricamento non riuscito', vi: 'Tải lên không thành công', fr: 'Échec du téléchargement' })), 'error')
                    } finally {
                      setScreenshotUploading(false)
                      e.target.value = ''
                    }
                  }}
                />
                <div
                  className="wallet-recharge-screenshot-area"
                  onClick={() => !screenshotUploading && screenshotInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && screenshotInputRef.current?.click()}
                  aria-label={tr(lang, { zh: '上传交易截图', en: 'Upload transaction screenshot', de: 'Laden Sie den Screenshot der Transaktion hoch', ja: 'トランザクションのスクリーンショットをアップロードする', ko: '거래 스크린샷 업로드', es: 'Cargar captura de pantalla de la transacción', it: 'Carica lo screenshot della transazione', vi: 'Tải lên ảnh chụp màn hình giao dịch', fr: 'Télécharger une capture d\'écran de la transaction' })}
                >
                  {screenshotUploading ? (
                    <span className="wallet-recharge-screenshot-loading">{tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })}</span>
                  ) : screenshotUrl ? (
                    <>
                      <img src={screenshotUrl} alt="" className="wallet-recharge-screenshot-preview" />
                      <span className="wallet-recharge-screenshot-label">{tr(lang, { zh: '点击可重新上传', en: 'Click to replace', de: 'Klicken Sie zum Ersetzen', ja: 'クリックして置き換えます', ko: '교체하려면 클릭하세요.', es: 'Haga clic para reemplazar', it: 'Fare clic per sostituire', vi: 'Bấm để thay thế', fr: 'Cliquez pour remplacer' })}</span>
                    </>
                  ) : (
                    <>
                      <svg className="wallet-recharge-screenshot-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="wallet-recharge-screenshot-text">{tr(lang, { zh: '点击上传', en: 'Click to upload', de: 'Klicken Sie zum Hochladen', ja: 'クリックしてアップロード', ko: '업로드하려면 클릭하세요.', es: 'Haga clic para cargar', it: 'Fare clic per caricare', vi: 'Bấm để tải lên', fr: 'Cliquez pour télécharger' })}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="wallet-recharge-submit"
                disabled={submitDisabled}
                onClick={() => setTradePwdModalOpen(true)}
              >
                {tr(lang, { zh: '确定', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
              </button>
            </div>

            {tradePwdModalOpen && (
              <div
                className="account-tradepwd-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="wallet-recharge-tradepwd-title"
                onClick={() => setTradePwdModalOpen(false)}
              >
                <div
                  className="account-tradepwd-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="account-tradepwd-close"
                    aria-label={tr(lang, { zh: '关闭', en: 'Close', de: 'Schließen', ja: '近い', ko: '닫다', es: 'Cerca', it: 'Vicino', vi: 'Đóng', fr: 'Fermer' })}
                    onClick={() => setTradePwdModalOpen(false)}
                  >
                    ×
                  </button>
                  <h2 id="wallet-recharge-tradepwd-title" className="account-tradepwd-title">
                    {tr(lang, { zh: '输入交易密码', en: 'Enter payment PIN', de: 'Geben Sie die Zahlungs-PIN ein', ja: '支払い暗証番号を入力してください', ko: '결제 PIN 입력', es: 'Ingrese el PIN de pago', it: 'Inserisci il PIN di pagamento', vi: 'Nhập mã PIN thanh toán', fr: 'Saisissez le code PIN de paiement' })}
                  </h2>
                  <p className="account-tradepwd-subtitle">
                    {tr(lang, { zh: '请输入交易密码', en: 'Please enter your payment PIN', de: 'Bitte geben Sie Ihre Zahlungs-PIN ein', ja: '支払いPINを入力してください', ko: '결제 PIN을 입력하세요.', es: 'Por favor ingrese su PIN de pago', it: 'Inserisci il PIN di pagamento', vi: 'Vui lòng nhập mã PIN thanh toán của bạn', fr: 'Veuillez saisir votre code PIN de paiement' })}
                  </p>
                  <div className="account-tradepwd-inputs">
                    {tradePwdChars.map((ch, idx) => (
                      <input
                        key={idx}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        className="account-tradepwd-input"
                        value={ch.trim()}
                        onChange={(e) => handleTradePwdChange(idx, e)}
                        onKeyDown={(e) => handleTradePwdKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="account-tradepwd-confirm"
                    disabled={confirmPwdDisabled}
                    onClick={async () => {
                      if (!isAmountFilled) return
                      const uid = getAuthUserId()
                      if (!uid) {
                        showToast(
                          tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }),
                          'error',
                        )
                        return
                      }
                      const amountValue = parseFloat(amount)
                      if (!Number.isFinite(amountValue) || amountValue <= 0) {
                        showToast(
                          tr(lang, { zh: '请输入正确的金额', en: 'Please enter a valid amount', de: 'Bitte geben Sie einen gültigen Betrag ein', ja: '有効な金額を入力してください', ko: '올바른 금액을 입력하세요.', es: 'Por favor ingresa una cantidad válida', it: 'Inserisci un importo valido', vi: 'Vui lòng nhập số tiền hợp lệ', fr: 'Veuillez entrer un montant valide' }),
                          'error',
                        )
                        return
                      }
                      if (!screenshotUrl) {
                        showToast(tr(lang, { zh: '请上传交易截图', en: 'Please upload transaction screenshot', de: 'Bitte laden Sie einen Screenshot der Transaktion hoch', ja: '取引のスクリーンショットをアップロードしてください', ko: '거래 스크린샷을 업로드해주세요.', es: 'Por favor sube la captura de pantalla de la transacción', it: 'Per favore carica lo screenshot della transazione', vi: 'Vui lòng tải lên ảnh chụp màn hình giao dịch', fr: 'Veuillez télécharger une capture d\'écran de la transaction' }), 'error')
                        return
                      }
                      try {
                        await api.post(`/api/users/${encodeURIComponent(uid)}/recharge`, {
                          amount: amountValue,
                          tradePassword: tradePwd,
                          rechargeScreenshotUrl: screenshotUrl,
                        })
                        setTradePwdModalOpen(false)
                        setTradePwd('')
                        setAmount('')
                        setScreenshotUrl(null)
                        showToast(tr(lang, { zh: '提交成功', en: 'Submitted successfully', de: 'Erfolgreich übermittelt', ja: '正常に送信されました', ko: '성공적으로 제출되었습니다', es: 'Enviado exitosamente', it: 'Inserito con successo', vi: 'Đã gửi thành công', fr: 'Soumis avec succès' }))
                        goBack()
                      } catch (err: unknown) {
                        const fallback =
                          tr(lang, { zh: '提交失败，请稍后重试', en: 'Submission failed, please try again later', de: 'Die Übermittlung ist fehlgeschlagen. Bitte versuchen Sie es später noch einmal', ja: '送信に失敗しました。後でもう一度お試しください', ko: '제출하지 못했습니다. 나중에 다시 시도해 주세요.', es: 'El envío falló. Vuelve a intentarlo más tarde.', it: 'Invio non riuscito, riprova più tardi', vi: 'Gửi không thành công, vui lòng thử lại sau', fr: 'Échec de la soumission, veuillez réessayer plus tard' })
                        showToast(err instanceof Error ? err.message : fallback, 'error')
                      }
                    }}
                  >
                    {tr(lang, { zh: '确认密码', en: 'Confirm PIN', de: 'PIN bestätigen', ja: 'PINの確認', ko: 'PIN 확인', es: 'Confirmar PIN', it: 'Conferma il PIN', vi: 'Xác nhận mã PIN', fr: 'Confirmer le code PIN' })}
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default WalletRecharge

