import { API_URL } from './api.js'

let token = localStorage.getItem('authToken')

function setToken(novoToken) {
    token = novoToken
}

async function request(method, path, body) {
    const headers = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`

    const resposta = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    })
    const contentType = resposta.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
        ? await resposta.json()
        : await resposta.text()

    if (!resposta.ok) {
        const erro = new Error(data?.mensagem || `Erro HTTP ${resposta.status}`)
        erro.response = { status: resposta.status, data }
        throw erro
    }

    return { data, status: resposta.status }
}

export const http = {
    get: path => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: path => request('DELETE', path),
    setToken
}
