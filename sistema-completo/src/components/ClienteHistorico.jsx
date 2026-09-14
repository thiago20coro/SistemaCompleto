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
      return texto.includes(termo)
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

      <div style={{ display: 'grid', gap: '18px' }}>
        {clientesFiltrados.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <article key={cliente._id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#111827' }}>{cliente.nome}</h2>
                  <p style={{ margin: '0 0 4px 0', color: '#475569' }}>{cliente.email}</p>
                  <p style={{ margin: 0, color: '#475569' }}>{cliente.celular || 'Celular não informado'}</p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '170px' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total gasto</div>
                  <strong style={{ display: 'block', fontSize: '26px', color: '#15803d', marginTop: '6px' }}>
                    R$ {Number(cliente.totalGasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                  <small style={{ color: '#64748b' }}>{cliente.quantidadeCompras || 0} compras</small>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#111827' }}>Histórico de compras</h3>

                {cliente.historico.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748b' }}>Nenhuma compra registrada para este cliente.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {cliente.historico.map((venda, index) => (
                      <div key={`${cliente._id}-${venda._id || index}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                            {new Date(venda.dataVenda || venda.createdAt).toLocaleDateString('pt-BR')}
                          </strong>
                          <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700' }}>
                            R$ {Number(venda.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                          {Array.isArray(venda.itens) && venda.itens.length > 0 ? (
                            venda.itens.map((item, itemIndex) => {
                              const nomeProduto = item.produto?.nomeProduto || item.produto?.nome || `Produto ${itemIndex + 1}`
                              const quantidade = Number(item.quantidade) || 0
                              return (
                                <div key={`${venda._id || index}-${itemIndex}`}>
                                  • {nomeProduto} x{quantidade}
                                </div>
                              )
                            })
                          ) : (
                            <div>• Pedido sem itens cadastrados</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default ClienteHistorico
