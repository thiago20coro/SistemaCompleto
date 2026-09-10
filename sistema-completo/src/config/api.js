const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = import.meta.env.PROD
	? '/api'
	: configuredApiUrl || 'http://localhost:3000'

export const API_URL = apiUrl
	.replace(/\/$/, '')
	.replace(/\/api(?:\/api)+$/, '/api')