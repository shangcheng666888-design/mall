import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import LoginSuccessModal from '../components/LoginSuccessModal.tsx'
import { api } from '../api/client'
import { updateCrispUser } from '../utils/crispInit'
import loginPoster from '../assets/login-illustration.png'
import iconZhengpin from '../assets/zhifu.png'
import iconTuihuo from '../assets/tuihuo.png'
import iconYunshu from '../assets/yunshu.png'
import iconZhifu from '../assets/zhengping.png'
import { tr } from '../i18n'


const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from

  const validate = () => {
    const next = { email: '', password: '' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,22}$/

    if (!email.trim()) next.email = tr(lang, { zh: '请输入邮箱', en: 'Please enter your email', de: 'Bitte geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력해주세요', es: 'Por favor ingrese su correo electrónico', it: 'Per favore inserisci la tua email', vi: 'Vui lòng nhập email của bạn', fr: 'Veuillez entrer votre email' })
    else if (!emailRegex.test(email.trim())) next.email = tr(lang, { zh: '邮箱格式不正确', en: 'Invalid email format', de: 'Ungültiges E-Mail-Format', ja: '無効な電子メール形式', ko: '잘못된 이메일 형식', es: 'Formato de correo electrónico no válido', it: 'Formato email non valido', vi: 'Định dạng email không hợp lệ', fr: 'Format d\'e-mail invalide' })

    if (!password) next.password = tr(lang, { zh: '请输入密码', en: 'Please enter your password', de: 'Bitte geben Sie Ihr Passwort ein', ja: 'パスワードを入力してください', ko: '비밀번호를 입력해주세요', es: 'Por favor ingrese su contraseña', it: 'Inserisci la tua password', vi: 'Vui lòng nhập mật khẩu của bạn', fr: 'Veuillez entrer votre mot de passe' })
    else if (!pwdRegex.test(password)) next.password = tr(lang, { zh: '密码需为 6-22 位字母和数字组合', en: 'Password must be 6-22 characters with letters and numbers', de: 'Das Passwort muss 6–22 Zeichen lang sein und Buchstaben und Zahlen enthalten', ja: 'パスワードは文字と数字を含む 6 ～ 22 文字にする必要があります', ko: '비밀번호는 6~22자 영문, 숫자로 구성되어야 합니다.', es: 'La contraseña debe tener entre 6 y 22 caracteres con letras y números.', it: 'La password deve contenere da 6 a 22 caratteri con lettere e numeri', vi: 'Mật khẩu phải có 6-22 ký tự bao gồm cả chữ và số', fr: 'Le mot de passe doit contenir de 6 à 22 caractères avec des lettres et des chiffres' })

    setErrors(next)
    return !next.email && !next.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const value = email.trim()
    setLoading(true)
    try {
      const res = await api.post<{ success: boolean; user?: { id: string; account: string; balance: number; shopId: string | null; avatar: string | null } }>(
        '/api/auth/login',
        { type: 'email', value, password }
      )
      if (res.success && res.user) {
        window.localStorage.setItem('authUser', JSON.stringify({
          type: 'email' as const,
          value: res.user.account,
          id: res.user.id,
          balance: res.user.balance,
          shopId: res.user.shopId,
          avatar: res.user.avatar ?? null,
          email: email.trim(),
        }))
        updateCrispUser()
        setSuccessOpen(true)
        setTimeout(() => {
          if (from?.pathname) {
            navigate(from.pathname, { replace: true, state: from.state })
          } else {
            navigate('/', { replace: true })
          }
        }, 1200)
      } else {
        setErrors((prev) => ({ ...prev, password: tr(lang, { zh: '账号或密码错误', en: 'Incorrect account or password', de: 'Falsches Konto oder Passwort', ja: 'アカウントまたはパスワードが間違っています', ko: '잘못된 계정 또는 비밀번호', es: 'Cuenta o contraseña incorrecta', it: 'Account o password errati', vi: 'Tài khoản hoặc mật khẩu không chính xác', fr: 'Compte ou mot de passe incorrect' }) }))
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, password: err instanceof Error ? err.message : (tr(lang, { zh: '网络错误，请稍后重试', en: 'Network error, please try again later', de: 'Netzwerkfehler, bitte versuchen Sie es später noch einmal', ja: 'ネットワークエラー。後でもう一度お試しください', ko: '네트워크 오류입니다. 나중에 다시 시도해 주세요.', es: 'Error de red, inténtelo de nuevo más tarde', it: 'Errore di rete, riprova più tardi', vi: 'Lỗi mạng, vui lòng thử lại sau', fr: 'Erreur réseau, veuillez réessayer plus tard' })) }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-left">
          <img src={loginPoster} alt={tr(lang, { zh: '登录海报', en: 'Login', de: 'Login', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })} className="login-poster-image" />
        </div>
        <div className="login-card-right">
          <div className="login-auth-entry">
            <span className="login-auth-current">{tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}</span>
            <span className="login-auth-sep" aria-hidden="true">|</span>
            <Link to="/register" className="login-auth-link">{tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}</Link>
          </div>
          <h1 className="login-title">{tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-field">
              <label className="login-label">
                <span className="login-label-required">*</span> {tr(lang, { zh: '邮箱', en: 'Email', de: 'E-Mail', ja: '電子メール', ko: '이메일', es: 'Correo electrónico', it: 'E-mail', vi: 'E-mail', fr: 'E-mail' })}
              </label>
              <input
                className={`login-input${errors.email ? ' login-input--error' : ''}`}
                placeholder={tr(lang, { zh: '请输入账户邮箱', en: 'Enter your email', de: 'Geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력하세요', es: 'Introduce tu correo electrónico', it: 'Inserisci la tua email', vi: 'Nhập email của bạn', fr: 'Entrez votre email' })}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
              />
              <div className="login-error-slot">
                {errors.email && <p className="login-error-text">{errors.email}</p>}
              </div>
            </div>

            <div className="login-form-field">
              <label className="login-label">
                <span className="login-label-required">*</span> {tr(lang, { zh: '密码', en: 'Password', de: 'Passwort', ja: 'パスワード', ko: '비밀번호', es: 'Contraseña', it: 'Password', vi: 'Mật khẩu', fr: 'Mot de passe' })}
              </label>
              <div className="login-password-wrap">
                <input
                  className={`login-input${errors.password ? ' login-input--error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={tr(lang, { zh: '请输入密码（6-22 位字母和数字组合）', en: 'Enter password (6-22 letters and numbers)', de: 'Passwort eingeben (6-22 Buchstaben und Zahlen)', ja: 'パスワードを入力してください (6～22 文字と数字)', ko: '비밀번호(6~22자, 숫자)를 입력하세요.', es: 'Ingrese la contraseña (6-22 letras y números)', it: 'Inserisci la password (6-22 lettere e numeri)', vi: 'Nhập mật khẩu (6-22 chữ và số)', fr: 'Entrez le mot de passe (6 à 22 lettres et chiffres)' })}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showPassword ? (tr(lang, { zh: '隐藏密码', en: 'Hide password', de: 'Passwort verbergen', ja: 'パスワードを隠す', ko: '비밀번호 숨기기', es: 'Ocultar contraseña', it: 'Nascondi la password', vi: 'Ẩn mật khẩu', fr: 'Masquer le mot de passe' })) : (tr(lang, { zh: '显示密码', en: 'Show password', de: 'Passwort anzeigen', ja: 'パスワードを表示', ko: '비밀번호 표시', es: 'Mostrar contraseña', it: 'Mostra password', vi: 'Hiển thị mật khẩu', fr: 'Afficher le mot de passe' }))}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 12s2.5-5 9-5 9 5 9 5-2.5 5-9 5-9-5-9-5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="4"
                        y1="4"
                        x2="20"
                        y2="20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 12s2.5-5 9-5 9 5 9 5-2.5 5-9 5-9-5-9-5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="login-error-slot">
                {errors.password && <p className="login-error-text">{errors.password}</p>}
              </div>
              <div className="login-forgot-wrap">
                <button
                  type="button"
                  className="login-link-button login-link-button--right"
                  onClick={() => setForgotOpen(true)}
                >
                  {tr(lang, { zh: '忘记密码?', en: 'Forgot password?', de: 'Passwort vergessen?', ja: 'パスワードをお忘れですか？', ko: '비밀번호를 잊으셨나요?', es: '¿Has olvidado tu contraseña?', it: 'Ha dimenticato la password?', vi: 'Quên mật khẩu?', fr: 'Mot de passe oublié ?' })}
                </button>
              </div>
            </div>

            <div className="login-form-footer">
              <div className="login-form-links">
                <span className="login-text">{tr(lang, { zh: '还没有账号？', en: 'Don\'t have an account?', de: 'Sie haben noch kein Konto?', ja: 'アカウントをお持ちでない場合は、', ko: '계정이 없나요?', es: '¿No tienes una cuenta?', it: 'Non hai un account?', vi: 'Bạn chưa có tài khoản?', fr: 'Vous n\'avez pas de compte ?' })}</span>
                <Link to="/register" className="login-link-button">
                  {tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}
                </Link>
              </div>
            </div>

            <button type="submit" className="login-submit-button" disabled={loading}>
              {loading ? (tr(lang, { zh: '登录中…', en: 'Logging in…', de: 'Anmelden…', ja: 'ログイン中…', ko: '로그인 중…', es: 'Iniciando sesión…', it: 'Accesso…', vi: 'Đang đăng nhập…', fr: 'Connexion…' })) : (tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' }))}
            </button>
          </form>
        </div>
      </div>

      <section className="section service-features login-service-features" aria-label={tr(lang, { zh: '服务保障', en: 'Service', de: 'Service', ja: 'サービス', ko: '서비스', es: 'Servicio', it: 'Servizio', vi: 'Dịch vụ', fr: 'Service' })}>
        <div className="service-features-inner">
          <div className="service-feature-item">
            <img src={iconZhengpin} alt="" className="service-feature-icon" />
            <span className="service-feature-label">{tr(lang, { zh: '100% 正品', en: '100% Authentic', de: '100 % authentisch', ja: '100%本物', ko: '100% 정품', es: '100% auténtico', it: '100% autentico', vi: 'Xác thực 100%', fr: '100% authentique' })}</span>
          </div>
          <div className="service-feature-item">
            <img src={iconTuihuo} alt="" className="service-feature-icon" />
            <span className="service-feature-label">{tr(lang, { zh: '7 天退货', en: '7-day returns', de: '7-tägige Rückgabefrist', ja: '7日間返品可能', ko: '7일 반품', es: 'Devoluciones de 7 días', it: 'Resi entro 7 giorni', vi: 'Trả lại 7 ngày', fr: 'Retours sous 7 jours' })}</span>
          </div>
          <div className="service-feature-item">
            <img src={iconYunshu} alt="" className="service-feature-icon" />
            <span className="service-feature-label">{tr(lang, { zh: '运费折扣', en: 'Shipping discount', de: 'Versandrabatt', ja: '送料割引', ko: '배송비 할인', es: 'Descuento de envío', it: 'Sconto sulla spedizione', vi: 'Giảm giá vận chuyển', fr: 'Remise sur l\'expédition' })}</span>
          </div>
          <div className="service-feature-item">
            <img src={iconZhifu} alt="" className="service-feature-icon" />
            <span className="service-feature-label">{tr(lang, { zh: '安全支付', en: 'Secure payment', de: 'Sichere Zahlung', ja: '安全な支払い', ko: '안전한 결제', es: 'Pago seguro', it: 'Pagamento sicuro', vi: 'Thanh toán an toàn', fr: 'Paiement sécurisé' })}</span>
          </div>
        </div>
      </section>

      <LoginSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
      {forgotOpen && (
        <div
          className="auth-success-overlay"
          role="dialog"
          aria-label={tr(lang, { zh: '找回密码', en: 'Reset password', de: 'Passwort zurücksetzen', ja: 'パスワードをリセットする', ko: '비밀번호 재설정', es: 'Restablecer contraseña', it: 'Reimposta la password', vi: 'Đặt lại mật khẩu', fr: 'Réinitialiser le mot de passe' })}
          onClick={() => setForgotOpen(false)}
        >
          <div className="auth-success-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-success-icon auth-success-icon--black">
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
            </div>
            <p className="auth-success-text">
              {tr(lang, { zh: '请联系在线客服进行申请密码找回', en: 'Please contact customer service to reset your password.', de: 'Bitte wenden Sie sich an den Kundendienst, um Ihr Passwort zurückzusetzen.', ja: 'パスワードをリセットするには、カスタマーサービスにお問い合わせください。', ko: '비밀번호를 재설정하려면 고객 서비스에 문의하세요.', es: 'Comuníquese con el servicio de atención al cliente para restablecer su contraseña.', it: 'Contatta il servizio clienti per reimpostare la password.', vi: 'Vui lòng liên hệ với bộ phận dịch vụ khách hàng để đặt lại mật khẩu của bạn.', fr: 'Veuillez contacter le service client pour réinitialiser votre mot de passe.' })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

