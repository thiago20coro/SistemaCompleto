import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import crypto from 'node:crypto'
import { supabase } from '../config/supabase.js'
const app = express()
app.use(express.json()) // avisando que vou usar JSON (JSON é o padrao da internet formato de dados) 
app.use(cors())

const isProduction = process.env.NODE_ENV === 'production'
const mongoUri = process.env.MONGODB_URI
const tokenSecret = process.env.AUTH_SECRET || (isProduction ? '' : 'CHAVE-LOCAL-DE-DESENVOLVIMENTO-NAO-USAR-EM-PRODUCAO')
const normalizeOrigin = origin => origin.trim().replace(/\/$/, '')
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173' || 'https://sistema-completo-3n9u.vercel.app/')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
const isProjectVercelOrigin = origin => {
    try {
        const url = new URL(origin)
        return url.protocol === 'https:'
            && /^sistema-completo(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(url.hostname)
    } catch {
        return false
    }
}
const isLocalOrigin = origin => {
    if (isProduction || !origin) return false
    try {
        const url = new URL(origin)
        return ['localhost', '127.0.0.1'].includes(url.hostname)
    } catch {
        return false
    }
}

if (!mongoUri) throw new Error('MONGODB_URI precisa ser configurada até a migração dos modelos para o Supabase.')
if (!tokenSecret) throw new Error('AUTH_SECRET precisa ser configurada em produção.')

if (supabase) console.log('Cliente Supabase configurado.')

let conexaoMongo = null

async function conectarMongo() {
    if (mongoose.connection.readyState === 1) return
    if (!conexaoMongo) conexaoMongo = mongoose.connect(mongoUri)
    await conexaoMongo
}

app.use(async (request, response, next) => {
    try {
        await conectarMongo()
        next()
    } catch (erro) {
        conexaoMongo = null
        console.error('Não foi possível conectar ao MongoDB:', erro.message)
        response.status(503).json({ mensagem: 'Banco de dados indisponível.' })
    }
})

app.use(cors({
    origin: (origin, callback) => {
        const normalizedOrigin = origin ? normalizeOrigin(origin) : ''
        if (!origin || allowedOrigins.includes(normalizedOrigin) || isProjectVercelOrigin(normalizedOrigin) || isLocalOrigin(normalizedOrigin)) {
            return callback(null, true)
        }
        return callback(new Error('Origem não autorizada pelo CORS.'))
    }
}))

//schema

const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    idade: {type: Number, required: true},
    endereco: {type: String, required: true},
    cep: {type: String, required: true},
    celular: {type: String, required: true},
    cpf: {type: String, required: true, unique: true},
    passwordHash: { type: String, required: true, select: false },
    perfil: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    acesso: { type: String, enum: ['pendente', 'aprovado', 'bloqueado'], default: 'pendente' }
    
}, {timestamps: true} )

const produtoSchema = new mongoose.Schema({
    nomeProduto: { type: String, required: true},
    categoria: {type: String, required: true},
    tamanho: {type: String, required: true},
    cores: {type: String, required: true},
    detalhes: {type: String, required: true},
    preco: {type: Number, required: true},
    quantidadeEstoque: {type: Number, required: true, min: 0},
    ncm: { type: String, default: '' },
    cfop: { type: String, default: '' },
    unidadeMedida: { type: String, default: 'UN' },
    estoqueMinimo: { type: Number, default: 0, min: 0 },
    validade: { type: Date, default: null }


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



const emailAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    senhaHash: { type: String, required: true, select: false }
}, {timestamps: true} )

const depositoSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, unique: true, trim: true },
    endereco: { type: String, default: '' },
    ativo: { type: Boolean, default: true }
}, { timestamps: true })

const movimentoEstoqueSchema = new mongoose.Schema({
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    deposito: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposito', required: true },
    tipo: { type: String, enum: ['entrada', 'saida', 'ajuste'], required: true },
    quantidade: { type: Number, required: true, min: 0.01 },
    motivo: { type: String, default: '' },
    documento: { type: String, default: '' },
    data: { type: Date, default: Date.now }
}, { timestamps: true })

const pedidoCompraSchema = new mongoose.Schema({
    fornecedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor', required: true },
    itens: [{ produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }, quantidade: Number, valorUnitario: Number }],
    status: { type: String, enum: ['solicitado', 'aprovado', 'recebido', 'cancelado'], default: 'solicitado' },
    observacoes: { type: String, default: '' },
    total: { type: Number, default: 0, min: 0 },
    dataPrevisao: { type: Date, default: null }
}, { timestamps: true })

const pedidoVendaSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    nomeCliente: { type: String, required: true, trim: true },
    itens: [{ produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }, quantidade: Number, valorUnitario: Number }],
    status: { type: String, enum: ['orcamento', 'aberto', 'faturado', 'cancelado'], default: 'aberto' },
    total: { type: Number, default: 0, min: 0 },
    comissao: { type: Number, default: 0, min: 0 },
    dataVenda: { type: Date, default: Date.now }
}, { timestamps: true })

const contaSchema = new mongoose.Schema({
    descricao: { type: String, required: true, trim: true },
    pessoa: { type: String, default: '' },
    valor: { type: Number, required: true, min: 0 },
    vencimento: { type: Date, required: true },
    pagamento: { type: Date, default: null },
    status: { type: String, enum: ['pendente', 'paga', 'cancelada'], default: 'pendente' },
    categoria: { type: String, default: 'geral' },
    observacoes: { type: String, default: '' }
}, { timestamps: true })

const configuracaoFiscalSchema = new mongoose.Schema({
    empresa: { type: String, required: true },
    cnpj: { type: String, required: true },
    regimeTributario: { type: String, default: '' },
    aliquotas: { icms: { type: Number, default: 0 }, pis: { type: Number, default: 0 }, cofins: { type: Number, default: 0 } },
    serieNfe: { type: String, default: '1' },
    ambiente: { type: String, enum: ['homologacao', 'producao'], default: 'homologacao' }
}, { timestamps: true })

const documentoFiscalSchema = new mongoose.Schema({
    tipo: { type: String, enum: ['nfe', 'nfce', 'boleto'], required: true },
    numero: { type: String, required: true },
    chaveAcesso: { type: String, default: '' },
    destinatario: { type: String, required: true },
    valor: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['rascunho', 'emitida', 'cancelada'], default: 'rascunho' },
    dataEmissao: { type: Date, default: Date.now }
}, { timestamps: true })

const colaboradorSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    cpf: { type: String, required: true, unique: true },
    cargo: { type: String, required: true },
    departamento: { type: String, default: '' },
    salario: { type: Number, required: true, min: 0 },
    admissao: { type: Date, required: true },
    beneficios: [{ type: String }],
    ativo: { type: Boolean, default: true }
}, { timestamps: true })

const folhaPagamentoSchema = new mongoose.Schema({
    colaborador: { type: mongoose.Schema.Types.ObjectId, ref: 'Colaborador', required: true },
    competencia: { type: String, required: true },
    salarioBruto: { type: Number, required: true, min: 0 },
    descontos: { type: Number, default: 0, min: 0 },
    liquido: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['aberta', 'processada', 'paga'], default: 'aberta' }
}, { timestamps: true })

const registroPontoSchema = new mongoose.Schema({
    colaborador: { type: mongoose.Schema.Types.ObjectId, ref: 'Colaborador', required: true },
    data: { type: Date, required: true },
    entrada: { type: String, required: true },
    saida: { type: String, default: '' },
    observacoes: { type: String, default: '' }
}, { timestamps: true })

// id no banco de dados e automatico

const Usuario = mongoose.model('Usuario', usuarioSchema)
const Produto = mongoose.model('Produto', produtoSchema)
const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema)
const EmailAdmin = mongoose.model('EmailAdmin', emailAdminSchema)
const Deposito = mongoose.model('Deposito', depositoSchema)
const MovimentoEstoque = mongoose.model('MovimentoEstoque', movimentoEstoqueSchema)
const PedidoCompra = mongoose.model('PedidoCompra', pedidoCompraSchema)
const PedidoVenda = mongoose.model('PedidoVenda', pedidoVendaSchema)
const ContaPagar = mongoose.model('ContaPagar', contaSchema)
const ContaReceber = mongoose.model('ContaReceber', contaSchema)
const ConfiguracaoFiscal = mongoose.model('ConfiguracaoFiscal', configuracaoFiscalSchema)
const DocumentoFiscal = mongoose.model('DocumentoFiscal', documentoFiscalSchema)
const Colaborador = mongoose.model('Colaborador', colaboradorSchema)
const FolhaPagamento = mongoose.model('FolhaPagamento', folhaPagamentoSchema)
const RegistroPonto = mongoose.model('RegistroPonto', registroPontoSchema)

function criarHashSenha(senha) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex')
        crypto.scrypt(senha, salt, 64, (erro, derivada) => {
            if (erro) return reject(erro)
            resolve(`${salt}:${derivada.toString('hex')}`)
        })
    })
}

function verificarSenha(senha, hashArmazenado) {
    return new Promise((resolve, reject) => {
        const [salt, hash] = hashArmazenado.split(':')
        if (!salt || !hash) return resolve(false)
        crypto.scrypt(senha, salt, 64, (erro, derivada) => {
            if (erro) return reject(erro)
            const hashRecebido = Buffer.from(hash, 'hex')
            if (hashRecebido.length !== derivada.length) return resolve(false)
            resolve(crypto.timingSafeEqual(hashRecebido, derivada))
        })
    })
}

function criarToken(usuarioId, email, perfil) {
    const payload = Buffer.from(JSON.stringify({
        usuarioId,
        email,
        perfil,
        expiraEm: Date.now() + 7 * 24 * 60 * 60 * 1000
    })).toString('base64url')
    const assinatura = crypto
        .createHmac('sha256', tokenSecret)
        .update(payload)
        .digest('base64url')
    return `${payload}.${assinatura}`
}

async function exigirAutenticacao(request, response, next) {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const [payloadCodificado, assinaturaRecebida] = token?.split('.') || []
    if (!payloadCodificado || !assinaturaRecebida) {
        return response.status(401).json({ mensagem: 'Faça login para continuar.' })
    }

    const assinaturaEsperada = crypto
        .createHmac('sha256', tokenSecret)
        .update(payloadCodificado)
        .digest('base64url')
    const assinaturaValida = assinaturaRecebida.length === assinaturaEsperada.length
        && crypto.timingSafeEqual(Buffer.from(assinaturaRecebida), Buffer.from(assinaturaEsperada))

    let dadosToken
    try {
        dadosToken = JSON.parse(Buffer.from(payloadCodificado, 'base64url').toString())
    } catch {
        dadosToken = null
    }

    const tokenValido = assinaturaValida
        && dadosToken?.usuarioId
        && Number(dadosToken.expiraEm) > Date.now()
    if (!tokenValido) return response.status(401).json({ mensagem: 'Faça login para continuar.' })

    request.usuarioId = dadosToken.usuarioId
    request.usuarioEmail = dadosToken.email
    request.perfil = dadosToken.perfil
    next()
}

async function exigirAdministrador(request, response, next) {
    const usuario = await Usuario.findById(request.usuarioId)
    const email = usuario?.email || request.usuarioEmail
    const emailAdmin = email ? await EmailAdmin.findOne({ email }) : null
    if (!emailAdmin && (!usuario || usuario.perfil !== 'admin')) {
        return response.status(403).json({ mensagem: 'Apenas administradores podem realizar esta ação.' })
    }
    request.usuarioAtual = usuario || emailAdmin
    next()
}

app.post('/auth/login', async (request, response) => {
    try {
        const email = String(request.body.email || '').trim().toLowerCase()
        const senha = String(request.body.senha || '')
        if (!email || !senha) return response.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' })

        const administrador = await EmailAdmin.findOne({ email }).select('+senhaHash')
        const usuario = await Usuario.findOne({ email }).select('+passwordHash')
        const senhaAdminValida = administrador
            ? await verificarSenha(senha, administrador.senhaHash)
            : false
        const senhaUsuarioValida = usuario
            ? await verificarSenha(senha, usuario.passwordHash)
            : false

        const loginAdminValido = administrador && senhaAdminValida
        const loginUsuarioValido = usuario && usuario.acesso === 'aprovado' && senhaUsuarioValida
        if (!loginAdminValido && !loginUsuarioValido) {
            if (usuario && usuario.acesso === 'pendente') {
                return response.status(403).json({ mensagem: 'Seu acesso ainda aguarda aprovação de um administrador.' })
            }
            if (usuario && usuario.acesso === 'bloqueado') {
                return response.status(403).json({ mensagem: 'Seu acesso foi bloqueado por um administrador.' })
            }
            return response.status(401).json({ mensagem: 'E-mail ou senha inválidos.' })
        }

        response.json({
            token: criarToken(
                (usuario?._id || administrador._id).toString(),
                usuario?.email || administrador.email,
                loginAdminValido ? 'admin' : usuario.perfil
            ),
            usuario: {
                id: usuario?._id || administrador._id,
                nome: usuario?.nome || administrador.email,
                email: usuario?.email || administrador.email,
                perfil: loginAdminValido ? 'admin' : usuario.perfil
            }
        })
    } catch (erro) {
        console.error('Erro ao fazer login:', erro)
        response.status(500).json({ mensagem: 'Erro interno ao fazer login.' })
    }
})

app.post('/auth/logout', exigirAutenticacao, (request, response) => {
    response.json({ mensagem: 'Logout realizado com sucesso.' })
})

app.get('/auth/me', exigirAutenticacao, async (request, response) => {
    const usuario = await Usuario.findById(request.usuarioId)
    if (usuario) {
        const emailAdmin = await EmailAdmin.exists({ email: usuario.email })
        return response.json({ id: usuario._id, nome: usuario.nome, email: usuario.email, perfil: emailAdmin ? 'admin' : usuario.perfil })
    }

    const administrador = await EmailAdmin.findById(request.usuarioId)
    if (!administrador) return response.status(401).json({ mensagem: 'Usuário não encontrado.' })
    response.json({ id: administrador._id, nome: administrador.email, email: administrador.email, perfil: 'admin' })
})

app.use((request, response, next) => {
    if (request.path === '/auth/login') return next()
    if (request.path === '/produtos' && request.method === 'GET') return next()
    if (request.path === '/usuarios' && request.method === 'POST') {
        return Usuario.countDocuments().then(total => {
            if (total === 0) return next()
            exigirAutenticacao(request, response, () => exigirAdministrador(request, response, next))
        }).catch(next)
    }
    exigirAutenticacao(request, response, next)
})

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
    const { senha, passwordHash, ...dadosUsuario } = request.body
    if (!senha || senha.length < 6) {
        return response.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' })
    }
    const totalUsuarios = await Usuario.countDocuments()
    const usuarioCriado = await Usuario.create({
        ...dadosUsuario,
        email: String(dadosUsuario.email || '').trim().toLowerCase(),
        passwordHash: await criarHashSenha(senha),
        perfil: totalUsuarios === 0 ? 'admin' : 'usuario',
        acesso: totalUsuarios === 0 ? 'aprovado' : 'pendente'
    })

    // push é um metodo de array que adiciona o item ao array

    response.json({ ...usuarioCriado.toObject(), passwordHash: undefined })


})

app.post('/administradores', exigirAdministrador, async (request, response) => {
    try {
        const nome = String(request.body.nome || '').trim()
        const email = String(request.body.email || '').trim().toLowerCase()
        const senha = String(request.body.senha || '')
        if (!nome || !email || senha.length < 6) {
            return response.status(400).json({ mensagem: 'Nome, e-mail e senha com pelo menos 6 caracteres são obrigatórios.' })
        }
        if (await Usuario.exists({ email }) || await EmailAdmin.exists({ email })) {
            return response.status(409).json({ mensagem: 'Já existe um usuário com este e-mail.' })
        }

        const usuarioCriado = await Usuario.create({
            nome,
            email,
            idade: 0,
            endereco: 'Não informado',
            cep: 'Não informado',
            celular: 'Não informado',
            cpf: `ADMIN-${crypto.randomUUID()}`,
            passwordHash: await criarHashSenha(senha),
            perfil: 'admin',
            acesso: 'aprovado'
        })
        await EmailAdmin.create({ email, senhaHash: await criarHashSenha(senha) })
        response.status(201).json({
            mensagem: 'Administrador criado com sucesso.',
            administrador: { id: usuarioCriado._id, nome, email, perfil: 'admin' }
        })
    } catch (erro) {
        console.error('Erro ao criar administrador:', erro)
        response.status(500).json({ mensagem: 'Erro interno ao criar administrador.' })
    }
})

app.put('/usuarios/:_id/acesso', exigirAdministrador, async (request, response) => {
    const acessosValidos = ['pendente', 'aprovado', 'bloqueado']
    const acesso = request.body.acesso
    if (!acessosValidos.includes(acesso)) {
        return response.status(400).json({ mensagem: 'Status de acesso inválido.' })
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
        request.params._id,
        { acesso },
        { new: true, runValidators: true }
    )
    if (!usuarioAtualizado) return response.status(404).json({ mensagem: 'Usuário não encontrado.' })
    response.json({ mensagem: `Usuário ${acesso}.`, usuarioAtualizado })
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

async function registrarVenda(request, response) {
    const itensSolicitados = Array.isArray(request.body.itens) ? request.body.itens : []
    const nomeCliente = String(request.body.nomeCliente || '').trim()
    if (!nomeCliente || itensSolicitados.length === 0) {
        return response.status(400).json({ mensagem: 'Informe o cliente e pelo menos um produto.' })
    }

    const itens = []
    const produtosAtualizados = []
    try {
        for (const item of itensSolicitados) {
            const quantidade = Number(item.quantidade)
            if (!item.produto || !Number.isInteger(quantidade) || quantidade <= 0) {
                return response.status(400).json({ mensagem: 'Cada item deve ter produto e quantidade inteira positiva.' })
            }

            const produto = await Produto.findOneAndUpdate(
                { _id: item.produto, quantidadeEstoque: { $gte: quantidade } },
                { $inc: { quantidadeEstoque: -quantidade } },
                { new: true, runValidators: true }
            )
            if (!produto) {
                for (const produtoAnterior of produtosAtualizados) {
                    await Produto.findByIdAndUpdate(produtoAnterior.id, { $inc: { quantidadeEstoque: produtoAnterior.quantidade } })
                }
                return response.status(409).json({ mensagem: `Estoque insuficiente ou produto inválido: ${item.produto}.` })
            }

            produtosAtualizados.push({ id: produto._id, quantidade })
            itens.push({ produto: produto._id, quantidade, valorUnitario: produto.preco })
        }

        const total = itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0)
        const venda = await PedidoVenda.create({
            cliente: request.body.cliente || null,
            nomeCliente,
            itens,
            status: request.body.status || 'faturado',
            total,
            comissao: Number(request.body.comissao) || 0,
            dataVenda: request.body.dataVenda || new Date()
        })
        response.status(201).json({ mensagem: 'Venda registrada e estoque atualizado.', venda })
    } catch (erro) {
        for (const produtoAnterior of produtosAtualizados) {
            await Produto.findByIdAndUpdate(produtoAnterior.id, { $inc: { quantidadeEstoque: produtoAnterior.quantidade } })
        }
        console.error('Erro ao registrar venda:', erro)
        response.status(400).json({ mensagem: 'Não foi possível registrar a venda.', detalhes: erro.message })
    }
}

function registrarCrud(caminho, Modelo, opcoes = {}) {
    app.get(caminho, async (request, response) => {
        try {
            const consulta = Modelo.find().sort({ createdAt: -1 })
            if (opcoes.populate) consulta.populate(opcoes.populate)
            response.json(await consulta)
        } catch (erro) {
            console.error(`Erro ao listar ${caminho}:`, erro)
            response.status(500).json({ mensagem: 'Erro interno ao listar registros.' })
        }
    })

    app.post(caminho, async (request, response) => {
        if (opcoes.post) return opcoes.post(request, response)
        try {
            const registro = await Modelo.create(request.body)
            response.status(201).json(registro)
        } catch (erro) {
            console.error(`Erro ao criar ${caminho}:`, erro)
            response.status(400).json({ mensagem: 'Dados inválidos.', detalhes: erro.message })
        }
    })

    app.put(`${caminho}/:_id`, async (request, response) => {
        try {
            const registro = await Modelo.findByIdAndUpdate(request.params._id, request.body, { new: true, runValidators: true })
            if (!registro) return response.status(404).json({ mensagem: 'Registro não encontrado.' })
            response.json(registro)
        } catch (erro) {
            console.error(`Erro ao atualizar ${caminho}:`, erro)
            response.status(400).json({ mensagem: 'Dados inválidos.', detalhes: erro.message })
        }
    })

    app.delete(`${caminho}/:_id`, async (request, response) => {
        try {
            const registro = await Modelo.findByIdAndDelete(request.params._id)
            if (!registro) return response.status(404).json({ mensagem: 'Registro não encontrado.' })
            response.json({ mensagem: 'Registro removido com sucesso.', registro })
        } catch (erro) {
            console.error(`Erro ao remover ${caminho}:`, erro)
            response.status(400).json({ mensagem: 'Identificador inválido.' })
        }
    })
}

registrarCrud('/depositos', Deposito)
registrarCrud('/compras', PedidoCompra, { populate: 'fornecedor' })
registrarCrud('/vendas', PedidoVenda, { populate: ['cliente', 'itens.produto'], post: registrarVenda })
registrarCrud('/contas-pagar', ContaPagar)
registrarCrud('/contas-receber', ContaReceber)
registrarCrud('/fiscal/configuracoes', ConfiguracaoFiscal)
registrarCrud('/fiscal/documentos', DocumentoFiscal)
registrarCrud('/colaboradores', Colaborador)
registrarCrud('/folha-pagamento', FolhaPagamento, { populate: 'colaborador' })
registrarCrud('/ponto', RegistroPonto, { populate: 'colaborador' })

app.get('/estoque/movimentos', async (request, response) => {
    try {
        const movimentos = await MovimentoEstoque.find().populate('produto deposito').sort({ data: -1 })
        response.json(movimentos)
    } catch (erro) {
        console.error('Erro ao listar movimentos de estoque:', erro)
        response.status(500).json({ mensagem: 'Erro interno ao listar movimentos.' })
    }
})

app.post('/estoque/movimentos', async (request, response) => {
    const { produto: produtoId, deposito: depositoId, tipo, quantidade, motivo, documento, data } = request.body
    if (!['entrada', 'saida', 'ajuste'].includes(tipo) || !Number.isFinite(Number(quantidade)) || Number(quantidade) <= 0) {
        return response.status(400).json({ mensagem: 'Tipo e quantidade válida são obrigatórios.' })
    }

    try {
        const produto = await Produto.findById(produtoId)
        if (!produto) return response.status(404).json({ mensagem: 'Produto não encontrado.' })
        if (!await Deposito.exists({ _id: depositoId, ativo: true })) {
            return response.status(404).json({ mensagem: 'Depósito não encontrado ou inativo.' })
        }

        const valor = Number(quantidade)
        const variacao = tipo === 'entrada' ? valor : tipo === 'saida' ? -valor : 0
        if (tipo === 'saida' && produto.quantidadeEstoque < valor) {
            return response.status(409).json({ mensagem: 'Estoque insuficiente para esta saída.' })
        }
        if (tipo === 'ajuste' && valor < 0) {
            return response.status(400).json({ mensagem: 'Ajuste deve informar um saldo positivo.' })
        }

        if (tipo === 'ajuste') produto.quantidadeEstoque = valor
        else produto.quantidadeEstoque += variacao
        await produto.save()

        const movimento = await MovimentoEstoque.create({ produto: produtoId, deposito: depositoId, tipo, quantidade: valor, motivo, documento, data })
        response.status(201).json({ movimento, produto })
    } catch (erro) {
        console.error('Erro ao registrar movimento de estoque:', erro)
        response.status(400).json({ mensagem: 'Não foi possível registrar o movimento.', detalhes: erro.message })
    }
})

app.get('/estoque/saldos', async (request, response) => {
    try {
        const saldos = await MovimentoEstoque.aggregate([
            { $group: {
                _id: { deposito: '$deposito', produto: '$produto' },
                entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$quantidade', 0] } },
                saidas: { $sum: { $cond: [{ $eq: ['$tipo', 'saida'] }, '$quantidade', 0] } },
                ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$quantidade', 0] } }
            } },
            { $lookup: { from: 'produtos', localField: '_id.produto', foreignField: '_id', as: 'produto' } },
            { $lookup: { from: 'depositos', localField: '_id.deposito', foreignField: '_id', as: 'deposito' } },
            { $unwind: '$produto' },
            { $unwind: '$deposito' },
            { $project: {
                _id: 0,
                produto: { _id: '$produto._id', nome: '$produto.nomeProduto' },
                deposito: { _id: '$deposito._id', nome: '$deposito.nome', codigo: '$deposito.codigo' },
                saldo: { $add: [{ $subtract: ['$entradas', '$saidas'] }, '$ajustes'] }
            } },
            { $sort: { 'deposito.nome': 1, 'produto.nome': 1 } }
        ])
        response.json(saldos)
    } catch (erro) {
        console.error('Erro ao consultar saldos por depósito:', erro)
        response.status(500).json({ mensagem: 'Erro interno ao consultar saldos.' })
    }
})

app.post('/compras/:_id/receber', async (request, response) => {
    try {
        const pedido = await PedidoCompra.findByIdAndUpdate(
            request.params._id,
            { status: 'recebido' },
            { new: true, runValidators: true }
        )
        if (!pedido) return response.status(404).json({ mensagem: 'Pedido de compra não encontrado.' })
        response.json({ mensagem: 'Pedido marcado como recebido.', pedido })
    } catch (erro) {
        console.error('Erro ao receber pedido de compra:', erro)
        response.status(400).json({ mensagem: 'Identificador inválido.' })
    }
})

app.get('/relatorios/resumo', async (request, response) => {
    try {
        const [produtos, fornecedores, colaboradores, contasPagar, contasReceber, vendas] = await Promise.all([
            Produto.find().select('quantidadeEstoque estoqueMinimo preco'),
            Fornecedor.countDocuments(),
            Colaborador.countDocuments({ ativo: true }),
            ContaPagar.find({ status: 'pendente' }).select('valor'),
            ContaReceber.find({ status: 'pendente' }).select('valor'),
            PedidoVenda.find({ status: { $ne: 'cancelado' } }).select('total')
        ])
        response.json({
            produtos: produtos.length,
            estoque: produtos.reduce((total, produto) => total + produto.quantidadeEstoque, 0),
            estoqueBaixo: produtos.filter(produto => produto.quantidadeEstoque <= produto.estoqueMinimo).length,
            fornecedores,
            colaboradores,
            contasPagar: contasPagar.reduce((total, conta) => total + conta.valor, 0),
            contasReceber: contasReceber.reduce((total, conta) => total + conta.valor, 0),
            vendas: vendas.reduce((total, venda) => total + venda.total, 0)
        })
    } catch (erro) {
        console.error('Erro ao gerar resumo gerencial:', erro)
        response.status(500).json({ mensagem: 'Erro interno ao gerar relatório.' })
    }
})

//request (requisicao) front
//response(backend ) 
// JSON (JavaScript object Notatation) - notacao de objetos javascript
//JSON- formato de dados





const port = Number(process.env.PORT) || 3000

async function iniciarServidor() {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Servidor aceitando conexões em http://0.0.0.0:${port}`)
    })

    try {
        await conectarMongo()
        console.log('Conectado ao banco de dados MongoDB.')
    } catch (error) {
        console.error('Não foi possível conectar ao MongoDB:', error.message)
    }
}

if (!process.env.VERCEL && !process.env.NETLIFY) iniciarServidor()

export default app


//localhost:3000/usuarios
