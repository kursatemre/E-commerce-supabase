// Google Analytics 4 client-side tracking

type GA4Event = {
  event_name: string
  event_params?: Record<string, any>
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ''

// Initialize GA4
export function initGA4() {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll send manually
  })
}

// Track page view
export function trackPageView(url: string, title?: string) {
  if (!window.gtag) return

  window.gtag('event', 'page_view', {
    page_location: url,
    page_title: title || document.title,
  })
}

// Track custom event
export function trackEvent(event: GA4Event) {
  if (!window.gtag) return

  window.gtag('event', event.event_name, event.event_params)
}

// E-commerce events
export function trackViewItem(item: {
  item_id: string
  item_name: string
  price: number
  currency?: string
  item_category?: string
  item_brand?: string
}) {
  trackEvent({
    event_name: 'view_item',
    event_params: {
      currency: item.currency || 'TRY',
      value: item.price,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          item_category: item.item_category,
          item_brand: item.item_brand,
        },
      ],
    },
  })
}

export function trackAddToCart(item: {
  item_id: string
  item_name: string
  price: number
  quantity: number
  currency?: string
}) {
  trackEvent({
    event_name: 'add_to_cart',
    event_params: {
      currency: item.currency || 'TRY',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          quantity: item.quantity,
        },
      ],
    },
  })
}

export function trackBeginCheckout(cart: {
  total: number
  currency?: string
  items: Array<{
    item_id: string
    item_name: string
    price: number
    quantity: number
  }>
}) {
  trackEvent({
    event_name: 'begin_checkout',
    event_params: {
      currency: cart.currency || 'TRY',
      value: cart.total,
      items: cart.items,
    },
  })
}

export function trackPurchase(order: {
  transaction_id: string
  value: number
  currency?: string
  tax?: number
  shipping?: number
  items: Array<{
    item_id: string
    item_name: string
    price: number
    quantity: number
  }>
}) {
  trackEvent({
    event_name: 'purchase',
    event_params: {
      transaction_id: order.transaction_id,
      value: order.value,
      currency: order.currency || 'TRY',
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      items: order.items,
    },
  })
}

export function trackSearch(search_term: string) {
  trackEvent({
    event_name: 'search',
    event_params: {
      search_term,
    },
  })
}

export function trackSelectContent(content_type: string, content_id: string) {
  trackEvent({
    event_name: 'select_content',
    event_params: {
      content_type,
      content_id,
    },
  })
}
