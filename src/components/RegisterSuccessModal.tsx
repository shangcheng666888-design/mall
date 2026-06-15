import type React from 'react'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

interface RegisterSuccessModalProps {
  open: boolean
  onClose: () => void
}

const RegisterSuccessModal: React.FC<RegisterSuccessModalProps> = ({ open, onClose }) => {
  const { lang } = useLang()
  if (!open) return null

  const label = tr(lang, {
    zh: '注册成功，已为您登录',
    en: 'Registration successful — you are now signed in',
    de: 'Registrierung erfolgreich — Sie sind jetzt angemeldet',
    ja: '登録成功、ログインしました',
    ko: '가입 완료, 로그인되었습니다',
    es: 'Registro exitoso — ya has iniciado sesión',
    it: 'Registrazione completata — accesso effettuato',
    vi: 'Đăng ký thành công — bạn đã được đăng nhập',
    fr: 'Inscription réussie — vous êtes connecté',
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

export default RegisterSuccessModal
