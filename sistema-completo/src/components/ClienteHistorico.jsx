import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'

function ClienteHistorico() {
  const [clientes, setClientes] = useState([])
  const [pesquisa, setPesquisa] = useState('')

  useEffect(() => {
    async function carregarClientes() {
      try {
        const [usuariosResposta, vendasResposta] = await Promise.all([
          axios.get(`${API_URL}/usuarios`),
          axios.get(`${API_URL}/vendas`)
        ])

        const usuarios = Array.isArray(usuariosResposta.data) ? usuariosResposta.data : []
        const vendas = Array.isArray(vendasResposta.data) ? vendasResposta.data : []

        const clientesComHistorico = usuarios
          .filter((usuario) => usuario && usuario.nome)
          .map((usuario) => {
            const nomeUsuario = String(usuario.nome || '').trim().toLowerCase()
            const historico = vendas.filter((venda) => {
              const nomeVenda = String(venda?.nomeCliente || '').trim().toLowerCase()
              const clienteId = venda?.cliente ? String(venda.cliente) : ''
              return clienteId === String(usuario._id) || nomeVenda === nomeUsuario
            })

            const totalGasto = historico.reduce((total, venda) => total + (Number(venda.total) || 0), 0)

            return {
              ...usuario,
              historico: historico.sort((a, b) => new Date(b.dataVenda || b.createdAt) - new Date(a.dataVenda || a.createdAt)),
              totalGasto,
              quantidadeCompras: historico.length
            }
          })
          .sort((a, b) => b.totalGasto - a.totalGasto)

        setClientes(clientesComHistorico)
      } catch (erro) {
        console.error('Erro ao carregar histórico de clientes:', erro)
        setClientes([])
      }
    }

    carregarClientes()
  }, [])

  const clientesFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()
    if (!termo) return clientes

    return clientes.filter((cliente) => {
      const texto = `${cliente.nome} ${cliente.email} ${cliente.celular || ''}`.toLowerCase()
      return `${texto} ${cliente.cpf || ''}`.toLowerCase().includes(termo)
    })
  }, [clientes, pesquisa])

  const totalGastoSistema = clientes.reduce((total, cliente) => total + (Number(cliente.totalGasto) || 0), 0)
  const totalComprasSistema = clientes.reduce((total, cliente) => total + (Number(cliente.quantidadeCompras) || 0), 0)

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', fontFamily: 'Segoe UI, sans-serif', color: '#1f2937' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '30px', color: '#111827' }}>👥 Clientes</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Histórico de compras e faturamento por cliente.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Clientes</div>
          <strong style={{ display: 'block', fontSize: '28px', marginTop: '8px' }}>{clientes.length}</strong>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Compras</div>
          <strong style={{ display: 'block', fontSize: '28px', marginTop: '8px' }}>{totalComprasSistema}</strong>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Faturamento</div>
          <strong style={{ display: 'block', fontSize: '28px', marginTop: '8px' }}>R$ {totalGastoSistema.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '22px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
        <input
          type='text'
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder='Buscar cliente por nome, e-mail ou celular'
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '15px',
            outline: 'none'
          }}
        />
      </div>

      <div className='cliente-tabela-wrap' style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)', overflowX: 'auto' }}>
        {clientesFiltrados.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <table className='cliente-tabela'>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Contato</th>
                <th>Compras</th>
                <th>Total gasto</th>
                <th>Histórico</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente._id}>
                  <td data-label='Cliente'><strong>{cliente.nome}</strong><small>{cliente.email || 'E-mail não informado'}</small></td>
                  <td data-label='CPF'>{cliente.cpf || 'Não informado'}</td>
                  <td data-label='Contato'>{cliente.celular || 'Não informado'}</td>
                  <td data-label='Compras'>{cliente.quantidadeCompras || 0}</td>
                  <td data-label='Total gasto'><strong className='cliente-total'>R$ {Number(cliente.totalGasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                  <td data-label='Histórico'>
                    <details>
                      <summary>Ver compras</summary>
                      {cliente.historico.length === 0 ? (
                        <p>Nenhuma compra registrada.</p>
                      ) : (
                        <div className='cliente-historico-lista'>
                          {cliente.historico.map((venda, index) => (
                            <div key={`${cliente._id}-${venda._id || index}`}>
                              <strong>{new Date(venda.dataVenda || venda.createdAt).toLocaleDateString('pt-BR')} · R$ {Number(venda.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                              <small>{Array.isArray(venda.itens) && venda.itens.length > 0 ? venda.itens.map((item, itemIndex) => `${item.produto?.nomeProduto || item.produto?.nome || `Produto ${itemIndex + 1}`} x${Number(item.quantidade) || 0}`).join(', ') : 'Pedido sem itens cadastrados'}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default ClienteHistorico
