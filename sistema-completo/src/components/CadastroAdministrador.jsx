import { useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'

function CadastroAdministrador() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMensagem('')
    setCarregando(true)

    try {
      await axios.post(`${API_URL}/administradores`, { nome, email, senha })
      setNome('')
      setEmail('')
      setSenha('')
      setMensagem('Administrador criado com sucesso.')
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Não foi possível criar o administrador.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section style={{ maxWidth: 560, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
      <h1 style={{ color: '#242f40', marginTop: 0 }}>🔐 Novo administrador</h1>
      <p style={{ color: '#64748b' }}>A senha será protegida antes de ser salva no banco.</p>
      {mensagem && <p role='status' style={{ color: '#166534', background: '#f0fdf4', padding: 12, borderRadius: 8 }}>{mensagem}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input value={nome} onChange={event => setNome(event.target.value)} placeholder='Nome completo' required />
        <input value={email} onChange={event => setEmail(event.target.value)} type='email' placeholder='E-mail' required />
        <input value={senha} onChange={event => setSenha(event.target.value)} type='password' placeholder='Senha (mínimo de 6 caracteres)' minLength={6} required />
        <button type='submit' disabled={carregando} style={{ padding: 12, border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600 }}>
          {carregando ? 'Salvando...' : 'Criar administrador'}
        </button>
      </form>
    </section>
  )
}

export default CadastroAdministrador
