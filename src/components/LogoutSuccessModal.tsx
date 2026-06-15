import type React from 'react'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


interface LogoutSuccessModalProps {
  open: boolean
  onClose: () => void
}

const LogoutSuccessModal: React.FC<LogoutSuccessModalProps> = ({ open, onClose }) => {
  if (!open) return null

  const { lang } = useLang()

  const ariaLabel = tr(lang, { zh: '已退出账户', en: 'Logged out', de: 'Abgemeldet', ja: 'ログアウトしました', ko: '로그아웃됨', es: 'Cerrado sesión', it: 'Disconnesso', vi: 'Đã đăng xuất', fr: 'Déconnecté' })
  const text = tr(lang, { zh: '已退出账户', en: 'You have been logged out', de: 'Sie wurden abgemeldet', ja: 'ログアウトされました', ko: '로그아웃되었습니다', es: 'Te has desconectado', it: 'Sei stato disconnesso', vi: 'Bạn đã đăng xuất', fr: 'Vous avez été déconnecté' })

  return (
    <div className="auth-success-overlay" role="dialog" aria-label={ariaLabel} onClick={onClose}>
      <div className="auth-success-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-success-icon auth-success-icon--black">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9 9l6 6M15 9l-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="auth-success-text">{text}</p>
      </div>
    </div>
  )
}

export default LogoutSuccessModal

