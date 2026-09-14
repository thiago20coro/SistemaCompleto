import './App.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './components/Login.jsx'
import CadastroUsuario from './components/CadastroUsuario.jsx'
import CadastroCliente from './components/CadastroCliente.jsx'
import FormProduto from './components/FormProduto.jsx'
import ListarUsuarios from './components/ListarUsuarios.jsx'
import ListarProdutos from './components/ListarProdutos.jsx'
import CadastroFornecedor from './components/CadastroFornecedores.jsx'
import ListarFornecedores from './components/ListarFornecedor.jsx'
import CadastroAdministrador from './components/CadastroAdministrador.jsx'
import DashboardERP from './components/DashboardERP.jsx'
import PainelVendas from './components/PainelVendas.jsx'
import RelatorioVendas from './components/RelatorioVendas.jsx'
import ClienteHistorico from './components/ClienteHistorico.jsx'
import minhaFoto from './assets/Amor e Eu 1.jpg'
import { API_URL } from './config/api.js'

const TOKEN_KEY = 'admin-token'

function aplicarToken(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  delete axios.defaults.headers.common.Authorization
  localStorage.removeItem(TOKEN_KEY)
}

function App() {
  const [telaAtiva, setTelaAtiva] = useState("home")
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      aplicarToken(token)
    }

    axios.interceptors.request.use((config) => {
      const atual = localStorage.getItem(TOKEN_KEY)
      if (atual) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${atual}`
        }
      }
      return config
    })

    if (!token) {
      setUsuarioAutenticado(null)
      setVerificandoSessao(false)
      return
    }

    axios.get(`${API_URL}/auth/me`)
      .then(resposta => setUsuarioAutenticado(resposta.data))
      .catch(() => {
        setUsuarioAutenticado(null)
        aplicarToken(null)
      })
      .finally(() => setVerificandoSessao(false))
  }, [])

  function sair() {
    setUsuarioAutenticado(null)
    aplicarToken(null)
    setTelaAtiva('home')
  }

  if (verificandoSessao) return <div style={{ padding: 40 }}>Verificando acesso...</div>
  if (!usuarioAutenticado) return <Login onLogin={(usuario, token) => {
    aplicarToken(token)
    setUsuarioAutenticado(usuario)
  }} />

  const estiloBotao = (tela) => ({
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    background: telaAtiva === tela ? '#cca43b' : 'transparent',
    color: telaAtiva === tela ? '#ffffff' : '#e0e0e0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: telaAtiva === tela ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
  })

  return (
    <div className='app-shell' style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa' }}>
      <aside className='app-sidebar' style={{ width: '260px', background: '#242f40', color: '#fff', padding: '24px 16px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid #34445c', paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#cca43b', letterSpacing: '1px' }}>🧵 Ateliê & Bordados</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>Painel de Controle</p>
        </div>

        <nav>
          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 8px 8px', letterSpacing: '0.5px' }}>Início</p>
          <button style={estiloBotao("home")} onClick={() => setTelaAtiva("home")}>🏠 Página Inicial</button>
          <button style={{ ...estiloBotao("logout"), color: '#fca5a5', marginTop: 16 }} onClick={sair}>🚪 Sair</button>

          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '16px 0 8px 8px', letterSpacing: '0.5px' }}>Cadastros</p>
          <button style={estiloBotao("usuario")} onClick={() => setTelaAtiva("usuario")}>👤 Cadastrar Usuário</button>
          <button style={estiloBotao("cliente-cadastro")} onClick={() => setTelaAtiva("cliente-cadastro")}>👥 Cadastrar Cliente</button>
          <button style={estiloBotao("produto")} onClick={() => setTelaAtiva("produto")}>👗 Cadastrar Produto</button>
          <button style={estiloBotao("fornecedores")} onClick={() => setTelaAtiva("fornecedores")}>🚚 Cadastrar Fornecedor</button>
          <button style={estiloBotao("vendas")} onClick={() => setTelaAtiva("vendas")}>🧾 Registrar Venda</button>
          {usuarioAutenticado.perfil === 'admin' && (
            <button style={estiloBotao("administrador")} onClick={() => setTelaAtiva("administrador")}>🔐 Novo Administrador</button>
          )}

          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '16px 0 8px 8px', letterSpacing: '0.5px' }}>Consultas</p>
          <button style={estiloBotao("clientes")} onClick={() => setTelaAtiva("clientes")}>👥 Usuários Cadastrados</button>
          <button style={estiloBotao("cliente-historico")} onClick={() => setTelaAtiva("cliente-historico")}>🧾 Histórico de Clientes</button>
          <button style={estiloBotao("produtos")} onClick={() => setTelaAtiva("produtos")}>📦 Produtos Cadastrados</button>
          <button style={estiloBotao("listarfornecedores")} onClick={() => setTelaAtiva("listarfornecedores")}>📋 Listar Fornecedores</button>
          <button style={estiloBotao("relatorio-vendas")} onClick={() => setTelaAtiva("relatorio-vendas")}>📊 Itens Vendidos</button>
        </nav>

        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #34445c', paddingTop: '24px' }}>
          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>Proprietários</p>
          <img 
            src={minhaFoto} 
            alt="Amor e Eu" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cca43b', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} 
          />
        </div>
      </aside>

      <main className='app-main' style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {telaAtiva === "home" && <DashboardERP onNavigate={setTelaAtiva} />}

        <div style={{ marginTop: '10px' }}>
          {telaAtiva === "usuario" && <CadastroUsuario />}
          {telaAtiva === "cliente-cadastro" && <CadastroCliente />}
          {telaAtiva === "produto" && <FormProduto />}
          {telaAtiva === "clientes" && <ListarUsuarios isAdmin={usuarioAutenticado.perfil === 'admin'} />}
          {telaAtiva === "cliente-historico" && <ClienteHistorico />}
          {telaAtiva === "produtos" && <ListarProdutos />}
          {telaAtiva === "fornecedores" && <CadastroFornecedor />}
          {telaAtiva === "vendas" && <PainelVendas />}
          {telaAtiva === "relatorio-vendas" && <RelatorioVendas />}
          {telaAtiva === "listarfornecedores" && <ListarFornecedores />}
          {telaAtiva === "administrador" && usuarioAutenticado.perfil === 'admin' && <CadastroAdministrador />}
        </div>

      </main>
    </div>
  )
}

export default App
