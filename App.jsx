import './App.css'
import { useState } from 'react'
import CadastroUsuario from './CadastroUsuario.jsx'
import FormProduto from './FormProduto.jsx'
import ListarUsuarios from './ListarUsuarios.jsx'
import ListarProdutos from './ListarProdutos.jsx'
import CadastroFornecedor from './CadastroFornecedores.jsx'
import ListarFornecedores from './ListarFornecedor.jsx'
import minhaFoto from './Amor e Eu 1.jpg'

function App() {
  const [telaAtiva, setTelaAtiva] = useState("home")

  // Função auxiliar para aplicar estilo no botão ativo da barra lateral
  const estiloBotao = (tela) => ({
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    background: telaAtiva === tela ? '#cca43b' : 'transparent', // Destaque dourado no ativo
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
      
      {/* 🧭 BARRA LATERAL DE NAVEGAÇÃO */}
      <aside style={{ width: '260px', background: '#242f40', color: '#fff', padding: '24px 16px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid #34445c', paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#cca43b', letterSpacing: '1px' }}>🧵 Ateliê & Bordados</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>Painel de Controle</p>
        </div>

        <nav>
          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 8px 8px', letterSpacing: '0.5px' }}>Início</p>
          <button style={estiloBotao("home")} onClick={() => setTelaAtiva("home")}>🏠 Página Inicial</button>

          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '16px 0 8px 8px', letterSpacing: '0.5px' }}>Cadastros</p>
          <button style={estiloBotao("usuario")} onClick={() => setTelaAtiva("usuario")}>👤 Cadastrar Usuário</button>
          <button style={estiloBotao("produto")} onClick={() => setTelaAtiva("produto")}>👗 Cadastrar Produto</button>
          <button style={estiloBotao("fornecedores")} onClick={() => setTelaAtiva("fornecedores")}>🚚 Cadastrar Fornecedor</button>

          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', margin: '16px 0 8px 8px', letterSpacing: '0.5px' }}>Consultas</p>
          <button style={estiloBotao("clientes")} onClick={() => setTelaAtiva("clientes")}>👥 Usuários Cadastrados</button>
          <button style={estiloBotao("produtos")} onClick={() => setTelaAtiva("produtos")}>📦 Produtos Cadastrados</button>
          <button style={estiloBotao("listarfornecedores")} onClick={() => setTelaAtiva("listarfornecedores")}>📋 Listar Fornecedores</button>
        </nav>

        {/* 📸 EXIBIÇÃO DA FOTO "AMOR E EU" NA BARRA LATERAL */}
        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #34445c', paddingTop: '24px' }}>
          <p style={{ color: '#718096', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>Proprietários</p>
          <img 
            src={minhaFoto} 
            alt="Amor e Eu" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cca43b', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} 
          />
        </div>
      </aside>

      {/* 🖥️ CONTEÚDO PRINCIPAL DA TELA */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Renderização da Home do Ateliê */}
        {telaAtiva === "home" && (
          <div>
            <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 12px 0', color: '#242f40', fontSize: '28px' }}>Bem-vindo ao Sistema do Ateliê</h1>
              <p style={{ margin: 0, color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
                Gerencie suas coleções de roupas sob medida, controle o estoque de linhas, tecidos e bordados computadorizados, além de monitorar clientes e fornecedores em um único lugar.
              </p>
              
              {/* Atalhos Rápidos na Home */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '32px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#fcfcfc', textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>🪡</span>
                  <h4 style={{ margin: '10px 0 5px 0', color: '#242f40' }}>Novo Produto</h4>
                  <button onClick={() => setTelaAtiva("produto")} style={{ background: '#242f40', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}>Acessar</button>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#fcfcfc', textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>✨</span>
                  <h4 style={{ margin: '10px 0 5px 0', color: '#242f40' }}>Ver Estoque</h4>
                  <button onClick={() => setTelaAtiva("produtos")} style={{ background: '#242f40', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}>Acessar</button>
                </div>
              </div>
            </div>

           
          </div>
        )}

        {/* Renderização Condicional dos Componentes Existentes */}
        <div style={{ marginTop: '10px' }}>
          {telaAtiva === "usuario" && <CadastroUsuario />}
          {telaAtiva === "produto" && <FormProduto />}
          {telaAtiva === "clientes" && <ListarUsuarios />}
          {telaAtiva === "produtos" && <ListarProdutos />}
          {telaAtiva === "fornecedores" && <CadastroFornecedor />}
          {telaAtiva === "listarfornecedores" && <ListarFornecedores />}
        </div>

      </main>
    </div>
  )
}

export default App
