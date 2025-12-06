# Twilio Sandbox SMS QA Planı

Aşağıdaki adımlar, Twilio sandbox numarası ile order_notifications kuyruğunun uçtan uca test edilmesini sağlar.

## 1. Ön Koşullar
- `.env.local` dosyasında `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `NOTIFICATION_SMS_PROVIDER=twilio` değerleri dolu olmalı.
- Test edilecek kullanıcının `profiles.phone` alanı Twilio tarafından doğrulanmış sandbox numarası olmalı.
- `profiles.sms_consent = true` (manuel olarak veya SQL ile güncellenebilir).

## 2. Test Senaryosu
1. **Hazırlık**
   - Supabase SQL Editor üzerinden ilgili kullanıcının `sms_consent` alanını `true` yap.
   - `order_notifications` tablosuna manuel olarak şu örnek kaydı ekle:
     ```sql
     insert into public.order_notifications (order_id, notification_type, channel, recipient_email, recipient_phone, subject, body)
     values ('{ORDER_ID}', 'return_flow', 'sms', 'qa@example.com', '+1XXXXXXXXXX', 'Twilio QA', 'Merhaba, bu bir Twilio QA mesajıdır.');
     ```
   - Kayıt `status='queued'` olarak oluşturulmalı.
2. **Worker Çalıştırma**
   - Terminalde `npm run notifications:worker` komutunu çalıştır.
   - Çıktıda `Toplam 1 bildirim işleniyor...` ve `Twilio` loglarını görmelisin.
3. **Twilio Paneli**
   - Twilio console > Monitor > Logs > Messaging alanında mesajın `sent` olduğunu doğrula.
   - Alıcı sandbox telefonunda SMS’i aldığını kontrol et.
4. **Veritabanı Doğrulaması**
   - `order_notifications` kaydının `status='sent'`, `sent_at` dolu, `attempt_count=1`, `provider_payload->>sid` alanı Twilio SID olacak şekilde güncellendiğini doğrula.

## 3. Hata Senaryoları
- **Eksik Numara**: `recipient_phone` boş ise worker logunda `missing_phone` hatası gözlenmeli, kayıt `failed` ve `error_code='missing_phone'` olmalı.
- **Twilio Kimliği Eksik**: ENV değişkenleri tanımlı değilse `twilio_not_configured` hatası dönmeli.
- **Yanlış Numara**: Twilio `21606` kodu ile dönebilir; worker `error_code=21606` olarak kaydetmeli.

## 4. Raporlama
- Her testten sonra sonuçları Notion/QA sheets’e ekle.
- Başarısız durumlarda worker logu + `order_notifications` kaydı + Twilio logu eklenmeli.

Bu senaryo tamamlandığında SMS kanalı üretim öncesi sağlıklı çalıştığını kanıtlamış olur.
