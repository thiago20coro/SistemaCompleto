const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/.test(configuredApiUrl || '')
const apiUrl = import.meta.env.PROD && (!configuredApiUrl || isLocalApiUrl)
	? '/api'
	: configuredApiUrl || 'http://localhost:3000'

export const API_URL = apiUrl
	.replace(/\/$/, '')
	.replace(/\/api(?:\/api)+$/, '/api')