import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'

export interface SkuAttrOption {
  raw: string
  display: string
  image?: string
}

interface SkuAttrSelectProps {
  label: string
  placeholder?: string
  options: SkuAttrOption[]
  value: string
  onChange: (raw: string) => void
}

function OptionContent({ opt }: { opt: SkuAttrOption }) {
  if (opt.image) {
    return (
      <span className="product-detail-sku-opt-img-wrap">
        <img src={opt.image} alt={opt.display} className="product-detail-sku-opt-img" />
      </span>
    )
  }
  return <span className="product-detail-sku-opt-text">{opt.display}</span>
}

const SkuAttrSelect: React.FC<SkuAttrSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
}) => {
  const { lang } = useLang()
  const resolvedPlaceholder = placeholder ?? tr(lang, {
    zh: '请选择',
    en: 'Please select',
    de: 'Bitte auswählen',
    ja: '選択してください',
    ko: '선택해 주세요',
    es: 'Seleccione',
    it: 'Seleziona',
    vi: 'Vui lòng chọn',
    fr: 'Veuillez sélectionner',
  })
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const selectedOpt = value ? options.find((o) => o.raw === value) : null

  const handleSelect = (raw: string) => {
    onChange(raw)
    setOpen(false)
  }

  return (
    <div className={`product-detail-sku-dropdown${!label ? ' product-detail-sku-dropdown--no-label' : ''}`} ref={wrapperRef}>
      {label ? <span className="product-detail-sku-select-label">{label}</span> : null}
      <button
        type="button"
        className={`product-detail-sku-dropdown-trigger${!value ? ' product-detail-sku-dropdown-trigger--placeholder' : ''}${selectedOpt?.image ? ' product-detail-sku-dropdown-trigger--has-img' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
      >
        <span className="product-detail-sku-dropdown-value">
          {selectedOpt ? <OptionContent opt={selectedOpt} /> : resolvedPlaceholder}
        </span>
        <span className="product-detail-sku-dropdown-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="product-detail-sku-dropdown-panel" role="listbox">
          {options.map((opt) => {
            const isSelected = value === opt.raw
            return (
              <button
                key={opt.raw}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`product-detail-sku-dropdown-item${isSelected ? ' product-detail-sku-dropdown-item--active' : ''}${opt.image ? ' product-detail-sku-dropdown-item--has-img' : ''}`}
                onClick={() => handleSelect(opt.raw)}
              >
                <OptionContent opt={opt} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SkuAttrSelect
