const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/.netlify/functions/api' : 'http://localhost:3000')

export const API_URL = apiUrl.replace(/\/$/, '')