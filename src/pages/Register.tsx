import type React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import RegisterSuccessModal from '../components/RegisterSuccessModal.tsx'
import registerPoster from '../assets/login-illustration.png'
import iconZhengpin from '../assets/zhifu.png'
import iconTuihuo from '../assets/tuihuo.png'
import iconYunshu from '../assets/yunshu.png'
import iconZhifu from '../assets/zhengping.png'
import { api } from '../api/client'
import { updateCrispUser } from '../utils/crispInit'
import { tr } from '../i18n'


const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [successOpen, setSuccessOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { lang } = useLang()

  const validate = () => {
    const next = { email: '', password: '', confirmPassword: '' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,22}$/

    if (!email.trim()) next.email = tr(lang, { zh: '请输入邮箱', en: 'Please enter your email', de: 'Bitte geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력해주세요', es: 'Por favor ingrese su correo electrónico', it: 'Per favore inserisci la tua email', vi: 'Vui lòng nhập email của bạn', fr: 'Veuillez entrer votre email' })
    else if (!emailRegex.test(email.trim())) next.email = tr(lang, { zh: '邮箱格式不正确', en: 'Invalid email format', de: 'Ungültiges E-Mail-Format', ja: '無効な電子メール形式', ko: '잘못된 이메일 형식', es: 'Formato de correo electrónico no válido', it: 'Formato email non valido', vi: 'Định dạng email không hợp lệ', fr: 'Format d\'e-mail invalide' })

    if (!password) next.password = tr(lang, { zh: '请输入密码', en: 'Please enter your password', de: 'Bitte geben Sie Ihr Passwort ein', ja: 'パスワードを入力してください', ko: '비밀번호를 입력해주세요', es: 'Por favor ingrese su contraseña', it: 'Inserisci la tua password', vi: 'Vui lòng nhập mật khẩu của bạn', fr: 'Veuillez entrer votre mot de passe' })
    else if (!pwdRegex.test(password)) next.password = tr(lang, { zh: '密码需为 6-22 位字母和数字组合', en: 'Password must be 6-22 characters with letters and numbers', de: 'Das Passwort muss 6–22 Zeichen lang sein und Buchstaben und Zahlen enthalten', ja: 'パスワードは文字と数字を含む 6 ～ 22 文字にする必要があります', ko: '비밀번호는 6~22자 영문, 숫자로 구성되어야 합니다.', es: 'La contraseña debe tener entre 6 y 22 caracteres con letras y números.', it: 'La password deve contenere da 6 a 22 caratteri con lettere e numeri', vi: 'Mật khẩu phải có 6-22 ký tự bao gồm cả chữ và số', fr: 'Le mot de passe doit contenir de 6 à 22 caractères avec des lettres et des chiffres' })

    if (!confirmPassword) next.confirmPassword = tr(lang, { zh: '请再次输入密码', en: 'Please confirm your password', de: 'Bitte bestätigen Sie Ihr Passwort', ja: 'パスワードを確認してください', ko: '비밀번호를 확인해 주세요', es: 'Por favor confirma tu contraseña', it: 'Per favore conferma la tua password', vi: 'Vui lòng xác nhận mật khẩu của bạn', fr: 'Veuillez confirmer votre mot de passe' })
    else if (confirmPassword !== password) next.confirmPassword = tr(lang, { zh: '两次输入的密码不一致', en: 'Passwords do not match', de: 'Passwörter stimmen nicht überein', ja: 'パスワードが一致しません', ko: '비밀번호가 일치하지 않습니다.', es: 'Las contraseñas no coinciden', it: 'Le password non corrispondono', vi: 'Mật khẩu không khớp', fr: 'Les mots de passe ne correspondent pas' })

    setErrors(next)
    return !next.email && !next.password && !next.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const account = email.trim()
    setLoading(true)
    setErrors({ email: '', password: '', confirmPassword: '' })
    try {
      const res = await api.post<{ success?: boolean; user?: { id: string; account: string; balance: number; shopId: string | null; avatar: string | null } }>(
        '/api/auth/register',
        { account, password, type: 'email' }
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
        setTimeout(() => navigate('/'), 1200)
      } else {
        setErrors((prev) => ({ ...prev, email: tr(lang, { zh: '注册失败，请重试', en: 'Registration failed, please try again', de: 'Die Registrierung ist fehlgeschlagen. Bitte versuchen Sie es erneut', ja: '登録に失敗しました。もう一度お試しください', ko: '등록에 실패했습니다. 다시 시도해 주세요.', es: 'Error en el registro, por favor inténtelo de nuevo', it: 'Registrazione non riuscita, riprova', vi: 'Đăng ký không thành công, vui lòng thử lại', fr: 'L\'inscription a échoué, veuillez réessayer' }) }))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (tr(lang, { zh: '网络错误，请稍后重试', en: 'Network error, please try again later', de: 'Netzwerkfehler, bitte versuchen Sie es später noch einmal', ja: 'ネットワークエラー。後でもう一度お試しください', ko: '네트워크 오류입니다. 나중에 다시 시도해 주세요.', es: 'Error de red, inténtelo de nuevo más tarde', it: 'Errore di rete, riprova più tardi', vi: 'Lỗi mạng, vui lòng thử lại sau', fr: 'Erreur réseau, veuillez réessayer plus tard' }))
      const isDuplicate = /已注册|重复|exists|already registered/i.test(msg) || msg.includes('409')
      const fieldMsg = isDuplicate
        ? (tr(lang, { zh: '该邮箱已注册，请直接登录', en: 'This email is already registered, please log in', de: 'Diese E-Mail ist bereits registriert, bitte melden Sie sich an', ja: 'このメールアドレスはすでに登録されています。ログインしてください', ko: '이 이메일은 이미 등록되어 있습니다. 로그인하세요.', es: 'Este correo electrónico ya está registrado, por favor inicia sesión', it: 'Questa email è già registrata, effettua il login', vi: 'Email này đã được đăng ký, vui lòng đăng nhập', fr: 'Cet email est déjà enregistré, veuillez vous connecter' }))
        : msg
      setErrors((prev) => ({ ...prev, email: fieldMsg }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page register-page">
      <div className="login-card">
        <div className="login-card-left">
          <img src={registerPoster} alt={tr(lang, { zh: '注册海报', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })} className="login-poster-image" />
        </div>
        <div className="login-card-right">
          <div className="login-auth-entry">
            <Link to="/login" className="login-auth-link">{tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}</Link>
            <span className="login-auth-sep" aria-hidden="true">|</span>
            <span className="login-auth-current">{tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}</span>
          </div>
          <h1 className="login-title">{tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' })}</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-field">
              <label className="login-label">
                <span className="login-label-required">*</span> {tr(lang, { zh: '邮箱', en: 'Email', de: 'E-Mail', ja: '電子メール', ko: '이메일', es: 'Correo electrónico', it: 'E-mail', vi: 'E-mail', fr: 'E-mail' })}
              </label>
              <input
                className={`login-input${errors.email ? ' login-input--error' : ''}`}
                placeholder={tr(lang, { zh: '请设置账户邮箱', en: 'Enter your email', de: 'Geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력하세요', es: 'Introduce tu correo electrónico', it: 'Inserisci la tua email', vi: 'Nhập email của bạn', fr: 'Entrez votre email' })}
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
                  placeholder={tr(lang, { zh: '请设置密码（6-22 位字母和数字组合）', en: 'Set password (6-22 letters and numbers)', de: 'Passwort festlegen (6-22 Buchstaben und Zahlen)', ja: 'Set password (6-22 letters and numbers)', ko: '비밀번호 설정(6~22자, 숫자)', es: 'Establecer contraseña (6-22 letras y números)', it: 'Imposta password (6-22 lettere e numeri)', vi: 'Đặt mật khẩu (6-22 chữ và số)', fr: 'Définir un mot de passe (6 à 22 lettres et chiffres)' })}
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
            </div>

            <div className="login-form-field">
              <label className="login-label">
                <span className="login-label-required">*</span> {tr(lang, { zh: '确认密码', en: 'Confirm password', de: 'Passwort bestätigen', ja: 'パスワードを認証する', ko: '비밀번호 확인', es: 'Confirmar Contraseña', it: 'Conferma password', vi: 'Xác nhận mật khẩu', fr: 'Confirmez le mot de passe' })}
              </label>
              <div className="login-password-wrap">
                <input
                  className={`login-input${errors.confirmPassword ? ' login-input--error' : ''}`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={tr(lang, { zh: '请再次输入密码', en: 'Enter password again', de: 'Geben Sie das Passwort erneut ein', ja: 'パスワードを再度入力してください', ko: '비밀번호를 다시 입력하세요', es: 'Ingrese la contraseña nuevamente', it: 'Immettere nuovamente la password', vi: 'Nhập lại mật khẩu', fr: 'Entrez à nouveau le mot de passe' })}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showConfirmPassword ? (tr(lang, { zh: '隐藏密码', en: 'Hide password', de: 'Passwort verbergen', ja: 'パスワードを隠す', ko: '비밀번호 숨기기', es: 'Ocultar contraseña', it: 'Nascondi la password', vi: 'Ẩn mật khẩu', fr: 'Masquer le mot de passe' })) : (tr(lang, { zh: '显示密码', en: 'Show password', de: 'Passwort anzeigen', ja: 'パスワードを表示', ko: '비밀번호 표시', es: 'Mostrar contraseña', it: 'Mostra password', vi: 'Hiển thị mật khẩu', fr: 'Afficher le mot de passe' }))}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
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
                {errors.confirmPassword && <p className="login-error-text">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="login-form-footer">
              <div className="login-form-links">
                <span className="login-text">{tr(lang, { zh: '已有账号？', en: 'Already have an account?', de: 'Sie haben bereits ein Konto?', ja: 'すでにアカウントをお持ちですか?', ko: '이미 계정이 있나요?', es: '¿Ya tienes una cuenta?', it: 'Hai già un account?', vi: 'Đã có tài khoản?', fr: 'Vous avez déjà un compte ?' })}</span>
                <Link to="/login" className="login-link-button">
                  {tr(lang, { zh: '登录', en: 'Log in', de: 'Einloggen', ja: 'ログイン', ko: '로그인', es: 'Acceso', it: 'Login', vi: 'Đăng nhập', fr: 'Se connecter' })}
                </Link>
              </div>
            </div>

            <button type="submit" className="login-submit-button" disabled={loading}>
              {loading ? (tr(lang, { zh: '注册中…', en: 'Signing up…', de: 'Anmelden…', ja: 'サインアップ中…', ko: '가입 중…', es: 'Registrarse…', it: 'Iscrizione…', vi: 'Đang đăng ký…', fr: 'Signature…' })) : (tr(lang, { zh: '注册', en: 'Sign up', de: 'Melden Sie sich an', ja: 'サインアップ', ko: '가입', es: 'Inscribirse', it: 'Iscrizione', vi: 'Đăng ký', fr: 'S\'inscrire' }))}
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
      <RegisterSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  )
}

export default Register

