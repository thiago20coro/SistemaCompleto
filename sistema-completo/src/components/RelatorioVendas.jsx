import { useEffect, useMemo, useState } from 'react'
import { http } from '../config/http.js'
import { API_URL } from '../config/api.js'


function inicioDaSemana(data) {
  const inicio = new Date(data)
  const dia = inicio.getDay()
  const distancia = dia === 0 ? 6 : dia - 1
  inicio.setHours(0, 0, 0, 0)
  inicio.setDate(inicio.getDate() - distancia)
  return inicio
}

function chaveDoPeriodo(data, periodo) {
  if (periodo === 'mes') return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
  const semana = inicioDaSemana(data)
  return semana.toISOString().slice(0, 10)
}

function formatarPeriodo(chave, periodo) {
  if (periodo === 'mes') {
    const [ano, mes] = chave.split('-')
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(Number(ano), Number(mes) - 1, 1))
  }
  const inicio = new Date(`${chave}T00:00:00`)
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + 6)
  return `Semana de ${inicio.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')}`
}

function quantidadeDeItens(venda) {
  return (venda.itens || []).reduce((total, item) => total + (Number(item.quantidade) || 0), 0)
}

function RelatorioVendas() {
  const [periodo, setPeriodo] = useState('semana')
  const [vendas, setVendas] = useState([])
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    http.get(`${API_URL}/vendas`)
      .then(resposta => setVendas(resposta.data))
      .catch(() => setMensagem('Não foi possível carregar o relatório de vendas.'))
  }, [])

  const grupos = useMemo(() => {
    const agrupado = new Map()
    vendas.forEach(venda => {
      const data = new Date(venda.dataVenda || venda.createdAt)
      const chave = chaveDoPeriodo(data, periodo)
      const atual = agrupado.get(chave) || { chave, itens: 0, vendas: 0, faturamento: 0 }
      atual.itens += quantidadeDeItens(venda)
      atual.vendas += 1
      atual.faturamento += Number(venda.total) || 0
      agrupado.set(chave, atual)
    })
    return [...agrupado.values()].sort((a, b) => b.chave.localeCompare(a.chave))
  }, [vendas, periodo])

  const periodoAtual = grupos[0] || { itens: 0, vendas: 0, faturamento: 0 }
  const totalItens = grupos.reduce((total, grupo) => total + grupo.itens, 0)

  return (
    <section className='relatorio-vendas'>
      <header className='relatorio-vendas-cabecalho'>
        <div>
          <span className='dashboard-kicker'>RELATÓRIOS E BI</span>
          <h1>Itens vendidos</h1>
          <p>Acompanhe o volume vendido separado por semana ou por mês.</p>
        </div>
        <div className='relatorio-total-geral'>
          <span>Total no histórico</span>
          <strong>{totalItens} itens</strong>
        </div>
      </header>

      {mensagem && <p className='vendas-mensagem' role='alert'>{mensagem}</p>}

      <div className='relatorio-abas' role='tablist' aria-label='Período do relatório'>
        <button type='button' role='tab' aria-selected={periodo === 'semana'} className={periodo === 'semana' ? 'aba-relatorio ativa' : 'aba-relatorio'} onClick={() => setPeriodo('semana')}>Por semana</button>
        <button type='button' role='tab' aria-selected={periodo === 'mes'} className={periodo === 'mes' ? 'aba-relatorio ativa' : 'aba-relatorio'} onClick={() => setPeriodo('mes')}>Por mês</button>
      </div>

      <div className='relatorio-kpis'>
        <article><span>{periodo === 'semana' ? 'Última semana' : 'Último mês'}</span><strong>{periodoAtual.itens}</strong><small>itens vendidos</small></article>
        <article><span>Pedidos no período</span><strong>{periodoAtual.vendas}</strong><small>vendas concluídas</small></article>
        <article><span>Faturamento no período</span><strong>R$ {periodoAtual.faturamento.toFixed(2).replace('.', ',')}</strong><small>valor bruto registrado</small></article>
      </div>

      <div className='relatorio-tabela-wrap'>
        <div className='relatorio-tabela-titulo'>Histórico por {periodo === 'semana' ? 'semana' : 'mês'}</div>
        {grupos.length === 0 ? <p className='vendas-vazio'>Nenhuma venda registrada.</p> : (
          <table className='relatorio-tabela'>
            <thead><tr><th>Período</th><th>Itens vendidos</th><th>Pedidos</th><th>Faturamento</th></tr></thead>
            <tbody>{grupos.map(grupo => (
              <tr key={grupo.chave}>
                <td>{formatarPeriodo(grupo.chave, periodo)}</td>
                <td><strong>{grupo.itens}</strong></td>
                <td>{grupo.vendas}</td>
                <td>R$ {grupo.faturamento.toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default RelatorioVendas
