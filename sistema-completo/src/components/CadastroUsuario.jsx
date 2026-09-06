import { useState } from 'react'
import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'

function CadastroUsuario() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cep, setCep] = useState('')
  const [celular, setCelular] = useState('')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  
  // Estado para controlar a mensagem de sucesso na tela
  const [mensagem, setMensagem] = useState('')
  
  // Estado para rastrear qual input está focado (para o efeito focus premium)
  const [campoFocado, setCampoFocado] = useState('')

  // Limpa os inputs após o cadastro
  function limparFormulario() {
    setName('')
    setEmail('')
    setAge('')
    setEndereco('')
    setCep('')
    setCelular('')
    setCpf('')
    setSenha('')
  }

  // Envia o formulário para criar um novo usuário
  async function handleSubmit(event) {
    event.preventDefault()

    const dadosUsuario = {
      nome: name,
      email: email,
      idade: age,
      endereco: endereco,
      cep: cep,
      celular: celular,
      cpf: cpf,
      senha: senha
    }

    try {
      await http.post(`${API_URL}/usuarios`, dadosUsuario)
      
      setMensagem('Novo usuário criado com sucesso! A senha já foi protegida.')
      limparFormulario()

      setTimeout(() => {
        setMensagem('')
      }, 3000)

    } catch (error) {
      setMensagem('Erro ao cadastrar usuário. Tente novamente.')
    }
  }

  // Objeto centralizado de Estilos Premium UI
  const estilos = {
    containerPagina: {
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f1f5f9',
      padding: '40px 20px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardForm: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      border: '1px solid #e2e8f0',
      padding: '40px',
      width: '100%',
      maxWidth: '700px',
      boxSizing: 'border-box'
    },
    titulo: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '6px',
      textAlign: 'center',
      letterSpacing: '-0.5px'
    },
    subtitulo: {
      fontSize: '14px',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '32px'
    },
    statusMensagem: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      padding: '14px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: '24px'
    },
    formularioGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    inputBase: {
      width: '100%',
      padding: '14px 16px',
      fontSize: '15px',
      border: '1px solid #cbd5e1',
      borderRadius: '10px',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease-in-out',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
    },
    inputFocus: {
      border: '1px solid #2563eb',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.02)'
    },
    campoInteiro: {
      gridColumn: 'span 2'
    },
    areaBotao: {
      gridColumn: 'span 2',
      marginTop: '12px'
    },
    botaoSubmit: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      transition: 'all 0.2s'
    }
  }

  // Função auxiliar para injetar dinamicamente o estilo de Focus
  const obterEstiloInput = (nomeCampo) => {
    return campoFocado === nomeCampo 
      ? { ...estilos.inputBase, ...estilos.inputFocus }
      : estilos.inputBase;
  }

  return (
    <div className='cadastro-usuario' style={estilos.containerPagina}>
      <div style={estilos.cardForm}>
        <h1 style={estilos.titulo}>👤 Cadastro de Usuário</h1>
        <p style={estilos.subtitulo}>Preencha as informações para registrar um novo perfil</p>
        
        {/* Exibe a mensagem na tela se ela não estiver vazia */}
        {mensagem && (
          <p className="mensagem-status" style={estilos.statusMensagem}>
            {mensagem}
          </p>
        )}

        <form onSubmit={handleSubmit} style={estilos.formularioGrid}>
          
          <div style={estilos.campoInteiro}>
            <input 
              placeholder='Nome Completo' 
              type='text' 
              value={name} 
              onChange={event => setName(event.target.value)} 
              required
              style={obterEstiloInput('name')}
              onFocus={() => setCampoFocado('name')}
              onBlur={() => setCampoFocado('')}
            />
          </div>

          <div style={estilos.campoInteiro}>
            <input
              placeholder='Senha (mínimo de 6 caracteres)'
              type='password'
              value={senha}
              onChange={event => setSenha(event.target.value)}
              required
              minLength={6}
              autoComplete='new-password'
              style={obterEstiloInput('senha')}
              onFocus={() => setCampoFocado('senha')}
              onBlur={() => setCampoFocado('')}
            />
          </div>

          <input 
            placeholder='E-mail' 
            type='email' 
            value={email} 
            onChange={event => setEmail(event.target.value)} 
            required
            style={obterEstiloInput('email')}
            onFocus={() => setCampoFocado('email')}
            onBlur={() => setCampoFocado('')}
          />
          
          <input 
            placeholder='Idade' 
            type='number' 
            value={age} 
            onChange={event => setAge(event.target.value)} 
            required
            style={obterEstiloInput('age')}
            onFocus={() => setCampoFocado('age')}
            onBlur={() => setCampoFocado('')}
          />

          <div style={estilos.campoInteiro}>
            <input 
              placeholder='Endereço' 
              type='text' 
              value={endereco} 
              onChange={event => setEndereco(event.target.value)} 
              required
              style={obterEstiloInput('endereco')}
              onFocus={() => setCampoFocado('endereco')}
              onBlur={() => setCampoFocado('')}
            />
          </div>

          <input 
            placeholder='CEP' 
            type='text' 
            value={cep} 
            onChange={event => setCep(event.target.value)} 
            required
            style={obterEstiloInput('cep')}
            onFocus={() => setCampoFocado('cep')}
            onBlur={() => setCampoFocado('')}
          />
          
          <input 
            placeholder='Celular' 
            type='text' 
            value={celular} 
            onChange={event => setCelular(event.target.value)} 
            required
            style={obterEstiloInput('celular')}
            onFocus={() => setCampoFocado('celular')}
            onBlur={() => setCampoFocado('')}
          />

          <div style={estilos.campoInteiro}>
            <input 
              placeholder='CPF' 
              type='text' 
              value={cpf} 
              onChange={event => setCpf(event.target.value)} 
              required
              style={obterEstiloInput('cpf')}
              onFocus={() => setCampoFocado('cpf')}
              onBlur={() => setCampoFocado('')}
            />
          </div>
          
          <div style={estilos.areaBotao}>
            <button 
              type='submit' 
              style={estilos.botaoSubmit}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1d4ed8'
                e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2563eb'
                e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CadastroUsuario
