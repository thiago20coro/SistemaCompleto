const configuredApiUrl = import.meta.env.VITE_API_URL
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
const isHttpApiUrl = /^https?:\/\/[^\s/]+(?:\/.*)?$/i.test(configuredApiUrl || '')
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl || '')
const isRelativeApiUrl = /^\/[^/]/.test(configuredApiUrl || '')
const isUsableApiUrl = isHttpApiUrl && !isLocalApiUrl || isRelativeApiUrl
const apiUrl = import.meta.env.PROD
    ? isUsableApiUrl ? configuredApiUrl : '/api'
    : isHttpApiUrl || isRelativeApiUrl ? configuredApiUrl : 'http://localhost:3000'

export const API_URL = apiUrl.replace(/\/$/, '')