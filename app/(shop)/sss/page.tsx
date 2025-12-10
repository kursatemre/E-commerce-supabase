'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const faqCategories = [
  {
    name: 'Sipariş ve Ödeme',
    faqs: [
      {
        question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz. Tüm kredi kartı ödemeleri 3D Secure ile güvence altındadır.',
      },
      {
        question: 'Siparişimi nasıl iptal edebilirim?',
        answer: 'Siparişiniz kargoya verilmeden önce "Hesabım" > "Siparişlerim" bölümünden iptal edebilirsiniz. Kargoya verildikten sonra iade sürecini başlatmanız gerekmektedir.',
      },
      {
        question: 'Fatura bilgilerimi nasıl güncelleyebilirim?',
        answer: 'Sipariş sırasında fatura bilgilerinizi girebilirsiniz. Sipariş verdikten sonra değişiklik için müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir.',
      },
      {
        question: 'Taksit seçenekleri nelerdir?',
        answer: 'Tüm kredi kartlarında 9 taksit imkanı sunuyoruz. Bazı bankalara özel kampanyalarda 12 taksit seçeneği de bulunmaktadır.',
      },
    ],
  },
  {
    name: 'Kargo ve Teslimat',
    faqs: [
      {
        question: 'Kargo ücreti ne kadar?',
        answer: '500 TL ve üzeri alışverişlerde kargo ücretsizdir. 500 TL altı siparişlerde kargo ücreti 29,90 TL\'dir.',
      },
      {
        question: 'Siparişim ne zaman kargoya verilir?',
        answer: 'Stokta bulunan ürünler için siparişiniz aynı gün kargoya verilir (saat 14:00\'a kadar verilen siparişler için). Özel üretim ürünlerde bu süre değişiklik gösterebilir.',
      },
      {
        question: 'Kargo takip numaramı nasıl öğrenebilirim?',
        answer: 'Siparişiniz kargoya verildikten sonra e-posta ve SMS ile kargo takip numaranız gönderilir. Ayrıca "Hesabım" > "Siparişlerim" bölümünden de görebilirsiniz.',
      },
      {
        question: 'Yurtdışına gönderim yapıyor musunuz?',
        answer: 'Şu an sadece Türkiye içi gönderim yapmaktayız. Yakın zamanda yurtdışı gönderim seçeneğini de ekleyeceğiz.',
      },
    ],
  },
  {
    name: 'İade ve Değişim',
    faqs: [
      {
        question: 'İade süresi ne kadar?',
        answer: 'Ürün teslim tarihinden itibaren 30 gün içinde koşulsuz iade hakkınız bulunmaktadır.',
      },
      {
        question: 'Hangi ürünleri iade edemem?',
        answer: 'Kişisel hijyen gerektiren ürünler (iç giyim, kozmetik) ambalajı açılmışsa, özel üretim veya kişiselleştirilmiş ürünler iade edilemez.',
      },
      {
        question: 'İade kargo ücreti kim tarafından ödenir?',
        answer: 'İade kargo ücreti tarafımızca karşılanır. İade talebiniz onaylandıktan sonra size ücretsiz kargo kodu gönderilir.',
      },
      {
        question: 'İade param ne zaman hesabıma yatar?',
        answer: 'Ürün depomuzageldikten sonra 3-5 iş günü içinde ödemeniz iade edilir. Kredi kartı iadelerinde bankanızın işlem süresine bağlı olarak 3-10 iş günü sürebilir.',
      },
      {
        question: 'Beden değişimi nasıl yapabilirim?',
        answer: 'Önce mevcut ürünü iade edin, ardından istediğiniz bedeni yeni sipariş olarak verin. İade onaylandıktan sonra ödemeniz hesabınıza aktarılacaktır.',
      },
    ],
  },
  {
    name: 'Üyelik ve Hesap',
    faqs: [
      {
        question: 'Üye olmadan alışveriş yapabilir miyim?',
        answer: 'Evet, misafir kullanıcı olarak da alışveriş yapabilirsiniz. Ancak üye olmanız durumunda sipariş takibi ve hızlı alışveriş gibi avantajlardan yararlanabilirsiniz.',
      },
      {
        question: 'Şifremi unuttum, ne yapmalıyım?',
        answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz.',
      },
      {
        question: 'E-posta adresimi nasıl değiştirebilirim?',
        answer: '"Hesabım" > "Profil Bilgilerim" bölümünden e-posta adresinizi güncelleyebilirsiniz.',
      },
      {
        question: 'Hesabımı nasıl silebilirim?',
        answer: 'Hesabınızı silmek için müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir. Verileriniz KVKK kapsamında güvenli bir şekilde silinecektir.',
      },
    ],
  },
]

export default function SSSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              Aradığınız cevabı bulamadınız mı? Müşteri hizmetlerimizle iletişime geçebilirsiniz.
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
              <input
                type="text"
                placeholder="Soru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-button text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-action/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="section-container py-16 md:py-20">
        {filteredCategories.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-dark/60 text-lg">
              Aradığınız soruyu bulamadık. Lütfen farklı bir arama yapın veya{' '}
              <a href="/iletisim" className="text-action hover:underline">
                bizimle iletişime geçin
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <section key={categoryIndex}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark mb-6">
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const key = `${categoryIndex}-${faqIndex}`
                    const isOpen = openItems[key]

                    return (
                      <div key={faqIndex} className="card overflow-hidden">
                        <button
                          onClick={() => toggleItem(categoryIndex, faqIndex)}
                          className="w-full text-left flex items-start justify-between gap-4 group"
                        >
                          <h3 className="font-semibold text-brand-dark group-hover:text-action transition-colors flex-1">
                            {faq.question}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-brand-dark/60 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-brand-dark/70 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="bg-surface-light py-12">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">
              Başka Sorunuz Var mı?
            </h2>
            <p className="text-brand-dark/70 mb-6">
              Aradığınız cevabı bulamadıysanız, müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar.
            </p>
            <a href="/iletisim" className="btn-cta inline-block">
              İletişime Geçin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
