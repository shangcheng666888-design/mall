import type React from 'react'
import { useState } from 'react'
import creditAmountIcon from '../assets/credit-feature-amount.png'
import creditFastIcon from '../assets/credit-feature-fast.png'
import creditSafeIcon from '../assets/credit-feature-safe.png'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


const CreditService: React.FC = () => {
  const { lang } = useLang()
  const [applyModalOpen, setApplyModalOpen] = useState(false)

  return (
    <div className="page credit-page">
      <section className="credit-hero">
        <div className="credit-hero-inner">
          <div className="credit-hero-content">
            <h1 className="credit-hero-title">
              {tr(lang, { zh: '创业贷款 解决借钱的烦恼', en: 'Startup loans to solve your funding worries', de: 'Startkredite zur Lösung Ihrer Finanzierungssorgen', ja: '資金繰りの悩みを解決する創業融資', ko: '자금 고민을 해결해주는 창업대출', es: 'Préstamos iniciales para resolver sus preocupaciones de financiación', it: 'Prestiti startup per risolvere i tuoi problemi di finanziamento', vi: 'Các khoản vay khởi nghiệp để giải quyết nỗi lo về vốn của bạn', fr: 'Des prêts de démarrage pour résoudre vos soucis de financement' })}
            </h1>
            <h2 className="credit-hero-subtitle">
              {tr(lang, { zh: '提供创业贷款 资金周转服务', en: 'Entrepreneurship loans and cash‑flow services', de: 'Unternehmerdarlehen und Cashflow-Dienstleistungen', ja: '起業家向け融資とキャッシュフロー サービス', ko: '기업가 정신 대출 및 현금 흐름 서비스', es: 'Préstamos empresariales y servicios de flujo de caja', it: 'Prestiti all’imprenditorialità e servizi di cash-flow', vi: 'Các khoản cho vay khởi nghiệp và dịch vụ dòng tiền', fr: 'Prêts à l’entrepreneuriat et services de trésorerie' })}
            </h2>
            <p className="credit-hero-description">
              {tr(lang, { zh: '为你解决资金紧张、无处借钱、不愿意再向朋友开口借钱等贷款难题，全程专业人员服务，随时解答你的疑惑。我们的目标是让每一笔贷款都透明化，让客户快速放心的使用。', en: 'We help you solve funding pressure, lack of borrowing channels, and the awkwardness of asking friends for money. Professional staff accompany you throughout the process and answer questions at any time. Our goal is to make every loan transparent so that you can use funds quickly and with peace of mind.', de: 'Wir helfen Ihnen, den Finanzierungsdruck, den Mangel an Kreditkanälen und die Unbeholfenheit, Freunde um Geld zu bitten, zu lösen. Professionelle Mitarbeiter begleiten Sie während des gesamten Prozesses und beantworten jederzeit Fragen. Unser Ziel ist es, jeden Kredit transparent zu machen, damit Sie die Mittel schnell und beruhigt verwenden können.', ja: '私たちは、資金調達のプレッシャー、借り入れ手段の不足、友人にお金を頼むときの気まずさなどを解決するお手伝いをします。専門スタッフがプロセス全体にわたって同行し、いつでも質問に答えます。私たちの目標は、すべての融資を透明化し、迅速かつ安心して資金をご利用いただけるようにすることです。', ko: '자금 압박, 대출 채널 부족, 친구에게 돈을 요구하는 어색함을 해결하도록 도와드립니다. 전 과정에 걸쳐 전문 직원이 동행하며 언제든지 질문에 답변해 드립니다. 우리의 목표는 모든 대출을 투명하게 만들어 귀하가 자금을 신속하고 안심하고 사용할 수 있도록 하는 것입니다.', es: 'Le ayudamos a resolver la presión de financiación, la falta de canales de préstamo y la incomodidad de pedir dinero a amigos. Personal profesional le acompañará durante todo el proceso y resolverá sus dudas en cualquier momento. Nuestro objetivo es hacer que cada préstamo sea transparente para que puedas utilizar los fondos rápidamente y con tranquilidad.', it: 'Ti aiutiamo a risolvere la pressione sui finanziamenti, la mancanza di canali di prestito e l\'imbarazzo di chiedere soldi agli amici. Il personale professionale ti accompagna durante tutto il processo e risponde alle domande in qualsiasi momento. Il nostro obiettivo è rendere trasparente ogni prestito in modo che tu possa utilizzare i fondi rapidamente e in tutta tranquillità.', vi: 'Chúng tôi giúp bạn giải quyết áp lực tài trợ, thiếu kênh vay và sự lúng túng khi xin tiền bạn bè. Đội ngũ nhân viên chuyên nghiệp đồng hành cùng bạn trong suốt quá trình và giải đáp thắc mắc bất cứ lúc nào. Mục tiêu của chúng tôi là minh bạch hóa mọi khoản vay để bạn có thể sử dụng tiền nhanh chóng và an tâm.', fr: 'Nous vous aidons à résoudre la pression de financement, le manque de canaux d’emprunt et la difficulté de demander de l’argent à des amis. Un personnel professionnel vous accompagne tout au long du processus et répond à vos questions à tout moment. Notre objectif est de rendre chaque prêt transparent afin que vous puissiez utiliser les fonds rapidement et en toute sérénité.' })}
            </p>
            <div className="credit-hero-actions">
              <button
                type="button"
                className="credit-hero-btn credit-hero-btn-primary"
                onClick={() => setApplyModalOpen(true)}
              >
                {tr(lang, { zh: '在线申请', en: 'Apply online', de: 'Bewerben Sie sich online', ja: 'オンラインで申し込む', ko: '온라인 신청', es: 'Aplicar en línea', it: 'Candidati on-line', vi: 'Đăng ký trực tuyến', fr: 'Postuler en ligne' })}
              </button>
              <button type="button" className="credit-hero-btn credit-hero-btn-secondary">
                {tr(lang, { zh: '我的贷款', en: 'My loans', de: 'Meine Kredite', ja: '私のローン', ko: '내 대출', es: 'mis prestamos', it: 'I miei prestiti', vi: 'Khoản vay của tôi', fr: 'Mes prêts' })}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="credit-feature-section">
        <h2 className="credit-feature-title">
          {tr(lang, { zh: '安全无忧', en: 'Secure and worry‑free', de: 'Sicher und sorgenfrei', ja: '安全で安心', ko: '안전하고 걱정할 필요가 없습니다', es: 'Seguro y sin preocupaciones', it: 'Sicuro e senza preoccupazioni', vi: 'An toàn và không phải lo lắng', fr: 'Sécurisé et sans souci' })}
        </h2>
        <div className="credit-feature-title-underline" />
        <div className="credit-feature-grid">
          <div className="credit-feature-card">
            <div className="credit-feature-icon">
              <img
                src={creditAmountIcon}
                alt={tr(lang, { zh: '灵活额度', en: 'Flexible credit limit', de: 'Flexibles Kreditlimit', ja: '柔軟な与信限度額', ko: '유연한 신용 한도', es: 'Límite de crédito flexible', it: 'Limite di credito flessibile', vi: 'Hạn mức tín dụng linh hoạt', fr: 'Limite de crédit flexible' })}
                className="credit-feature-icon-img"
              />
            </div>
            <h3 className="credit-feature-card-title">
              {tr(lang, { zh: '灵活额度', en: 'Flexible limits', de: 'Flexible Grenzen', ja: '柔軟な制限', ko: '유연한 한도', es: 'Límites flexibles', it: 'Limiti flessibili', vi: 'Giới hạn linh hoạt', fr: 'Limites flexibles' })}
            </h3>
            <p className="credit-feature-card-text">
              {tr(lang, { zh: '额度区间、利息、还款方式都可根据你的实际情况灵活配置，支持随借随还，提前结清无额外手续费。', en: 'Credit limit, interest and repayment method can all be tailored to your situation. Support borrow‑as‑you‑go and early repayment with no extra fees.', de: 'Kreditlimit, Zinsen und Rückzahlungsart können individuell auf Ihre Situation abgestimmt werden. Unterstützen Sie die Kreditaufnahme nach Bedarf und die vorzeitige Rückzahlung ohne zusätzliche Gebühren.', ja: '利用限度額、利息、返済方法などはお客様の状況に合わせてカスタマイズ可能です。追加手数料なしで、従量借入と早期返済をサポートします。', ko: '신용한도, 이자, 상환방법 등을 상황에 맞게 맞춤 설정할 수 있습니다. 추가 비용 없이 사용한 만큼 대출하고 조기 상환을 지원합니다.', es: 'El límite de crédito, los intereses y el método de pago pueden adaptarse a su situación. Apoye el préstamo sobre la marcha y el pago anticipado sin cargos adicionales.', it: 'Il limite di credito, gli interessi e il metodo di rimborso possono essere adattati alla tua situazione. Supporta il prestito a consumo e il rimborso anticipato senza costi aggiuntivi.', vi: 'Hạn mức tín dụng, lãi suất và phương thức trả nợ đều có thể được điều chỉnh phù hợp với tình hình của bạn. Hỗ trợ vay theo nhu cầu và trả nợ trước hạn mà không phải trả thêm phí.', fr: 'La limite de crédit, les intérêts et le mode de remboursement peuvent tous être adaptés à votre situation. Prenez en charge l’emprunt au fur et à mesure et le remboursement anticipé sans frais supplémentaires.' })}
            </p>
          </div>
          <div className="credit-feature-card">
            <div className="credit-feature-icon">
              <img
                src={creditFastIcon}
                alt={tr(lang, { zh: '急速放款', en: 'Fast disbursement', de: 'Schnelle Auszahlung', ja: '迅速な支払い', ko: '빠른 지급', es: 'Desembolso rápido', it: 'Erogazione rapida', vi: 'Giải ngân nhanh chóng', fr: 'Décaissement rapide' })}
                className="credit-feature-icon-img"
              />
            </div>
            <h3 className="credit-feature-card-title">
              {tr(lang, { zh: '急速放款', en: 'Fast approval', de: 'Schnelle Genehmigung', ja: '迅速な承認', ko: '빠른 승인', es: 'Aprobación rápida', it: 'Approvazione rapida', vi: 'Phê duyệt nhanh', fr: 'Approbation rapide' })}
            </h3>
            <p className="credit-feature-card-text">
              {tr(lang, { zh: '最快一个小时内完成审核，通过后资金实时到账，助你把握每一次创业和周转机会。', en: 'Approval can be completed in as fast as one hour, and funds are credited in real time after approval so you can seize every opportunity.', de: 'Die Genehmigung kann in nur einer Stunde abgeschlossen werden und die Gutschrift erfolgt in Echtzeit nach der Genehmigung, sodass Sie jede Gelegenheit nutzen können.', ja: '承認は最短 1 時間で完了し、承認後はリアルタイムで資金が入金されるため、あらゆる機会を捉えることができます。', ko: '승인은 최대 1시간 안에 완료될 수 있으며, 승인 후 실시간으로 자금이 적립되므로 모든 기회를 잡을 수 있습니다.', es: 'La aprobación se puede completar en tan solo una hora y los fondos se acreditan en tiempo real después de la aprobación para que pueda aprovechar cada oportunidad.', it: 'L\'approvazione può essere completata in appena un\'ora e i fondi vengono accreditati in tempo reale dopo l\'approvazione, così puoi cogliere ogni opportunità.', vi: 'Quá trình phê duyệt có thể được hoàn thành nhanh nhất trong một giờ và tiền sẽ được ghi có theo thời gian thực sau khi được phê duyệt để bạn có thể nắm bắt mọi cơ hội.', fr: 'L\'approbation peut être effectuée en une heure seulement, et les fonds sont crédités en temps réel après l\'approbation afin que vous puissiez saisir chaque opportunité.' })}
            </p>
          </div>
          <div className="credit-feature-card">
            <div className="credit-feature-icon">
              <img
                src={creditSafeIcon}
                alt={tr(lang, { zh: '安全无忧', en: 'Secure and reliable', de: 'Sicher und zuverlässig', ja: '安全で信頼性の高い', ko: '안전하고 신뢰할 수 있음', es: 'Seguro y confiable', it: 'Sicuro e affidabile', vi: 'An toàn và đáng tin cậy', fr: 'Sécurisé et fiable' })}
                className="credit-feature-icon-img"
              />
            </div>
            <h3 className="credit-feature-card-title">
              {tr(lang, { zh: '安全无忧', en: 'Secure and reliable', de: 'Sicher und zuverlässig', ja: '安全で信頼性の高い', ko: '안전하고 신뢰할 수 있음', es: 'Seguro y confiable', it: 'Sicuro e affidabile', vi: 'An toàn và đáng tin cậy', fr: 'Sécurisé et fiable' })}
            </h3>
            <p className="credit-feature-card-text">
              {tr(lang, { zh: '正规金融合作机构，全程数据加密，严格保护你的隐私和资金安全，让借款更安心。', en: 'We work with licensed financial institutions, encrypt your data end‑to‑end, and strictly protect your privacy and funds.', de: 'Wir arbeiten mit lizenzierten Finanzinstituten zusammen, verschlüsseln Ihre Daten Ende-zu-Ende und schützen Ihre Privatsphäre und Gelder streng.', ja: '当社は認可された金融機関と連携し、お客様のデータをエンドツーエンドで暗号化し、お客様のプライバシーと資金を厳格に保護します。', ko: '우리는 허가받은 금융 기관과 협력하여 귀하의 데이터를 엔드 투 엔드로 암호화하고 귀하의 개인정보와 자금을 엄격하게 보호합니다.', es: 'Trabajamos con instituciones financieras autorizadas, ciframos sus datos de extremo a extremo y protegemos estrictamente su privacidad y sus fondos.', it: 'Collaboriamo con istituti finanziari autorizzati, crittografiamo i tuoi dati end-to-end e proteggiamo rigorosamente la tua privacy e i tuoi fondi.', vi: 'Chúng tôi làm việc với các tổ chức tài chính được cấp phép, mã hóa dữ liệu của bạn từ đầu đến cuối và bảo vệ nghiêm ngặt quyền riêng tư cũng như tiền của bạn.', fr: 'Nous travaillons avec des institutions financières agréées, chiffrons vos données de bout en bout et protégeons strictement votre vie privée et vos fonds.' })}
            </p>
          </div>
        </div>
      </section>

      <section className="credit-about-section">
        <div className="credit-about-inner">
          <div className="credit-about-illustration" aria-hidden>
            <img src="/credit-about-illustration.png" alt="" className="credit-about-img" />
          </div>
          <div className="credit-about-content">
            <h2 className="credit-about-title">
              {tr(lang, { zh: '关于我们', en: 'About us', de: 'Über uns', ja: '私たちについて', ko: '회사 소개', es: 'Sobre nosotros', it: 'Chi siamo', vi: 'Về chúng tôi', fr: 'À propos de nous' })}
            </h2>
            <p className="credit-about-text">
              {tr(lang, { zh: '我们致力于为客户提供高效、基于客户至上的资金解决服务，以解决客户资金周转和贷款问题为使命。公司从风控、安全、合规多维度搭建风险管理体系，帮助市面各类客户解决资金难题。', en: 'We are committed to providing efficient, customer‑first funding solutions, focusing on cash‑flow and loan needs. From risk control to security and compliance, we build a multi‑dimensional risk management system to help customers solve funding challenges.', de: 'Wir sind bestrebt, effiziente, kundenorientierte Finanzierungslösungen bereitzustellen und uns dabei auf den Cashflow und den Kreditbedarf zu konzentrieren. Von der Risikokontrolle bis hin zu Sicherheit und Compliance bauen wir ein mehrdimensionales Risikomanagementsystem auf, um Kunden bei der Lösung von Finanzierungsproblemen zu unterstützen.', ja: '当社は、キャッシュフローとローンのニーズに重点を置き、効率的で顧客第一の資金調達ソリューションを提供することに尽力しています。リスク管理からセキュリティ、コンプライアンスに至るまで、当社は多次元のリスク管理システムを構築して、お客様の資金調達に関する課題の解決を支援します。', ko: '우리는 현금 흐름과 대출 요구에 초점을 맞춰 효율적인 고객 우선 자금 솔루션을 제공하기 위해 최선을 다하고 있습니다. 위험 통제부터 보안 및 규정 준수까지, 우리는 고객이 자금 조달 문제를 해결할 수 있도록 돕기 위해 다차원적인 위험 관리 시스템을 구축합니다.', es: 'Estamos comprometidos a brindar soluciones de financiamiento eficientes y centradas en el cliente, centrándonos en el flujo de efectivo y las necesidades de préstamos. Desde el control de riesgos hasta la seguridad y el cumplimiento, creamos un sistema de gestión de riesgos multidimensional para ayudar a los clientes a resolver los desafíos de financiación.', it: 'Ci impegniamo a fornire soluzioni di finanziamento efficienti, mettendo al primo posto il cliente, concentrandoci sulle esigenze di flusso di cassa e di prestito. Dal controllo del rischio alla sicurezza e alla conformità, costruiamo un sistema di gestione del rischio multidimensionale per aiutare i clienti a risolvere le sfide di finanziamento.', vi: 'Chúng tôi cam kết cung cấp các giải pháp cấp vốn hiệu quả, ưu tiên khách hàng, tập trung vào nhu cầu về dòng tiền và khoản vay. Từ kiểm soát rủi ro đến bảo mật và tuân thủ, chúng tôi xây dựng hệ thống quản lý rủi ro đa chiều để giúp khách hàng giải quyết các thách thức về vốn.', fr: 'Nous nous engageons à fournir des solutions de financement efficaces et axées sur le client, en nous concentrant sur les besoins de trésorerie et de prêt. Du contrôle des risques à la sécurité et à la conformité, nous construisons un système de gestion des risques multidimensionnel pour aider les clients à résoudre les problèmes de financement.' })}
            </p>
            <p className="credit-about-text">
              {tr(lang, { zh: '额度：100,000 至 30,000,000，利息及还款方式灵活，无任何前期费用，线上放款，不打审核电话，信息保密，当天放款。如有特别需求可单独沟通定制，请联系我们。', en: 'Limits from 100,000 to 30,000,000, with flexible interest and repayment options. No upfront fees, online disbursement, no intrusive verification calls, and strict confidentiality. Same‑day disbursement is available. For special needs, please contact us for a tailored plan.', de: 'Limits von 100.000 bis 30.000.000, mit flexiblen Zins- und Rückzahlungsoptionen. Keine Vorabgebühren, Online-Auszahlung, keine aufdringlichen Verifizierungsanrufe und strenge Vertraulichkeit. Eine Auszahlung am selben Tag ist möglich. Bei besonderen Bedürfnissen kontaktieren Sie uns bitte für einen maßgeschneiderten Plan.', ja: '限度額は 100,000 から 30,000,000 までで、金利と返済のオプションは柔軟です。前払い料金なし、オンライン支払い、煩わしい確認電話なし、機密保持は厳格です。即日出金も可能です。特別なニーズについては、カスタマイズされたプランについてお問い合わせください。', ko: '융통성 있는 이자 및 상환 옵션으로 한도는 100,000에서 30,000,000까지입니다. 선불 비용, 온라인 지불, 방해가 되는 확인 전화가 없고 엄격한 기밀이 보장됩니다. 당일 지급이 가능합니다. 특별한 요구 사항이 있는 경우 맞춤형 계획을 위해 당사에 문의하세요.', es: 'Límites de 100.000 a 30.000.000, con intereses flexibles y opciones de pago. Sin tarifas iniciales, desembolsos en línea, sin llamadas de verificación intrusivas y con estricta confidencialidad. El desembolso el mismo día está disponible. Para necesidades especiales, comuníquese con nosotros para obtener un plan personalizado.', it: 'Limiti da 100.000 a 30.000.000, con interessi flessibili e opzioni di rimborso. Nessuna commissione anticipata, pagamento online, nessuna chiamata di verifica intrusiva e massima riservatezza. È disponibile il pagamento in giornata. Per esigenze particolari contattateci per un progetto su misura.', vi: 'Hạn mức từ 100.000 đến 30.000.000, với các lựa chọn lãi suất và trả nợ linh hoạt. Không có phí trả trước, giải ngân trực tuyến, không có cuộc gọi xác minh xâm nhập và bảo mật nghiêm ngặt. Có thể giải ngân trong ngày. Đối với các nhu cầu đặc biệt, vui lòng liên hệ với chúng tôi để có kế hoạch phù hợp.', fr: 'Limites de 100 000 à 30 000 000, avec options flexibles d’intérêts et de remboursement. Pas de frais initiaux, de décaissement en ligne, pas d\'appels de vérification intrusifs et une stricte confidentialité. Un décaissement le jour même est disponible. Pour des besoins particuliers, veuillez nous contacter pour un plan sur mesure.' })}
            </p>
            <div className="credit-about-actions">
              <button type="button" className="credit-about-btn credit-about-btn-primary">
                {tr(lang, { zh: '致力于创业者贷款服务', en: 'Focused on loans for entrepreneurs', de: 'Konzentriert sich auf Kredite für Unternehmer', ja: '起業家向け融資に注力', ko: '기업가를 위한 대출에 중점을 두고 있습니다.', es: 'Enfocados en préstamos para emprendedores', it: 'Focalizzato sui prestiti per gli imprenditori', vi: 'Tập trung cho vay đối với doanh nghiệp', fr: 'Axé sur les prêts aux entrepreneurs' })}
              </button>
              <button type="button" className="credit-about-btn credit-about-btn-secondary">
                {tr(lang, { zh: '解决您的资金困扰', en: 'Solving your funding problems', de: 'Lösung Ihrer Finanzierungsprobleme', ja: '資金調達の問題を解決する', ko: '자금 문제 해결', es: 'Resolviendo sus problemas de financiación', it: 'Risolvere i tuoi problemi di finanziamento', vi: 'Giải quyết vấn đề tài chính của bạn', fr: 'Résoudre vos problèmes de financement' })}
              </button>
            </div>
          </div>
        </div>
      </section>

      {applyModalOpen && (
        <div
          className="credit-apply-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={tr(lang, { zh: '在线申请提示', en: 'Online application hint', de: 'Hinweis zur Online-Bewerbung', ja: 'オンライン申請のヒント', ko: '온라인 지원 힌트', es: 'Sugerencia de solicitud en línea', it: 'Suggerimento per l\'applicazione online', vi: 'Gợi ý ứng tuyển trực tuyến', fr: 'Conseil pour postuler en ligne' })}
          onClick={() => setApplyModalOpen(false)}
        >
          <div
            className="credit-apply-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="credit-apply-modal-text">
              {tr(lang, { zh: '请联系在线客服人员办理您的业务', en: 'Please contact our online customer service to process your request.', de: 'Bitte wenden Sie sich zur Bearbeitung Ihrer Anfrage an unseren Online-Kundenservice.', ja: 'リクエストを処理するには、オンライン カスタマー サービスにお問い合わせください。', ko: '귀하의 요청을 처리하려면 온라인 고객 서비스에 문의하십시오.', es: 'Póngase en contacto con nuestro servicio de atención al cliente en línea para procesar su solicitud.', it: 'Contatta il nostro servizio clienti online per elaborare la tua richiesta.', vi: 'Vui lòng liên hệ với dịch vụ khách hàng trực tuyến của chúng tôi để xử lý yêu cầu của bạn.', fr: 'Veuillez contacter notre service client en ligne pour traiter votre demande.' })}
            </p>
            <button
              type="button"
              className="credit-apply-modal-btn"
              onClick={() => setApplyModalOpen(false)}
            >
              {tr(lang, { zh: '知道了', en: 'Got it', de: 'Habe es', ja: 'わかった', ko: '알았어요', es: 'Entiendo', it: 'Fatto', vi: 'Hiểu rồi', fr: 'J\'ai compris' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreditService

