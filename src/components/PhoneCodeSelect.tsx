import React, { useEffect, useRef, useState } from 'react'
import { COUNTRY_CODES } from '../constants/countryCodes'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


interface PhoneCodeSelectProps {
  value: string
  onChange: (code: string) => void
}

const PhoneCodeSelect: React.FC<PhoneCodeSelectProps> = ({ value, onChange }) => {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const filterText = keyword.trim().toLowerCase()
  const filteredCodes = COUNTRY_CODES.filter((code) =>
    code.toLowerCase().includes(filterText),
  )

  const handleSelect = (code: string) => {
    onChange(code)
    setOpen(false)
  }

  const displayCode = (code: string) => (code.startsWith('+') ? code.slice(1) : code)

  return (
    <div className="phone-code-select" ref={wrapperRef}>
      <button
        type="button"
        className="login-phone-code-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {displayCode(value)}
      </button>
      {open && (
        <div className="phone-code-dropdown">
          <div className="phone-code-dropdown-search">
            <input
              className="phone-code-dropdown-search-input"
              placeholder={tr(lang, { zh: '输入区号搜索', en: 'Search country code', de: 'Ländercode suchen', ja: '国コードを検索する', ko: '국가 코드 검색', es: 'Buscar código de país', it: 'Cerca il codice del paese', vi: 'Tìm kiếm mã quốc gia', fr: 'Rechercher le code du pays' })}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="phone-code-dropdown-list" role="listbox">
            {filteredCodes.map((code) => (
              <button
                key={code}
                type="button"
                className={`phone-code-option${
                  code === value ? ' phone-code-option--active' : ''
                }`}
                onClick={() => handleSelect(code)}
              >
                <span className="phone-code-option-text">{displayCode(code)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhoneCodeSelect

