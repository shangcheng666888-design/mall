import React, { useState, useEffect } from 'react'
import type { AddressItem } from '../utils/addressList'
import { useToast } from './ToastProvider'
import PhoneCodeSelect from './PhoneCodeSelect'
import CountrySelect from './CountrySelect'
import RegionSelect from './RegionSelect'
import CitySelect from './CitySelect'
import { getRegions } from '../constants/countryRegions'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


export interface AddressModalProps {
  open: boolean
  onClose: () => void
  /** 编辑时传入，新增时传 null/undefined */
  initialAddress?: AddressItem | null
  onSuccess: (item: AddressItem) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** 手机号：仅数字，7～15 位（国际常见长度） */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

const AddressModal: React.FC<AddressModalProps> = ({ open, onClose, initialAddress, onSuccess }) => {
  const { showToast } = useToast()
  const { lang } = useLang()
  const [recipient, setRecipient] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+86')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [postal, setPostal] = useState('')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    if (!open) return
    setEmailError('')
    setPhoneError('')
    if (initialAddress) {
      setRecipient(initialAddress.recipient)
      setEmail(initialAddress.email)
      setPhoneCode(initialAddress.phoneCode)
      setPhone(initialAddress.phone)
      setCountry(initialAddress.country)
      setProvince(initialAddress.province)
      setCity(initialAddress.city)
      setPostal(initialAddress.postal)
      setDetail(initialAddress.detail)
      setIsDefault(initialAddress.isDefault)
    } else {
      setRecipient('')
      setEmail('')
      setPhoneCode('+86')
      setPhone('')
      setCountry('')
      setProvince('')
      setCity('')
      setPostal('')
      setDetail('')
      setIsDefault(false)
    }
  }, [open, initialAddress])

  const handleSubmit = () => {
    const r = recipient.trim()
    const e = email.trim()
    const p = phone.trim()
    const d = detail.trim()

    setEmailError('')
    setPhoneError('')

    if (!r) {
      showToast(tr(lang, { zh: '请填写收货人姓名', en: 'Please enter the recipient name', de: 'Bitte geben Sie den Empfängernamen ein', ja: '受信者の名前を入力してください', ko: '수령인 이름을 입력해주세요', es: 'Por favor ingrese el nombre del destinatario', it: 'Inserisci il nome del destinatario', vi: 'Vui lòng nhập tên người nhận', fr: 'Veuillez entrer le nom du destinataire' }), 'error')
      return
    }
    if (!e) {
      setEmailError(tr(lang, { zh: '请输入邮箱', en: 'Please enter your email', de: 'Bitte geben Sie Ihre E-Mail-Adresse ein', ja: 'メールアドレスを入力してください', ko: '이메일을 입력해주세요', es: 'Por favor ingrese su correo electrónico', it: 'Per favore inserisci la tua email', vi: 'Vui lòng nhập email của bạn', fr: 'Veuillez entrer votre email' }))
      return
    }
    if (!EMAIL_REGEX.test(e)) {
      setEmailError(tr(lang, { zh: '请输入正确合法的邮箱格式', en: 'Please enter a valid email address', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein', ja: '有効なメールアドレスを入力してください', ko: '유효한 이메일 주소를 입력하세요.', es: 'Por favor, introduce una dirección de correo electrónico válida', it: 'Si prega di inserire un indirizzo email valido', vi: 'Vui lòng nhập địa chỉ email hợp lệ', fr: 'S\'il vous plaît, mettez une adresse email valide' }))
      return
    }
    if (!p) {
      setPhoneError(tr(lang, { zh: '请输入手机号码', en: 'Please enter your phone number', de: 'Bitte geben Sie Ihre Telefonnummer ein', ja: '電話番号を入力してください', ko: '전화번호를 입력해주세요', es: 'Por favor ingresa tu número de teléfono', it: 'Inserisci il tuo numero di telefono', vi: 'Vui lòng nhập số điện thoại của bạn', fr: 'Veuillez entrer votre numéro de téléphone' }))
      return
    }
    if (!isValidPhone(p)) {
      setPhoneError(
        tr(lang, { zh: '请输入正确合法的手机号码（7～15 位数字）', en: 'Please enter a valid phone number (7–15 digits)', de: 'Bitte geben Sie eine gültige Telefonnummer ein (7–15 Ziffern)', ja: '有効な電話番号 (7 ～ 15 桁) を入力してください', ko: '유효한 전화번호(7~15자리)를 입력하세요.', es: 'Ingrese un número de teléfono válido (7 a 15 dígitos)', it: 'Inserisci un numero di telefono valido (7-15 cifre)', vi: 'Vui lòng nhập số điện thoại hợp lệ (7–15 chữ số)', fr: 'Veuillez saisir un numéro de téléphone valide (7 à 15 chiffres)' }),
      )
      return
    }
    if (!country) {
      showToast(tr(lang, { zh: '请选择国家', en: 'Please select a country', de: 'Bitte wählen Sie ein Land aus', ja: '国を選択してください', ko: '국가를 선택하세요.', es: 'Por favor seleccione un país', it: 'Seleziona un paese', vi: 'Vui lòng chọn một quốc gia', fr: 'Veuillez sélectionner un pays' }), 'error')
      return
    }
    if (!d) {
      showToast(tr(lang, { zh: '请填写详细地址', en: 'Please enter your full address', de: 'Bitte geben Sie Ihre vollständige Adresse ein', ja: '完全な住所を入力してください', ko: '전체 주소를 입력하세요.', es: 'Por favor ingrese su dirección completa', it: 'Inserisci il tuo indirizzo completo', vi: 'Vui lòng nhập địa chỉ đầy đủ của bạn', fr: 'Veuillez entrer votre adresse complète' }), 'error')
      return
    }
    const item: AddressItem = {
      id: initialAddress?.id ?? `addr_${Date.now()}`,
      recipient: r,
      email: e,
      phoneCode,
      phone: p,
      country,
      province,
      city,
      postal: postal.trim(),
      detail: d,
      isDefault,
    }
    onSuccess(item)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="account-tradepwd-overlay address-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      onClick={handleClose}
    >
      <div className="address-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="account-tradepwd-close address-modal-close"
          aria-label={tr(lang, { zh: '关闭', en: 'Close', de: 'Schließen', ja: '近い', ko: '닫다', es: 'Cerca', it: 'Vicino', vi: 'Đóng', fr: 'Fermer' })}
          onClick={handleClose}
        >
          ×
        </button>
        <h2 id="address-modal-title" className="address-modal-title">
          {initialAddress
            ? (tr(lang, { zh: '修改地址', en: 'Edit address', de: 'Adresse bearbeiten', ja: '住所の編集', ko: '주소 수정', es: 'Editar dirección', it: 'Modifica indirizzo', vi: 'Chỉnh sửa địa chỉ', fr: 'Modifier l\'adresse' }))
            : (tr(lang, { zh: '添加地址', en: 'Add address', de: 'Adresse hinzufügen', ja: 'アドレスを追加', ko: '주소 추가', es: 'Agregar dirección', it: 'Aggiungi indirizzo', vi: 'Thêm địa chỉ', fr: 'Ajouter une adresse' }))}
        </h2>
        <div className="address-modal-form">
          <div className="address-modal-field">
            <input
              type="text"
              className="address-modal-input"
              placeholder={tr(lang, { zh: '收货人姓名', en: 'Recipient name', de: 'Empfängername', ja: '受信者名', ko: '받는 사람 이름', es: 'Nombre del destinatario', it: 'Nome del destinatario', vi: 'Tên người nhận', fr: 'Nom du destinataire' })}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="address-modal-field">
            <input
              type="email"
              className={`address-modal-input${emailError ? ' address-modal-input--error' : ''}`}
              placeholder={tr(lang, { zh: '邮箱', en: 'Email', de: 'E-Mail', ja: '電子メール', ko: '이메일', es: 'Correo electrónico', it: 'E-mail', vi: 'E-mail', fr: 'E-mail' })}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
            />
            {emailError && <p className="address-modal-error-text">{emailError}</p>}
          </div>
          <div className="address-modal-field">
            <div className="address-modal-phone-combo-wrap">
              <div className="address-modal-phone-combo">
                <PhoneCodeSelect value={phoneCode} onChange={setPhoneCode} />
                <input
                  type="tel"
                  className={`address-modal-phone-input${phoneError ? ' address-modal-input--error' : ''}`}
                  placeholder={tr(lang, { zh: '请设置手机号码', en: 'Please enter your phone number', de: 'Bitte geben Sie Ihre Telefonnummer ein', ja: '電話番号を入力してください', ko: '전화번호를 입력해주세요', es: 'Por favor ingresa tu número de teléfono', it: 'Inserisci il tuo numero di telefono', vi: 'Vui lòng nhập số điện thoại của bạn', fr: 'Veuillez entrer votre numéro de téléphone' })}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (phoneError) setPhoneError('')
                  }}
                />
              </div>
            </div>
            {phoneError && <p className="address-modal-error-text">{phoneError}</p>}
          </div>
          {(() => {
            const regions = getRegions(country)
            const hasRegions = regions.length > 1 || (regions[0]?.value !== '_')
            const regionValue = hasRegions ? province : '_'
            return (
              <div
                className={`address-modal-field address-modal-field--row ${hasRegions ? 'address-modal-field--three' : 'address-modal-field--two'}`}
              >
                <CountrySelect
                  value={country}
                  onChange={(code) => {
                    setCountry(code)
                    setProvince('')
                    const nextRegions = getRegions(code)
                    const nextHasRegions = nextRegions.length > 1 || (nextRegions[0]?.value !== '_')
                    setCity(nextHasRegions ? '' : '_')
                  }}
                  placeholder={tr(lang, { zh: '国家', en: 'Country', de: 'Land', ja: '国', ko: '국가', es: 'País', it: 'Paese', vi: 'Quốc gia', fr: 'Pays' })}
                />
                {hasRegions && (
                  <RegionSelect
                    countryCode={country}
                    value={province}
                    onChange={(regionValue) => {
                      setProvince(regionValue)
                      setCity('')
                    }}
                    placeholder={tr(lang, { zh: '省/州/邦', en: 'State / province', de: 'Staat/Provinz', ja: '州/県', ko: '주/도', es: 'Estado / provincia', it: 'Stato/provincia', vi: 'Bang/tỉnh', fr: 'État/province' })}
                    disabled={!country}
                  />
                )}
                <CitySelect
                  countryCode={country}
                  regionValue={regionValue}
                  value={city}
                  onChange={setCity}
                  placeholder={tr(lang, { zh: '城市', en: 'City', de: 'Stadt', ja: '市', ko: '도시', es: 'Ciudad', it: 'Città', vi: 'Thành phố', fr: 'Ville' })}
                  disabled={!country || (hasRegions && !province)}
                />
                {country && !hasRegions && regions[0]?.value === '_' && (
                  <div className="address-modal-field address-modal-field-hint" style={{ flexBasis: '100%', marginTop: '-0.25rem' }}>
                    <span className="address-modal-field-hint-text">
                      {tr(lang, { zh: '该国家暂无省/市列表，可直接填写下方详细地址', en: 'No province/city list for this country. You can fill the full address directly below.', de: 'Für dieses Land gibt es keine Provinz-/Stadtliste. Sie können die vollständige Adresse direkt unten eingeben.', ja: 'この国の州/都市のリストはありません。完全な住所を直接下に入力できます。', ko: '이 국가에 해당하는 주/시 목록이 없습니다. 아래에서 전체 주소를 직접 입력할 수 있습니다.', es: 'No hay lista de provincias/ciudades para este país. Puede completar la dirección completa directamente debajo.', it: 'Nessun elenco di province/città per questo paese. Puoi inserire l\'indirizzo completo direttamente qui sotto.', vi: 'Không có danh sách tỉnh/thành phố cho quốc gia này. Bạn có thể điền địa chỉ đầy đủ ngay bên dưới.', fr: 'Aucune liste de provinces/villes pour ce pays. Vous pouvez remplir l’adresse complète directement ci-dessous.' })}
                    </span>
                  </div>
                )}
              </div>
            )
          })()}
          <div className="address-modal-field">
            <input
              type="text"
              className="address-modal-input"
              placeholder={tr(lang, { zh: '邮编', en: 'Postal code', de: 'Postleitzahl', ja: '郵便番号', ko: '우편번호', es: 'Código Postal', it: 'Codice Postale', vi: 'Mã bưu chính', fr: 'Code Postal' })}
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
            />
          </div>
          <div className="address-modal-field">
            <textarea
              className="address-modal-input address-modal-textarea"
              placeholder={tr(lang, { zh: '详细地址', en: 'Full address', de: 'Vollständige Adresse', ja: '完全な住所', ko: '전체 주소', es: 'dirección completa', it: 'Indirizzo completo', vi: 'Địa chỉ đầy đủ', fr: 'Adresse complète' })}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
          </div>
          <div className="address-modal-toggle-row">
            <span className="address-modal-toggle-label">
              {tr(lang, { zh: '设为默认地址', en: 'Set as default address', de: 'Als Standardadresse festlegen', ja: 'デフォルトのアドレスとして設定', ko: '기본 주소로 설정', es: 'Establecer como dirección predeterminada', it: 'Imposta come indirizzo predefinito', vi: 'Đặt làm địa chỉ mặc định', fr: 'Définir comme adresse par défaut' })}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isDefault}
              className={`address-modal-toggle${isDefault ? ' address-modal-toggle--on' : ''}`}
              onClick={() => setIsDefault((v) => !v)}
            >
              <span className="address-modal-toggle-thumb" />
            </button>
          </div>
          <button
            type="button"
            className="account-settings-submit address-modal-submit"
            onClick={handleSubmit}
          >
            {tr(lang, { zh: '确定', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressModal
