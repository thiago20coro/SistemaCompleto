import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api.js'


function PainelVendas() {
  const [produtos, setProdutos] = useState([])
  const [vendas, setVendas] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [nomeCliente, setNomeCliente] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function carregarDados() {
    const [produtosResposta, vendasResposta] = await Promise.all([
      axios.get(`${API_URL}/produtos`),
      axios.get(`${API_URL}/vendas`)
    ])
    setProdutos(produtosResposta.data)
    setVendas(vendasResposta.data)
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
      await axios.post(`${API_URL}/vendas`, {
        nomeCliente: nomeCliente.trim(),
        itens: carrinho.map(item => ({ produto: item.produto, quantidade: item.quantidade })),
        status: 'faturado'
      })
      setMensagem('Venda registrada. O estoque foi atualizado automaticamente.')
      setNomeCliente('')
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
            Cliente
            <input value={nomeCliente} onChange={event => setNomeCliente(event.target.value)} placeholder='Nome do cliente' required />
          </label>
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
