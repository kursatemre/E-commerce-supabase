import { redirect } from 'next/navigation'

export default async function ProductsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Redirect from /shop/products/[slug] to /shop/product/[slug]
  redirect(`/shop/product/${slug}`)
}
