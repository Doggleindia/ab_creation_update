import Footer from '@/components/Footer'
import ExploreCategories from '@/components/Product-Collection/ExploreCategories'
import ProductPage from '@/components/Product-Collection/ProductPage'

async function fetchProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_MAIN_BACKEND

  const host = base ? String(base).replace(/\/$/, '') : ''
  const url = host
    ? `${host}/api/products/slug/${encodeURIComponent(slug)}`
    : `/api/products/slug/${encodeURIComponent(slug)}`


  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      let body = ''
      try {
        body = await res.text()
      } catch (e) {
        body = '<unable to read body>'
      }
      console.error('[fetchProduct] API error', res.status, res.statusText, 'body:', body)
      return null
    }

    const json = await res.json()
    return json?.data ?? null
  } catch (err) {
    console.error('[fetchProduct] Fetch failed for', url, err)
    return null
  }
}


async function extractProductId(params: any): Promise<string | undefined> {
  if (!params) return undefined
  // If params is a promise/thenable, await it
  if (typeof params === 'object' && typeof (params as any).then === 'function') {
    try {
      params = await params
    } catch (e) {
      return undefined
    }
  }

  // If it's a JSON string
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params)
    } catch (e) {
      return undefined
    }
  }

  // Direct property
  if (typeof params === 'object' && params?.productid) return params.productid

  // Some frameworks wrap values in a `value` string
  if (params?.value && typeof params.value === 'string') {
    try {
      const parsed = JSON.parse(params.value)
      if (parsed?.productid) return parsed.productid
    } catch (e) {
      // ignore
    }
  }

  // Fallback: search recursively for a productid key
  const stack = [params]
  while (stack.length) {
    const cur = stack.pop()
    if (!cur || typeof cur !== 'object') continue
    if (typeof cur.productid === 'string') return cur.productid
    for (const k of Object.keys(cur)) {
      stack.push(cur[k])
    }
  }

  return undefined
}

export async function generateMetadata({ params }: { params: Promise<{ productid: string }> }) {
  const productId = await extractProductId(params)
  const product = productId ? await fetchProduct(productId) : null
  if (!product) return { title: 'Product' }
  const seo = product.seo || {}
  return {
    title: seo.metaTitle || product.title,
    description: seo.metaDescription || product.description,
    openGraph: {
      title: seo.ogTitle || product.title,
      description: seo.ogDescription || product.description,
      images: seo.ogImage ? [seo.ogImage] : product?.variants?.[0]?.media?.images ?? [],
    },
    alternates: { canonical: seo.canonicalUrl || undefined },
  }
}

const Page = async ({
  params,
}: {
  params: any
}) => {
  const productId = await extractProductId(params)

  if (!productId) return <div>Invalid product</div>

  const product = await fetchProduct(productId)
  if (!product) {
    return <div>Product not found</div>
  }
  // Collect images from variants (flatten, unique)
  const images: string[] = []
  if (product?.variants) {
    for (const v of product.variants) {
      const imgs = v?.media?.images || []
      for (const i of imgs) {
        if (i && !images.includes(i)) images.push(i)
      }
    }
  }

  return (
    <div>
      <ProductPage images={images} product={product} />
      <ExploreCategories />
      <Footer />
    </div>
  )
}

export default Page