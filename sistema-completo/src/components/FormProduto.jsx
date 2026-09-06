import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api.js'

const PRODUTOS_URL = `${API_URL}/produtos`;

export default function FormProduto() {
    const [nomeProduto, setNomeProduto] = useState('');
    const [categoria, setCategoria] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [cores, setCores] = useState('');
    const [detalhes, setDetalhes] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidadeEstoque, setQuantidadeEstoque] = useState('');

    // Limpa todos os campos do formulário após o cadastro bem-sucedido
    function limparFormulario() {
        setNomeProduto('');
        setCategoria('');
        setTamanho('');
        setCores('');
        setDetalhes('');
        setPreco('');
        setQuantidadeEstoque('');
    }

    async function enviarFormulario(event) {
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
            detalhes: detalhes.trim(),
            preco: precoNumerico,
            quantidadeEstoque: Number(quantidadeEstoque) || 0
        };

        try {
            const resposta = await axios.post(PRODUTOS_URL, dadosProduto);
            console.log('Resposta do banco:', resposta.data);
            alert('Produto cadastrado com sucesso!');
            limparFormulario(); 
        } catch (erro) {
            console.error('Erro detalhado ao salvar:', erro);
            if (erro.response) {
                alert(`Erro no Servidor (${erro.response.status}): ${JSON.stringify(erro.response.data)}`);
            } else if (erro.request) {
                alert('O servidor não respondeu. Verifique se o backend está rodando.');
            } else {
                alert(`Erro na requisição: ${erro.message}`);
            }
        }
    }

    // Objetos de estilização reaproveitáveis para manter o código limpo
    const estilos = {
        container: {
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            padding: '40px 20px',
            maxWidth: '550px',
            margin: '40px auto',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
            border: '1px solid #eaeaea'
        },
        titulo: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        grupoInput: {
            display: 'block',
            marginBottom: '18px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4a4a4a'
        },
        input: {
            width: '100%',
            padding: '12px 14px',
            marginTop: '6px',
            fontSize: '15px',
            border: '1px solid #dcdcdc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            color: '#333333',
            transition: 'border-color 0.2s, background-color 0.2s',
            boxSizing: 'border-box',
            outline: 'none'
        },
        gridDuplo: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
        },
        botao: {
            width: '100%',
            padding: '14px',
            marginTop: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            transition: 'background-color 0.2s, transform 0.1s'
        }
    };

    return (
        <div className="container-form" style={estilos.container}>
            <form className='formulario' onSubmit={enviarFormulario}>
                <h2 style={estilos.titulo}>📦 Novo Produto</h2>

                <label style={estilos.grupoInput}> Nome do Produto *
                    <input type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)} placeholder='Ex. Camiseta Oversized' style={estilos.input} />
                </label>

                <label style={estilos.grupoInput}> Categoria
                    <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder='Ex. Vestuário Masculino' style={estilos.input} />
                </label>

                {/* Grid para organizar Tamanho e Cores lado a lado */}
                <div style={estilos.gridDuplo}>
                    <label style={estilos.grupoInput}> Tamanho
                        <input type="text" value={tamanho} onChange={(e) => setTamanho(e.target.value)} placeholder='Ex. P, M, G' style={estilos.input} />
                    </label>

                    <label style={estilos.grupoInput}> Cores
                        <input type="text" value={cores} onChange={(e) => setCores(e.target.value)} placeholder='Ex. Preto, Branco' style={estilos.input} />
                    </label>
                </div>

                <label style={estilos.grupoInput}> Detalhes / Descrição
                    <input type="text" value={detalhes} onChange={(e) => setDetalhes(e.target.value)} placeholder='Ex. Algodão 100% fio 30.1' style={estilos.input} />
                </label>

                {/* Grid para organizar Preço e Estoque lado a lado */}
                <div style={estilos.gridDuplo}>
                    <label style={estilos.grupoInput}> Preço (R$) *
                        <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder='0,00' style={estilos.input} />
                    </label>

                    <label style={estilos.grupoInput}> Quantidade em Estoque
                        <input type="number" value={quantidadeEstoque} onChange={(e) => setQuantidadeEstoque(e.target.value)} placeholder='0' style={estilos.input} />
                    </label>
                </div>

                <button 
                    type='submit' 
                    style={estilos.botao}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                    }}
                >
                    Cadastrar Produto
                </button>
            </form>
        </div>
    );
}
