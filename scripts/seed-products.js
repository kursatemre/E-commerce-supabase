const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local')
const envFile = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const slugify = (text) =>
  text.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function seedData() {
  console.log('🚀 Starting data seeding...')

  // 1. Add Mango brand
  console.log('📦 Adding Mango brand...')
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .insert({
      name: 'Mango',
      slug: 'mango',
      description: 'Uluslararası moda markası - Trend ve kaliteli giyim',
      is_active: true
    })
    .select()
    .single()

  if (brandError) {
    console.error('❌ Brand error:', brandError)
    return
  }
  console.log('✅ Mango brand added:', brand.id)

  // 2. Add categories
  console.log('📁 Adding categories...')
  const categories = [
    { name: 'Kadın Elbiseleri', slug: 'kadin-elbiseleri', description: 'Günlük ve özel günler için kadın elbiseleri' },
    { name: 'Erkek Dış Giyim', slug: 'erkek-dis-giyim', description: 'Erkek mont, kaban ve ceketler' },
    { name: 'Kadın Alt Giyim', slug: 'kadin-alt-giyim', description: 'Kadın pantolon, etek ve şortlar' },
    { name: 'Erkek Üst Giyim', slug: 'erkek-ust-giyim', description: 'Erkek tişört, sweatshirt ve kazaklar' },
    { name: 'Aksesuar ve Ayakkabı', slug: 'aksesuar-ve-ayakkabi', description: 'Çanta, ayakkabı ve aksesuarlar' }
  ]

  const categoryIds = {}
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, is_active: true })
      .select()
      .single()

    if (error) {
      console.error(`❌ Category error (${cat.name}):`, error)
    } else {
      categoryIds[cat.slug] = data.id
      console.log(`✅ Category added: ${cat.name}`)
    }
  }

  // 3. Add products with variants
  console.log('🛍️ Adding products...')

  const products = [
    // Kadın Elbiseleri
    {
      category: 'kadin-elbiseleri',
      name: 'Midi Boy Çiçekli Viskon Elbise',
      description: 'Hafif ve nefes alan viskon kumaştan, yazlık günler için ideal, beli lastikli ve V yaka tasarım.',
      price: 899.99,
      stock: 50,
      sku: 'MANGO-DRESS-001',
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800', alt: 'Midi Boy Çiçekli Viskon Elbise - Ön', sort_order: 1 },
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', alt: 'Midi Boy Çiçekli Viskon Elbise - Yan', sort_order: 2 },
      ],
      variants: [
        { color: 'Mavi', size: 'S', sku: 'MANGO-DRESS-001-BLUE-S', stock: 10 },
        { color: 'Mavi', size: 'M', sku: 'MANGO-DRESS-001-BLUE-M', stock: 15 },
        { color: 'Mavi', size: 'L', sku: 'MANGO-DRESS-001-BLUE-L', stock: 10 },
        { color: 'Bej', size: 'S', sku: 'MANGO-DRESS-001-BEIGE-S', stock: 8 },
        { color: 'Bej', size: 'M', sku: 'MANGO-DRESS-001-BEIGE-M', stock: 12 },
      ]
    },
    {
      category: 'kadin-elbiseleri',
      name: 'Siyah Uzun Kollu Kadife Elbise',
      description: 'Şık akşam davetleri için mükemmel, yumuşak dokulu kadife kumaş, diz altı kesim.',
      price: 1299.99,
      stock: 40,
      sku: 'MANGO-DRESS-002',
      variants: [
        { color: 'Siyah', size: 'XS', sku: 'MANGO-DRESS-002-BLACK-XS', stock: 8 },
        { color: 'Siyah', size: 'S', sku: 'MANGO-DRESS-002-BLACK-S', stock: 10 },
        { color: 'Siyah', size: 'M', sku: 'MANGO-DRESS-002-BLACK-M', stock: 12 },
        { color: 'Bordo', size: 'S', sku: 'MANGO-DRESS-002-BURGUNDY-S', stock: 10 },
      ]
    },
    {
      category: 'kadin-elbiseleri',
      name: 'Örgü Desenli Triko Kışlık Elbise',
      description: 'Soğuk havalar için sıcak tutan, kalın triko, balıkçı yaka ve rahat kalıp.',
      price: 749.99,
      stock: 45,
      sku: 'MANGO-DRESS-003',
      variants: [
        { color: 'Krem', size: 'S', sku: 'MANGO-DRESS-003-CREAM-S', stock: 15 },
        { color: 'Krem', size: 'M', sku: 'MANGO-DRESS-003-CREAM-M', stock: 15 },
        { color: 'Gri', size: 'M', sku: 'MANGO-DRESS-003-GRAY-M', stock: 15 },
      ]
    },

    // Erkek Dış Giyim
    {
      category: 'erkek-dis-giyim',
      name: 'Klasik Yün Kaban',
      description: 'Kış ayları için şık ve sıcak tutan, %70 yün karışımı, tek sıra düğmeli, diz boyu.',
      price: 2499.99,
      stock: 30,
      sku: 'MANGO-COAT-001',
      variants: [
        { color: 'Siyah', size: '48', sku: 'MANGO-COAT-001-BLACK-48', stock: 5 },
        { color: 'Siyah', size: '50', sku: 'MANGO-COAT-001-BLACK-50', stock: 8 },
        { color: 'Siyah', size: '52', sku: 'MANGO-COAT-001-BLACK-52', stock: 7 },
        { color: 'Koyu Gri', size: '50', sku: 'MANGO-COAT-001-DGRAY-50', stock: 10 },
      ]
    },
    {
      category: 'erkek-dis-giyim',
      name: 'Su Geçirmez Kapüşonlu Mont',
      description: 'Yağmurlu ve rüzgarlı havalar için ideal, teknik kumaş, fermuarlı ve ayarlanabilir kapüşon.',
      price: 1799.99,
      stock: 60,
      sku: 'MANGO-JACKET-001',
      variants: [
        { color: 'Lacivert', size: 'M', sku: 'MANGO-JACKET-001-NAVY-M', stock: 15 },
        { color: 'Lacivert', size: 'L', sku: 'MANGO-JACKET-001-NAVY-L', stock: 15 },
        { color: 'Lacivert', size: 'XL', sku: 'MANGO-JACKET-001-NAVY-XL', stock: 15 },
        { color: 'Yeşil', size: 'L', sku: 'MANGO-JACKET-001-GREEN-L', stock: 15 },
      ]
    },

    // Kadın Alt Giyim
    {
      category: 'kadin-alt-giyim',
      name: 'Yüksek Bel Skinny Jean',
      description: 'Vücudu saran ve toparlayan, yüksek belli, esnek denim kumaş.',
      price: 599.99,
      stock: 80,
      sku: 'MANGO-JEANS-001',
      variants: [
        { color: 'Koyu Mavi', size: '27', sku: 'MANGO-JEANS-001-DBLUE-27', stock: 15 },
        { color: 'Koyu Mavi', size: '28', sku: 'MANGO-JEANS-001-DBLUE-28', stock: 15 },
        { color: 'Koyu Mavi', size: '29', sku: 'MANGO-JEANS-001-DBLUE-29', stock: 15 },
        { color: 'Siyah', size: '28', sku: 'MANGO-JEANS-001-BLACK-28', stock: 20 },
        { color: 'Siyah', size: '29', sku: 'MANGO-JEANS-001-BLACK-29', stock: 15 },
      ]
    },
    {
      category: 'kadin-alt-giyim',
      name: 'Pileli Midi Boy Suni Deri Etek',
      description: 'Trend ve dikkat çekici, yumuşak suni deri, arkası fermuarlı, midi boy.',
      price: 799.99,
      stock: 40,
      sku: 'MANGO-SKIRT-001',
      variants: [
        { color: 'Siyah', size: 'S', sku: 'MANGO-SKIRT-001-BLACK-S', stock: 15 },
        { color: 'Siyah', size: 'M', sku: 'MANGO-SKIRT-001-BLACK-M', stock: 15 },
        { color: 'Kahverengi', size: 'M', sku: 'MANGO-SKIRT-001-BROWN-M', stock: 10 },
      ]
    },

    // Erkek Üst Giyim
    {
      category: 'erkek-ust-giyim',
      name: 'Basic Bisiklet Yaka T-Shirt',
      description: '%100 pamuk, standart kalıp, yumuşak doku, günlük kullanım için ideal.',
      price: 199.99,
      stock: 100,
      sku: 'MANGO-TSHIRT-001',
      variants: [
        { color: 'Beyaz', size: 'M', sku: 'MANGO-TSHIRT-001-WHITE-M', stock: 25 },
        { color: 'Beyaz', size: 'L', sku: 'MANGO-TSHIRT-001-WHITE-L', stock: 25 },
        { color: 'Siyah', size: 'M', sku: 'MANGO-TSHIRT-001-BLACK-M', stock: 25 },
        { color: 'Siyah', size: 'L', sku: 'MANGO-TSHIRT-001-BLACK-L', stock: 25 },
      ]
    },
    {
      category: 'erkek-ust-giyim',
      name: 'Kapüşonlu Logolu Sweatshirt',
      description: 'Kışlık ve rahat, içi polar astarlı, önü kanguru cepli, göğüs logolu.',
      price: 699.99,
      stock: 60,
      sku: 'MANGO-HOODIE-001',
      variants: [
        { color: 'Koyu Gri', size: 'M', sku: 'MANGO-HOODIE-001-DGRAY-M', stock: 15 },
        { color: 'Koyu Gri', size: 'L', sku: 'MANGO-HOODIE-001-DGRAY-L', stock: 15 },
        { color: 'Mavi', size: 'L', sku: 'MANGO-HOODIE-001-BLUE-L', stock: 15 },
        { color: 'Mavi', size: 'XL', sku: 'MANGO-HOODIE-001-BLUE-XL', stock: 15 },
      ]
    },

    // Aksesuar
    {
      category: 'aksesuar-ve-ayakkabi',
      name: 'Minimalist Deri Çapraz Çanta',
      description: 'Günlük kullanım için ideal, suni deri, ayarlanabilir askılı, fermuarlı kapama.',
      price: 499.99,
      stock: 50,
      sku: 'MANGO-BAG-001',
      variants: [
        { color: 'Siyah', size: 'Standart', sku: 'MANGO-BAG-001-BLACK-STD', stock: 20 },
        { color: 'Taba', size: 'Standart', sku: 'MANGO-BAG-001-TAN-STD', stock: 15 },
        { color: 'Krem', size: 'Standart', sku: 'MANGO-BAG-001-CREAM-STD', stock: 15 },
      ]
    },
    {
      category: 'aksesuar-ve-ayakkabi',
      name: 'Unisex Spor Beyaz Sneaker',
      description: 'Her kombine uyum sağlayan, rahat tabanlı, suni deri ve tekstil karışımı.',
      price: 899.99,
      stock: 100,
      sku: 'MANGO-SHOE-001',
      variants: [
        { color: 'Beyaz', size: '38', sku: 'MANGO-SHOE-001-WHITE-38', stock: 10 },
        { color: 'Beyaz', size: '39', sku: 'MANGO-SHOE-001-WHITE-39', stock: 15 },
        { color: 'Beyaz', size: '40', sku: 'MANGO-SHOE-001-WHITE-40', stock: 15 },
        { color: 'Beyaz', size: '41', sku: 'MANGO-SHOE-001-WHITE-41', stock: 15 },
        { color: 'Beyaz', size: '42', sku: 'MANGO-SHOE-001-WHITE-42', stock: 15 },
        { color: 'Beyaz', size: '43', sku: 'MANGO-SHOE-001-WHITE-43', stock: 15 },
      ]
    },
  ]

  for (const product of products) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        category_id: categoryIds[product.category],
        brand_id: brand.id,
        is_active: true
      })
      .select()
      .single()

    if (productError) {
      console.error(`❌ Product error (${product.name}):`, productError)
      continue
    }

    console.log(`✅ Product added: ${product.name}`)

    // Add variants
    if (product.variants && product.variants.length > 0) {
      const variantData = product.variants.map(v => ({
        product_id: productData.id,
        name: `${v.color} - ${v.size}`,
        color: v.color,
        size: v.size,
        sku: v.sku,
        price: product.price,
        stock: v.stock,
        is_active: true
      }))

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantData)

      if (variantError) {
        console.error(`❌ Variant error (${product.name}):`, variantError)
      } else {
        console.log(`  ✅ Added ${product.variants.length} variants`)
      }
    }
  }

  console.log('🎉 Data seeding completed!')
}

seedData().catch(console.error)
