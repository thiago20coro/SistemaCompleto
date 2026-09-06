// Se preferir, pode manter o nome antigo do CSS
import { useState } from 'react'
import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'

function CadastroFornecedor() {
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
  
  // Estado para controlar a mensagem de sucesso na tela
  const [mensagem, setMensagem] = useState('')

  // Limpa os inputs após o cadastro
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

  // Envia o formulário para criar um novo fornecedor
  async function handleSubmit(event) {
    event.preventDefault()

    // Objeto formatado com as chaves exatas do seu Mongoose Schema
    const dadosFornecedor = {
      razaoSocial: razaoSocial,
      nomeFantasia: nomeFantasia,
      cnpj: cnpj,
      endereco: endereco,
      telefone: telefone,
      email: email,
      inscriçãoEstadual: inscricaoEstadual, // Mantida a chave com caractere especial do Schema
      segmento: segmento,
      prazoPagamento: prazoPagamento,
      prazoEntrega: prazoEntrega
    }

    try {
      // Rota atualizada para fornecedores
      await http.post(`${API_URL}/fornecedores`, dadosFornecedor)
      
      setMensagem('Novo fornecedor criado com sucesso!')
      limparFormulario()

      setTimeout(() => {
        setMensagem('')
      }, 3000)

    } catch (error) {
      setMensagem('Erro ao cadastrar fornecedor. Tente novamente.')
    }
  }

    // Objeto centralizado de Estilos Premium UI
  const estilos = {
    containerPagina: {
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f8fafc',
      padding: '40px 20px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardForm: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0',
      padding: '32px',
      width: '100%',
      maxWidth: '750px', // Um pouco mais largo para acomodar bem as duas colunas
      boxSizing: 'border-box'
    },
    titulo: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '24px',
      textAlign: 'center',
      letterSpacing: '-0.5px'
    },
    statusMensagem: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: '20px'
    },
    formularioGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr', // Divide o formulário em duas colunas iguais
      gap: '16px'
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      fontSize: '15px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      color: '#1e293b',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease'
    },
    campoInteiro: {
      gridColumn: 'span 2' // Força o input a ocupar as duas colunas (linhas cheias)
    },
    areaBotao: {
      gridColumn: 'span 2',
      marginTop: '8px'
    },
    botaoSubmit: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
      transition: 'background-color 0.2s'
    }
  }

  return (
    <div className='cadastro-fornecedor' style={estilos.containerPagina}>
      <div style={estilos.cardForm}>
        <h1 style={estilos.titulo}>🏢 Cadastro de Fornecedor</h1>
        
        {/* Exibe a mensagem na tela se ela não estiver vazia */}
        {mensagem && (
          <p className="mensagem-status" style={estilos.statusMensagem}>
            {mensagem}
          </p>
        )}

        <form onSubmit={handleSubmit} style={estilos.formularioGrid}>
          {/* Dados Principais da Empresa */}
          <input placeholder='Razão Social' type='text' value={razaoSocial} onChange={event => setRazaoSocial(event.target.value)} required style={estilos.input} />
          <input placeholder='Nome Fantasia' type='text' value={nomeFantasia} onChange={event => setNomeFantasia(event.target.value)} required style={estilos.input} />
          
          <input placeholder='CNPJ' type='text' value={cnpj} onChange={event => setCnpj(event.target.value)} required style={estilos.input} />
          <input placeholder='Inscrição Estadual' type='text' value={inscricaoEstadual} onChange={event => setInscricaoEstadual(event.target.value)} required style={estilos.input} />
          
          {/* Endereço ocupa a largura total para ficar confortável */}
          <div style={estilos.campoInteiro}>
            <input placeholder='Endereço Completo' type='text' value={endereco} onChange={event => setEndereco(event.target.value)} required style={estilos.input} />
          </div>

          {/* Contatos */}
          <input placeholder='Telefone / Celular' type='text' value={telefone} onChange={event => setTelefone(event.target.value)} required style={estilos.input} />
          <input placeholder='E-mail Comercial' type='email' value={email} onChange={event => setEmail(event.target.value)} required style={estilos.input} />
          
          {/* Atuação e Logística */}
          <div style={estilos.campoInteiro}>
            <input placeholder='Segmento de Mercado (Ex: Alimentos, Embalagens)' type='text' value={segmento} onChange={event => setSegmento(event.target.value)} required style={estilos.input} />
          </div>
          
          <input placeholder='Prazo de Pagamento (Ex: 30 dias)' type='text' value={prazoPagamento} onChange={event => setPrazoPagamento(event.target.value)} required style={estilos.input} />
          <input placeholder='Prazo de Entrega (Ex: 5 dias úteis)' type='text' value={prazoEntrega} onChange={event => setPrazoEntrega(event.target.value)} required style={estilos.input} />
          
          {/* Botão de Envio */}
          <div style={estilos.areaBotao}>
            <button 
              type='submit' 
              style={estilos.botaoSubmit}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Cadastrar Fornecedor
            </button>
          </div>
        </form>
      </div>
    </div>
  )

    
}

export default CadastroFornecedor
