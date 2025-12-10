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

async function addImages() {
  console.log('🖼️ Adding product images...')

  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  // Image URLs from Unsplash for each product category
  const productImages = {
    // Kadın Elbiseleri
    'midi-boy-cicekli-viskon-elbise': [
      { url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800', alt: 'Midi Boy Çiçekli Viskon Elbise - Ön' },
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', alt: 'Midi Boy Çiçekli Viskon Elbise - Yan' },
    ],
    'siyah-uzun-kollu-kadife-elbise': [
      { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800', alt: 'Siyah Uzun Kollu Kadife Elbise - Ön' },
      { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', alt: 'Siyah Uzun Kollu Kadife Elbise - Detay' },
    ],
    'orgu-desenli-triko-kislik-elbise': [
      { url: 'https://images.unsplash.com/photo-1564257577-18049f9e0a96?w=800', alt: 'Örgü Desenli Triko Kışlık Elbise - Ön' },
      { url: 'https://images.unsplash.com/photo-1594633313593-bab3596b8f47?w=800', alt: 'Örgü Desenli Triko Kışlık Elbise - Detay' },
    ],

    // Erkek Dış Giyim
    'klasik-yun-kaban': [
      { url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800', alt: 'Klasik Yün Kaban - Ön' },
      { url: 'https://images.unsplash.com/photo-1548126032-079b-27c3-7f26?w=800', alt: 'Klasik Yün Kaban - Yan' },
    ],
    'su-gecirmez-kapusonlu-mont': [
      { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', alt: 'Su Geçirmez Kapüşonlu Mont - Ön' },
      { url: 'https://images.unsplash.com/photo-1608241130738-47596ba33c76?w=800', alt: 'Su Geçirmez Kapüşonlu Mont - Detay' },
    ],

    // Kadın Alt Giyim
    'yuksek-bel-skinny-jean': [
      { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', alt: 'Yüksek Bel Skinny Jean - Ön' },
      { url: 'https://images.unsplash.com/photo-1582552938357-32b906d78807?w=800', alt: 'Yüksek Bel Skinny Jean - Detay' },
    ],
    'pileli-midi-boy-suni-deri-etek': [
      { url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800', alt: 'Pileli Midi Boy Suni Deri Etek - Ön' },
      { url: 'https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800', alt: 'Pileli Midi Boy Suni Deri Etek - Yan' },
    ],

    // Erkek Üst Giyim
    'basic-bisiklet-yaka-t-shirt': [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt: 'Basic Bisiklet Yaka T-Shirt - Ön' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', alt: 'Basic Bisiklet Yaka T-Shirt - Beyaz' },
    ],
    'kapusonlu-logolu-sweatshirt': [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', alt: 'Kapüşonlu Logolu Sweatshirt - Ön' },
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', alt: 'Kapüşonlu Logolu Sweatshirt - Detay' },
    ],

    // Aksesuar
    'minimalist-deri-capraz-canta': [
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', alt: 'Minimalist Deri Çapraz Çanta - Ön' },
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', alt: 'Minimalist Deri Çapraz Çanta - Detay' },
    ],
    'unisex-spor-beyaz-sneaker': [
      { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', alt: 'Unisex Spor Beyaz Sneaker - Ön' },
      { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', alt: 'Unisex Spor Beyaz Sneaker - Yan' },
    ],
  }

  for (const product of products) {
    const images = productImages[product.slug]
    if (!images) {
      console.log(`⚠️  No images defined for: ${product.name}`)
      continue
    }

    // Add images for this product
    const imageData = images.map((img, index) => ({
      product_id: product.id,
      url: img.url,
      alt: img.alt,
      sort_order: index + 1
    }))

    const { error: imageError } = await supabase
      .from('product_images')
      .insert(imageData)

    if (imageError) {
      console.error(`❌ Error adding images for ${product.name}:`, imageError)
    } else {
      console.log(`✅ Added ${images.length} images for: ${product.name}`)
    }
  }

  console.log('🎉 Image adding completed!')
}

addImages().catch(console.error)
