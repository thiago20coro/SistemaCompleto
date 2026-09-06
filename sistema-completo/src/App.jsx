import './App.css'
import { useEffect, useState } from 'react'
import { http } from './config/http.js'
import Login from './components/Login.jsx'
import CadastroUsuario from './components/CadastroUsuario.jsx'
import FormProduto from './components/FormProduto.jsx'
import ListarUsuarios from './components/ListarUsuarios.jsx'
import ListarProdutos from './components/ListarProdutos.jsx'
import CadastroFornecedor from './components/CadastroFornecedores.jsx'
import ListarFornecedores from './components/ListarFornecedor.jsx'
import CadastroAdministrador from './components/CadastroAdministrador.jsx'
import DashboardERP from './components/DashboardERP.jsx'
import PainelVendas from './components/PainelVendas.jsx'
import RelatorioVendas from './components/RelatorioVendas.jsx'
import minhaFoto from './assets/Amor e Eu 1.jpg'
import { API_URL } from './config/api.js'

function App() {
  const [telaAtiva, setTelaAtiva] = useState("home")
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setVerificandoSessao(false)
      return
    }
    http.setToken(token)
    http.get(`${API_URL}/auth/me`)
      .then(resposta => setUsuarioAutenticado(resposta.data))
      .catch(() => {
        localStorage.removeItem('authToken')
        http.setToken(null)
      })
      .finally(() => setVerificandoSessao(false))
  }, [])

  function sair() {
    http.post(`${API_URL}/auth/logout`).catch(error => {
      console.error('Não foi possível registrar o logout:', error)
    })
    localStorage.removeItem('authToken')
    http.setToken(null)
    setUsuarioAutenticado(null)
    setTelaAtiva('home')
  }

  if (verificandoSessao) return <div style={{ padding: 40 }}>Verificando acesso...</div>
  if (!usuarioAutenticado) return <Login onLogin={setUsuarioAutenticado} />

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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa' }}>
      <aside style={{ width: '260px', background: '#242f40', color: '#fff', padding: '24px 16px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
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
          <button style={estiloBotao("produto")} onClick={() => setTelaAtiva("produto")}>👗 Cadastrar Produto</button>
          <button style={estiloBotao("fornecedores")} onClick={() => setTelaAtiva("fornecedores")}>🚚 Cadastrar Fornecedor</button>
          <button style={estiloBotao("vendas")} onClick={() => setTelaAtiva("vendas")}>🧾 Registrar Venda</button>
          {usuarioAutenticado.perfil === 'admin' && (
            <button style={estiloBotao("administrador")} onClick={() => setTelaAtiva("administrador")}>🔐 Novo Administrador</button>
          )}

          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '16px 0 8px 8px', letterSpacing: '0.5px' }}>Consultas</p>
          <button style={estiloBotao("clientes")} onClick={() => setTelaAtiva("clientes")}>👥 Usuários Cadastrados</button>
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

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {telaAtiva === "home" && <DashboardERP onNavigate={setTelaAtiva} />}

        <div style={{ marginTop: '10px' }}>
          {telaAtiva === "usuario" && <CadastroUsuario />}
          {telaAtiva === "produto" && <FormProduto />}
          {telaAtiva === "clientes" && <ListarUsuarios isAdmin={usuarioAutenticado.perfil === 'admin'} />}
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
