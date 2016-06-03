if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => {})
    .catch((error) => {
      console.log('Registration failed:', error)
    })
}
