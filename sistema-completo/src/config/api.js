const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000')

export const API_URL = apiUrl.replace(/\/$/, '')