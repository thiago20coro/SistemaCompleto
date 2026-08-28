import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'


// mongodb+srv://:@cluster0.9meaxhq.mongodb.net/Usuarios?appName=Cluster0
const app = express()
app.use(express.json()) // avisando que vou usar JSON (JSON é o padrao da internet formato de dados) 
app.use(cors()) //liberando o cors

mongoose.connect('mongodb+srv://@cluster0.9meaxhq.mongodb.net/Usuarios?appName=Cluster0')
.then(() => console.log("conectado ao banco de dados Mongo") )
.catch((error) => console.log(error))

//schema

const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    idade: {type: Number, required: true},
    endereco: {type: String, required: true},
    cep: {type: String, required: true},
    celular: {type: String, required: true},
    cpf: {type: String, required: true, unique: true}
    
}, {timestamps: true} )

const produtoSchema = new mongoose.Schema({
    nomeProduto: { type: String, required: true},
    categoria: {type: String, required: true},
    tamanho: {type: String, required: true},
    cores: {type: String, required: true},
    detalhes: {type: String, required: true},
    preco: {type: Number, required: true},
    quantidadeEstoque: {type: Number, required: true}


}, {timestamps: true} )

const fornecedorSchema = new mongoose.Schema({
    razaoSocial: { type: String, required: true},
    nomeFantasia: {type: String, required: true},
    cnpj: {type: String, required: true, unique: true},
    endereco: {type: String, required: true},
    telefone: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    inscriçãoEstadual: {type: String, required: true, unique: true},
    segmento: {type: String, required: true},
    prazoPagamento: {type: String, required: true},
    prazoEntrega: {type: String, required: true},

}, {timestamps: true} )

// id no banco de dados e automatico

const Usuario = mongoose.model('Usuario', usuarioSchema)
const Produto = mongoose.model('Produto', produtoSchema)
const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema)

//rota retorna produtos
app.get('/produtos', async (request, response) => {

    const produtosDoBanco = await Produto.find()
    response.json(produtosDoBanco)


})

app.post('/produtos', async (request, response) => {

    const produtoCriado = await Produto.create(request.body)
    response.json(produtoCriado)
    })
// DELETAR PRODUTO POR ID (Nova rota adicionada)
// Usamos o ':id' na URL para receber o ID do produto que o Front-end quer deletar
app.delete('/produtos/:id', async (request, response) => {
    try {
        const idProduto = request.params.id // Pega o ID vindo da URL

        // Busca no MongoDB e deleta o produto
        const produtoDeletado = await Produto.findByIdAndDelete(idProduto)

        // Se o id não existir no banco de dados, avisa o front-end
        if (!produtoDeletado) {
            return response.status(404).json({ mensagem: "Produto não encontrado" })
        }

        // Se der tudo certo, responde com sucesso e os dados do produto removido
        response.json({ mensagem: "Produto deletado com sucesso!", produtoDeletado })
        
    } catch (erro) {
        // Se o ID for inválido ou o banco falhar, cai aqui
        console.error("Erro ao deletar produto:", erro)
        response.status(500).json({ mensagem: "Erro interno no servidor ao tentar deletar" })
    }
})

// EDITAR PRODUTO POR ID (Nova rota adicionada)
// Usamos o ':id' na URL para saber QUEM editar, e o 'request.body' para saber O QUE mudar
app.put('/produtos/:_id', async (request, response) => {
    try {
        const idProduto = request.params._id // Pega o ID vindo da URL
        const dadosAtualizados = request.body // Pega os novos dados (NomeProduto, descrição, etc.) enviados pelo formulário

        // Busca no MongoDB, atualiza e nos retorna o produto já atualizado
        // O { new: true } serve para o Mongoose retornar o produto DEPOIS da alteração
        const produtoAtualizado = await Produto.findByIdAndUpdate(
            idProduto, 
            dadosAtualizados, 
            { new: true, runValidators: true } 
        )

        // Se o id não existir no banco de dados, avisa o front-end
        if (!produtoAtualizado) {
            return response.status(404).json({ mensagem: "Produto não encontrado" })
        }

        // Se der tudo certo, responde com sucesso e envia os dados novos
        response.json({ mensagem: "Produto atualizado com sucesso!", produtoAtualizado })
        
    } catch (erro) {
        // Se o ID for inválido, se faltar campo obrigatório ou se o banco falhar, cai aqui
        console.error("Erro ao editar produto:", erro)
        response.status(500).json({ mensagem: "Erro interno no servidor ao tentar editar" })
    }
})






// essa rota retorna usuarios
app.get('/usuarios', async (request, response) => {
    
    // respondendo ao front end com os usuarios
   const usuariosDoBanco = await Usuario.find()
   
    response.json(usuariosDoBanco)


})

//criar usuarios 
//promise (promessa) / quanto tempo o banco demora pra responder ???
// async / await 

app.post('/usuarios', async (request,response)=>{

    const usuarioCriado = await  Usuario.create(request.body)
    // push é um metodo de array que adiciona o item ao array

    response.json(usuarioCriado)


})

// DELETAR USUÁRIO POR ID (Nova rota adicionada)
// Usamos o ':id' na URL para receber o ID do usuário que o Front-end quer deletar
app.delete('/usuarios/:_id', async (request, response) => {
    try {
        const idUsuario = request.params._id // Pega o ID vindo da URL

        // Busca no MongoDB e deleta o usuário
        const usuarioDeletado = await Usuario.findByIdAndDelete(idUsuario)

        // Se o id não existir no banco de dados, avisa o front-end
        if (!usuarioDeletado) {
            return response.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        // Se der tudo certo, responde com sucesso e os dados do usuário removido
        response.json({ mensagem: "Usuário deletado com sucesso!", usuarioDeletado })
        
    } catch (erro) {
        // Se o ID for inválido ou o banco falhar, cai aqui
        console.error("Erro ao deletar usuário:", erro)
        response.status(500).json({ mensagem: "Erro interno no servidor ao tentar deletar" })
    }
})


// EDITAR USUÁRIO POR ID (Nova rota adicionada)
// Usamos o ':id' na URL para saber QUEM editar, e o 'request.body' para saber O QUE mudar
app.put('/usuarios/:_id', async (request, response) => {
    try {
        const idUsuario = request.params._id // Pega o ID vindo da URL
        const dadosAtualizados = request.body // Pega os novos dados (nome, email, etc.) enviados pelo formulário

        // Busca no MongoDB, atualiza e nos retorna o usuário já atualizado
        // O { new: true } serve para o Mongoose retornar o usuário DEPOIS da alteração
        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            idUsuario, 
            dadosAtualizados, 
            { new: true, runValidators: true } 
        )

        // Se o id não existir no banco de dados, avisa o front-end
        if (!usuarioAtualizado) {
            return response.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        // Se der tudo certo, responde com sucesso e envia os dados novos
        response.json({ mensagem: "Usuário atualizado com sucesso!", usuarioAtualizado })
        
    } catch (erro) {
        // Se o ID for inválido, se faltar campo obrigatório ou se o banco falhar, cai aqui
        console.error("Erro ao editar usuário:", erro)
        response.status(500).json({ mensagem: "Erro interno no servidor ao tentar editar" })
    }
})


app.get('/fornecedores', async (request, response) => {
    const fornecedoresDoBanco = await Fornecedor.find()
    response.json(fornecedoresDoBanco)
})

app.post('/fornecedores', async (request, response) => {
    const fornecedorCriado = await Fornecedor.create(request.body)
    response.json(fornecedorCriado)
})
app.delete('/fornecedores/:_id', async (request, response) => {
    try {
        const idFornecedor = request.params._id // Pega o ID vindo da URL
        const fornecedorDeletado = await Fornecedor.findByIdAndDelete(idFornecedor)

        if (!fornecedorDeletado) {
            return response.status(404).json({ mensagem: "Fornecedor não encontrado" })
        }

        response.json({ mensagem: "Fornecedor deletado com sucesso!", fornecedorDeletado })
    } catch (erro) {
        console.error("Erro ao deletar fornecedor:", erro)
        response.status(500).json({ mensagem: "Erro interno no servidor ao tentar deletar" })
    }
})
app.put('/fornecedores/:_id', async (request, response) => { 
    Fornecedor.findByIdAndUpdate(request.params._id, request.body, { new: true, runValidators: true })
        .then(fornecedorAtualizado => {
            if (!fornecedorAtualizado) {
                return response.status(404).json({ mensagem: "Fornecedor não encontrado" })
            }
            response.json({ mensagem: "Fornecedor atualizado com sucesso!", fornecedorAtualizado })
        })
        .catch(erro => {
            console.error("Erro ao atualizar fornecedor:", erro)
            response.status(500).json({ mensagem: "Erro interno no servidor ao tentar atualizar" })
        })
})

//request (requisicao) front
//response(backend ) 
// JSON (JavaScript object Notatation) - notacao de objetos javascript
//JSON- formato de dados





app.listen(3000, () => {
    console.log("Servidor Rodando Na porta 3000")
})


//localhost:3000/usuarios