import { useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'

function CadastroCliente() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [endereco, setEndereco] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)

  function limparFormulario() {
    setNome('')
    setCpf('')
    setEndereco('')
    setCelular('')
    setEmail('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSalvando(true)
    setMensagem('')

    const cpfNormalizado = cpf.replace(/\D/g, '')
    const emailTecnico = email.trim().toLowerCase() || `cliente.${cpfNormalizado}@cliente.local`

    try {
      await axios.post(`${API_URL}/usuarios`, {
        nome: nome.trim(),
        cpf: cpf.trim(),
        endereco: endereco.trim(),
        cep: '00000-000',
        celular: celular.trim(),
        email: emailTecnico,
        senha: 'Cliente@123',
        tipoCadastro: 'cliente'
      })
      setMensagem('Cliente cadastrado com sucesso.')
      limparFormulario()
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Não foi possível cadastrar o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  const inputStyle = {
    width: '100%',
    minHeight: 44,
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    background: '#f8fafc',
    color: '#1e293b',
    font: 'inherit',
    boxSizing: 'border-box'
  }

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', color: '#1e293b' }}>
      <header style={{ marginBottom: 24 }}>
        <span className='dashboard-kicker'>CADASTRO DE CLIENTES</span>
        <h1 style={{ margin: '8px 0', color: '#172033', fontSize: 32 }}>Cadastrar cliente</h1>
        <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>Registre pessoas da loja mesmo antes de realizarem uma compra.</p>
      </header>

      {mensagem && <p className='vendas-mensagem' role='status'>{mensagem}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, padding: 24, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 22px rgba(30, 41, 59, .05)' }}>
        <label style={{ display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 }}>
          Nome completo
          <input value={nome} onChange={event => setNome(event.target.value)} required style={inputStyle} />
        </label>

        <div className='cliente-cadastro-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label style={{ display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 }}>
            CPF
            <input value={cpf} onChange={event => setCpf(event.target.value)} required style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 }}>
            Telefone
            <input value={celular} onChange={event => setCelular(event.target.value)} required style={inputStyle} />
          </label>
        </div>

        <label style={{ display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 }}>
          Endereço
          <input value={endereco} onChange={event => setEndereco(event.target.value)} required style={inputStyle} />
        </label>

        <label style={{ display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 }}>
          E-mail (opcional)
          <input type='email' value={email} onChange={event => setEmail(event.target.value)} style={inputStyle} />
        </label>

        <button type='submit' disabled={salvando} style={{ minHeight: 46, border: 0, background: '#0f766e', color: '#fff', fontWeight: 700, cursor: salvando ? 'wait' : 'pointer' }}>
          {salvando ? 'Salvando...' : 'Cadastrar cliente'}
        </button>
      </form>
    </section>
  )
}

export default CadastroCliente
