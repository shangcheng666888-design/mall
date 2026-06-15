import type React from 'react'
import { useState, useRef } from 'react'
import footerLogo from '../assets/logo2.png'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

export interface CustomerServiceChatProps {
  open: boolean
  onClose: () => void
  logoUrl?: string
}

type MessageItem = { id: number; type: 'text' | 'image'; content: string; from: 'user' }

const CustomerServiceChat: React.FC<CustomerServiceChatProps> = ({
  open,
  onClose,
  logoUrl = footerLogo,
}) => {
  const { lang } = useLang()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<MessageItem[]>([])
  const nextId = useRef(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const title = tr(lang, {
    zh: '在线客服',
    en: 'Live support',
    de: 'Live-Support',
    ja: 'オンラインサポート',
    ko: '온라인 고객센터',
    es: 'Soporte en vivo',
    it: 'Assistenza live',
    vi: 'Hỗ trợ trực tuyến',
    fr: 'Assistance en direct',
  })

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, type: 'text', content: inputValue.trim(), from: 'user' },
    ])
    setInputValue('')
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, type: 'image', content: url, from: 'user' },
    ])
    e.target.value = ''
  }

  if (!open) return null

  return (
    <div
      className="customer-service-chat"
      role="dialog"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="customer-service-chat-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="customer-service-chat-header">
          <img src={logoUrl} alt="TikTok Mall" className="customer-service-chat-logo" />
          <span className="customer-service-chat-title">{title}</span>
          <button
            type="button"
            className="customer-service-chat-close"
            aria-label={tr(lang, { zh: '收起客服窗口', en: 'Collapse chat', de: 'Chat einklappen', ja: 'チャットを閉じる', ko: '채팅 접기', es: 'Contraer chat', it: 'Comprimi chat', vi: 'Thu gọn chat', fr: 'Réduire le chat' })}
            onClick={onClose}
          >
            <span className="customer-service-chat-chevron">▾</span>
          </button>
        </header>
        <div className="customer-service-chat-body">
          <div className="customer-service-chat-messages">
            {messages.map((msg) =>
              msg.type === 'text' ? (
                <div key={msg.id} className="customer-service-chat-msg customer-service-chat-msg--user">
                  <span className="customer-service-chat-msg-text">{msg.content}</span>
                </div>
              ) : (
                <div key={msg.id} className="customer-service-chat-msg customer-service-chat-msg--user">
                  <img src={msg.content} alt={tr(lang, { zh: '上传的图片', en: 'Uploaded image', de: 'Hochgeladenes Bild', ja: 'アップロード画像', ko: '업로드한 이미지', es: 'Imagen subida', it: 'Immagine caricata', vi: 'Ảnh đã tải lên', fr: 'Image téléchargée' })} className="customer-service-chat-msg-img" />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="customer-service-chat-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="customer-service-chat-file-input"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="customer-service-chat-attach"
            aria-label={tr(lang, { zh: '上传图片', en: 'Upload image', de: 'Bild hochladen', ja: '画像をアップロード', ko: '이미지 업로드', es: 'Subir imagen', it: 'Carica immagine', vi: 'Tải ảnh lên', fr: 'Télécharger une image' })}
            onClick={handleAttachClick}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
              />
            </svg>
          </button>
          <input
            type="text"
            className="customer-service-chat-input"
            placeholder={tr(lang, { zh: '请输入', en: 'Type a message', de: 'Nachricht eingeben', ja: '入力してください', ko: '입력하세요', es: 'Escribe un mensaje', it: 'Scrivi un messaggio', vi: 'Nhập tin nhắn', fr: 'Saisissez un message' })}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            aria-label={tr(lang, { zh: '输入消息', en: 'Message input', de: 'Nachrichteneingabe', ja: 'メッセージ入力', ko: '메시지 입력', es: 'Entrada de mensaje', it: 'Input messaggio', vi: 'Nhập tin nhắn', fr: 'Saisie du message' })}
          />
          <button
            type="button"
            className="customer-service-chat-send"
            onClick={handleSend}
          >
            {tr(lang, { zh: '发送', en: 'Send', de: 'Senden', ja: '送信', ko: '보내기', es: 'Enviar', it: 'Invia', vi: 'Gửi', fr: 'Envoyer' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerServiceChat
