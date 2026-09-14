import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'


function PainelVendas() {
  const [produtos, setProdutos] = useState([])
  const [vendas, setVendas] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [nomeCliente, setNomeCliente] = useState('')
  const [cpfCliente, setCpfCliente] = useState('')
  const [enderecoCliente, setEnderecoCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [idadeCliente, setIdadeCliente] = useState(18)
  const [mostrarCadastroCliente, setMostrarCadastroCliente] = useState(false)
  const [carrinho, setCarrinho] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function carregarDados() {
    const [produtosResposta, vendasResposta] = await Promise.all([
      axios.get(`${API_URL}/produtos`),
      axios.get(`${API_URL}/vendas`)
    ])
    setProdutos(Array.isArray(produtosResposta.data) ? produtosResposta.data : [])
    setVendas(Array.isArray(vendasResposta.data) ? vendasResposta.data : [])
  }

  useEffect(() => {
    carregarDados().catch(() => setMensagem('Não foi possível carregar produtos e vendas.'))
  }, [])

  const produtoAtual = produtos.find(produto => produto._id === produtoSelecionado)
  const totalCarrinho = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade * item.valorUnitario, 0),
    [carrinho]
  )

  function adicionarAoCarrinho(event) {
    event.preventDefault()
    const quantidadeInformada = Number(quantidade)
    if (!produtoAtual || !Number.isInteger(quantidadeInformada) || quantidadeInformada <= 0) {
      setMensagem('Selecione um produto e informe uma quantidade válida.')
      return
    }

    const itemExistente = carrinho.find(item => item.produto === produtoAtual._id)
    const novaQuantidade = (itemExistente?.quantidade || 0) + quantidadeInformada
    if (novaQuantidade > produtoAtual.quantidadeEstoque) {
      setMensagem('A quantidade solicitada é maior que o estoque disponível.')
      return
    }

    setCarrinho(itens => itemExistente
      ? itens.map(item => item.produto === produtoAtual._id ? { ...item, quantidade: novaQuantidade } : item)
      : [...itens, {
        produto: produtoAtual._id,
        nome: produtoAtual.nome || produtoAtual.nomeProduto,
        quantidade: quantidadeInformada,
        valorUnitario: Number(produtoAtual.preco)
      }]
    )
    setProdutoSelecionado('')
    setQuantidade(1)
    setMensagem('Produto adicionado à venda.')
  }

  function removerDoCarrinho(idProduto) {
    setCarrinho(itens => itens.filter(item => item.produto !== idProduto))
  }

  async function finalizarVenda(event) {
    event.preventDefault()
    if (!nomeCliente.trim() || carrinho.length === 0) {
      setMensagem('Informe o cliente e adicione pelo menos um produto.')
      return
    }

    setCarregando(true)
    setMensagem('')
    try {
      const clientesResposta = await axios.get(`${API_URL}/usuarios`)
      const clientesCadastrados = Array.isArray(clientesResposta.data) ? clientesResposta.data : []
      const cpfNormalizado = String(cpfCliente || '').replace(/\D/g, '')
      const nomeNormalizado = nomeCliente.trim().toLowerCase()

      let clienteEncontrado = clientesCadastrados.find(cliente => {
        const cpfClienteCadastrado = String(cliente.cpf || '').replace(/\D/g, '')
        const nomeClienteCadastrado = String(cliente.nome || '').trim().toLowerCase()
        return (cpfNormalizado && cpfClienteCadastrado === cpfNormalizado) || nomeClienteCadastrado === nomeNormalizado
      })

      let clienteId = clienteEncontrado?._id || null
      let nomeClienteFinal = nomeCliente.trim()

      if (!clienteEncontrado) {
        const camposObrigatorios = (!cpfCliente.trim() || !enderecoCliente.trim() || !telefoneCliente.trim())

        if (camposObrigatorios) {
          setMostrarCadastroCliente(true)
          setMensagem('Cliente não encontrado. Complete os dados abaixo para cadastrar o cliente antes da venda.')
          setCarregando(false)
          return
        }

        const nomeParaEmail = nomeClienteFinal.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'cliente'
        const emailParaCadastro = (emailCliente || `${nomeParaEmail}@cliente.local`).trim()

        const respostaCadastro = await axios.post(`${API_URL}/usuarios`, {
          nome: nomeClienteFinal,
          email: emailParaCadastro,
          idade: Number(idadeCliente) || 18,
          endereco: enderecoCliente.trim(),
          cep: '00000-000',
          celular: telefoneCliente.trim(),
          cpf: cpfCliente.trim(),
          senha: 'Cliente@123'
        })

        clienteId = respostaCadastro.data?._id
        nomeClienteFinal = respostaCadastro.data?.nome || nomeClienteFinal
      }

      await axios.post(`${API_URL}/vendas`, {
        cliente: clienteId,
        nomeCliente: nomeClienteFinal,
        itens: carrinho.map(item => ({ produto: item.produto, quantidade: item.quantidade })),
        status: 'faturado'
      })

      setMensagem('Venda registrada. O cliente foi validado e o estoque foi atualizado automaticamente.')
      setNomeCliente('')
      setCpfCliente('')
      setEnderecoCliente('')
      setTelefoneCliente('')
      setEmailCliente('')
      setIdadeCliente(18)
      setMostrarCadastroCliente(false)
      setCarrinho([])
      await carregarDados()
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Não foi possível registrar a venda.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className='painel-vendas'>
      <header className='painel-vendas-cabecalho'>
        <div>
          <span className='dashboard-kicker'>VENDAS E FATURAMENTO</span>
          <h1>Registrar uma venda</h1>
          <p>Adicione quantos produtos o cliente quiser. O estoque só é reduzido ao confirmar a venda.</p>
        </div>
        <div className='vendas-total'>
          <span>Total da venda</span>
          <strong>R$ {totalCarrinho.toFixed(2).replace('.', ',')}</strong>
        </div>
      </header>

      {mensagem && <p className='vendas-mensagem' role='status'>{mensagem}</p>}

      <div className='vendas-layout'>
        <form className='vendas-formulario' onSubmit={finalizarVenda}>
          <label>
            Nome do cliente
            <input value={nomeCliente} onChange={event => setNomeCliente(event.target.value)} placeholder='Nome do cliente' required />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              type='button'
              onClick={() => setMostrarCadastroCliente(!mostrarCadastroCliente)}
              style={{
                background: '#e2e8f0',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {mostrarCadastroCliente ? 'Ocultar cadastro' : 'Cadastrar cliente'}
            </button>
          </div>

          {mostrarCadastroCliente && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  CPF
                  <input value={cpfCliente} onChange={event => setCpfCliente(event.target.value)} placeholder='CPF do cliente' required />
                </label>
                <label>
                  Telefone
                  <input value={telefoneCliente} onChange={event => setTelefoneCliente(event.target.value)} placeholder='Telefone do cliente' required />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <label>
                  Idade
                  <input type='number' min='18' value={idadeCliente} onChange={event => setIdadeCliente(event.target.value)} placeholder='Idade' required />
                </label>
                <label>
                  E-mail (opcional)
                  <input value={emailCliente} onChange={event => setEmailCliente(event.target.value)} type='email' placeholder='E-mail do cliente' />
                </label>
              </div>

              <label style={{ display: 'block', marginTop: '12px' }}>
                Endereço
                <input value={enderecoCliente} onChange={event => setEnderecoCliente(event.target.value)} placeholder='Endereço completo' required />
              </label>
            </div>
          )}

          <div className='vendas-adicionar'>
            <label>
              Produto
              <select value={produtoSelecionado} onChange={event => setProdutoSelecionado(event.target.value)}>
                <option value=''>Selecione um produto</option>
                {produtos.filter(produto => produto.quantidadeEstoque > 0).map(produto => (
                  <option key={produto._id} value={produto._id}>
                    {(produto.nome || produto.nomeProduto)} - estoque: {produto.quantidadeEstoque}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input type='number' min='1' value={quantidade} onChange={event => setQuantidade(event.target.value)} />
            </label>
            <button type='button' className='vendas-botao-secundario' onClick={adicionarAoCarrinho}>Adicionar</button>
          </div>

          <div className='vendas-carrinho'>
            <div className='vendas-secao-titulo'>Itens da venda <span>{carrinho.length}</span></div>
            {carrinho.length === 0 ? (
              <p className='vendas-vazio'>Nenhum produto adicionado.</p>
            ) : carrinho.map(item => (
              <div className='vendas-item' key={item.produto}>
                <div><strong>{item.nome}</strong><small>{item.quantidade} x R$ {item.valorUnitario.toFixed(2).replace('.', ',')}</small></div>
                <strong>R$ {(item.quantidade * item.valorUnitario).toFixed(2).replace('.', ',')}</strong>
                <button type='button' aria-label={`Remover ${item.nome}`} onClick={() => removerDoCarrinho(item.produto)}>Remover</button>
              </div>
            ))}
          </div>
          <button className='vendas-botao-principal' type='submit' disabled={carregando || carrinho.length === 0}>
            {carregando ? 'Registrando...' : 'Confirmar venda'}
          </button>
        </form>

        <section className='vendas-historico'>
          <div className='vendas-secao-titulo'>Últimas vendas <span>{vendas.length}</span></div>
          {vendas.length === 0 ? <p className='vendas-vazio'>Nenhuma venda registrada.</p> : vendas.slice(0, 8).map(venda => (
            <article className='venda-historico-item' key={venda._id}>
              <div>
                <strong>{venda.nomeCliente}</strong>
                <small>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(venda.dataVenda || venda.createdAt))}</small>
              </div>
              <strong>R$ {Number(venda.total).toFixed(2).replace('.', ',')}</strong>
              <small>{venda.itens?.length || 0} produto(s)</small>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}

export default PainelVendas
