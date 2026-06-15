import React, { useState } from 'react'
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

const WalletWithdraw: React.FC = () => {
  const { lang } = useLang()
  const navigate = useNavigate()
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/account')
    }
  }
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { showToast } = useToast()
  const [tradePwdModalOpen, setTradePwdModalOpen] = useState(false)
  const [tradePwd, setTradePwd] = useState('')

  const amountNum = parseFloat(amount)
  const isAmountFilled = amount.trim() !== '' && !Number.isNaN(amountNum) && amountNum > 0
  const submitDisabled = !address.trim() || !isAmountFilled
  const confirmPwdDisabled = tradePwd.length < 6

  const tradePwdChars = tradePwd.padEnd(6, ' ').slice(0, 6).split('')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d.]/g, '')
    const parts = v.split('.')
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
    setAmount(v)
  }

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
      setTradePwd((prev) => {
        const chars = prev.split('')
        chars[index] = ''
        return chars.join('').slice(0, 6)
      })
      return
    }
    if (index > 0) {
      setTradePwd((prev) => {
        const chars = prev.split('')
        chars[index - 1] = ''
        return chars.join('').slice(0, 6)
      })
      const prev = e.currentTarget.previousElementSibling as HTMLInputElement | null
      prev?.focus()
    }
  }

  return (
    <div className="account-page">
      <div className="account-inner">
        <AccountSidebar activeKey="wallet" />

        <main className="account-main">
          <section className="wallet-withdraw">
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
                {tr(lang, { zh: '我的钱包/提现', en: 'My wallet / Withdraw', de: 'Mein Portemonnaie / Abheben', ja: '私の財布 / 引き出し', ko: '내 지갑 / 출금', es: 'Mi billetera / Retirar', it: 'Il mio portafoglio / Prelievo', vi: 'Ví của tôi / Rút tiền', fr: 'Mon portefeuille / Retrait' })}
              </h1>
            </header>

            <div className="wallet-recharge-form">
              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  {tr(lang, { zh: '提现方式', en: 'Withdrawal method', de: 'Auszahlungsmethode', ja: '出金方法', ko: '출금방법', es: 'método de retiro', it: 'Metodo di prelievo', vi: 'Phương thức rút tiền', fr: 'Méthode de retrait' })}
                </label>
                <div className="wallet-withdraw-method">
                  {tr(lang, { zh: '加密货币', en: 'Cryptocurrency', de: 'Kryptowährung', ja: '暗号通貨', ko: '암호화폐', es: 'Criptomoneda', it: 'Criptovaluta', vi: 'tiền điện tử', fr: 'Crypto-monnaie' })}
                </div>
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  {tr(lang, { zh: '币种协议', en: 'Currency / protocol', de: 'Währung/Protokoll', ja: '通貨/プロトコル', ko: '통화/프로토콜', es: 'Moneda / protocolo', it: 'Valuta/protocollo', vi: 'Tiền tệ/giao thức', fr: 'Monnaie/protocole' })}
                </label>
                <div className="wallet-recharge-select-wrap">
                  <select className="wallet-recharge-select" defaultValue="USDT">
                    <option value="USDT">USDT</option>
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
                <button type="button" className="wallet-withdraw-network-btn">
                  TRC20
                </button>
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  <span className="wallet-recharge-required">*</span>
                  {tr(lang, { zh: '提现地址', en: 'Withdrawal address', de: 'Auszahlungsadresse', ja: '出金アドレス', ko: '출금주소', es: 'dirección de retiro', it: 'Indirizzo di ritiro', vi: 'Địa chỉ rút tiền', fr: 'Adresse de retrait' })}
                </label>
                <div className="wallet-recharge-address-row wallet-withdraw-address-row">
                  <input
                    className="wallet-recharge-address-input"
                    placeholder={
                      tr(lang, { zh: '请输入提币地址', en: 'Please enter the withdrawal address', de: 'Bitte geben Sie die Auszahlungsadresse ein', ja: '出金アドレスを入力してください', ko: '출금주소를 입력해주세요', es: 'Por favor ingrese la dirección de retiro', it: 'Inserisci l\'indirizzo di ritiro', vi: 'Vui lòng nhập địa chỉ rút tiền', fr: 'Veuillez saisir l\'adresse de retrait' })
                    }
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="wallet-recharge-field">
                <label className="wallet-recharge-label">
                  <span className="wallet-recharge-required">*</span>
                  {tr(lang, { zh: '数量', en: 'Amount', de: 'Menge', ja: '額', ko: '양', es: 'Cantidad', it: 'Quantità', vi: 'Số lượng', fr: 'Montant' })}
                </label>
                <input
                  className="wallet-recharge-input wallet-recharge-input--short"
                  placeholder={tr(lang, { zh: '请输入', en: 'Please enter', de: 'Bitte treten Sie ein', ja: '入力してください', ko: '입력해주세요', es: 'Por favor ingresa', it: 'Per favore entra', vi: 'Vui lòng nhập', fr: 'Veuillez entrer' })}
                  value={amount}
                  onChange={handleAmountChange}
                />
                <div className="wallet-recharge-hint">
                  {tr(lang, { zh: '当前可用余额：', en: 'Available balance: ', de: 'Verfügbares Guthaben:', ja: '利用可能な残高:', ko: '사용 가능한 잔액:', es: 'Saldo disponible:', it: 'Saldo disponibile:', vi: 'Số dư khả dụng:', fr: 'Solde disponible :' })}
                  {/* 从本地 authUser 中读取最新余额 */}
                  {(() => {
                    try {
                      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('authUser') : null
                      if (!raw) return '0.00 USDT'
                      const parsed = JSON.parse(raw) as { balance?: number }
                      const bal = Number.isFinite(Number(parsed.balance)) ? Number(parsed.balance) : 0
                      return `${bal.toFixed(2)} USDT`
                    } catch {
                      return '0.00 USDT'
                    }
                  })()}
                </div>
              </div>

              <button
                type="button"
                className="wallet-recharge-submit"
                disabled={submitDisabled}
                onClick={() => {
                  setTradePwdModalOpen(true)
                }}
              >
                {tr(lang, { zh: '确定', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
              </button>
            </div>
          </section>
        </main>
      </div>

      {tradePwdModalOpen && (
        <div
          className="account-tradepwd-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-withdraw-tradepwd-title"
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
            <h2 id="wallet-withdraw-tradepwd-title" className="account-tradepwd-title">
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
                const uid = getAuthUserId()
                if (!uid) {
                  showToast(
                    tr(lang, { zh: '请先登录', en: 'Please log in first', de: 'Bitte melden Sie sich zuerst an', ja: 'まずログインしてください', ko: '먼저 로그인해주세요', es: 'Por favor inicia sesión primero', it: 'Effettua prima l\'accesso', vi: 'Vui lòng đăng nhập trước', fr: 'Veuillez d\'abord vous connecter' }),
                    'error',
                  )
                  return
                }
                if (!address.trim()) {
                  showToast(
                    tr(lang, { zh: '请输入提币地址', en: 'Please enter the withdrawal address', de: 'Bitte geben Sie die Auszahlungsadresse ein', ja: '出金アドレスを入力してください', ko: '출금주소를 입력해주세요', es: 'Por favor ingrese la dirección de retiro', it: 'Inserisci l\'indirizzo di ritiro', vi: 'Vui lòng nhập địa chỉ rút tiền', fr: 'Veuillez saisir l\'adresse de retrait' }),
                    'error',
                  )
                  return
                }
                if (!isAmountFilled) {
                  showToast(
                    tr(lang, { zh: '请输入正确的提现金额', en: 'Please enter a valid withdrawal amount', de: 'Bitte geben Sie einen gültigen Auszahlungsbetrag ein', ja: '有効な出金額を入力してください', ko: '유효한 인출 금액을 입력하세요.', es: 'Por favor ingrese un monto de retiro válido', it: 'Inserisci un importo di prelievo valido', vi: 'Vui lòng nhập số tiền rút hợp lệ', fr: 'Veuillez saisir un montant de retrait valide' }),
                    'error',
                  )
                  return
                }
                const amountValue = parseFloat(amount)
                if (!Number.isFinite(amountValue) || amountValue <= 0) {
                  showToast(
                    tr(lang, { zh: '请输入正确的提现金额', en: 'Please enter a valid withdrawal amount', de: 'Bitte geben Sie einen gültigen Auszahlungsbetrag ein', ja: '有効な出金額を入力してください', ko: '유효한 인출 금액을 입력하세요.', es: 'Por favor ingrese un monto de retiro válido', it: 'Inserisci un importo di prelievo valido', vi: 'Vui lòng nhập số tiền rút hợp lệ', fr: 'Veuillez saisir un montant de retrait valide' }),
                    'error',
                  )
                  return
                }
                try {
                  await api.post(`/api/users/${encodeURIComponent(uid)}/withdraw`, {
                    amount: amountValue,
                    tradePassword: tradePwd,
                    address,
                  })
                  setTradePwdModalOpen(false)
                  setTradePwd('')
                  setAmount('')
                  setAddress('')
                  showToast(
                    tr(lang, { zh: '提交成功', en: 'Submitted successfully', de: 'Erfolgreich übermittelt', ja: '正常に送信されました', ko: '성공적으로 제출되었습니다', es: 'Enviado exitosamente', it: 'Inserito con successo', vi: 'Đã gửi thành công', fr: 'Soumis avec succès' }),
                  )
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
    </div>
  )
}

export default WalletWithdraw

