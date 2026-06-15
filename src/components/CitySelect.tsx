import React, { useEffect, useRef, useState } from 'react'
import { getCities } from '../constants/countryRegions'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

interface CitySelectProps {
  countryCode: string
  regionValue: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const CitySelect: React.FC<CitySelectProps> = ({
  countryCode,
  regionValue,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const { lang } = useLang()
  const resolvedPlaceholder = placeholder ?? tr(lang, {
    zh: '城市',
    en: 'City',
    de: 'Stadt',
    ja: '都市',
    ko: '도시',
    es: 'Ciudad',
    it: 'Città',
    vi: 'Thành phố',
    fr: 'Ville',
  })
  const searchPlaceholder = tr(lang, {
    zh: '输入城市搜索',
    en: 'Search city',
    de: 'Stadt suchen',
    ja: '都市を検索',
    ko: '도시 검색',
    es: 'Buscar ciudad',
    it: 'Cerca città',
    vi: 'Tìm thành phố',
    fr: 'Rechercher une ville',
  })
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const options = getCities(countryCode, regionValue)

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
  const fallbackOption = options.length === 1 && options[0].value === '_' ? options[0] : null
  const filteredOptions = (() => {
    const filtered = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(filterText) ||
        opt.value.toLowerCase().includes(filterText),
    )
    if (filtered.length === 0 && fallbackOption) return [fallbackOption]
    return filtered
  })()

  const handleSelect = (cityValue: string) => {
    onChange(cityValue)
    setOpen(false)
    setKeyword('')
  }

  const selectedLabel = value ? options.find((o) => o.value === value)?.label ?? value : ''

  return (
    <div className="phone-code-select city-select" ref={wrapperRef}>
      <button
        type="button"
        className="login-phone-code-select city-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        {selectedLabel || resolvedPlaceholder}
      </button>
      {open && !disabled && (
        <div className="phone-code-dropdown">
          <div className="phone-code-dropdown-search">
            <input
              className="phone-code-dropdown-search-input"
              placeholder={searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="phone-code-dropdown-list" role="listbox">
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`phone-code-option${opt.value === value ? ' phone-code-option--active' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="phone-code-option-text">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CitySelect
