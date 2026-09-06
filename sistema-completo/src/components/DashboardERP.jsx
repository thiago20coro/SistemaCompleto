import { useEffect, useState } from 'react'
import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'


const modulos = [
  { id: 'estoque', icone: '▣', titulo: 'Estoque', descricao: 'Entradas, saídas, depósitos e inventário.', acao: 'produtos', cor: '#0f766e' },
  { id: 'compras', icone: '↗', titulo: 'Compras', descricao: 'Solicitações, pedidos e recebimento.', acao: 'fornecedores', cor: '#2563eb' },
  { id: 'vendas', icone: '↘', titulo: 'Vendas e faturamento', descricao: 'Pedidos, orçamentos e comissões.', acao: 'vendas', cor: '#b45309' },
  { id: 'financeiro', icone: '$', titulo: 'Financeiro', descricao: 'Contas, fluxo de caixa e conciliação.', acao: null, cor: '#7c3aed' },
  { id: 'fiscal', icone: '税', titulo: 'Fiscal e tributário', descricao: 'NCM, CFOP e parametrização de impostos.', acao: 'produto', cor: '#be123c' },
  { id: 'rh', icone: '◎', titulo: 'Recursos humanos', descricao: 'Colaboradores, benefícios e ponto.', acao: 'usuario', cor: '#475569' },
  { id: 'bi', icone: '⌁', titulo: 'Relatórios e BI', descricao: 'Indicadores para decisões mais rápidas.', acao: 'relatorio-vendas', cor: '#166534' }
]

function DashboardERP({ onNavigate }) {
  const [resumo, setResumo] = useState({ produtos: 0, estoque: 0, fornecedores: 0 })

  useEffect(() => {
    async function carregarResumo() {
      const [produtosResposta, fornecedoresResposta] = await Promise.allSettled([
        http.get(`${API_URL}/produtos`),
        http.get(`${API_URL}/fornecedores`)
      ])
      const produtos = produtosResposta.status === 'fulfilled' ? produtosResposta.value.data : []
      const fornecedores = fornecedoresResposta.status === 'fulfilled' ? fornecedoresResposta.value.data : []
      setResumo({
        produtos: produtos.length,
        estoque: produtos.reduce((total, produto) => total + (Number(produto.quantidadeEstoque) || 0), 0),
        fornecedores: fornecedores.length
      })
    }
    carregarResumo()
  }, [])

  const indicadores = [
    { rotulo: 'Produtos cadastrados', valor: resumo.produtos, detalhe: 'Catálogo ativo', cor: '#0f766e' },
    { rotulo: 'Itens em estoque', valor: resumo.estoque, detalhe: 'Saldo informado', cor: '#2563eb' },
    { rotulo: 'Fornecedores', valor: resumo.fornecedores, detalhe: 'Base homologada', cor: '#b45309' },
    { rotulo: 'Módulos do ERP', valor: 7, detalhe: 'Visão operacional', cor: '#7c3aed' }
  ]

  return (
    <section className='dashboard-erp'>
      <header className='dashboard-cabecalho'>
        <div>
          <span className='dashboard-kicker'>CENTRO DE OPERAÇÕES</span>
          <h1>Bom dia, vamos cuidar do negócio?</h1>
          <p>Uma visão única para acompanhar cadastro, estoque, vendas e a saúde financeira do ateliê.</p>
        </div>
        <div className='dashboard-data'>
          <span>Hoje</span>
          <strong>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date())}</strong>
        </div>
      </header>

      <div className='dashboard-indicadores'>
        {indicadores.map(indicador => (
          <article className='indicador' key={indicador.rotulo} style={{ '--indicador-cor': indicador.cor }}>
            <span>{indicador.rotulo}</span>
            <strong>{indicador.valor}</strong>
            <small>{indicador.detalhe}</small>
          </article>
        ))}
      </div>

      <div className='dashboard-bloco-titulo'>
        <div>
          <span className='dashboard-kicker'>ÁREAS DO NEGÓCIO</span>
          <h2>O que você precisa resolver agora?</h2>
        </div>
        <span className='dashboard-status'><i /> Sistema conectado</span>
      </div>

      <div className='dashboard-modulos'>
        {modulos.map(modulo => (
          <button
            className='modulo-card'
            key={modulo.id}
            type='button'
            onClick={() => modulo.acao && onNavigate(modulo.acao)}
            disabled={!modulo.acao}
            style={{ '--modulo-cor': modulo.cor }}
          >
            <span className='modulo-icone'>{modulo.icone}</span>
            <span className='modulo-conteudo'>
              <strong>{modulo.titulo}</strong>
              <small>{modulo.descricao}</small>
            </span>
            <span className='modulo-seta'>{modulo.acao ? '→' : 'Em breve'}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default DashboardERP
