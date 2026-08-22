import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  
  // Try to get the asset from KV
  try {
    const response = await getAssetFromKV(event, {
      mapRequestToAsset: (request) => {
        // For SPA, serve index.html for all non-file requests
        const url = new URL(request.url)
        if (!url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
          // No file extension, serve index.html
          return new Request(`${url.origin}/index.html`, request)
        }
        return mapRequestToAsset(request)
      }
    })
    
    // Add cache headers for static assets
    const cacheControl = url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|ico|svg|webp)$/)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate'
    
    return new Response(response.body, {
      ...response,
      headers: {
        ...response.headers,
        'Cache-Control': cacheControl
      }
    })
  } catch (e) {
    // Fallback to index.html for SPA routing
    try {
      const indexResponse = await getAssetFromKV(event, {
        mapRequestToAsset: () => new Request(`${url.origin}/index.html`, event.request)
      })
      return indexResponse
    } catch (e2) {
      return new Response('Not Found', { status: 404 })
    }
  }
}
