
import { useState, useEffect } from 'react'

import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'

function ListarUsuarios({ isAdmin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cep, setCep] = useState('')
  const [celular, setCelular] = useState('')
  const [cpf, setCpf] = useState('')
  const [users, setUsers] = useState([])
  const [mensagem, setMensagem] = useState('')
  
  // Mantido para saber exatamente qual ID está em modo de edição
  const [idEdicao, setIdEdicao] = useState(null)

  // Função para buscar os usuários da API
  async function buscarUsuarios() {
    const resposta = await http.get(`${API_URL}/usuarios`)
    setUsers(resposta.data)
  }

  useEffect(() => {
    buscarUsuarios()
  }, [])

  // Prepara e abre os inputs de edição diretamente na vaga do usuário clicado
  function iniciarEdicao(user) {
    setIdEdicao(user._id)
    setName(user.nome)
    setEmail(user.email)
    setAge(user.idade)
    setEndereco(user.endereco)
    setCep(user.cep)
    setCelular(user.celular)
    setCpf(user.cpf)
  }

  // Cancela o modo de edição e esconde os inputs
  function cancelarEdicao() {
    setIdEdicao(null)
    limparFormulario()
  }

  // Limpa os estados temporários
  function limparFormulario() {
    setName('')
    setEmail('')
    setAge('')
    setEndereco('')
    setCep('')
    setCelular('')
    setCpf('')
  }

  // Deleta o usuário da API e atualiza a lista da tela
  async function deletarUsuario(id) {
    await http.delete(`${API_URL}/usuarios/${id}`)
    buscarUsuarios()
  }

  async function alterarAcesso(id, acesso) {
    try {
      await http.put(`${API_URL}/usuarios/${id}/acesso`, { acesso })
      setMensagem(`Acesso atualizado para ${acesso}.`)
      buscarUsuarios()
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Não foi possível atualizar o acesso.')
    }
  }

  // Envia a atualização do usuário selecionado
  async function handleUpdate(event) {
    event.preventDefault() // Evita o recarregamento da página

    const dadosUsuario = {
      nome: name,
      email: email,
      idade: age,
      endereco: endereco,
      cep: cep,
      celular: celular,
      cpf: cpf
    }

    await http.put(`${API_URL}/usuarios/${idEdicao}`, dadosUsuario)
    
    setIdEdicao(null)
    limparFormulario()
    buscarUsuarios()
  }

    // Objeto centralizado de Estilos Premium UI
  const estilos = {
    pagina: {
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f8fafc',
      padding: '40px 20px',
      minHeight: '100vh',
      color: '#1e293b'
    },
    titulo: {
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '40px',
      color: '#0f172a',
      letterSpacing: '-0.5px'
    },
    gridCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    cardContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      border: '1px solid #e2e8f0',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    },
    areaBotoes: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '16px'
    },
    btnAlterar: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
      transition: 'background-color 0.2s'
    },
    btnDeletar: {
      padding: '10px 16px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
      transition: 'background-color 0.2s'
    },
    // Estilos para o formulário de Edição Interna
    formularioEdicao: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    subtituloEdicao: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#475569',
      margin: '0 0 4px 0'
    },
    inputEdicao: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    gridDuploForm: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px'
    },
    gridMistoForm: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '10px'
    },
    btnSalvar: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px'
    },
    btnCancelar: {
      padding: '10px 20px',
      backgroundColor: '#64748b',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px'
    }
  }

    // Lembrete: Adicione este novo input de arquivo no seu estado (no topo do componente):
  // const [fotoArquivo, setFotoArquivo] = useState(null)

  return (
    <div className='cadastro-usuario' style={estilos.pagina}>
      <h1 style={estilos.titulo}>📋 Lista de Usuários</h1>
      {mensagem && <p role='status' style={{ textAlign: 'center', marginBottom: 20, color: '#334155' }}>{mensagem}</p>}

      <div className='user-list' style={estilos.gridCards}>
        {users.map((user) => (
          <div key={user._id} className='user-card-container' style={estilos.cardContainer}>
            
            {/* Condicional: se o ID deste usuário for igual ao idEdicao, exibe os inputs */}
            {idEdicao === user._id ? (
              <form onSubmit={handleUpdate} style={estilos.formularioEdicao}>
                <h3 style={estilos.subtituloEdicao}>✏️ Editar Usuário</h3>
                
                <input placeholder='Nome' type='text' value={name} onChange={event => setName(event.target.value)} required style={estilos.inputEdicao} />
                <input placeholder='Email' type='email' value={email} onChange={event => setEmail(event.target.value)} required style={estilos.inputEdicao} />
                
                <div style={estilos.gridMistoForm}>
                  <input placeholder='Endereço' type='text' value={endereco} onChange={event => setEndereco(event.target.value)} style={estilos.inputEdicao} />
                  <input placeholder='Idade' type='number' value={age} onChange={event => setAge(event.target.value)} style={estilos.inputEdicao} />
                </div>
                
                <div style={estilos.gridDuploForm}>
                  <input placeholder='CEP' type='text' value={cep} onChange={event => setCep(event.target.value)} style={estilos.inputEdicao} />
                  <input placeholder='Celular' type='text' value={celular} onChange={event => setCelular(event.target.value)} style={estilos.inputEdicao} />
                </div>
                
                <input placeholder='CPF' type='text' value={cpf} onChange={event => setCpf(event.target.value)} style={estilos.inputEdicao} />
                
                {/* NOVO INPUT: Permite ao usuário escolher o arquivo da nova foto de perfil */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Foto de Perfil:</label>
                  <input 
                    type='file' 
                    accept='image/*' 
                    onChange={event => setFotoArquivo(event.target.files[0])} // Salva o arquivo no estado temporário
                    style={{ ...estilos.inputEdicao, padding: '6px 12px' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type='submit' style={{ ...estilos.btnSalvar, flex: 1 }}>Salvar Alterações</button>
                  <button type='button' onClick={cancelarEdicao} style={{ ...estilos.btnCancelar, flex: 1 }}>Cancelar</button>
                </div>
              </form>
            ) : (
              // Modo de Visualização normal
              <>
                <div className="user-card-content" style={{ flex: 1 }}>
                  
                  {/* Se houver foto salva (user.fotoUrl), exibe ela. Se não houver, usa o robozinho correspondente do RoboHash */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                    <img 
                      className='user-card-avatar' 
                      src={user.fotoUrl || `https://www.robohash.org/${user._id}`} 
                      alt={`Avatar de ${user.nome}`}
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}
                    />
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>{user.nome}</h2>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>📍 {user.cep}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', margin: '8px 0', color: '#334155' }}><strong>Email:</strong> {user.email}</p>
                  <p style={{ fontSize: '14px', margin: '8px 0', color: '#334155' }}><strong>Idade:</strong> {user.idade} anos</p>
                  <p style={{ fontSize: '14px', margin: '8px 0', color: '#334155' }}><strong>Endereço:</strong> {user.endereco}</p>
                  <p style={{ fontSize: '14px', margin: '8px 0', color: '#334155' }}><strong>Celular:</strong> {user.celular}</p>
                  <p style={{ fontSize: '14px', margin: '8px 0', color: '#334155' }}><strong>CPF:</strong> {user.cpf}</p>
                  <p style={{ fontSize: '14px', margin: '8px 0', color: user.acesso === 'aprovado' ? '#15803d' : user.acesso === 'bloqueado' ? '#b91c1c' : '#b45309' }}>
                    <strong>Acesso:</strong> {user.acesso || 'pendente'}
                  </p>
                </div>
                
                <div className='user-actions' style={estilos.areaBotoes}>
                  {isAdmin && user.acesso !== 'aprovado' && <button onClick={() => alterarAcesso(user._id, 'aprovado')} style={{ ...estilos.btnSalvar, flex: 1 }}>Aprovar</button>}
                  {isAdmin && user.acesso !== 'bloqueado' && <button onClick={() => alterarAcesso(user._id, 'bloqueado')} style={{ ...estilos.btnDeletar, flex: 1 }}>Bloquear</button>}
                  <button 
                    onClick={() => iniciarEdicao(user)} 
                    style={estilos.btnAlterar}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Alterar
                  </button>
                  <button 
                    onClick={() => deletarUsuario(user._id)} 
                    style={estilos.btnDeletar}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                  >
                    Deletar
                  </button>
                </div>
              </>
            )}

          </div>
        ))}
      </div>
    </div>
  )

}

export default ListarUsuarios
