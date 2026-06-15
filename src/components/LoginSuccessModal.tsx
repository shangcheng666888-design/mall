import type React from 'react'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

interface LoginSuccessModalProps {
  open: boolean
  onClose: () => void
}

const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({ open, onClose }) => {
  const { lang } = useLang()
  if (!open) return null

  const label = tr(lang, {
    zh: '登录成功',
    en: 'Login successful',
    de: 'Anmeldung erfolgreich',
    ja: 'ログイン成功',
    ko: '로그인 성공',
    es: 'Inicio de sesión exitoso',
    it: 'Accesso riuscito',
    vi: 'Đăng nhập thành công',
    fr: 'Connexion réussie',
  })

  return (
    <div className="auth-success-overlay" role="dialog" aria-label={label} onClick={onClose}>
      <div className="auth-success-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-success-icon auth-success-icon--black">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M7 12.5 10.5 16 17 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="auth-success-text">{label}</p>
      </div>
    </div>
  )
}

export default LoginSuccessModal
