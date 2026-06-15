import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import idFrontExample from '../assets/id-front-example.png'
import idBackExample from '../assets/id-back-example.png'
import idHandheldExample from '../assets/id-handheld-example.png'
import { api } from '../api/client'
import { useToast } from '../components/ToastProvider'
import { useLang } from '../context/LangContext'
import { getMerchantConsoleLoginUrl } from '../config/env'
import { tr } from '../i18n'


const MerchantApply: React.FC = () => {
  const { lang } = useLang()
  const merchantLoginUrl = getMerchantConsoleLoginUrl()
  const [_verifyMethod, _setVerifyMethod] = useState<'email' | 'phone'>('email')
  const [_passwordVisible, _setPasswordVisible] = useState(false)
  const [_confirmPasswordVisible, _setConfirmPasswordVisible] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [agreementModalOpen, setAgreementModalOpen] = useState(false)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [partyBSignature, setPartyBSignature] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const [idHandheldPreview, setIdHandheldPreview] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [formData, setFormData] = useState({
    storeName: '',
    storeAddress: '',
    country: '',
    idNumber: '',
    realName: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState<'logo' | 'idFront' | 'idBack' | 'idHandheld' | 'signature' | null>(null)
  const { showToast } = useToast()

  /** 将 Data URL 转为 File，用于签名上传 */
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mime = (arr[0].match(/:(.*);/)?.[1] ?? 'image/png').trim()
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8 = new Uint8Array(n)
    for (let i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i)
    return new File([new Blob([u8], { type: mime })], filename, { type: mime })
  }

  const allRequiredFilled =
    agreed &&
    !!logoPreview &&
    !!idFrontPreview &&
    !!idBackPreview &&
    !!idHandheldPreview &&
    formData.storeName.trim() !== '' &&
    formData.storeAddress.trim() !== '' &&
    formData.country.trim() !== '' &&
    formData.idNumber.trim() !== '' &&
    formData.realName.trim() !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRequiredFilled) {
      const missing: string[] = []
      if (!agreed || !partyBSignature)
        missing.push(
          tr(lang, { zh: '请先阅读并签署入驻协议', en: 'Please read and sign the onboarding agreement first', de: 'Bitte lesen und unterzeichnen Sie zunächst die Onboarding-Vereinbarung', ja: '最初にオンボーディング契約書を読んで署名してください', ko: '먼저 온보딩 계약서를 읽고 서명하세요.', es: 'Primero lea y firme el acuerdo de incorporación.', it: 'Si prega di leggere e firmare prima l\'accordo di onboarding', vi: 'Vui lòng đọc và ký thỏa thuận giới thiệu trước', fr: 'Veuillez d\'abord lire et signer l\'accord d\'intégration' }),
        )
      if (!logoPreview)
        missing.push(
          tr(lang, { zh: '请上传店铺标志', en: 'Please upload your shop logo', de: 'Bitte laden Sie Ihr Shop-Logo hoch', ja: 'ショップのロゴをアップロードしてください', ko: '매장 로고를 업로드해주세요.', es: 'Por favor sube el logo de tu tienda', it: 'Carica il logo del tuo negozio', vi: 'Vui lòng tải lên logo cửa hàng của bạn', fr: 'Veuillez télécharger le logo de votre boutique' }),
        )
      if (!idFrontPreview || !idBackPreview || !idHandheldPreview)
        missing.push(
          tr(lang, { zh: '请上传完整的证件照片（正反面和手持照）', en: 'Please upload all ID photos (front, back and handheld)', de: 'Bitte laden Sie alle Ausweisfotos hoch (Vorderseite, Rückseite und Handheld)', ja: 'すべての証明写真（表、裏、手持ち）をアップロードしてください。', ko: '모든 신분증 사진(앞면, 뒷면, 손으로 들고 찍은 사진)을 업로드하세요.', es: 'Cargue todas las fotografías de identificación (anverso, reverso y en mano)', it: 'Si prega di caricare tutte le foto identificative (fronte, retro e palmare)', vi: 'Vui lòng tải lên tất cả ảnh CMND (mặt trước, mặt sau và cầm tay)', fr: 'Veuillez télécharger toutes les photos d\'identité (recto, verso et portable)' }),
        )
      if (!formData.storeName.trim())
        missing.push(
          tr(lang, { zh: '请填写店铺名称', en: 'Please fill in your shop name', de: 'Bitte geben Sie Ihren Shopnamen ein', ja: 'ショップ名をご記入ください', ko: '매장명을 입력해주세요.', es: 'Por favor escribe el nombre de tu tienda', it: 'Inserisci il nome del tuo negozio', vi: 'Vui lòng điền tên cửa hàng của bạn', fr: 'Veuillez remplir le nom de votre boutique' }),
        )
      if (!formData.storeAddress.trim())
        missing.push(
          tr(lang, { zh: '请填写店铺地址', en: 'Please fill in your shop address', de: 'Bitte geben Sie Ihre Shop-Adresse ein', ja: 'ショップの住所をご記入ください', ko: '매장 주소를 입력해주세요', es: 'Por favor complete la dirección de su tienda', it: 'Inserisci l\'indirizzo del tuo negozio', vi: 'Vui lòng điền địa chỉ cửa hàng của bạn', fr: 'Veuillez renseigner l\'adresse de votre boutique' }),
        )
      if (!formData.country.trim())
        missing.push(
          tr(lang, { zh: '请填写国家或地区', en: 'Please fill in your country or region', de: 'Bitte geben Sie Ihr Land oder Ihre Region ein', ja: 'あなたの国または地域を入力してください', ko: '해당 국가 또는 지역을 입력하세요.', es: 'Por favor complete su país o región', it: 'Inserisci il tuo paese o regione', vi: 'Vui lòng điền vào quốc gia hoặc khu vực của bạn', fr: 'Veuillez renseigner votre pays ou région' }),
        )
      if (!formData.idNumber.trim())
        missing.push(
          tr(lang, { zh: '请填写证件/护照号码', en: 'Please fill in your ID/passport number', de: 'Bitte geben Sie Ihre Personalausweis-/Reisepassnummer ein', ja: 'ID/パスポート番号を入力してください', ko: '신분증/여권번호를 입력해주세요.', es: 'Por favor introduzca su número de DNI/pasaporte', it: 'Inserisci il numero del tuo documento d\'identità/passaporto', vi: 'Vui lòng điền số CMND/hộ chiếu của bạn', fr: 'Veuillez remplir votre numéro d\'identité/passeport' }),
        )
      if (!formData.realName.trim())
        missing.push(
          tr(lang, { zh: '请填写真实姓名', en: 'Please fill in your real name', de: 'Bitte geben Sie Ihren richtigen Namen ein', ja: '本名を入力してください', ko: '실명을 입력해주세요.', es: 'Por favor escribe tu nombre real', it: 'Per favore inserisci il tuo vero nome', vi: 'Vui lòng điền tên thật của bạn', fr: 'Veuillez indiquer votre vrai nom' }),
        )
      showToast(
        missing[0] ??
          (tr(lang, { zh: '还有必填信息未填写', en: 'Some required fields are still empty', de: 'Einige Pflichtfelder sind noch leer', ja: '一部の必須フィールドがまだ空です', ko: '일부 필수 입력란이 아직 비어 있습니다.', es: 'Algunos campos obligatorios todavía están vacíos', it: 'Alcuni campi obbligatori sono ancora vuoti', vi: 'Một số trường bắt buộc vẫn trống', fr: 'Certains champs obligatoires sont encore vides' })),
        'error',
      )
      return
    }
    setSubmitting(true)
    try {
      let userId: string | null = null
      try {
        const raw = window.localStorage.getItem('authUser')
        if (raw) {
          const auth = JSON.parse(raw) as { id?: string }
          if (typeof auth.id === 'string') userId = auth.id
        }
      } catch {
        userId = null
      }
      if (!userId) {
        showToast(
          tr(lang, { zh: '请先登录商城账号，再提交入驻申请', en: 'Please log in to your mall account before applying', de: 'Bitte melden Sie sich vor der Bewerbung bei Ihrem Mall-Konto an', ja: 'お申込み前にモールアカウントにログインしてください', ko: '신청하기 전에 쇼핑몰 계정에 로그인하십시오', es: 'Inicie sesión en su cuenta del centro comercial antes de presentar la solicitud.', it: 'Accedi al tuo account del centro commerciale prima di fare domanda', vi: 'Vui lòng đăng nhập vào tài khoản trung tâm mua sắm của bạn trước khi đăng ký', fr: 'Veuillez vous connecter à votre compte de centre commercial avant de postuler' }),
          'error',
        )
        setSubmitting(false)
        return
      }
      await api.post('/api/shop-applications', {
        storeName: formData.storeName.trim(),
        storeAddress: formData.storeAddress.trim(),
        country: formData.country,
        idNumber: formData.idNumber.trim(),
        realName: formData.realName.trim(),
        logo: logoPreview || null,
        idFront: idFrontPreview || null,
        idBack: idBackPreview || null,
        idHandheld: idHandheldPreview || null,
        signature: partyBSignature || null,
        userId,
      })
      showToast(
        tr(lang, { zh: '申请已提交，请等待管理员审核', en: 'Application submitted, please wait for admin review', de: 'Antrag eingereicht. Bitte warten Sie auf die Überprüfung durch den Administrator', ja: '申請が送信されました。管理者の審査をお待ちください', ko: '신청서가 제출되었습니다. 관리자 검토를 기다려 주세요.', es: 'Solicitud enviada, espere la revisión del administrador', it: 'Domanda inviata, attendere la revisione da parte dell\'amministratore', vi: 'Đơn đăng ký đã được gửi, vui lòng chờ quản trị viên xem xét', fr: 'Candidature soumise, veuillez attendre l\'examen de l\'administrateur' }),
      )
      setFormData({ storeName: '', storeAddress: '', country: '', idNumber: '', realName: '' })
      setLogoPreview(null)
      setIdFrontPreview(null)
      setIdBackPreview(null)
      setIdHandheldPreview(null)
      setPartyBSignature(null)
      setAgreed(false)
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(lang, { zh: '提交失败，请稍后重试', en: 'Submission failed, please try again later', de: 'Die Übermittlung ist fehlgeschlagen. Bitte versuchen Sie es später noch einmal', ja: '送信に失敗しました。後でもう一度お試しください', ko: '제출하지 못했습니다. 나중에 다시 시도해 주세요.', es: 'El envío falló. Vuelve a intentarlo más tarde.', it: 'Invio non riuscito, riprova più tardi', vi: 'Gửi không thành công, vui lòng thử lại sau', fr: 'Échec de la soumission, veuillez réessayer plus tard' }),
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (!signatureModalOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    return () => {}
  }, [signatureModalOpen])

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const p = getCanvasPoint(e)
    if (!p || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    drawingRef.current = true
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!drawingRef.current) return
    const p = getCanvasPoint(e)
    if (!p || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const endDraw = () => {
    drawingRef.current = false
  }

  const confirmSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setImageUploading('signature')
    try {
      const file = dataURLtoFile(dataUrl, 'signature.png')
      const { url } = await api.uploadImage(file)
      setPartyBSignature(url)
      setSignatureModalOpen(false)
      setAgreed(true)
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(lang, { zh: '签名上传失败', en: 'Failed to upload signature', de: 'Die Signatur konnte nicht hochgeladen werden', ja: '署名のアップロードに失敗しました', ko: '서명을 업로드하지 못했습니다.', es: 'No se pudo cargar la firma', it: 'Impossibile caricare la firma', vi: 'Không thể tải lên chữ ký', fr: 'Échec du téléchargement de la signature' }),
        'error',
      )
    } finally {
      setImageUploading(null)
    }
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'idFront' | 'idBack' | 'idHandheld',
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    e.target.value = ''
    setImageUploading(field)
    try {
      const { url } = await api.uploadImage(file)
      setPreview(url)
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : tr(lang, { zh: '图片上传失败', en: 'Image upload failed', de: 'Das Hochladen des Bildes ist fehlgeschlagen', ja: '画像のアップロードに失敗しました', ko: '이미지 업로드 실패', es: 'Error al subir la imagen', it: 'Caricamento immagine non riuscito', vi: 'Tải hình ảnh lên không thành công', fr: 'Échec du téléchargement de l\'image' }),
        'error',
      )
    } finally {
      setImageUploading(null)
    }
  }

  return (
    <div className="page merchant-apply-page">
      <section className="merchant-apply-hero">
        <div className="merchant-apply-hero-inner">
          <div className="merchant-apply-hero-text">
            <h1 className="merchant-apply-hero-title">
              {tr(lang, { zh: 'TikTok Shop 商家入驻', en: 'TikTok Shop merchant onboarding', de: 'Onboarding von TikTok-Shop-Händlern', ja: 'TikTok Shop 加盟店のオンボーディング', ko: 'TikTok Shop 판매자 온보딩', es: 'Incorporación de comerciantes de la tienda TikTok', it: 'Onboarding del commerciante di TikTok Shop', vi: 'Giới thiệu người bán trên TikTok Shop', fr: 'Intégration des marchands de la boutique TikTok' })}
            </h1>
            <p className="merchant-apply-hero-subtitle">
              {tr(lang, { zh: '我们的合作伙伴计划为您提供全方位的营销支持和服务，我们的客户服务团队将提供专业的支持和建议，帮助您优化您的产品展示和销售策略。现在就加入我们吧！让我们一起创造更大的商业机会，共同成长！', en: 'Our partner program provides full marketing support and services. Our customer service team offers professional advice to optimize your product display and sales strategy. Join us now to create more business opportunities and grow together!', de: 'Unser Partnerprogramm bietet umfassende Marketingunterstützung und -dienstleistungen. Unser Kundenservice-Team bietet professionelle Beratung zur Optimierung Ihrer Produktpräsentation und Verkaufsstrategie. Schließen Sie sich uns jetzt an, um mehr Geschäftsmöglichkeiten zu schaffen und gemeinsam zu wachsen!', ja: '当社のパートナー プログラムは、完全なマーケティング サポートとサービスを提供します。当社のカスタマーサービスチームは、製品の表示と販売戦略を最適化するための専門的なアドバイスを提供します。今すぐ私たちに参加して、より多くのビジネスチャンスを創出し、一緒に成長してください!', ko: '당사의 파트너 프로그램은 완전한 마케팅 지원 및 서비스를 제공합니다. 당사의 고객 서비스 팀은 귀하의 제품 디스플레이 및 판매 전략을 최적화하기 위한 전문적인 조언을 제공합니다. 지금 우리와 함께 더 많은 비즈니스 기회를 창출하고 함께 성장해 보세요!', es: 'Nuestro programa de socios proporciona soporte y servicios completos de marketing. Nuestro equipo de atención al cliente ofrece asesoramiento profesional para optimizar la exhibición de sus productos y su estrategia de ventas. ¡Únase a nosotros ahora para crear más oportunidades de negocio y crecer juntos!', it: 'Il nostro programma partner fornisce supporto e servizi di marketing completi. Il nostro team di assistenza clienti offre consulenza professionale per ottimizzare l\'esposizione dei prodotti e la strategia di vendita. Unisciti a noi ora per creare più opportunità di business e crescere insieme!', vi: 'Chương trình đối tác của chúng tôi cung cấp đầy đủ các dịch vụ và hỗ trợ tiếp thị. Đội ngũ dịch vụ khách hàng của chúng tôi đưa ra lời khuyên chuyên nghiệp để tối ưu hóa chiến lược trưng bày sản phẩm và bán hàng của bạn. Hãy tham gia ngay với chúng tôi để tạo ra nhiều cơ hội kinh doanh và cùng nhau phát triển!', fr: 'Notre programme de partenariat fournit une assistance et des services marketing complets. Notre équipe de service client vous offre des conseils professionnels pour optimiser la présentation de vos produits et votre stratégie de vente. Rejoignez-nous maintenant pour créer plus d\'opportunités commerciales et grandir ensemble !' })}
            </p>
          </div>
          <div className="merchant-apply-hero-illustration" aria-hidden="true">
            <div className="merchant-apply-hero-dashboard">
              <div className="merchant-apply-hero-dashboard-header">
                <span className="merchant-apply-hero-dot" />
                <span className="merchant-apply-hero-dot" />
                <span className="merchant-apply-hero-dot" />
              </div>
              <div className="merchant-apply-hero-dashboard-body">
                <div className="merchant-apply-hero-chart">
                  <span className="merchant-apply-hero-chart-line" />
                  <span className="merchant-apply-hero-chart-bar merchant-apply-hero-chart-bar--1" />
                  <span className="merchant-apply-hero-chart-bar merchant-apply-hero-chart-bar--2" />
                  <span className="merchant-apply-hero-chart-bar merchant-apply-hero-chart-bar--3" />
                </div>
                <div className="merchant-apply-hero-metrics">
                  <div className="merchant-apply-hero-metric">
                    <span className="merchant-apply-hero-metric-label">
                      {tr(lang, { zh: '本月订单', en: 'Orders this month', de: 'Bestellungen in diesem Monat', ja: '今月のご注文', ko: '이번 달 주문', es: 'Pedidos este mes', it: 'Ordini questo mese', vi: 'Đơn đặt hàng trong tháng này', fr: 'Commandes ce mois-ci' })}
                    </span>
                    <span className="merchant-apply-hero-metric-value">+128%</span>
                  </div>
                  <div className="merchant-apply-hero-metric">
                    <span className="merchant-apply-hero-metric-label">
                      {tr(lang, { zh: '活跃买家', en: 'Active buyers', de: 'Aktive Käufer', ja: 'アクティブな購入者', ko: '활성 구매자', es: 'Compradores activos', it: 'Acquirenti attivi', vi: 'Người mua đang hoạt động', fr: 'Acheteurs actifs' })}
                    </span>
                    <span className="merchant-apply-hero-metric-value">3.2K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 商业信息 / Business info */}
      <section className="merchant-apply-section">
        <header className="merchant-apply-header">
          <h1 className="merchant-apply-title">
            {tr(lang, { zh: '商业信息', en: 'Business information', de: 'Geschäftsinformationen', ja: '事業案内', ko: '사업정보', es: 'Información comercial', it: 'Informazioni commerciali', vi: 'Thông tin doanh nghiệp', fr: 'Informations commerciales' })}
          </h1>
          <p className="merchant-apply-login-hint">
            {tr(lang, { zh: '如果您已是卖家,请', en: 'If you are already a seller, please ', de: 'Wenn Sie bereits Verkäufer sind, bitte', ja: 'すでに販売者である場合は、', ko: '이미 판매자이신 경우,', es: 'Si ya eres vendedor, por favor', it: 'Se sei già un venditore, per favore', vi: 'Nếu bạn đã là người bán, vui lòng', fr: 'Si vous êtes déjà vendeur, veuillez' })}
            {merchantLoginUrl ? (
              <a
                href={merchantLoginUrl}
                className="merchant-apply-login-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(lang, { zh: '点击登录', en: 'click to log in', de: 'Klicken Sie hier, um sich anzumelden', ja: 'クリックしてログインします', ko: '로그인하려면 클릭하세요.', es: 'haga clic para iniciar sesión', it: 'clicca per accedere', vi: 'bấm vào để đăng nhập', fr: 'cliquez pour vous connecter' })}
              </a>
            ) : (
              <span className="merchant-apply-login-link merchant-apply-login-link--disabled">
                {tr(lang, { zh: '点击登录', en: 'click to log in', de: 'Klicken Sie hier, um sich anzumelden', ja: 'クリックしてログインします', ko: '로그인하려면 클릭하세요.', es: 'haga clic para iniciar sesión', it: 'clicca per accedere', vi: 'bấm vào để đăng nhập', fr: 'cliquez pour vous connecter' })}
              </span>
            )}
          </p>
        </header>

        <form className="merchant-apply-form merchant-apply-form--row">
          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '店铺标志', en: 'Shop logo', de: 'Shop-Logo', ja: 'ショップロゴ', ko: '상점 로고', es: 'Logotipo de la tienda', it: 'Logo del negozio', vi: 'Logo cửa hàng', fr: 'Logo de la boutique' })}
            </label>
            <label className="merchant-apply-upload merchant-apply-upload--logo">
              <input
                type="file"
                accept="image/*"
                className="merchant-apply-upload-input"
                onChange={(e) => handleImageUpload(e, 'logo', setLogoPreview)}
              />
              {imageUploading === 'logo' ? (
                <span className="merchant-apply-upload-loading">
                  {tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })}
                </span>
              ) : logoPreview ? (
                <img
                  src={logoPreview}
                  alt={tr(lang, { zh: '店铺标志', en: 'Shop logo', de: 'Shop-Logo', ja: 'ショップロゴ', ko: '상점 로고', es: 'Logotipo de la tienda', it: 'Logo del negozio', vi: 'Logo cửa hàng', fr: 'Logo de la boutique' })}
                  className="merchant-apply-upload-preview"
                />
              ) : (
                <svg className="merchant-apply-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </label>
          </div>

          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '店铺名称', en: 'Shop name', de: 'Shopname', ja: '店名', ko: '가게 이름', es: 'Nombre de la tienda', it: 'Nome del negozio', vi: 'Tên cửa hàng', fr: 'Nom de la boutique' })}
            </label>
            <input
              type="text"
              className="merchant-apply-input"
              placeholder={
                tr(lang, { zh: '请输入店铺名称,不包含特殊字符', en: 'Please enter your shop name without special characters', de: 'Bitte geben Sie Ihren Shopnamen ohne Sonderzeichen ein', ja: 'ショップ名を特殊文字なしで入力してください', ko: '특수문자 없이 매장명을 입력해주세요.', es: 'Por favor ingresa el nombre de tu tienda sin caracteres especiales', it: 'Inserisci il nome del tuo negozio senza caratteri speciali', vi: 'Vui lòng nhập tên cửa hàng của bạn không có ký tự đặc biệt', fr: 'Veuillez saisir le nom de votre boutique sans caractères spéciaux' })
              }
              value={formData.storeName}
              onChange={(e) => setFormData((d) => ({ ...d, storeName: e.target.value }))}
            />
          </div>

          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '店铺地址', en: 'Shop address', de: 'Shop-Adresse', ja: '店舗住所', ko: '매장 주소', es: 'Dirección de la tienda', it: 'Indirizzo del negozio', vi: 'Địa chỉ cửa hàng', fr: 'Adresse du magasin' })}
            </label>
            <input
              type="text"
              className="merchant-apply-input"
              placeholder={
                tr(lang, { zh: '请输入店铺地址,不包含特殊字符', en: 'Please enter your shop address without special characters', de: 'Bitte geben Sie Ihre Shop-Adresse ohne Sonderzeichen ein', ja: 'ショップの住所を特殊文字を含めずに入力してください', ko: '특수문자 없이 매장 주소를 입력해주세요.', es: 'Por favor introduce la dirección de tu tienda sin caracteres especiales', it: 'Inserisci l\'indirizzo del tuo negozio senza caratteri speciali', vi: 'Vui lòng nhập địa chỉ cửa hàng của bạn không có ký tự đặc biệt', fr: 'Veuillez saisir l\'adresse de votre boutique sans caractères spéciaux' })
              }
              value={formData.storeAddress}
              onChange={(e) => setFormData((d) => ({ ...d, storeAddress: e.target.value }))}
            />
          </div>

          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '国家', en: 'Country/Region', de: 'Land/Region', ja: '国/地域', ko: '국가/지역', es: 'País/Región', it: 'Paese/regione', vi: 'Quốc gia/Khu vực', fr: 'Pays/Région' })}
            </label>
            <input
              type="text"
              className="merchant-apply-input"
              placeholder={
                tr(lang, { zh: '请输入国家或地区', en: 'Please enter country or region', de: 'Bitte geben Sie Land oder Region ein', ja: '国または地域を入力してください', ko: '국가 또는 지역을 입력하세요.', es: 'Por favor ingrese país o región', it: 'Inserisci il paese o la regione', vi: 'Vui lòng nhập quốc gia hoặc khu vực', fr: 'Veuillez entrer le pays ou la région' })
              }
              value={formData.country}
              onChange={(e) => setFormData((d) => ({ ...d, country: e.target.value }))}
            />
          </div>

          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '证件/护照号码', en: 'ID / Passport number', de: 'Ausweis-/Passnummer', ja: 'ID/パスポート番号', ko: '신분증/여권번호', es: 'Número de DNI/Pasaporte', it: 'Numero di carta d\'identità/passaporto', vi: 'Số CMND/Hộ chiếu', fr: 'Numéro d\'identité/passeport' })}
            </label>
            <input
              type="text"
              className="merchant-apply-input"
              placeholder={
                tr(lang, { zh: '请输入身份证或者护照号', en: 'Please enter your ID or passport number', de: 'Bitte geben Sie Ihre Ausweis- oder Reisepassnummer ein', ja: 'IDまたはパスポート番号を入力してください', ko: '신분증이나 여권번호를 입력해주세요.', es: 'Por favor introduce tu número de DNI o pasaporte', it: 'Inserisci il tuo numero di carta d\'identità o passaporto', vi: 'Vui lòng nhập số CMND hoặc hộ chiếu của bạn', fr: 'Veuillez entrer votre numéro d\'identité ou de passeport' })
              }
              value={formData.idNumber}
              onChange={(e) => setFormData((d) => ({ ...d, idNumber: e.target.value }))}
            />
          </div>

          <div className="merchant-apply-field">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '真实姓名', en: 'Full legal name', de: 'Vollständiger legaler Name', ja: '正式な正式名', ko: '실명', es: 'Nombre legal completo', it: 'Nome legale completo', vi: 'Tên pháp lý đầy đủ', fr: 'Nom légal complet' })}
            </label>
            <input
              type="text"
              className="merchant-apply-input"
              placeholder={
                tr(lang, { zh: '请输入真实姓名,不包含特殊字符', en: 'Please enter your real name without special characters', de: 'Bitte geben Sie Ihren echten Namen ohne Sonderzeichen ein', ja: '特殊文字を含まない本名を入力してください', ko: '특수문자 없이 실명을 입력해주세요.', es: 'Por favor ingresa tu nombre real sin caracteres especiales', it: 'Inserisci il tuo vero nome senza caratteri speciali', vi: 'Vui lòng nhập tên thật của bạn không có ký tự đặc biệt', fr: 'Veuillez entrer votre vrai nom sans caractères spéciaux' })
              }
              value={formData.realName}
              onChange={(e) => setFormData((d) => ({ ...d, realName: e.target.value }))}
            />
          </div>

          <div className="merchant-apply-field merchant-apply-field--id-photos">
            <label className="merchant-apply-label">
              <span className="merchant-apply-required">*</span>
              {tr(lang, { zh: '证件照/上传护照', en: 'ID / passport photos', de: 'Ausweis-/Passfotos', ja: '身分証明書/パスポート用写真', ko: '신분증/여권 사진', es: 'Fotos de DNI/pasaporte', it: 'Foto carta d\'identità/passaporto', vi: 'Ảnh CMND/Hộ chiếu', fr: 'Photos d\'identité/passeport' })}
            </label>
            <div className="merchant-apply-id-uploads">
              <div className="merchant-apply-id-upload-item">
                <label className="merchant-apply-upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="merchant-apply-upload-input"
                    onChange={(e) => handleImageUpload(e, 'idFront', setIdFrontPreview)}
                  />
                  {imageUploading === 'idFront' ? (
                    <span className="merchant-apply-upload-loading">
                      {tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })}
                    </span>
                  ) : idFrontPreview ? (
                    <img
                      src={idFrontPreview}
                      alt={tr(lang, { zh: '证件正面', en: 'Front of ID', de: 'Vorderseite des Ausweises', ja: '身分証明書の表面', ko: '신분증 앞', es: 'Frente de identificación', it: 'Davanti all\'ID', vi: 'Mặt trước ID', fr: 'Recto de la pièce d\'identité' })}
                      className="merchant-apply-upload-preview"
                    />
                  ) : (
                    <svg className="merchant-apply-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </label>
                <span className="merchant-apply-id-upload-label">
                  {tr(lang, { zh: '证件正面', en: 'Front side', de: 'Vorderseite', ja: '前面', ko: '정면', es: 'Lado frontal', it: 'Lato anteriore', vi: 'Mặt trước', fr: 'Face avant' })}
                </span>
              </div>
              <div className="merchant-apply-id-upload-item">
                <label className="merchant-apply-upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="merchant-apply-upload-input"
                    onChange={(e) => handleImageUpload(e, 'idBack', setIdBackPreview)}
                  />
                  {imageUploading === 'idBack' ? (
                    <span className="merchant-apply-upload-loading">
                      {tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })}
                    </span>
                  ) : idBackPreview ? (
                    <img
                      src={idBackPreview}
                      alt={tr(lang, { zh: '证件反面', en: 'Back of ID', de: 'Rückseite des Ausweises', ja: '身分証明書の裏面', ko: '신분증 뒷면', es: 'Parte posterior de la identificación', it: 'Retro del documento d\'identità', vi: 'Mặt sau giấy tờ tùy thân', fr: 'Dos de la pièce d\'identité' })}
                      className="merchant-apply-upload-preview"
                    />
                  ) : (
                    <svg className="merchant-apply-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </label>
                <span className="merchant-apply-id-upload-label">
                  {tr(lang, { zh: '证件反面', en: 'Back side', de: 'Rückseite', ja: '裏側', ko: '후면', es: 'parte trasera', it: 'Lato posteriore', vi: 'Mặt sau', fr: 'Face arrière' })}
                </span>
              </div>
              <div className="merchant-apply-id-upload-item">
                <label className="merchant-apply-upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="merchant-apply-upload-input"
                    onChange={(e) => handleImageUpload(e, 'idHandheld', setIdHandheldPreview)}
                  />
                  {imageUploading === 'idHandheld' ? (
                    <span className="merchant-apply-upload-loading">
                      {tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })}
                    </span>
                  ) : idHandheldPreview ? (
                    <img
                      src={idHandheldPreview}
                      alt={tr(lang, { zh: '手持证件照', en: 'Handheld ID photo', de: 'Handheld-Ausweisfoto', ja: '手持ち証明写真', ko: '휴대용 신분증 사진', es: 'Foto de identificación portátil', it: 'Fototessera portatile', vi: 'Ảnh ID cầm tay', fr: 'Photo d\'identité portable' })}
                      className="merchant-apply-upload-preview"
                    />
                  ) : (
                    <svg className="merchant-apply-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </label>
                <span className="merchant-apply-id-upload-label">
                  {tr(lang, { zh: '手持证件照', en: 'Handheld photo', de: 'Handfoto', ja: '手持ち写真', ko: '휴대용 사진', es: 'Foto de mano', it: 'Foto a mano', vi: 'Ảnh cầm tay', fr: 'Photo à main levée' })}
                </span>
              </div>
            </div>
            <span className="merchant-apply-example-col-label">
              {tr(lang, { zh: '拍照示例', en: 'Photo examples', de: 'Fotobeispiele', ja: '写真例', ko: '사진 예', es: 'Ejemplos de fotos', it: 'Esempi di foto', vi: 'Ví dụ về ảnh', fr: 'Exemples de photos' })}
            </span>
            <div className="merchant-apply-example-list">
              <div className="merchant-apply-example-item">
                <img
                  src={idFrontExample}
                  alt={tr(lang, { zh: '证件正面示例', en: 'Front of ID example', de: 'Beispiel für die Vorderseite des Ausweises', ja: 'ID の前面の例', ko: 'ID 예시 앞면', es: 'Ejemplo de frente de identificación', it: 'Esempio di fronte dell\'ID', vi: 'Ví dụ về mặt trước của ID', fr: 'Exemple de recto d\'une pièce d\'identité' })}
                  className="merchant-apply-example-img"
                />
              </div>
              <div className="merchant-apply-example-item">
                <img
                  src={idBackExample}
                  alt={tr(lang, { zh: '证件反面示例', en: 'Back of ID example', de: 'Beispiel für die Rückseite eines Ausweises', ja: 'ID 例の裏面', ko: '신분증 예시 뒷면', es: 'Ejemplo de reverso de identificación', it: 'Esempio sul retro del documento d\'identità', vi: 'Ví dụ mặt sau của ID', fr: 'Exemple de verso d\'une pièce d\'identité' })}
                  className="merchant-apply-example-img"
                />
              </div>
              <div className="merchant-apply-example-item">
                <img
                  src={idHandheldExample}
                  alt={tr(lang, { zh: '手持证件照示例', en: 'Handheld ID photo example', de: 'Beispiel für ein Handheld-Ausweisfoto', ja: '手持ち証明写真例', ko: '휴대용 신분증 사진 예시', es: 'Ejemplo de fotografía de identificación portátil', it: 'Esempio di fototessera portatile', vi: 'Ví dụ về ảnh ID cầm tay', fr: 'Exemple de photo d\'identité portable' })}
                  className="merchant-apply-example-img"
                />
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* 入驻协议与提交 / Agreement & submit */}
      <section className="merchant-apply-section">
        <form className="merchant-apply-form merchant-apply-form--row" onSubmit={handleSubmit}>
          <div className="merchant-apply-field merchant-apply-field--checkbox">
            <div
              className="merchant-apply-checkbox-wrap"
              role="button"
              tabIndex={0}
              onClick={() => setAgreementModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setAgreementModalOpen(true)
                }
              }}
            >
              <span
                className={`merchant-apply-checkbox${agreed ? ' merchant-apply-checkbox--checked' : ''}`}
                aria-hidden
              />
              <span className="merchant-apply-checkbox-label">
                {tr(lang, { zh: '我已阅读并同意', en: 'I have read and agree to the ', de: 'Ich habe die gelesen und bin damit einverstanden', ja: 'を読んで同意します', ko: '나는 다음 내용을 읽었으며 이에 동의합니다.', es: 'He leído y acepto las', it: 'Ho letto e accetto il', vi: 'Tôi đã đọc và đồng ý với', fr: 'J\'ai lu et j\'accepte le' })}
                <span className="merchant-apply-checkbox-agreement">
                  {tr(lang, { zh: '入驻协议', en: 'Onboarding agreement', de: 'Onboarding-Vereinbarung', ja: 'オンボーディング契約', ko: '온보딩 계약', es: 'Acuerdo de incorporación', it: 'Contratto di onboarding', vi: 'Thỏa thuận giới thiệu', fr: 'Accord d\'intégration' })}
                </span>
              </span>
            </div>
          </div>

          <div className="merchant-apply-field merchant-apply-field--submit">
            <button
              type="submit"
              className={`merchant-apply-submit-btn${
                allRequiredFilled ? '' : ' merchant-apply-submit-btn--disabled'
              }`}
              disabled={!allRequiredFilled || submitting}
            >
              {submitting
                ? tr(lang, { zh: '提交中…', en: 'Submitting…', de: 'Einreichen…', ja: '送信中…', ko: '제출 중…', es: 'Sumisión…', it: 'Invio...', vi: 'Đang gửi…', fr: 'Soumission…' })
                : tr(lang, { zh: '提交申请表', en: 'Submit application', de: 'Bewerbung einreichen', ja: '申請書を提出する', ko: '신청서 제출', es: 'Enviar solicitud', it: 'Invia domanda', vi: 'Gửi đơn đăng ký', fr: 'Soumettre la candidature' })}
            </button>
          </div>
        </form>
      </section>

      {/* 入驻协议弹窗 / Agreement modal */}
      {agreementModalOpen && (
        <div
          className="merchant-apply-agreement-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="agreement-modal-title"
          onClick={() => setAgreementModalOpen(false)}
        >
          <div className="merchant-apply-agreement-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="merchant-apply-agreement-close"
              aria-label="关闭"
              onClick={() => setAgreementModalOpen(false)}
            >
              ×
            </button>
            <h2 id="agreement-modal-title" className="merchant-apply-agreement-title">
              {tr(lang, { zh: '经营合同', en: 'Business contract', de: 'Geschäftsvertrag', ja: '業務契約書', ko: '사업계약', es: 'Contrato comercial', it: 'Contratto d\'impresa', vi: 'Hợp đồng kinh doanh', fr: 'Contrat commercial' })}
            </h2>
            <div className="merchant-apply-agreement-body">
              {lang === 'zh' || lang === 'tw' ? (
                <>
                  <p>双方经友好协商，对于商城合作一事达成如下协议：</p>

                  <h3>一、甲方责任</h3>
                  <p>1.甲方需提供足够的供应商以及商品，用于合作。</p>
                  <p>2.甲方需提供安全及运输工作，以其一切工商税务和运输费用等。其包括：打包、安装、售后、运输、公共关系，等一切费用。</p>
                  <p>3.甲方需保证物流运输的正常运行，并负责商品和工作人员的安全。如出现人为破坏，被盗，物品损坏，均由甲方全面负责，照价赔偿。</p>

                  <h3>二、乙方责任</h3>
                  <p>1.乙方需提供商品成本、维护商城买家（客户关系）。</p>
                  <p>2.乙方保证良好的个人信用。</p>
                  <p>3.乙方需48小时内及时处理订单。</p>

                  <h3>三、违约条款</h3>
                  <p>1.如有特殊情况，经双方协商协议解决。</p>
                  <p>2.如受政策影响，特殊情况和经营状态不好，乙方全权负责。</p>
                  <p>3.双方必须严格遵守合同规定，如单方违约，任何一方需负法律责任或者赔偿。</p>
                  <p>4.即签字之日起效。</p>

                  <h3>四、补充规定</h3>
                  <p>本协议为电子合同，具有同等法律效力。</p>
                  <p>本协议未尽事宜，双方可通过友好协商达成补充协议解决。补充协议与本协议具有同等法律效力。</p>
                  <p>本协议一经签署，即视为双方已充分理解并同意本合同的全部条款。</p>
                </>
              ) : (
                <>
                  <p>
                    After friendly negotiation, both parties reach the following agreement on mall
                    cooperation:
                  </p>

                  <h3>1. Party A&apos;s responsibilities</h3>
                  <p>
                    (1) Party A shall provide sufficient suppliers and products for cooperation.
                  </p>
                  <p>
                    (2) Party A shall be responsible for logistics safety and transportation, and bear
                    all related industrial and commercial taxes and transportation costs, including
                    packing, installation, after‑sales service, transportation and public relations.
                  </p>
                  <p>
                    (3) Party A shall ensure normal logistics operation and the safety of goods and
                    staff. In case of human damage, theft or damage of goods, Party A shall be fully
                    responsible and make compensation at cost.
                  </p>

                  <h3>2. Party B&apos;s responsibilities</h3>
                  <p>
                    (1) Party B shall provide product cost and maintain mall buyers (customer
                    relationship).
                  </p>
                  <p>(2) Party B shall ensure good personal credit.</p>
                  <p>(3) Party B shall process orders in time within 48 hours.</p>

                  <h3>3. Breach of contract</h3>
                  <p>
                    (1) In case of special circumstances, both parties shall resolve them through
                    negotiation.
                  </p>
                  <p>
                    (2) If affected by policies or poor business conditions, Party B shall bear full
                    responsibility.
                  </p>
                  <p>
                    (3) Both parties must strictly abide by this contract. In case of unilateral
                    breach, the breaching party shall bear legal liability or compensation.
                  </p>
                  <p>(4) This agreement takes effect from the date of signing.</p>

                  <h3>4. Supplementary provisions</h3>
                  <p>This agreement is an electronic contract with the same legal effect.</p>
                  <p>
                    For matters not covered herein, both parties may sign supplementary agreements
                    through friendly negotiation, which shall have the same legal effect.
                  </p>
                  <p>
                    Once signed, this agreement is deemed that both parties have fully understood and
                    agreed to all its terms.
                  </p>
                </>
              )}

              <div className="merchant-apply-agreement-signatures">
                <div className="merchant-apply-agreement-party merchant-apply-agreement-party--a">
                  <p className="merchant-apply-agreement-party-line">
                    <span className="merchant-apply-agreement-party-label">
                      {tr(lang, { zh: '甲方：', en: 'Party A:', de: 'Partei A:', ja: '当事者A:', ko: '당사자 A:', es: 'Partido A:', it: 'Parte A:', vi: 'Bên A:', fr: 'Partie A :' })}
                    </span>
                    <span className="merchant-apply-agreement-party-name-wrap">
                      <span className="merchant-apply-agreement-party-name">TikTok Shop</span>
                      <img
                        src="/party-a-signature.png"
                        alt={tr(lang, { zh: '甲方签名', en: 'Party A\'s signature', de: 'Unterschrift von Partei A', ja: '当事者Aの署名', ko: 'A당사자의 서명', es: 'Firma del partido A.', it: 'Firma della parte A', vi: 'Chữ ký của bên A', fr: 'Signature de la partie A' })}
                        className="merchant-apply-agreement-signature-img"
                      />
                    </span>
                  </p>
                  <p>
                    {tr(lang, { zh: '日期：2026-02-27', en: 'Date: 2026-02-27', de: 'Datum: 27.02.2026', ja: '日付: 2026-02-27', ko: '날짜: 2026-02-27', es: 'Fecha: 2026-02-27', it: 'Data: 27-02-2026', vi: 'Ngày: 27-02-2026', fr: 'Dates : 2026-02-27' })}
                  </p>
                </div>
                <div className="merchant-apply-agreement-party merchant-apply-agreement-party--b">
                  <p className="merchant-apply-agreement-party-line">
                    <span className="merchant-apply-agreement-party-label">
                      {tr(lang, { zh: '乙方：', en: 'Party B:', de: 'Partei B:', ja: '当事者B:', ko: '파티 B:', es: 'Partido B:', it: 'Parte B:', vi: 'Bên B:', fr: 'Partie B :' })}
                    </span>
                    <span className="merchant-apply-agreement-party-name-wrap">
                      <span className="merchant-apply-agreement-party-name"> </span>
                      {partyBSignature ? (
                        <img
                          src={partyBSignature}
                          alt={tr(lang, { zh: '乙方签名', en: 'Party B\'s signature', de: 'Unterschrift von Partei B', ja: '当事者Bの署名', ko: 'B당의 서명', es: 'Firma del partido B.', it: 'La firma del partito B', vi: 'Chữ ký của bên B', fr: 'Signature de la partie B' })}
                          className="merchant-apply-agreement-signature-img"
                        />
                      ) : null}
                    </span>
                  </p>
                  <p>
                    <span className="merchant-apply-agreement-party-label">
                      {tr(lang, { zh: '日期：', en: 'Date: ', de: 'Datum:', ja: '日付：', ko: '날짜:', es: 'Fecha:', it: 'Data:', vi: 'Ngày:', fr: 'Date:' })}
                    </span>
                    2026-02-27
                  </p>
                </div>
              </div>
            </div>
            <div className="merchant-apply-agreement-actions">
              <button
                type="button"
                className="merchant-apply-agreement-btn merchant-apply-agreement-btn--primary"
                onClick={() => setSignatureModalOpen(true)}
              >
                {tr(lang, { zh: '同意并签名', en: 'Agree and sign', de: 'Zustimmen und unterschreiben', ja: '同意して署名する', ko: '동의하고 서명하세요', es: 'Aceptar y firmar', it: 'Accetta e firma', vi: 'Đồng ý và ký tên', fr: 'Acceptez et signez' })}
              </button>
              <button
                type="button"
                className="merchant-apply-agreement-btn merchant-apply-agreement-btn--secondary"
                onClick={() => setAgreementModalOpen(false)}
              >
                {tr(lang, { zh: '确认', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 签名确认弹窗（叠在协议弹窗之上） / Signature confirm modal */}
      {signatureModalOpen && (
        <div
          className="merchant-apply-signature-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={tr(lang, { zh: '签名确认', en: 'Signature confirmation', de: 'Unterschriftsbestätigung', ja: '署名の確認', ko: '서명 확인', es: 'Confirmación de firma', it: 'Conferma della firma', vi: 'Xác nhận chữ ký', fr: 'Confirmation de signature' })}
          onClick={() => setSignatureModalOpen(false)}
        >
          <div className="merchant-apply-signature-modal" onClick={(e) => e.stopPropagation()}>
            <p className="merchant-apply-signature-title">
              {tr(lang, { zh: '请在此处签名', en: 'Please sign here', de: 'Unterschreiben Sie bitte hier', ja: 'ここにご署名下さい', ko: '여기에 서명해주세요', es: 'Por favor, firme aquí', it: 'Firmi qui', vi: 'Vui lòng ký vào đây', fr: 'Veuillez signer ici, s\'il vous plaît' })}
            </p>
            <div className="merchant-apply-signature-pad-wrap">
              <canvas
                ref={canvasRef}
                className="merchant-apply-signature-canvas"
                onMouseDown={startDraw}
                onMouseMove={moveDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={moveDraw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="merchant-apply-signature-actions">
              <button
                type="button"
                className="merchant-apply-agreement-btn merchant-apply-agreement-btn--primary"
                onClick={clearSignatureCanvas}
              >
                {tr(lang, { zh: '重置', en: 'Reset', de: 'Zurücksetzen', ja: 'リセット', ko: '다시 놓기', es: 'Reiniciar', it: 'Reset', vi: 'Cài lại', fr: 'Réinitialiser' })}
              </button>
              <button
                type="button"
                className="merchant-apply-agreement-btn merchant-apply-agreement-btn--primary"
                onClick={() => setSignatureModalOpen(false)}
              >
                {tr(lang, { zh: '上一步', en: 'Back', de: 'Zurück', ja: '戻る', ko: '뒤쪽에', es: 'Atrás', it: 'Indietro', vi: 'Mặt sau', fr: 'Dos' })}
              </button>
              <button
                type="button"
                className="merchant-apply-agreement-btn merchant-apply-agreement-btn--primary"
                onClick={confirmSignature}
                disabled={imageUploading === 'signature'}
              >
                {imageUploading === 'signature'
                  ? tr(lang, { zh: '上传中…', en: 'Uploading…', de: 'Hochladen…', ja: 'アップロード中…', ko: '업로드 중…', es: 'Subiendo…', it: 'Caricamento…', vi: 'Đang tải lên…', fr: 'Téléchargement…' })
                  : tr(lang, { zh: '确认', en: 'Confirm', de: 'Bestätigen', ja: '確認する', ko: '확인하다', es: 'Confirmar', it: 'Confermare', vi: 'Xác nhận', fr: 'Confirmer' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MerchantApply
