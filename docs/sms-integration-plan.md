# SMS Entegrasyon Planı

Bu doküman, `order_notifications` altyapısını SMS kanalıyla genişletmek için gerekli adımları, sağlayıcı seçim kriterlerini ve operasyonel kontrolleri özetler.

## 1. Hedefler
- Kritik sipariş olaylarında (sipariş oluşturma, kargo, iade, ödeme) müşteriye SMS gönderimi.
- Aynı tetikleyiciyi hem e-posta hem SMS için kullanarak tek kuyruğa (order_notifications) bağlı kalmak.
- KVKK ve Ticari İleti Yönetmeliği gereği opt-in/opt-out kayıtlarını loglamak.
- Failover: SMS başarısız olursa e-posta fallback veya yeniden deneme planı.

## 2. Sağlayıcı Alternatifleri
| Sağlayıcı | Artılar | Eksiler | Not |
| --- | --- | --- | --- |
| **Twilio** | Global API standardı, kapsamlı SDK'lar, webhook desteği | Mesaj başı maliyet Türkiye'ye göre yüksek olabilir | Sandbox ile hızlı POC yapılabilir |
| **Turkcell (İletimerkezi)** | Yerel fiyat avantajı, Türkçe müşteri desteği, KVKK uyumluluğu kolay | API dokümantasyonu daha sınırlı, test hesabı edinmek zaman alabilir | Turkcell hesabı gerekiyorsa süre planlanmalı |
| Alternatif (Vodafone, Netgsm) | Yerel fiyat | Bazılarında modern REST API eksik | Gerektiğinde yedek plan |

**Öneri:** POC için Twilio; prod geçişinde Turkcell fiyat analizi tamamlanınca switch/dual routing.

## 3. Mimari Taslak
```
Next.js actions (orders.ts / returns.ts)
        |
        V
order_notifications (status=queued, channel=email/sms)
        |
        V
notification-worker.mjs (cron / serverless job)
        |-- email adapter (mevcut placeholder)
        |-- sms adapter (yeni)
```
- `order_notifications` tablosuna `channel` (default `email`) ve `provider_payload` kolonları eklenmeli.
- Worker, kayıt kanalına göre ilgili adapter'ı çağıracak.
- SMS adapter, sağlayıcı kimliği ve gönderim sonucunu `status` + `sent_at` alanlarına yazacak.

## 4. Uygulama Adımları
1. **Şema Güncellemesi**
   - `alter table order_notifications add column channel text not null default 'email';`
   - `add column provider_payload jsonb; add column error_code text; add column attempt_count integer default 0;`.
2. **Server Action Güncellemesi**
   - `queueReturnFlowNotification` gibi helper'larda `channel: 'sms'` seçeneği ekle.
   - SMS tetiklenecek durumlar: aynı anda e-posta + SMS (örn. `return_flow`), sadece SMS (örn. kargo teslimi).
3. **Worker Refaktörü**
   - `deliverNotification` fonksiyonunu `deliverEmail`/`deliverSms` diye ayır.
   - SMS adapter'ı provider-agnostic interface ile yaz: `{ send({ to, body, template, metadata }): Promise<{ success: boolean; code?: string }>; }`.
4. **Provider Bağlantısı**
   - Twilio için `@twilio/sdk` ekle, `.env` içine `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` tanımla.
   - Turkcell için REST endpoint + basic auth/WSSE (dokümana göre) ayarları `.env`'ye ekle.
5. **Şablon Yönetimi**
   - Mesaj taslaklarını `config/notification-templates.ts` benzeri dosyada tut; kanal bazında kısalt.
   - Uzun URL'leri kısa link servisi ile kısalt (örn. Rebrandly) veya order portal path kullan.
6. **Opt-In/Opt-Out**
   - `profiles` tablosuna `sms_consent boolean` ekle.
   - SMS tetiklemeden önce consent kontrolü yap; opsiyonel kampanya mesajları için ayrıca `marketing_sms_consent` alanı düşünebilirsin.
7. **Loglama & İzleme**
   - Başarısız denemeleri Sentry'ye gönder.
   - `order_notifications` üzerinden günlük rapor almak için Supabase cron job + Slack webhook planla.
8. **Test & Rollout**
   - Twilio sandbox numarası ile QA kullanıcılarına smoke test.
   - Gerçek numara testi için KVKK gereği yazılı izinli internal kullanıcılar.
   - Turkcell geçişi öncesi fiyat/sözleşme onayı.

## 5. Güvenlik ve KVKK Notları
- Çıkış (opt-out) anahtar kelimeleri ("IPTAL") desteklenmeli; sağlayıcı webhook'u `sms_unsubscribes` tablosuna yazacak.
- SMS içeriklerinde kişisel veri minimum tutulmalı; kargo no masking.
- Service Role Key sadece worker tarafında kullanılmalı, Next.js server actions public key ile kalmalı.

## 6. Zamanlama Tahmini
| Sprint | İş Kalemi |
| --- | --- |
| 1 | Şema değişiklikleri + worker refaktörü + Twilio adapter (sandbox) |
| 2 | Consent alanları + müşteri panelinde tercih UI + prod Twilio yayını |
| 3 | Turkcell/yerel sağlayıcı değerlendirmesi, çift yönlü routing, opt-out webhookları |

## 7. Açık Sorular
- Turkcell API için resmi SLA ve maksimum TPS nedir?
- SMS maliyetini düşürmek için toplu anlaşma / kontör modeli tercihi?
- İade sürecinde SMS tetiklemek yeterli mi yoksa ödeme onayında da SMS isteniyor mu?

Bu plan doğrultusunda özellikle worker refaktörü ve şema güncellemeleri tamamlandığında SMS kanalı devreye alınabilir.
