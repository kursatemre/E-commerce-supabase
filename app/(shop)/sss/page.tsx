'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])

  const faqCategories = [
    {
      category: 'Kargo ve Teslimat',
      items: [
        {
          id: 'kargo-1',
          question: 'Kargo ücreti ne kadar?',
          answer: '150 TL ve üzeri alışverişlerinizde kargo ücretsizdir. 150 TL altı alışverişlerde kargo ücreti 29,90 TL\'dir.',
        },
        {
          id: 'kargo-2',
          question: 'Siparişim ne zaman kargoya verilir?',
          answer: 'Siparişleriniz hafta içi saat 14:00\'a kadar verilen siparişler aynı gün, sonrası ertesi iş günü kargoya teslim edilir. Hafta sonu verilen siparişler pazartesi günü kargoya verilir.',
        },
        {
          id: 'kargo-3',
          question: 'Kargo takibi nasıl yapılır?',
          answer: 'Siparişiniz kargoya verildikten sonra e-posta ve SMS ile kargo takip numaranız tarafınıza iletilir. Hesabım sayfasından da kargo durumunuzu takip edebilirsiniz.',
        },
      ],
    },
    {
      category: 'İade ve Değişim',
      items: [
        {
          id: 'iade-1',
          question: 'İade sürem ne kadar?',
          answer: 'Ürününüzü teslim aldığınız tarihten itibaren 30 gün içerisinde ücretsiz olarak iade edebilirsiniz.',
        },
        {
          id: 'iade-2',
          question: 'İade şartları nelerdir?',
          answer: 'İade edilecek ürünün etiketi üzerinde, kullanılmamış ve hasarsız olması gerekmektedir. İç giyim ürünlerinde hijyen bandının açılmamış olması şarttır.',
        },
        {
          id: 'iade-3',
          question: 'İade bedelim ne zaman hesabıma geçer?',
          answer: 'İade ettiğiniz ürün depomıza ulaştıktan sonra 3-5 iş günü içerisinde iade bedeliniz ödeme yaptığınız kartınıza iade edilir.',
        },
        {
          id: 'iade-4',
          question: 'Değişim yapabilir miyim?',
          answer: 'Değişim işlemi için önce iade işlemi başlatmanız, ardından yeni siparişi vermeniz gerekmektedir.',
        },
      ],
    },
    {
      category: 'Ödeme',
      items: [
        {
          id: 'odeme-1',
          question: 'Hangi ödeme yöntemlerini kullanabilirim?',
          answer: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Kredi kartınızla 3, 6, 9 ve 12 taksit seçenekleri mevcuttur.',
        },
        {
          id: 'odeme-2',
          question: 'Ödeme güvenli mi?',
          answer: 'Evet, tüm ödemeleriniz 256-bit SSL sertifikası ile şifrelenmektedir. Kart bilgileriniz bizim sistemlerimizde saklanmaz.',
        },
        {
          id: 'odeme-3',
          question: 'Kapıda ödeme yapabilir miyim?',
          answer: 'Şu anda kapıda ödeme seçeneği bulunmamaktadır. Kredi kartı veya havale/EFT ile ödeme yapabilirsiniz.',
        },
      ],
    },
    {
      category: 'Ürün ve Beden',
      items: [
        {
          id: 'urun-1',
          question: 'Beden seçiminde yardıma ihtiyacım var',
          answer: 'Her ürün sayfasında beden tablosu bulunmaktadır. Ölçülerinizi alarak beden tablosundan size uygun bedeni seçebilirsiniz. Beden konusunda tereddüdünüz varsa müşteri hizmetlerimizle iletişime geçebilirsiniz.',
        },
        {
          id: 'urun-2',
          question: 'Ürünün stoğu ne zaman gelir?',
          answer: 'Stokta olmayan ürünlerin tekrar stoğa giriş tarihleri için müşteri hizmetlerimizle iletişime geçebilirsiniz.',
        },
        {
          id: 'urun-3',
          question: 'Ürünlerin bakım talimatları nelerdir?',
          answer: 'Her ürünün etiketinde bakım talimatları belirtilmiştir. Genel olarak hassas yıkama programı ve ters çevirerek yıkama önerilir.',
        },
      ],
    },
  ]

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0)

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-4">
            Sık Sorulan Sorular
          </h1>
          <p className="text-base md:text-lg text-brand-dark/70">
            Merak ettiğiniz soruların yanıtlarını burada bulabilirsiniz
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
            <input
              type="search"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface-light border border-gray-200 rounded-button text-base focus:outline-none focus:border-action focus:ring-2 focus:ring-action/20 transition-all"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.category}>
                <h2 className="font-heading text-xl font-semibold text-brand-dark mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const isOpen = openItems.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <span className="font-medium text-brand-dark pr-4">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-brand-dark/60 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-brand-dark/70 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-dark/60 mb-4">Aradığınız soruyu bulamadık</p>
              <p className="text-sm text-brand-dark/50">
                Farklı bir arama terimi deneyin veya bizimle iletişime geçin
              </p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-8 bg-action/5 rounded-2xl text-center">
          <h3 className="font-heading text-xl font-semibold text-brand-dark mb-3">
            Sorunuzu Bulamadınız mı?
          </h3>
          <p className="text-brand-dark/70 mb-6">
            Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <Link
            href="/iletisim"
            className="inline-block px-8 py-3 bg-action text-white font-semibold rounded-button shadow-button-depth hover:bg-action-hover hover:shadow-button-depth-hover hover:-translate-y-0.5 transition-all"
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>
    </div>
  )
}
