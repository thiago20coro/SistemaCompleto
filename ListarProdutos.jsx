import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/produtos';

export default function ListarProdutos() {
    const [idEdicao, setIdEdicao] = useState('');
    const [nomeProduto, setNomeProduto] = useState('');
    const [categoria, setCategoria] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [cores, setCores] = useState('');
    const [detalhes, setDetalhes] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
    const [produtos, setProdutos] = useState([]);
    
    // NOVO: Estado para armazenar o termo de pesquisa
    const [pesquisa, setPesquisa] = useState('');

    useEffect(() => {
        buscarProdutos();
    }, []);

    async function buscarProdutos() {
        try {
            const resposta = await axios.get(API_URL);
            setProdutos(resposta.data);
        } catch (erro) {
            console.error('Erro ao buscar produtos:', erro);
        }
    }

    function iniciarEdicao(produto) {
        setIdEdicao(produto._id);
        setNomeProduto(produto.nome || produto.nomeProduto || '');
        setCategoria(produto.categoria || '');
        setTamanho(produto.tamanho || '');
        setCores(produto.cores || '');
        setDetalhes(produto.detalhes || '');
        setPreco(produto.preco || '');
        setQuantidadeEstoque(produto.quantidadeEstoque || '');
    }

    function cancelarEdicao() {
        setIdEdicao('');
        limparCampos();
    }

    function limparCampos() {
        setNomeProduto('');
        setCategoria('');
        setTamanho('');
        setCores('');
        setDetalhes('');
        setPreco('');
        setQuantidadeEstoque('');
    }

    async function salvarAlteracoes(event) {
        event.preventDefault();

        const precoNumerico = preco ? Number(preco) : 0;

        if (!nomeProduto.trim()) {
            alert('Preencha o nome do produto!');
            return;
        }

        if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
            alert('O preço deve ser um número válido maior que zero!');
            return;
        }

        const dadosProduto = {
            nome: nomeProduto.trim(),
            nomeProduto: nomeProduto.trim(),
            categoria: categoria.trim(),
            tamanho: tamanho.trim(),
            cores: cores.trim(),
            detalhes: detalhes ? detalhes.trim() : '',
            preco: precoNumerico,
            quantidadeEstoque: Number(quantidadeEstoque) || 0
        };

        try {
            await axios.put(`${API_URL}/${idEdicao}`, dadosProduto);
            alert('Produto atualizado com sucesso!');
            setIdEdicao('');
            limparCampos();
            buscarProdutos();
        } catch (erro) {
            console.error('Erro ao atualizar:', erro);
            alert('Erro ao atualizar produto.');
        }
    }

    async function deletarProduto(idProduto) {
        if (!idProduto) return;

        if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            try {
                await axios.delete(`${API_URL}/${idProduto}`);
                alert('Produto deletado com sucesso!');
                if (idEdicao === idProduto) {
                    cancelarEdicao();
                }
                buscarProdutos();
            } catch (erro) {
                console.error('Erro ao deletar:', erro);
                alert('Erro ao deletar o produto.');
            }
        }
    }

    // NOVO: Filtra os produtos em tempo real (ignora maiúsculas/minúsculas)
    const produtosFiltrados = produtos.filter((produto) => {
        const termo = pesquisa.toLowerCase();
        const nome = (produto.nome || produto.nomeProduto || '').toLowerCase();
        const cat = (produto.categoria || '').toLowerCase();
        
        return nome.includes(termo) || cat.includes(termo);
    })
return (
    <div className="container-form" style={{ padding: '20px', maxWidth: '650px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📦 Produtos em Estoque</h2>
        
        {/* NOVO: Campo de pesquisa em tempo real */}
        <div style={{ marginBottom: '20px' }}>
            <input
                type="text"
                placeholder="🔍 Pesquisar por nome ou categoria..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    outline: 'none'
                }}
            />
        </div>
        
        {/* Alterado para verificar produtosFiltrados */}
        {produtosFiltrados.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
                {produtos.length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto corresponde à sua pesquisa.'}
            </p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {/* Alterado de produtos.map para produtosFiltrados.map */}
                {produtosFiltrados.map((produto) => (
                    <li key={produto._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginBottom: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        
                        {idEdicao === produto._id ? (
                            // Renderiza os Inputs de alteração somente para o item ativo
                            <form onSubmit={salvarAlteracoes}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'orange' }}>Editando Produto</h3>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Nome *
                                    <input type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Categoria
                                    <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Tamanho
                                    <input type="text" value={tamanho} onChange={(e) => setTamanho(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Cores
                                    <input type="text" value={cores} onChange={(e) => setCores(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Detalhes
                                    <input type="text" value={detalhes} onChange={(e) => setDetalhes(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}> Preço *
                                    <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}> Estoque
                                    <input type="number" value={quantidadeEstoque} onChange={(e) => setQuantidadeEstoque(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </label>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button type='submit' style={{ flex: 1, padding: '10px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar</button>
                                    <button type='button' onClick={cancelarEdicao} style={{ padding: '10px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                                </div>
                            </form>
                        ) : (
                            // Renderiza a exibição normal mostrando TODOS os detalhes do produto
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#222' }}>{produto.nome || produto.nomeProduto}</h4>
                                    
                                    {/* Exibição formatada de todas as propriedades do produto */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                        {produto.categoria && <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#555' }}>🏷️ {produto.categoria}</span>}
                                        {produto.tamanho && <span style={{ background: '#e8f0fe', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#1a73e8' }}>📏 Tam: {produto.tamanho}</span>}
                                        {produto.cores && <span style={{ background: '#e6f4ea', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#137333' }}>🎨 Cores: {produto.cores}</span>}
                                        <span style={{ background: '#fef7e0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#b06000', fontWeight: 'bold' }}>📦 Estoque: {produto.quantidadeEstoque}</span>
                                    </div>

                                    {produto.detalhes && (
                                        <p style={{ margin: '8px 0', fontSize: '14px', color: '#555', backgroundColor: '#fafafa', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #ccc' }}>
                                            <strong>Detalhes:</strong> {produto.detalhes}
                                        </p>
                                    )}

                                    <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                                        R$ {Number(produto.preco).toFixed(2)}
                                    </p>
                                </div>

                                {/* Botões com espaçamento melhorado usando Flexbox e Gap */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                                    <button onClick={() => iniciarEdicao(produto)} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>Alterar</button>
                                    <button onClick={() => deletarProduto(produto._id)} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>Deletar</button>
                                </div>
                            </div>
                        )}

                    </li>
                ))}
            </ul>
        )}
    </div>
);

}
