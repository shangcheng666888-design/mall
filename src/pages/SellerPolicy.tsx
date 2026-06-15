import type React from 'react'
import { useLang } from '../context/LangContext'
import { tr } from '../i18n'


const SellerPolicy: React.FC = () => {
  const { lang } = useLang()
  return (
    <div className="page policy-page">
      <h1 className="policy-title">
        {tr(lang, { zh: '卖家政策', en: 'Seller Policy', de: 'Verkäuferrichtlinie', ja: '販売者ポリシー', ko: '판매자 정책', es: 'Política del vendedor', it: 'Politica del venditore', vi: 'Chính sách người bán', fr: 'Politique du vendeur' })}
      </h1>
      <p className="policy-subtitle">
        {tr(lang, { zh: '卖家政策 · 卖家评分系统', en: 'Seller policy · Seller rating system', de: 'Verkäuferrichtlinien · Verkäuferbewertungssystem', ja: '販売者ポリシー・販売者評価システム', ko: '판매자 정책 · 판매자 등급 시스템', es: 'Política del vendedor · Sistema de calificación del vendedor', it: 'Politica del venditore · Sistema di valutazione del venditore', vi: 'Chính sách người bán · Hệ thống xếp hạng người bán', fr: 'Politique du vendeur · Système d\'évaluation des vendeurs' })}
      </p>

      <section className="policy-section">
        <h2>{tr(lang, { zh: '简介', en: 'Introduction', de: 'Einführung', ja: '導入', ko: '소개', es: 'Introducción', it: 'Introduzione', vi: 'Giới thiệu', fr: 'Introduction' })}</h2>
        <p>
          {tr(lang, { zh: '在这里，我们将向您介绍卖家评分系统及其生成和使用方式。', en: 'Here we introduce the seller rating system and how scores are generated and used.', de: 'Hier stellen wir das Verkäuferbewertungssystem und die Erstellung und Verwendung von Bewertungen vor.', ja: 'ここでは、販売者の評価システムとスコアの生成方法と使用方法を紹介します。', ko: '여기서는 판매자 등급 시스템과 점수 생성 및 사용 방법을 소개합니다.', es: 'Aquí presentamos el sistema de calificación del vendedor y cómo se generan y utilizan las puntuaciones.', it: 'Qui presentiamo il sistema di valutazione del venditore e il modo in cui i punteggi vengono generati e utilizzati.', vi: 'Ở đây chúng tôi giới thiệu hệ thống xếp hạng người bán cũng như cách tạo và sử dụng điểm.', fr: 'Nous présentons ici le système d\'évaluation des vendeurs et la manière dont les scores sont générés et utilisés.' })}
        </p>
        <p>
          <strong>{tr(lang, { zh: '相关网站：', en: 'Site: ', de: 'Website:', ja: 'サイト：', ko: '대지:', es: 'Sitio:', it: 'Sito:', vi: 'Địa điểm:', fr: 'Site:' })}</strong>
          TikTokMall
        </p>
        <p>
          <strong>{tr(lang, { zh: '相关方：', en: 'Applies to: ', de: 'Gilt für:', ja: '適用対象:', ko: '적용 대상:', es: 'Se aplica a:', it: 'Si applica a:', vi: 'Áp dụng cho:', fr: 'S\'applique à :' })}</strong>
          {tr(lang, { zh: '所有卖家', en: 'All sellers', de: 'Alle Verkäufer', ja: 'すべての販売者', ko: '모든 판매자', es: 'Todos los vendedores', it: 'Tutti i venditori', vi: 'Tất cả người bán', fr: 'Tous les vendeurs' })}
        </p>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '1、如何进入卖家评分系统？', en: '1. How does the seller rating work?', de: '1. Wie funktioniert die Verkäuferbewertung?', ja: '1. 販売者の評価はどのように機能しますか?', ko: '1. 판매자 평가는 어떻게 이루어지나요?', es: '1. ¿Cómo funciona la calificación del vendedor?', it: '1. Come funziona la valutazione del venditore?', vi: '1. Xếp hạng người bán hoạt động như thế nào?', fr: '1. Comment fonctionne l’évaluation du vendeur ?' })}
        </h2>
        <p>
          {tr(lang, { zh: '卖家评分系统鼓励卖家保持高服务标准，为我们的买家创造良好的购物体验。', en: 'The seller rating system encourages sellers to maintain high service standards and create a good shopping experience for buyers.', de: 'Das Verkäuferbewertungssystem ermutigt Verkäufer, hohe Servicestandards einzuhalten und den Käufern ein gutes Einkaufserlebnis zu bieten.', ja: '販売者評価システムは、販売者が高いサービス基準を維持し、購入者にとって優れたショッピング体験を生み出すことを奨励します。', ko: '판매자 등급 시스템은 판매자가 높은 서비스 표준을 유지하고 구매자에게 좋은 쇼핑 경험을 제공하도록 장려합니다.', es: 'El sistema de calificación de vendedores alienta a los vendedores a mantener altos estándares de servicio y crear una buena experiencia de compra para los compradores.', it: 'Il sistema di valutazione del venditore incoraggia i venditori a mantenere elevati standard di servizio e a creare una buona esperienza di acquisto per gli acquirenti.', vi: 'Hệ thống xếp hạng người bán khuyến khích người bán duy trì tiêu chuẩn dịch vụ cao và tạo trải nghiệm mua sắm tốt cho người mua.', fr: 'Le système d\'évaluation des vendeurs encourage les vendeurs à maintenir des normes de service élevées et à créer une bonne expérience d\'achat pour les acheteurs.' })}
        </p>
        <p>
          {tr(lang, { zh: '未达到承诺目标将扣分。', en: 'If the agreed targets are not met, points will be deducted.', de: 'Bei Nichterreichen der vereinbarten Ziele kommt es zu Punktabzug.', ja: '合意された目標が達成されなかった場合は、減点されます。', ko: '합의된 목표를 달성하지 못한 경우 포인트가 차감됩니다.', es: 'Si no se cumplen los objetivos acordados, se descontarán puntos.', it: 'Se gli obiettivi concordati non vengono raggiunti, i punti verranno detratti.', vi: 'Nếu không đạt chỉ tiêu đã thỏa thuận sẽ bị trừ điểm.', fr: 'Si les objectifs convenus ne sont pas atteints, des points seront déduits.' })}
        </p>
        <p>
          {tr(lang, { zh: '您可以在【卖家中心 &gt;&gt; 卖家信用评分】页面查看您的评分。', en: 'You can view your score on the page “Seller Center &gt;&gt; Seller credit score”.', de: 'Sie können Ihren Punktestand auf der Seite „Verkäufercenter &gt;&gt; Kreditwürdigkeit des Verkäufers“ einsehen.', ja: 'スコアは「販売者センター &gt;&gt; 販売者クレジット スコア」ページで確認できます。', ko: '\'셀러센터&gt;&gt;셀러신용점수\' 페이지에서 귀하의 점수를 확인하실 수 있습니다.', es: 'Puede ver su puntaje en la página "Centro de vendedores > Puntaje de crédito del vendedor".', it: 'Puoi visualizzare il tuo punteggio nella pagina "Centro venditori &gt;&gt; Punteggio credito venditore".', vi: 'Bạn có thể xem điểm của mình trên trang “Trung tâm người bán &gt;&gt; Điểm tín dụng của người bán”.', fr: 'Vous pouvez consulter votre score sur la page « Seller Center > Score de crédit du vendeur ».' })}
        </p>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '2、评分是如何产生的？', en: '2. How are scores generated?', de: '2. Wie werden Punkte generiert?', ja: '2. スコアはどのように生成されますか?', ko: '2. 점수는 어떻게 생성되나요?', es: '2. ¿Cómo se generan las puntuaciones?', it: '2. Come vengono generati i punteggi?', vi: '2. Điểm được tạo ra như thế nào?', fr: '2. Comment les scores sont-ils générés ?' })}
        </h2>
        <p>
          {tr(lang, { zh: '仅当未满足买方的最低期望时才会产生扣分，这也提醒卖家还有哪些问题需要改进。', en: 'Points are only deducted when the minimum expectations of buyers are not met, which also highlights areas where the seller needs to improve.', de: 'Punkte werden nur dann abgezogen, wenn die Mindesterwartungen der Käufer nicht erfüllt werden, was auch Bereiche aufzeigt, in denen der Verkäufer Verbesserungsbedarf hat.', ja: 'ポイントは購入者の最低限の期待が満たされない場合にのみ減点されますが、これは販売者が改善する必要がある領域も浮き彫りにします。', ko: '구매자의 최소 기대치가 충족되지 않은 경우에만 포인트가 차감되며, 이는 판매자가 개선해야 할 부분도 강조합니다.', es: 'Los puntos sólo se deducen cuando no se cumplen las expectativas mínimas de los compradores, lo que también resalta áreas donde el vendedor necesita mejorar.', it: 'I punti vengono detratti solo quando le aspettative minime degli acquirenti non vengono soddisfatte, il che evidenzia anche le aree in cui il venditore deve migliorare.', vi: 'Điểm chỉ bị trừ khi không đáp ứng được kỳ vọng tối thiểu của người mua, điều này cũng nêu bật những lĩnh vực mà người bán cần cải thiện.', fr: 'Des points ne sont déduits que lorsque les attentes minimales des acheteurs ne sont pas satisfaites, ce qui met également en évidence les domaines dans lesquels le vendeur doit s\'améliorer.' })}
        </p>
        <p>
          {tr(lang, { zh: '卖家评分系统会在每个月的第一天根据卖家上月的违规情况更新评分。您可以点击对应的评分维度关键词查看完整的政策。', en: 'On the first day of each month, the seller rating system updates scores based on violations in the previous month. You can click each metric keyword to view the full policy.', de: 'Am ersten Tag jedes Monats aktualisiert das Verkäuferbewertungssystem die Bewertungen basierend auf Verstößen im Vormonat. Sie können auf jedes Metrikschlüsselwort klicken, um die vollständige Richtlinie anzuzeigen.', ja: '毎月 1 日に、販売者評価システムは前月の違反に基づいてスコアを更新します。各指標のキーワードをクリックすると、完全なポリシーが表示されます。', ko: '매월 1일, 판매자 등급 시스템은 이전 달의 위반 사항을 기준으로 점수를 업데이트합니다. 각 지표 키워드를 클릭하면 전체 정책을 볼 수 있습니다.', es: 'El primer día de cada mes, el sistema de calificación del vendedor actualiza las puntuaciones en función de las infracciones del mes anterior. Puede hacer clic en cada palabra clave métrica para ver la política completa.', it: 'Il primo giorno di ogni mese, il sistema di valutazione del venditore aggiorna i punteggi in base alle violazioni del mese precedente. È possibile fare clic su ciascuna parola chiave della metrica per visualizzare la policy completa.', vi: 'Vào ngày đầu tiên hàng tháng, hệ thống xếp hạng người bán sẽ cập nhật điểm dựa trên các vi phạm trong tháng trước. Bạn có thể nhấp vào từng từ khóa số liệu để xem chính sách đầy đủ.', fr: 'Le premier jour de chaque mois, le système d\'évaluation des vendeurs met à jour les scores en fonction des violations du mois précédent. Vous pouvez cliquer sur chaque mot-clé de mesure pour afficher la politique complète.' })}
        </p>
        <div className="policy-table-wrap">
          <table className="policy-table">
            <thead>
              <tr>
                <th>{tr(lang, { zh: '计分指标', en: 'Metric', de: 'Metrisch', ja: 'メトリック', ko: '미터법', es: 'Métrico', it: 'Metrico', vi: 'Số liệu', fr: 'Métrique' })}</th>
                <th>{tr(lang, { zh: '说明', en: 'Details', de: 'Details', ja: '詳細', ko: '세부', es: 'Detalles', it: 'Dettagli', vi: 'Chi tiết', fr: 'Détails' })}</th>
                <th>{tr(lang, { zh: '违规处罚', en: 'Penalty', de: 'Strafe', ja: 'ペナルティ', ko: '패널티', es: 'Pena', it: 'Pena', vi: 'Hình phạt', fr: 'Peine' })}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{tr(lang, { zh: '不履行率（NFR）', en: 'Non‑fulfilment rate (NFR)', de: 'Nichterfüllungsquote (NFR)', ja: '不履行率 (NFR)', ko: '불이행률(NFR)', es: 'Tasa de incumplimiento (NFR)', it: 'Tasso di inadempienza (NFR)', vi: 'Tỷ lệ không thực hiện (NFR)', fr: 'Taux de non-exécution (NFR)' })}</td>
                <td>
                  {tr(lang, { zh: '近 7 天卖家取消或退货的订单数量占订单总数的 30%', en: 'In the last 7 days, cancelled or returned orders exceed 30% of total orders.', de: 'In den letzten 7 Tagen übersteigen die stornierten oder zurückgegebenen Bestellungen 30 % der Gesamtbestellungen.', ja: '過去 7 日間のキャンセルまたは返品された注文は、注文総数の 30% を超えています。', ko: '지난 7일 동안 취소 또는 반품된 주문이 전체 주문의 30%를 초과했습니다.', es: 'En los últimos 7 días, los pedidos cancelados o devueltos superan el 30% del total de los pedidos.', it: 'Negli ultimi 7 giorni gli ordini annullati o restituiti superano il 30% del totale degli ordini.', vi: 'Trong 7 ngày qua, số đơn đặt hàng bị hủy hoặc trả lại vượt quá 30% tổng số đơn đặt hàng.', fr: 'Au cours des 7 derniers jours, les commandes annulées ou retournées dépassent 30 % du total des commandes.' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
              <tr>
                <td>{tr(lang, { zh: '迟发率（LSR）', en: 'Late shipment rate (LSR)', de: 'Rate verspäteter Lieferungen (LSR)', ja: '遅延出荷率 (LSR)', ko: '배송지연율(LSR)', es: 'Tasa de envíos tardíos (LSR)', it: 'Tasso di spedizioni in ritardo (LSR)', vi: 'Tỷ lệ giao hàng trễ (LSR)', fr: 'Taux d\'expédition en retard (LSR)' })}</td>
                <td>
                  {tr(lang, { zh: '近 7 天内卖家延迟 72 小时以上的订单数量占订单总数的 20%', en: 'In the last 7 days, orders shipped more than 72 hours late exceed 20% of total orders.', de: 'In den letzten 7 Tagen überstiegen die Bestellungen, die mit einer Verspätung von mehr als 72 Stunden versendet wurden, 20 % der Gesamtbestellungen.', ja: '過去 7 日間で、72 時間以上遅れて出荷された注文は、注文全体の 20% を超えています。', ko: '지난 7일 동안 72시간 이상 늦게 배송된 주문이 전체 주문의 20%를 초과합니다.', es: 'En los últimos 7 días, los pedidos enviados con más de 72 horas de retraso superan el 20% del total de los pedidos.', it: 'Negli ultimi 7 giorni gli ordini spediti con più di 72 ore di ritardo superano il 20% del totale degli ordini.', vi: 'Trong 7 ngày qua, số đơn đặt hàng bị vận chuyển trễ hơn 72 giờ vượt quá 20% tổng số đơn đặt hàng.', fr: 'Au cours des 7 derniers jours, les commandes expédiées avec plus de 72 heures de retard dépassent 20 % du total des commandes.' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
              <tr>
                <td rowSpan={2}>{tr(lang, { zh: '客户服务', en: 'Customer service', de: 'Kundendienst', ja: '顧客サービス', ko: '고객 서비스', es: 'Servicio al cliente', it: 'Assistenza clienti', vi: 'Dịch vụ khách hàng', fr: 'Service client' })}</td>
                <td>
                  {tr(lang, { zh: '粗鲁或辱骂性的聊天或评论', en: 'Rude or abusive chat messages or comments', de: 'Unhöfliche oder beleidigende Chatnachrichten oder Kommentare', ja: '失礼または虐待的なチャット メッセージまたはコメント', ko: '무례하거나 모욕적인 채팅 메시지나 댓글', es: 'Mensajes o comentarios de chat groseros o abusivos.', it: 'Messaggi o commenti in chat scortesi o offensivi', vi: 'Tin nhắn hoặc bình luận trò chuyện thô lỗ hoặc lạm dụng', fr: 'Messages ou commentaires grossiers ou abusifs' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
              <tr>
                <td>
                  {tr(lang, { zh: '要求买家本月取消订单超过 5 次', en: 'Seller asks buyers to cancel orders more than 5 times in a month', de: 'Der Verkäufer bittet Käufer, Bestellungen mehr als fünfmal im Monat zu stornieren', ja: '販売者は購入者に月に5回以上注文をキャンセルするよう求めています', ko: '판매자가 구매자에게 한 달에 5회 이상 주문 취소를 요청합니다.', es: 'El vendedor pide a los compradores que cancelen los pedidos más de 5 veces al mes', it: 'Il venditore chiede agli acquirenti di annullare gli ordini più di 5 volte in un mese', vi: 'Người bán yêu cầu người mua hủy đơn hàng hơn 5 lần trong một tháng', fr: 'Le vendeur demande aux acheteurs d\'annuler les commandes plus de 5 fois par mois' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
              <tr>
                <td rowSpan={2}>{tr(lang, { zh: '不守诺言', en: 'Broken promises', de: 'Gebrochene Versprechen', ja: '破られた約束', ko: '깨진 약속', es: 'Promesas incumplidas', it: 'Promesse non mantenute', vi: 'Thất hứa', fr: 'Promesses non tenues' })}</td>
                <td>
                  {tr(lang, { zh: '买家回复率低于 80%', en: 'Reply rate to buyers is lower than 80%', de: 'Die Antwortrate an Käufer liegt unter 80 %', ja: '購入者への返信率は 80% 未満です', ko: '구매자에 대한 응답률이 80% 미만입니다.', es: 'La tasa de respuesta a los compradores es inferior al 80%', it: 'Il tasso di risposta agli acquirenti è inferiore all\'80%', vi: 'Tỷ lệ trả lời người mua thấp hơn 80%', fr: 'Le taux de réponse aux acheteurs est inférieur à 80 %' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
              <tr>
                <td>
                  {tr(lang, { zh: '卖方未按承诺向买方提供服务，损害买方权益', en: 'Seller fails to provide services as promised, harming buyer rights', de: 'Der Verkäufer erbringt die versprochenen Dienstleistungen nicht, wodurch die Rechte des Käufers beeinträchtigt werden', ja: '売主が約束どおりにサービスを提供せず、買主の権利を侵害する', ko: '판매자가 약속한 대로 서비스를 제공하지 않아 구매자의 권리가 침해됨', es: 'El vendedor no proporciona los servicios prometidos, lo que perjudica los derechos del comprador', it: 'Il venditore non fornisce i servizi promessi, danneggiando i diritti dell\'acquirente', vi: 'Bên bán không cung cấp dịch vụ như đã hứa, gây tổn hại đến quyền lợi của bên mua', fr: 'Le vendeur ne fournit pas les services promis, ce qui porte atteinte aux droits de l\'acheteur.' })}
                </td>
                <td>{tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '3、与一定积分相关的惩罚是什么？', en: '3. What penalties correspond to the total score?', de: '3. Welche Strafen entsprechen der Gesamtpunktzahl?', ja: '3. 合計スコアに対応するペナルティは何ですか?', ko: '3. 총점에 해당하는 벌점은 무엇입니까?', es: '3. ¿Qué penalizaciones corresponden al puntaje total?', it: '3. Quali penalità corrispondono al punteggio totale?', vi: '3. Hình phạt nào tương ứng với tổng điểm?', fr: '3. Quelles pénalités correspondent au score total ?' })}
        </h2>
        <p>
          {tr(lang, { zh: '总积分与处罚级别对应关系如下，达到该级别即适用对应及以下所有处罚。', en: 'The total score corresponds to penalty levels as below. Once a level is reached, all penalties for that and lower levels apply.', de: 'Die Gesamtpunktzahl entspricht den unten aufgeführten Strafstufen. Sobald ein Level erreicht ist, gelten alle Strafen für dieses und niedrigere Level.', ja: '合計スコアは、以下のペナルティ レベルに対応します。あるレベルに到達すると、そのレベルとそれより低いレベルのすべてのペナルティが適用されます。', ko: '총점은 아래와 같이 페널티 등급에 해당됩니다. 특정 레벨에 도달하면 해당 레벨과 그보다 낮은 레벨에 대한 모든 페널티가 적용됩니다.', es: 'La puntuación total corresponde a los niveles de penalización que se muestran a continuación. Una vez que se alcanza un nivel, se aplican todas las penalizaciones para ese nivel y los inferiores.', it: 'Il punteggio totale corrisponde ai livelli di penalità come di seguito. Una volta raggiunto un livello, si applicano tutte le penalità per quello e per i livelli inferiori.', vi: 'Tổng điểm tương ứng với các mức phạt như dưới đây. Khi đạt đến một cấp độ, tất cả các hình phạt cho cấp độ đó và cấp độ thấp hơn sẽ được áp dụng.', fr: 'Le score total correspond aux niveaux de pénalité ci-dessous. Une fois qu\'un niveau est atteint, toutes les pénalités pour ce niveau et les niveaux inférieurs s\'appliquent.' })}
        </p>
        <div className="policy-table-wrap">
          <table className="policy-table policy-table-penalty">
            <thead>
              <tr>
                <th rowSpan={2}></th>
                <th colSpan={6}>{tr(lang, { zh: '总积分', en: 'Total score', de: 'Gesamtpunktzahl', ja: '合計スコア', ko: '총점', es: 'Puntuación total', it: 'Punteggio totale', vi: 'Tổng số điểm', fr: 'Note totale' })}</th>
              </tr>
              <tr>
                <th>5</th>
                <th>10</th>
                <th>15</th>
                <th>20</th>
                <th>25</th>
                <th>&gt;25</th>
              </tr>
              <tr>
                <th>{tr(lang, { zh: '处罚级别', en: 'Penalty level', de: 'Strafhöhe', ja: 'ペナルティレベル', ko: '페널티 수준', es: 'Nivel de penalización', it: 'Livello di penalità', vi: 'Mức phạt', fr: 'Niveau de pénalité' })}</th>
                <th>{tr(lang, { zh: '1等级', en: 'Level 1', de: 'Stufe 1', ja: 'レベル1', ko: '레벨 1', es: 'Nivel 1', it: 'Livello 1', vi: 'Cấp 1', fr: 'Niveau 1' })}</th>
                <th>{tr(lang, { zh: '2等级', en: 'Level 2', de: 'Stufe 2', ja: 'レベル2', ko: '레벨 2', es: 'Nivel 2', it: 'Livello 2', vi: 'Cấp 2', fr: 'Niveau 2' })}</th>
                <th>{tr(lang, { zh: '3等级', en: 'Level 3', de: 'Stufe 3', ja: 'レベル3', ko: '레벨 3', es: 'Nivel 3', it: 'Livello 3', vi: 'Cấp 3', fr: 'Niveau 3' })}</th>
                <th>{tr(lang, { zh: '4等级', en: 'Level 4', de: 'Stufe 4', ja: 'レベル4', ko: '레벨 4', es: 'Nivel 4', it: 'Livello 4', vi: 'Cấp 4', fr: 'Niveau 4' })}</th>
                <th>{tr(lang, { zh: '5等级', en: 'Level 5', de: 'Stufe 5', ja: 'レベル5', ko: '레벨 5', es: 'Nivel 5', it: 'Livello 5', vi: 'Cấp 5', fr: 'Niveau 5' })}</th>
                <th>{tr(lang, { zh: '6等级', en: 'Level 6', de: 'Stufe 6', ja: 'レベル6', ko: '레벨 6', es: 'Nivel 6', it: 'Livello 6', vi: 'Cấp 6', fr: 'Niveau 6' })}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{tr(lang, { zh: '禁止营销活动', en: 'No marketing activities', de: 'Keine Marketingaktivitäten', ja: 'マーケティング活動はありません', ko: '마케팅 활동 없음', es: 'Sin actividades de marketing', it: 'Nessuna attività di marketing', vi: 'Không có hoạt động tiếp thị', fr: 'Aucune activité de marketing' })}</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
              </tr>
              <tr>
                <td>
                  {tr(lang, { zh: '删除免运费或运费回扣', en: 'Remove free‑shipping or shipping rebates', de: 'Entfernen Sie kostenlosen Versand oder Versandrabatte', ja: '送料無料または送料リベートを削除する', ko: '무료 배송 또는 배송 리베이트 제거', es: 'Eliminar envío gratuito o reembolsos de envío', it: 'Rimuovi la spedizione gratuita o gli sconti sulla spedizione', vi: 'Xóa miễn phí vận chuyển hoặc giảm giá vận chuyển', fr: 'Supprimer la livraison gratuite ou les remises sur les frais d\'expédition' })}
                </td>
                <td></td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
              </tr>
              <tr>
                <td>{tr(lang, { zh: 'Deboost 上市', en: 'Deboost product listings', de: 'Deboost-Produktlisten', ja: 'デブースト製品リスト', ko: '디부스트 제품 목록', es: 'Desacelerar listados de productos', it: 'Deboost elenchi di prodotti', vi: 'Gỡ bỏ danh sách sản phẩm', fr: 'Débooster les fiches produits' })}</td>
                <td></td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
              </tr>
              <tr>
                <td>{tr(lang, { zh: '限制卖方贷款', en: 'Restrict seller loans', de: 'Verkäuferdarlehen einschränken', ja: '売り手のローンを制限する', ko: '판매자 대출 제한', es: 'Restringir préstamos a vendedores', it: 'Limitare i prestiti al venditore', vi: 'Hạn chế cho vay người bán', fr: 'Restreindre les prêts aux vendeurs' })}</td>
                <td></td>
                <td></td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
              </tr>
              <tr>
                <td>
                  {tr(lang, { zh: '阻止列表创建和编辑', en: 'Block listing creation and editing', de: 'Erstellung und Bearbeitung von Blocklisten', ja: 'ブロックリストの作成と編集', ko: '차단 목록 생성 및 편집', es: 'Creación y edición de listas de bloqueo', it: 'Blocca la creazione e la modifica di elenchi', vi: 'Chặn tạo và chỉnh sửa danh sách', fr: 'Création et modification de listes de blocage' })}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>●</td>
                <td>●</td>
                <td>●</td>
              </tr>
              <tr>
                <td>{tr(lang, { zh: '冻结账户', en: 'Freeze account', de: 'Konto einfrieren', ja: 'アカウントを凍結する', ko: '계정 동결', es: 'congelar cuenta', it: 'Congelare il conto', vi: 'Đóng băng tài khoản', fr: 'Geler le compte' })}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>●</td>
                <td>●</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '4、客户服务规则及实施细则', en: '4. Customer service rules and details', de: '4. Kundendienstregeln und -details', ja: '4. 顧客サービスの規則と詳細', ko: '4. 고객 서비스 규정 및 세부 사항', es: '4. Normas y detalles de atención al cliente', it: '4. Regole e dettagli del servizio clienti', vi: '4. Quy tắc và chi tiết dịch vụ khách hàng', fr: '4. Règles et détails du service client' })}
        </h2>
        <h3>
          {tr(lang, { zh: '什么是粗鲁或辱骂性的聊天或评论？', en: 'What is considered rude or abusive chat or comments?', de: 'Was gilt als unhöflicher oder beleidigender Chat oder Kommentar?', ja: '失礼または虐待的なチャットやコメントとは何ですか?', ko: '무례하거나 모욕적인 채팅이나 댓글은 무엇입니까?', es: '¿Qué se considera un chat o comentario grosero o abusivo?', it: 'Quali sono le chat o i commenti considerati maleducati o offensivi?', vi: 'Trò chuyện hoặc bình luận như thế nào được coi là thô lỗ hoặc lăng mạ?', fr: 'Qu\'est-ce qui est considéré comme un chat ou un commentaire grossier ou abusif ?' })}
        </h3>
        <p>
          {tr(lang, { zh: '恶意骚扰是指会员对他人进行侮辱、诅咒、威胁、评论等言语攻击或采取不正当手段骚扰他人，损害他人合法权益的行为。', en: 'Malicious harassment refers to insulting, cursing, threatening or otherwise verbally attacking others, or using improper means to harass others and harm their legitimate rights and interests.', de: 'Unter böswilliger Belästigung versteht man die Beleidigung, Beschimpfung, Drohung oder anderweitige verbale Attacke auf andere oder den Einsatz unangemessener Mittel, um andere zu belästigen und ihre legitimen Rechte und Interessen zu verletzen.', ja: '悪意のあるハラスメントとは、他者を侮辱、罵倒、脅迫、またはその他の言葉で攻撃すること、または不適切な手段を使用して他者に嫌がらせをし、正当な権利や利益を害することを指します。', ko: '악의적 괴롭힘이란 타인을 모욕, 저주, 위협, 기타 언어로 공격하는 행위 또는 부적절한 수단을 사용하여 타인을 희롱하고 정당한 권익을 침해하는 행위를 말합니다.', es: 'El acoso malicioso se refiere a insultar, maldecir, amenazar o atacar verbalmente a otros, o utilizar medios inadecuados para acosar a otros y dañar sus derechos e intereses legítimos.', it: 'Per molestie dannose si intendono l\'insulto, la maledizione, la minaccia o l\'attacco verbale in altro modo ad altri o l\'uso di mezzi impropri per molestare gli altri e danneggiare i loro diritti e interessi legittimi.', vi: 'Quấy rối ác ý là lăng mạ, chửi bới, đe dọa hoặc tấn công bằng lời nói khác hoặc sử dụng các biện pháp không phù hợp để quấy rối người khác, gây tổn hại đến quyền và lợi ích hợp pháp của họ.', fr: 'Le harcèlement malveillant fait référence au fait d\'insulter, d\'insulter, de menacer ou d\'attaquer verbalement autrui, ou d\'utiliser des moyens inappropriés pour harceler autrui et nuire à ses droits et intérêts légitimes.' })}
        </p>
        <h3>
          {tr(lang, { zh: '如何处理粗鲁或辱骂性的聊天或评论？', en: 'How are rude or abusive chats or comments handled?', de: 'Wie wird mit unhöflichen oder beleidigenden Chats oder Kommentaren umgegangen?', ja: '失礼または虐待的なチャットやコメントはどのように処理されますか?', ko: '무례하거나 모욕적인 채팅이나 댓글은 어떻게 처리되나요?', es: '¿Cómo se manejan los chats o comentarios groseros o abusivos?', it: 'Come vengono gestiti le chat o i commenti scortesi o offensivi?', vi: 'Những cuộc trò chuyện hoặc bình luận thô lỗ hoặc lăng mạ được xử lý như thế nào?', fr: 'Comment les discussions ou commentaires grossiers ou abusifs sont-ils traités ?' })}
        </h3>
        <p>
          {tr(lang, { zh: '此类行为将作为一般或严重违规，对业务权限进行扣分管理和限制。', en: 'Such behaviour is treated as a general or serious violation, and points will be deducted with corresponding restrictions on business permissions.', de: 'Ein solches Verhalten wird als allgemeiner oder schwerwiegender Verstoß gewertet und mit Punktabzug und entsprechender Einschränkung der Geschäftsgenehmigungen geahndet.', ja: 'このような行為は一般的または重大な違反として扱われ、営業許可に対する対応制限とともに減点の対象となります。', ko: '이러한 행위는 일반 위반 또는 심각한 위반으로 간주되며, 이에 상응하는 영업 허가 제한에 따라 감점됩니다.', es: 'Tal comportamiento se trata como una infracción general o grave y se deducirán puntos con las restricciones correspondientes en los permisos comerciales.', it: 'Tale comportamento viene trattato come una violazione generale o grave e verranno detratti punti con le corrispondenti restrizioni sulle autorizzazioni aziendali.', vi: 'Hành vi như vậy được coi là vi phạm chung hoặc vi phạm nghiêm trọng và sẽ bị trừ điểm kèm theo các hạn chế tương ứng về quyền kinh doanh.', fr: 'Un tel comportement est traité comme une violation générale ou grave, et des points seront déduits avec les restrictions correspondantes sur les autorisations commerciales.' })}
        </p>
        <p>
          <strong>{tr(lang, { zh: '适用情形：', en: 'Applicable situations: ', de: 'Anwendbare Situationen:', ja: '該当する状況:', ko: '적용 가능한 상황:', es: 'Situaciones aplicables:', it: 'Situazioni applicabili:', vi: 'Các tình huống áp dụng:', fr: 'Situations applicables :' })}</strong>
          {tr(lang, { zh: '恶意骚扰是指会员对他人进行辱骂、诅咒、威胁等言语攻击，或者以恶劣手段骚扰他人，损害他人合法权益的行为。', en: 'Malicious harassment includes insulting, cursing, threatening others or using malicious means to harass them and harm their rights.', de: 'Unter böswilliger Belästigung versteht man die Beleidigung, Verfluchung, Bedrohung anderer oder den Einsatz böswilliger Mittel, um sie zu belästigen und ihre Rechte zu verletzen.', ja: '悪意のあるハラスメントには、他者を侮辱、罵倒、脅迫すること、または悪意のある手段を使用して嫌がらせをして権利を侵害することが含まれます。', ko: '악의적인 괴롭힘에는 다른 사람을 모욕하고, 저주하고, 위협하거나 악의적인 수단을 사용하여 괴롭히고 권리를 침해하는 것이 포함됩니다.', es: 'El acoso malicioso incluye insultar, maldecir, amenazar a otros o utilizar medios maliciosos para acosarlos y perjudicar sus derechos.', it: 'Le molestie dannose includono insultare, imprecare, minacciare gli altri o usare mezzi dannosi per molestarli e ledere i loro diritti.', vi: 'Quấy rối ác ý bao gồm lăng mạ, chửi bới, đe dọa người khác hoặc dùng thủ đoạn ác ý để quấy rối và xâm phạm quyền lợi của họ.', fr: 'Le harcèlement malveillant comprend les insultes, les injures, les menaces envers autrui ou l\'utilisation de moyens malveillants pour les harceler et porter atteinte à leurs droits.' })}
        </p>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '5、违约适用的措施', en: '5. Measures applied to breaches of obligation', de: '5. Maßnahmen bei Pflichtverletzungen', ja: '5. 義務違反に対する措置', ko: '5. 의무 위반에 대한 조치', es: '5. Medidas aplicadas al incumplimiento de obligaciones', it: '5. Misure applicate in caso di violazione degli obblighi', vi: '5. Biện pháp xử lý vi phạm nghĩa vụ', fr: '5. Mesures appliquées aux manquements aux obligations' })}
        </h2>
        <h3>
          {tr(lang, { zh: '什么是违约？', en: 'What is considered a breach?', de: 'Was gilt als Verstoß?', ja: '何が違反とみなされますか?', ko: '위반으로 간주되는 것은 무엇입니까?', es: '¿Qué se considera un incumplimiento?', it: 'Cosa è considerato una violazione?', vi: 'Điều gì được coi là vi phạm?', fr: 'Qu’est-ce qui est considéré comme une violation ?' })}
        </h3>
        <p>
          {tr(lang, { zh: '违约是指卖家未向买家提供服务，侵犯买家权益，未按承诺向 TikTokMall 履行义务。卖方必须继续履行法定或约定的更换、退货和退款。', en: 'A breach occurs when the seller fails to provide services to the buyer, infringes the buyer’s rights, or fails to fulfil obligations promised to TikTokMall. The seller must still perform legally or contractually required exchanges, returns and refunds.', de: 'Ein Verstoß liegt vor, wenn der Verkäufer dem Käufer keine Dienstleistungen erbringt, die Rechte des Käufers verletzt oder den gegenüber TikTokMall versprochenen Verpflichtungen nicht nachkommt. Der Verkäufer muss weiterhin gesetzlich oder vertraglich vorgeschriebene Umtausche, Rückgaben und Rückerstattungen durchführen.', ja: '違反は、売り手が買い手にサービスを提供しなかったり、買い手の権利を侵害したり、TikTokMallに約束した義務を履行しなかったりした場合に発生します。販売者は、法的または契約上必要な交換、返品、返金を実行する必要があります。', ko: '위반은 판매자가 구매자에게 서비스를 제공하지 않거나, 구매자의 권리를 침해하거나, TikTokMall에 약속한 의무를 이행하지 않을 때 발생합니다. 판매자는 법적 또는 계약상 요구되는 교환, 반품 및 환불을 계속 수행해야 합니다.', es: 'Se produce un incumplimiento cuando el vendedor no proporciona servicios al comprador, infringe los derechos del comprador o no cumple las obligaciones prometidas a TikTokMall. El vendedor aún debe realizar los cambios, devoluciones y reembolsos requeridos legal o contractualmente.', it: 'Una violazione si verifica quando il venditore non fornisce servizi all’acquirente, viola i diritti dell’acquirente o non adempie agli obblighi promessi a TikTokMall. Il venditore deve comunque eseguire cambi, resi e rimborsi richiesti dalla legge o contrattualmente.', vi: 'Vi phạm xảy ra khi người bán không cung cấp dịch vụ cho người mua, vi phạm quyền của người mua hoặc không thực hiện nghĩa vụ đã hứa với TikTokMall. Người bán vẫn phải thực hiện trao đổi, trả lại và hoàn tiền theo yêu cầu của pháp luật hoặc theo hợp đồng.', fr: 'Une violation se produit lorsque le vendeur ne fournit pas de services à l’acheteur, porte atteinte aux droits de l’acheteur ou ne remplit pas ses obligations promises à TikTokMall. Le vendeur doit néanmoins procéder aux échanges, retours et remboursements requis par la loi ou le contrat.' })}
        </p>
        <p>
          <strong>{tr(lang, { zh: '适用措施：', en: 'Measures: ', de: 'Maßnahmen:', ja: '対策：', ko: '조치:', es: 'Medidas:', it: 'Misure:', vi: 'Đo:', fr: 'Mesures:' })}</strong>
          {tr(lang, { zh: '冻结店铺', en: 'Store suspension', de: 'Suspendierung speichern', ja: '店舗休業', ko: '매장 정지', es: 'Suspensión de tienda', it: 'Sospensione del negozio', vi: 'Đình chỉ cửa hàng', fr: 'Suspension du magasin' })}
        </p>
        <p>
          <strong>{tr(lang, { zh: '具体措施：', en: 'Details: ', de: 'Einzelheiten:', ja: '詳細：', ko: '세부:', es: 'Detalles:', it: 'Dettagli:', vi: 'Chi tiết:', fr: 'Détails:' })}</strong>
        </p>
        <p>
          {tr(lang, { zh: '1、如卖家在特定情况下对已付款订单或相应商品或服务还有其他需要履行的承诺，每项一般违规扣 5 分。', en: '1. If the seller has other obligations to fulfil for paid orders or related products/services, each general violation will deduct 5 points.', de: '1. Wenn der Verkäufer bei bezahlten Bestellungen oder zugehörigen Produkten/Dienstleistungen weitere Pflichten zu erfüllen hat, werden für jeden allgemeinen Verstoß 5 Punkte abgezogen.', ja: '1. 販売者が有料注文または関連商品/サービスに関して履行すべきその他の義務がある場合、一般的な違反ごとに 5 ポイントが減点されます。', ko: '1. 판매자가 유료 주문 또는 관련 제품/서비스에 대해 이행해야 할 다른 의무가 있는 경우 각 일반 위반에 대해 5점이 감점됩니다.', es: '1. Si el vendedor tiene otras obligaciones que cumplir para pedidos pagados o productos/servicios relacionados, cada infracción general se deducirá 5 puntos.', it: '1. Se il venditore ha altri obblighi da adempiere per ordini pagati o prodotti/servizi correlati, ogni violazione generale verrà decurtata di 5 punti.', vi: '1. Nếu người bán có các nghĩa vụ khác phải thực hiện đối với đơn hàng đã thanh toán hoặc sản phẩm/dịch vụ liên quan thì mỗi vi phạm chung sẽ bị trừ 5 điểm.', fr: '1. Si le vendeur a d\'autres obligations à remplir pour les commandes payées ou les produits/services associés, chaque violation générale déduira 5 points.' })}
        </p>
        <p>
          {tr(lang, { zh: '2、卖家违反以下承诺之一，每严重一次扣 10 分：', en: '2. For each serious violation of the following commitments, 10 points will be deducted:', de: '2. Für jeden schwerwiegenden Verstoß gegen die folgenden Verpflichtungen werden 10 Punkte abgezogen:', ja: '2. 以下の約束に対する重大な違反ごとに、10 ポイントが減点されます。', ko: '2. 다음 약속을 심각하게 위반할 때마다 10점이 감점됩니다.', es: '2. Por cada infracción grave de los siguientes compromisos se descontarán 10 puntos:', it: '2. Per ogni grave violazione dei seguenti impegni verranno detratti 10 punti:', vi: '2. Vi phạm nghiêm trọng các cam kết sau sẽ bị trừ 10 điểm:', fr: '2. Pour chaque violation grave des engagements suivants, 10 points seront déduits :' })}
        </p>
        <ul>
          <li>
            {tr(lang, { zh: 'TikTokMall 判断卖家应承担退款等售后保障责任，卖家拒不承担；', en: 'TikTokMall determines that the seller should bear after‑sales responsibilities such as refunds, but the seller refuses.', de: 'TikTokMall legt fest, dass der Verkäufer die After-Sales-Verantwortung wie Rückerstattungen tragen soll, der Verkäufer lehnt dies jedoch ab.', ja: 'TikTokMallは、販売者が返金などのアフター責任を負うべきであると判断しましたが、販売者はこれを拒否しました。', ko: 'TikTokMall은 판매자가 환불 등 판매 후 책임을 져야 한다고 결정했지만 판매자가 이를 거부합니다.', es: 'TikTokMall determina que el vendedor debe asumir las responsabilidades posventa, como los reembolsos, pero el vendedor se niega.', it: 'TikTokMall stabilisce che il venditore dovrebbe assumersi le responsabilità post-vendita come i rimborsi, ma il venditore rifiuta.', vi: 'TikTokMall xác định rằng người bán phải chịu các trách nhiệm sau bán hàng như hoàn tiền, nhưng người bán từ chối.', fr: 'TikTokMall détermine que le vendeur doit assumer les responsabilités après-vente telles que les remboursements, mais le vendeur refuse.' })}
          </li>
          <li>
            {tr(lang, { zh: 'TikTokMall 判断卖家确实应承担 7 天无理由退换货的售后保障责任，但卖家拒不承担；', en: 'TikTokMall determines that the seller should honour the 7‑day no‑reason return policy but refuses.', de: 'TikTokMall beschließt, dass der Verkäufer das 7-tägige Rückgaberecht ohne Angabe von Gründen einhalten sollte, lehnt dies jedoch ab.', ja: 'TikTokMall は、販売者が 7 日間の理由なし返品ポリシーを遵守する必要があると判断しましたが、拒否しました。', ko: 'TikTokMall은 판매자가 7일 이유 없는 반품 정책을 준수해야 한다고 결정했지만 거부했습니다.', es: 'TikTokMall determina que el vendedor debe cumplir con la política de devolución sin motivo de 7 días, pero se niega.', it: 'TikTokMall stabilisce che il venditore dovrebbe onorare la politica di restituzione senza motivo di 7 giorni, ma rifiuta.', vi: 'TikTokMall xác định rằng người bán phải tôn trọng chính sách hoàn trả trong 7 ngày không cần lý do nhưng từ chối.', fr: 'TikTokMall détermine que le vendeur doit honorer la politique de retour sans motif de 7 jours, mais refuse.' })}
          </li>
          <li>
            {tr(lang, { zh: '未经买卖双方协商，拒绝或延迟向买家发送承诺的试用商品；', en: 'Without mutual agreement, the seller refuses or delays sending promised trial products to the buyer.', de: 'Ohne gegenseitiges Einvernehmen verweigert der Verkäufer den Versand versprochener Testprodukte an den Käufer oder verzögert ihn.', ja: '双方の合意がなければ、売主は約束した試用製品の買主への送付を拒否したり、遅らせたりします。', ko: '판매자는 상호 합의 없이 구매자에게 약속한 체험판 배송을 거부하거나 지연합니다.', es: 'Sin acuerdo mutuo, el vendedor se niega o retrasa el envío de los productos de prueba prometidos al comprador.', it: 'Senza accordo reciproco, il venditore rifiuta o ritarda l\'invio all\'acquirente dei prodotti di prova promessi.', vi: 'Nếu không có thỏa thuận chung, người bán sẽ từ chối hoặc trì hoãn việc gửi sản phẩm dùng thử đã hứa cho người mua.', fr: 'Sans accord mutuel, le vendeur refuse ou retarde l\'envoi à l\'acheteur des produits d\'essai promis.' })}
          </li>
          <li>
            {tr(lang, { zh: '卖家在支付订单后 48 小时内未处理订单；', en: 'The seller fails to process an order within 48 hours after payment.', de: 'Der Verkäufer bearbeitet eine Bestellung nicht innerhalb von 48 Stunden nach der Zahlung.', ja: '販売者は支払い後 48 時間以内に注文を処理できませんでした。', ko: '판매자가 결제 후 48시간 이내에 주문을 처리하지 못했습니다.', es: 'El vendedor no procesa un pedido dentro de las 48 horas posteriores al pago.', it: 'Il venditore non riesce a elaborare un ordine entro 48 ore dal pagamento.', vi: 'Người bán không xử lý đơn hàng trong vòng 48 giờ sau khi thanh toán.', fr: 'Le vendeur ne parvient pas à traiter une commande dans les 48 heures suivant le paiement.' })}
          </li>
          <li>
            {tr(lang, { zh: '参加 TikTokMall 官方活动的卖家，未能完成活动要求（发货时间除外），或违反 TikTokMall 官方发布的其他管理内容（包括但不限于规则、规范、类目管理规范、行业标准），按具体规则执行。', en: 'Sellers participating in official TikTokMall campaigns fail to meet campaign requirements (excluding shipping time) or violate other official rules (including but not limited to platform rules, category standards, industry standards), and will be penalized according to the corresponding rules.', de: 'Verkäufer, die an offiziellen TikTokMall-Kampagnen teilnehmen, erfüllen die Kampagnenanforderungen (mit Ausnahme der Lieferzeit) nicht oder verstoßen gegen andere offizielle Regeln (einschließlich, aber nicht beschränkt auf Plattformregeln, Kategoriestandards, Industriestandards) und werden gemäß den entsprechenden Regeln bestraft.', ja: 'TikTokMallの公式キャンペーンに参加している販売者は、キャンペーン要件（配送時間を除く）を満たさなかったり、その他の公式ルール（プラットフォームルール、カテゴリ標準、業界標準を含むがこれらに限定されない）に違反したりした場合、対応するルールに従ってペナルティが課せられます。', ko: '공식 TikTokMall 캠페인에 참여하는 판매자는 캠페인 요구 사항(배송 시간 제외)을 충족하지 못하거나 기타 공식 규칙(플랫폼 규칙, 카테고리 표준, 산업 표준을 포함하되 이에 국한되지 않음)을 위반하며 해당 규칙에 따라 처벌을 받게 됩니다.', es: 'Los vendedores que participan en campañas oficiales de TikTokMall no cumplen con los requisitos de la campaña (excluido el tiempo de envío) o violan otras reglas oficiales (incluidas, entre otras, las reglas de la plataforma, los estándares de categorías y los estándares de la industria), y serán penalizados de acuerdo con las reglas correspondientes.', it: 'I venditori che partecipano alle campagne ufficiali di TikTokMall non riescono a soddisfare i requisiti della campagna (esclusi i tempi di spedizione) o violano altre regole ufficiali (incluse ma non limitate a regole della piattaforma, standard di categoria, standard di settore) e saranno penalizzati in base alle regole corrispondenti.', vi: 'Người bán tham gia chiến dịch TikTokMall chính thức không đáp ứng các yêu cầu của chiến dịch (không bao gồm thời gian vận chuyển) hoặc vi phạm các quy tắc chính thức khác (bao gồm nhưng không giới hạn ở quy tắc nền tảng, tiêu chuẩn danh mục, tiêu chuẩn ngành) và sẽ bị phạt theo quy tắc tương ứng.', fr: 'Les vendeurs participant aux campagnes officielles de TikTokMall ne respectent pas les exigences de la campagne (à l\'exclusion du délai de livraison) ou enfreignent d\'autres règles officielles (y compris, mais sans s\'y limiter, les règles de la plateforme, les normes des catégories, les normes de l\'industrie) et seront pénalisés selon les règles correspondantes.' })}
          </li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '6、处罚会持续多久？', en: '6. How long do penalties last?', de: '6. Wie lange dauern Strafen?', ja: '6. 罰則はどのくらいの期間続きますか?', ko: '6. 처벌은 얼마나 오래 지속되나요?', es: '6. ¿Cuánto duran las sanciones?', it: '6. Quanto durano le sanzioni?', vi: '6. Hình phạt kéo dài bao lâu?', fr: '6. Quelle est la durée des pénalités ?' })}
        </h2>
        <p>
          {tr(lang, { zh: '如对处罚有异议，可联系客户服务进行申诉。以客服审核结果为准，在卖家改善店铺表现并保持达标后，被制裁的卖家将逐步恢复相应的卖家权利。', en: 'If you disagree with a penalty, you may contact customer service to appeal. Based on the review result, once store performance is improved and maintained at the required level, the sanctioned seller will gradually regain corresponding rights.', de: 'Wenn Sie mit einer Strafe nicht einverstanden sind, können Sie sich an den Kundendienst wenden und Einspruch einlegen. Basierend auf dem Überprüfungsergebnis erhält der sanktionierte Verkäufer nach und nach die entsprechenden Rechte zurück, sobald die Leistung des Geschäfts verbessert und auf dem erforderlichen Niveau gehalten wird.', ja: 'ペナルティに同意できない場合は、カスタマーサービスに連絡して異議を申し立てることができます。審査結果に基づいて、店舗の業績が改善され、必要なレベルに維持されると、制裁を受けた販売者は徐々に対応する権利を回復します。', ko: '벌금에 동의하지 않는 경우 고객 서비스에 문의하여 이의를 제기할 수 있습니다. 검토 결과에 따라 매장 성능이 개선되고 필요한 수준으로 유지되면 제재를 받은 판매자는 점차적으로 해당 권리를 회복하게 됩니다.', es: 'Si no está de acuerdo con una multa, puede comunicarse con el servicio de atención al cliente para apelar. Según el resultado de la revisión, una vez que el rendimiento de la tienda mejore y se mantenga en el nivel requerido, el vendedor sancionado recuperará gradualmente los derechos correspondientes.', it: 'Se non sei d\'accordo con una sanzione, puoi contattare il servizio clienti per presentare ricorso. Sulla base del risultato della revisione, una volta che le prestazioni del negozio saranno migliorate e mantenute al livello richiesto, il venditore sanzionato riacquisterà gradualmente i diritti corrispondenti.', vi: 'Nếu bạn không đồng ý với hình phạt, bạn có thể liên hệ với bộ phận dịch vụ khách hàng để khiếu nại. Căn cứ vào kết quả rà soát, khi hiệu quả hoạt động của cửa hàng được cải thiện và duy trì ở mức yêu cầu, người bán bị xử phạt sẽ dần lấy lại được các quyền tương ứng.', fr: 'Si vous n\'êtes pas d\'accord avec une pénalité, vous pouvez contacter le service client pour faire appel. Sur la base du résultat de l\'examen, une fois les performances du magasin améliorées et maintenues au niveau requis, le vendeur sanctionné retrouvera progressivement les droits correspondants.' })}
        </p>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '7、违规处理', en: '7. Handling of violations', de: '7. Umgang mit Verstößen', ja: '7. 違反行為への対応', ko: '7. 위반사항 처리', es: '7. Manejo de infracciones', it: '7. Gestione delle violazioni', vi: '7. Xử lý vi phạm', fr: '7. Traitement des violations' })}
        </h2>
        <p>
          {tr(lang, { zh: '1、如果情况一般：消费者发起投诉，TikTokMall 判断投诉有理，一般违规每次扣 5 分。完成 5 个订单可恢复 5 点。', en: '1. General cases: when a buyer complaint is judged valid by TikTokMall, 5 points are deducted for each general violation. Completing 5 orders restores 5 points.', de: '1. Allgemeine Fälle: Wenn eine Käuferbeschwerde von TikTokMall als gültig beurteilt wird, werden für jeden allgemeinen Verstoß 5 Punkte abgezogen. Das Abschließen von 5 Aufträgen stellt 5 Punkte wieder her.', ja: '1. 一般的な場合: 購入者の苦情が TikTokMall によって正当であると判断された場合、一般的な違反ごとに 5 ポイントが減点されます。 5 つの注文を完了すると 5 ポイントが回復します。', ko: '1. 일반 사례: TikTokMall에서 구매자 불만 사항이 타당하다고 판단하는 경우 각 일반 위반에 대해 5점이 차감됩니다. 5개의 주문을 완료하면 5포인트가 회복됩니다.', es: '1. Casos generales: cuando TikTokMall considera válida la queja de un comprador, se deducen 5 puntos por cada infracción general. Completar 5 pedidos restaura 5 puntos.', it: '1. Casi generali: quando un reclamo dell\'acquirente viene giudicato valido da TikTokMall, vengono detratti 5 punti per ogni violazione generale. Il completamento di 5 ordini ripristina 5 punti.', vi: '1. Các trường hợp chung: khi khiếu nại của người mua được TikTokMall đánh giá là hợp lệ, mỗi vi phạm chung sẽ bị trừ 5 điểm. Hoàn thành 5 đơn hàng khôi phục 5 điểm.', fr: '1. Cas généraux : lorsqu\'une réclamation d\'un acheteur est jugée valable par TikTokMall, 5 points sont déduits pour chaque violation générale. Terminer 5 commandes restaure 5 points.' })}
        </p>
        <p>
          {tr(lang, { zh: '2、情节严重的：消费者投诉，TikTokMall 判断投诉有理，情节严重的每项扣 20 分。完成 20 个订单可恢复 20 点。', en: '2. Serious cases: for serious valid complaints, 20 points are deducted per violation. Completing 20 orders restores 20 points.', de: '2. Schwerwiegende Fälle: Bei schwerwiegenden berechtigten Beschwerden werden pro Verstoß 20 Punkte abgezogen. Das Abschließen von 20 Aufträgen stellt 20 Punkte wieder her.', ja: '2. 重大なケース: 重大な有効な苦情の場合、違反ごとに 20 ポイントが減点されます。 20 件の注文を完了すると 20 ポイントが回復します。', ko: '2. 심각한 경우: 심각하고 정당한 불만사항의 경우 위반당 20점이 감점됩니다. 20개의 주문을 완료하면 20포인트가 회복됩니다.', es: '2. Casos graves: por denuncias graves válidas se deducen 20 puntos por infracción. Completar 20 pedidos restaura 20 puntos.', it: '2. Casi gravi: per reclami gravi e validi vengono detratti 20 punti per violazione. Il completamento di 20 ordini ripristina 20 punti.', vi: '2. Trường hợp nghiêm trọng: đối với khiếu nại nghiêm trọng hợp lệ bị trừ 20 điểm/vi phạm. Hoàn thành 20 đơn hàng sẽ khôi phục 20 điểm.', fr: '2. Cas graves : pour les plaintes graves et valables, 20 points sont déduits par infraction. Terminer 20 commandes restaure 20 points.' })}
        </p>
        <p>
          {tr(lang, { zh: '3、情节特别严重的：冻结账号，关闭店铺。', en: '3. Extremely serious cases: the account is frozen and the store is closed.', de: '3. Extrem schwerwiegende Fälle: Das Konto wird gesperrt und das Geschäft geschlossen.', ja: '3. 非常に深刻なケース：アカウントが凍結され、店舗が閉鎖されます。', ko: '3. 극히 심각한 경우: 계좌가 동결되고 매장이 폐쇄되는 경우.', es: '3. Casos extremadamente graves: se congela la cuenta y se cierra la tienda.', it: '3. Casi estremamente gravi: il conto viene bloccato e il negozio viene chiuso.', vi: '3. Trường hợp cực kỳ nghiêm trọng: tài khoản bị đóng băng và cửa hàng đóng cửa.', fr: '3. Cas extrêmement graves : le compte est gelé et le magasin est fermé.' })}
        </p>
        <h3>
          {tr(lang, { zh: '例 1：卖家 A 在第 3 周获得 3 分，将在第 7 周重新获得权利', en: 'Example 1: Seller A gets 3 points in week 3 and regains rights in week 7', de: 'Beispiel 1: Verkäufer A erhält in Woche 3 3 Punkte und erhält in Woche 7 die Rechte zurück', ja: '例 1: 販売者 A は第 3 週に 3 ポイントを獲得し、第 7 週に権利を取り戻します', ko: '예 1: 판매자 A는 3주차에 3포인트를 얻고 7주차에 권리를 다시 얻습니다.', es: 'Ejemplo 1: el vendedor A obtiene 3 puntos en la semana 3 y recupera los derechos en la semana 7', it: 'Esempio 1: Il venditore A ottiene 3 punti nella settimana 3 e riacquista i diritti nella settimana 7', vi: 'Ví dụ 1: Người bán A được 3 điểm ở tuần thứ 3 và lấy lại quyền vào tuần thứ 7', fr: 'Exemple 1 : Le vendeur A obtient 3 points la semaine 3 et retrouve ses droits la semaine 7' })}
        </h3>
        <p>
          {tr(lang, { zh: '卖家 A 在第 3 周获得 3 分，处罚级别为 1 等级，处罚持续 28 天，第 7 周重新获得权利。', en: 'Seller A gets 3 points in week 3, reaching penalty level 1. The penalty lasts 28 days and rights are restored in week 7.', de: 'Verkäufer A erhält in Woche 3 3 Punkte und erreicht damit Strafstufe 1. Die Strafe dauert 28 Tage und die Rechte werden in Woche 7 wiederhergestellt.', ja: '販売者 A は第 3 週に 3 ポイントを獲得し、ペナルティ レベル 1 に達します。ペナルティは 28 日間続き、第 7 週に権利が回復します。', ko: '판매자 A는 3주차에 3포인트를 얻어 페널티 레벨 1에 도달합니다. 페널티는 28일 동안 지속되며 7주차에 권리가 복원됩니다.', es: 'El vendedor A obtiene 3 puntos en la semana 3, alcanzando el nivel de penalización 1. La penalización dura 28 días y los derechos se restablecen en la semana 7.', it: 'Il venditore A ottiene 3 punti nella settimana 3, raggiungendo il livello di penalità 1. La penalità dura 28 giorni e i diritti vengono ripristinati nella settimana 7.', vi: 'Người bán A nhận được 3 điểm trong tuần 3, đạt mức phạt 1. Hình phạt kéo dài 28 ngày và các quyền được khôi phục vào tuần 7.', fr: 'Le vendeur A obtient 3 points au cours de la semaine 3, atteignant le niveau de pénalité 1. La pénalité dure 28 jours et les droits sont rétablis au cours de la semaine 7.' })}
        </p>
        <h3>
          {tr(lang, { zh: '例 2：卖家 B 在第 3 周获得 3 分，第 5 周获得 3 分。这些积分会累积起来定义等级，第 9 周会夺回权利', en: 'Example 2: Seller B gets 3 points in week 3 and another 3 points in week 5; rights are restored in week 9', de: 'Beispiel 2: Verkäufer B erhält 3 Punkte in Woche 3 und weitere 3 Punkte in Woche 5; Die Rechte werden in Woche 9 wiederhergestellt', ja: '例 2: 販売者 B は第 3 週に 3 ポイントを獲得し、第 5 週にさらに 3 ポイントを獲得します。権利は第9週に回復されます', ko: '예 2: 판매자 B는 3주차에 3포인트를 얻고 5주차에 추가로 3포인트를 얻습니다. 권리는 9주차에 회복됩니다', es: 'Ejemplo 2: El vendedor B obtiene 3 puntos en la semana 3 y otros 3 puntos en la semana 5; los derechos se restablecen en la semana 9', it: 'Esempio 2: Il venditore B ottiene 3 punti nella settimana 3 e altri 3 punti nella settimana 5; i diritti vengono ripristinati nella settimana 9', vi: 'Ví dụ 2: Người bán B được 3 điểm ở tuần thứ 3 và 3 điểm ở tuần thứ 5; quyền được khôi phục vào tuần thứ 9', fr: 'Exemple 2 : le vendeur B obtient 3 points au cours de la semaine 3 et 3 points supplémentaires au cours de la semaine 5 ; les droits sont rétablis en semaine 9' })}
        </h3>
        <p>
          {tr(lang, { zh: '卖家 B 在第 3 周、第 5 周各获得 3 分，积分累积共 6 分，定义等级后处罚持续相应周期，第 9 周夺回权利。', en: 'Seller B gets 3 points in week 3 and week 5 (6 points total). After the level is determined, the penalty runs its course and rights are restored in week 9.', de: 'Verkäufer B erhält in Woche 3 und Woche 3 3 Punkte (insgesamt 6 Punkte). Nachdem die Stufe festgelegt wurde, läuft die Strafe ab und die Rechte werden in Woche 9 wiederhergestellt.', ja: '販売者 B は第 3 週と第 5 週で 3 ポイントを獲得します (合計 6 ポイント)。レベルが決定されると、ペナルティが適用され、第 9 週に権利が回復されます。', ko: '판매자 B는 3주차와 5주차에 3포인트(총 6포인트)를 얻습니다. 수준이 결정된 후 페널티가 진행되고 9주차에 권리가 복원됩니다.', es: 'El vendedor B obtiene 3 puntos en la semana 3 y la semana 5 (6 puntos en total). Una vez determinado el nivel, la penalización sigue su curso y los derechos se restablecen en la semana 9.', it: 'Il venditore B ottiene 3 punti nella settimana 3 e nella settimana 5 (6 punti in totale). Dopo che il livello è stato determinato, la penalità fa il suo corso e i diritti vengono ripristinati nella settimana 9.', vi: 'Người bán B nhận được 3 điểm trong tuần 3 và tuần 5 (tổng cộng 6 điểm). Sau khi mức độ được xác định, hình phạt sẽ diễn ra và các quyền sẽ được khôi phục vào tuần thứ 9.', fr: 'Le vendeur B obtient 3 points au cours des semaines 3 et 5 (6 points au total). Une fois le niveau déterminé, la pénalité suit son cours et les droits sont rétablis au cours de la semaine 9.' })}
        </p>
        <h3>
          {tr(lang, { zh: '例 3：卖家 C 新季度开始前一周获得 3 分，季度开始后获得 3 分，新获得的积分将重新定义等级', en: 'Example 3: Seller C gets 3 points one week before a new quarter and 3 points after; the new score redefines the level', de: 'Beispiel 3: Verkäufer C erhält 3 Punkte eine Woche vor einem neuen Quartal und 3 Punkte danach; Die neue Partitur definiert das Niveau neu', ja: '例 3: 販売者 C は、新しい四半期の 1 週間前とその後に 3 ポイントを獲得します。新しいスコアはレベルを再定義します', ko: '예 3: 판매자 C는 새 분기가 시작되기 1주일 전에 3포인트를 받고 그 이후에는 3포인트를 받습니다. 새로운 점수는 레벨을 재정의합니다', es: 'Ejemplo 3: El vendedor C obtiene 3 puntos una semana antes de un nuevo trimestre y 3 puntos después; la nueva puntuación redefine el nivel', it: 'Esempio 3: Il venditore C ottiene 3 punti una settimana prima del nuovo trimestre e 3 punti dopo; il nuovo punteggio ridefinisce il livello', vi: 'Ví dụ 3: Người bán C được 3 điểm một tuần trước quý mới và 3 điểm sau đó; điểm số mới xác định lại cấp độ', fr: 'Exemple 3 : Le vendeur C obtient 3 points une semaine avant un nouveau trimestre et 3 points après ; le nouveau score redéfinit le niveau' })}
        </h3>
        <p>
          {tr(lang, { zh: '卖家 C 在新季度开始前一周获得 3 分，季度开始后又获得 3 分；新季度开始后新获得的积分将重新定义等级，分别计算处罚周期。', en: 'Seller C gets 3 points one week before the new quarter and 3 more after it starts. The new points in the new quarter redefine the level and penalty periods are calculated separately.', de: 'Verkäufer C erhält 3 Punkte eine Woche vor dem neuen Quartal und 3 weitere nach dessen Beginn. Die neuen Punkte im neuen Viertel definieren das Level neu und Strafzeiten werden separat berechnet.', ja: '販売者 C は、新しい四半期の 1 週間前に 3 ポイントを獲得し、開始後にさらに 3 ポイントを獲得します。新しい四半期の新しいポイントによってレベルが再定義され、ペナルティ期間は個別に計算されます。', ko: '판매자 C는 새 분기가 시작되기 일주일 전에 3포인트를 받고 분기가 시작된 후에는 3포인트를 더 얻습니다. 새 분기의 새로운 포인트는 레벨을 재정의하며 페널티 기간은 별도로 계산됩니다.', es: 'El vendedor C obtiene 3 puntos una semana antes del nuevo trimestre y 3 más después de que comience. Los nuevos puntos del nuevo trimestre redefinen el nivel y los periodos de penalización se calculan por separado.', it: 'Il venditore C ottiene 3 punti una settimana prima del nuovo trimestre e altri 3 dopo l\'inizio. I nuovi punti nel nuovo trimestre ridefiniscono il livello e i periodi di penalità vengono calcolati separatamente.', vi: 'Người bán C nhận được 3 điểm một tuần trước quý mới và 3 điểm nữa sau khi quý mới bắt đầu. Điểm mới trong quý mới xác định lại mức độ và thời gian phạt được tính riêng.', fr: 'Le vendeur C obtient 3 points une semaine avant le nouveau trimestre et 3 autres après le début de celui-ci. Les nouveaux points du nouveau trimestre redéfinissent le niveau et les périodes de pénalité sont calculées séparément.' })}
        </p>
      </section>

      <section className="policy-section">
        <h2>
          {tr(lang, { zh: '8、如何进行评分申诉？', en: '8. How to appeal your score?', de: '8. Wie können Sie gegen Ihre Punktzahl Einspruch einlegen?', ja: '8. スコアをアピールするにはどうすればよいですか?', ko: '8. 점수에 대해 이의를 제기하는 방법은 무엇입니까?', es: '8. ¿Cómo apelar tu puntuación?', it: '8. Come contestare il tuo punteggio?', vi: '8. Làm thế nào để khiếu nại điểm của bạn?', fr: '8. Comment faire appel de votre score ?' })}
        </h2>
        <p>
          {tr(lang, { zh: '单击求助热线链接进行申诉。如果您申诉成功，我们将取消您的扣分并恢复您相应的卖家权利。', en: 'Click the help‑line link to submit an appeal. If your appeal is successful, the deducted points will be cancelled and the corresponding seller rights will be restored.', de: 'Klicken Sie auf den Helpline-Link, um Einspruch einzureichen. Wenn Ihr Einspruch erfolgreich ist, werden die abgezogenen Punkte annulliert und die entsprechenden Verkäuferrechte werden wiederhergestellt.', ja: 'ヘルプラインのリンクをクリックして申し立てを送信します。異議申し立てが認められた場合、差し引かれたポイントは取り消され、対応する販売者の権利が回復されます。', ko: '항소를 제출하려면 헬프 라인 링크를 클릭하세요. 이의신청이 승인되면 차감된 포인트는 취소되고 해당 판매자 권한은 복원됩니다.', es: 'Haga clic en el enlace de la línea de ayuda para enviar una apelación. Si su apelación tiene éxito, los puntos deducidos se cancelarán y se restablecerán los derechos de vendedor correspondientes.', it: 'Fare clic sul collegamento della linea di assistenza per presentare un ricorso. Se il tuo ricorso viene accolto, i punti detratti verranno annullati e i corrispondenti diritti del venditore verranno ripristinati.', vi: 'Nhấp vào liên kết đường dây trợ giúp để gửi khiếu nại. Nếu kháng nghị của bạn thành công, số điểm bị trừ sẽ bị hủy và quyền của người bán tương ứng sẽ được khôi phục.', fr: 'Cliquez sur le lien de la ligne d\'assistance pour soumettre un appel. Si votre recours aboutit, les points déduits seront annulés et les droits de vendeur correspondants seront rétablis.' })}
        </p>
      </section>
    </div>
  )
}

export default SellerPolicy
