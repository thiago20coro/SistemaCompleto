import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'

function ListarFornecedores() {
  // Estados mapeados rigorosamente para o Schema do Fornecedor
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [inscricaoEstadual, setInscricaoEstadual] = useState('')
  const [segmento, setSegmento] = useState('')
  const [prazoPagamento, setPrazoPagamento] = useState('')
  const [prazoEntrega, setPrazoEntrega] = useState('')
  
  const [fornecedores, setFornecedores] = useState([])
  
  // Estado para saber qual ID está em modo de edição
  const [idEdicao, setIdEdicao] = useState(null)

  // Função para buscar os fornecedores da API
  async function buscarFornecedores() {
    try {
      const resposta = await axios.get(`${API_URL}/fornecedores`)
      setFornecedores(Array.isArray(resposta.data) ? resposta.data : [])
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error)
    }
  }

  useEffect(() => {
    buscarFornecedores()
  }, [])

  // Prepara e abre os inputs de edição diretamente na vaga do fornecedor clicado
  function iniciarEdicao(fornecedor) {
    setIdEdicao(fornecedor._id)
    setRazaoSocial(fornecedor.razaoSocial)
    setNomeFantasia(fornecedor.nomeFantasia)
    setCnpj(fornecedor.cnpj)
    setEndereco(fornecedor.endereco)
    setTelefone(fornecedor.telefone)
    setEmail(fornecedor.email)
    setInscricaoEstadual(fornecedor.inscriçãoEstadual) // Mapeando o campo com acento do banco
    setSegmento(fornecedor.segmento)
    setPrazoPagamento(fornecedor.prazoPagamento)
    setPrazoEntrega(fornecedor.prazoEntrega)
  }

  // Cancela o modo de edição e esconde os inputs
  function cancelarEdicao() {
    setIdEdicao(null)
    limparFormulario()
  }

  // Limpa os estados temporários
  function limparFormulario() {
    setRazaoSocial('')
    setNomeFantasia('')
    setCnpj('')
    setEndereco('')
    setTelefone('')
    setEmail('')
    setInscricaoEstadual('')
    setSegmento('')
    setPrazoPagamento('')
    setPrazoEntrega('')
  }

  // Deleta o fornecedor da API e atualiza a lista da tela
  async function deletarFornecedor(id) {
    try {
      await axios.delete(`${API_URL}/fornecedores/${id}`)
      buscarFornecedores()
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error)
    }
  }

  // Envia a atualização do fornecedor selecionado
  async function handleUpdate(event) {
    event.preventDefault() // Evita o recarregamento da página

    const dadosFornecedor = {
      razaoSocial: razaoSocial,
      nomeFantasia: nomeFantasia,
      cnpj: cnpj,
      endereco: endereco,
      telefone: telefone,
      email: email,
      inscriçãoEstadual: inscricaoEstadual, // Mantido o padrão de escrita com acento do Schema
      segmento: segmento,
      prazoPagamento: prazoPagamento,
      prazoEntrega: prazoEntrega
    }

    try {
      await axios.put(`${API_URL}/fornecedores/${idEdicao}`, dadosFornecedor)
      setIdEdicao(null)
      limparFormulario()
      buscarFornecedores()
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error)
    }
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
    headerCard: {
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '14px',
      marginBottom: '16px'
    },
    razaoSocialText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 6px 0'
    },
    nomeFantasiaText: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      margin: 0
    },
    infoLinha: {
      fontSize: '14px',
      margin: '10px 0',
      color: '#334155',
      lineHeight: '1.5',
      display: 'flex',
      gap: '6px'
    },
    containerBadges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '16px'
    },
    badge: {
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
    },
    areaBotoes: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
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
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
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
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
    },
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
      boxSizing: 'border-box'
    },
    gridDuploForm: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
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

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>📋 Lista de Fornecedores</h1>

      <div style={estilos.gridCards}>
        {fornecedores.map((fornecedor) => (
          <div key={fornecedor._id} style={estilos.cardContainer}>
            
            {/* Condicional: se o ID deste fornecedor for igual ao idEdicao, exibe os inputs */}
            {idEdicao === fornecedor._id ? (
              <form onSubmit={handleUpdate} style={estilos.formularioEdicao}>
                <h3 style={estilos.subtituloEdicao}>✏️ Editar Informações</h3>
                
                <input placeholder='Razão Social' type='text' value={razaoSocial} onChange={event => setRazaoSocial(event.target.value)} required style={estilos.inputEdicao} />
                <input placeholder='Nome Fantasia' type='text' value={nomeFantasia} onChange={event => setNomeFantasia(event.target.value)} required style={estilos.inputEdicao} />
                
                <div style={estilos.gridDuploForm}>
                  <input placeholder='CNPJ' type='text' value={cnpj} onChange={event => setCnpj(event.target.value)} required style={estilos.inputEdicao} />
                  <input placeholder='Inscrição Estadual' type='text' value={inscricaoEstadual} onChange={event => setInscricaoEstadual(event.target.value)} required style={estilos.inputEdicao} />
                </div>
                
                <input placeholder='Endereço' type='text' value={endereco} onChange={event => setEndereco(event.target.value)} required style={estilos.inputEdicao} />
                
                <div style={estilos.gridDuploForm}>
                  <input placeholder='Telefone' type='text' value={telefone} onChange={event => setTelefone(event.target.value)} required style={estilos.inputEdicao} />
                  <input placeholder='Email' type='email' value={email} onChange={event => setEmail(event.target.value)} required style={estilos.inputEdicao} />
                </div>
                
                <input placeholder='Segmento' type='text' value={segmento} onChange={event => setSegmento(event.target.value)} required style={estilos.inputEdicao} />
                
                <div style={estilos.gridDuploForm}>
                  <input placeholder='Prazo de Pagamento' type='text' value={prazoPagamento} onChange={event => setPrazoPagamento(event.target.value)} required style={estilos.inputEdicao} />
                  <input placeholder='Prazo de Entrega' type='text' value={prazoEntrega} onChange={event => setPrazoEntrega(event.target.value)} required style={estilos.inputEdicao} />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type='submit' style={{ ...estilos.btnSalvar, flex: 1 }}>Salvar Alterações</button>
                  <button type='button' onClick={cancelarEdicao} style={{ ...estilos.btnCancelar, flex: 1 }}>Cancelar</button>
                </div>
              </form>
            ) : (
              // Modo Visualização Ativo (Exibição Direta e Limpa)
              <>
                <div className="fornecedor-info-card">
                  <div style={estilos.headerCard}>
                    <h2 style={estilos.razaoSocialText}>{fornecedor.razaoSocial}</h2>
                    <p style={estilos.nomeFantasiaText}>🏢 {fornecedor.nomeFantasia}</p>
                  </div>

                  <p style={estilos.infoLinha}><strong>CNPJ:</strong> {fornecedor.cnpj}</p>
                  <p style={estilos.infoLinha}><strong>I.E.:</strong> {fornecedor.inscriçãoEstadual}</p>
                  <p style={estilos.infoLinha}><strong>Endereço:</strong> {fornecedor.endereco}</p>
                  <p style={estilos.infoLinha}><strong>Telefone:</strong> {fornecedor.telefone}</p>
                  <p style={estilos.infoLinha}><strong>Email:</strong> {fornecedor.email}</p>
                  
                  <div style={estilos.containerBadges}>
                    <span style={{ ...estilos.badge, backgroundColor: '#f1f5f9', color: '#475569' }}>🏷️ {fornecedor.segmento}</span>
                    <span style={{ ...estilos.badge, backgroundColor: '#e0f2fe', color: '#0369a1' }}>💳 {fornecedor.prazoPagamento}</span>
                    <span style={{ ...estilos.badge, backgroundColor: '#f0fdf4', color: '#166534' }}>🚚 {fornecedor.prazoEntrega}</span>
                  </div>
                </div>
                
                <div style={estilos.areaBotoes}>
                  <button 
                    onClick={() => iniciarEdicao(fornecedor)} 
                    style={estilos.btnAlterar}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Alterar
                  </button>
                  <button 
                    onClick={() => deletarFornecedor(fornecedor._id)} 
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

export default ListarFornecedores

