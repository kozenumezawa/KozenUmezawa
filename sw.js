/* eslint-env worker */

const CACHE_NAME = 'V1'

self.addEventListener('fetch', (event) => {
  const promise = caches.match(event.request)
    .then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request.clone())
    })
    .then((response) => {
      if (event.request.url.startsWith('http://133.3.250.177')) {
        if (!response || response.status !== 200) {
          return response
        }

        const clone = response.clone()
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, clone)
          })
      }

      return response
    })
  event.respondWith(promise)
})
