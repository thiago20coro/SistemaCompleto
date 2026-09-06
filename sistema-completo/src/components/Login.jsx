import { useState } from 'react'
import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setCarregando(true)
    setMensagem('')
    try {
      const resposta = await http.post(`${API_URL}/auth/login`, { email, senha })
      localStorage.setItem('authToken', resposta.data.token)
      http.setToken(resposta.data.token)
      onLogin(resposta.data.usuario)
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Não foi possível fazer login.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f1f5f9', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, background: '#fff', padding: 36, borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,.1)' }}>
        <h1 style={{ color: '#242f40', marginBottom: 8 }}>Ateliê & Bordados</h1>
        <p style={{ color: '#64748b', marginBottom: 28 }}>Entre com seu e-mail e senha</p>
        {mensagem && <p role='alert' style={{ color: '#b91c1c', background: '#fef2f2', padding: 12, borderRadius: 8 }}>{mensagem}</p>}
        <label style={{ display: 'block', marginBottom: 16 }}>
          E-mail
          <input type='email' value={email} onChange={event => setEmail(event.target.value)} required autoComplete='email' style={{ display: 'block', width: '100%', padding: 12, marginTop: 6, border: '1px solid #cbd5e1', borderRadius: 8 }} />
        </label>
        <label style={{ display: 'block', marginBottom: 24 }}>
          Senha
          <input type='password' value={senha} onChange={event => setSenha(event.target.value)} required minLength={6} autoComplete='current-password' style={{ display: 'block', width: '100%', padding: 12, marginTop: 6, border: '1px solid #cbd5e1', borderRadius: 8 }} />
        </label>
        <button type='submit' disabled={carregando} style={{ width: '100%', padding: 14, border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

export default Login
