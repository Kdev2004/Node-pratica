const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const { sequelize, Clientes, Carrinhos } = require('./sql');
const initializeBot = require('./bot-ajuda');

const app = express();

app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '../../../views/layouts'),
    helpers: {
        toFixed: function (number, decimals) {
            return number.toFixed(decimals);
        },
        calcularTotalItem: function (preco, quantidade) {
            return preco * quantidade;
        },
        totalGeral: function (carrinho) {
            console.log("Tipo de carrinho:", typeof carrinho);
            let total = 0;
            if (Array.isArray(carrinho)) {
                carrinho.forEach(item => {
                    total += item.produtoPreco * item.quantidade;
                });
            } else {
                console.error("Erro: carrinho não é um array.");
                total = 0;
            }
            return total;
        },
        json: function (context) {
            return JSON.stringify(context);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../../../views/pages'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../../../src')));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kaykvsfd@gmail.com',
        pass: 'SUA_SENHA_DE_APLICATIVO'
    }
});

app.get('/', function(req, res) {
    res.render('init');
});

app.get('/cadastro', function(req, res) {
    res.render('register');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/sobre', function(req, res) {
    res.render('about');
});

app.get('/mn', function(req, res) {
    res.render('inside');
});

app.get('/carrinho', async function(req, res) {
    const clienteId = req.cookies.clienteId;
    console.log('Cliente ID:', clienteId);

    if (!clienteId) {
        return res.status(401).send('Usuário não autenticado');
    }

    try {
        const carrinhoSequelize = await Carrinhos.findAll({
            where: { clienteId: clienteId }
        });

        console.log('Carrinho encontrado (Sequelize):', carrinhoSequelize);

        const carrinho = carrinhoSequelize.map(item => item.dataValues);

        console.log('Carrinho encontrado (dataValues):', carrinho);

        let totalGeral = 0;
        if (Array.isArray(carrinho)) {
            carrinho.forEach(item => {
                totalGeral += item.produtoPreco * item.quantidade;
            });
        } else {
            console.error("Erro: carrinho não é um array.");
            totalGeral = 0;
        }

        res.render('cart', { carrinho: carrinho, totalGeral: totalGeral });
    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        res.status(500).send('Erro ao buscar carrinho');
    }
});

app.get('/end', function(req, res) {
    const pedido = req.query.pedido; // Obtém o pedido da URL
    res.render('end', { pedido: pedido });
});

app.post('/fregistro', async function(req, res) {
    const { usuario, senha } = req.body;

    try {
        const clienteExistente = await Clientes.findOne({ where: { usuario } });

        if (clienteExistente) {
            return res.status(400).send('Usuário já cadastrado');
        }

        const hashedSenha = await bcrypt.hash(senha, 10);
        await Clientes.create({ usuario, senha: hashedSenha });

        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);

        if (error.name === 'SequelizeValidationError') {
            const mensagensDeErro = error.errors.map(err => err.message);
            return res.status(400).send(`Erro de validação: ${mensagensDeErro.join(', ')}`);
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('Usuário já cadastrado');
        } else {
            return res.status(500).send('Erro ao cadastrar cliente');
        }
    }
});

app.post('/flogin', async function(req, res) {
    const { usuario, senha } = req.body; 

    try {
        const clienteExistente = await Clientes.findOne({ where: { usuario } });

        if (!clienteExistente) {
            return res.status(400).send('Usuário não cadastrado'); 
        }

        const senhaCorreta = await bcrypt.compare(senha, clienteExistente.senha);

        if (!senhaCorreta) {
            return res.status(400).send('Senha incorreta!');
        }

        res.cookie('clienteId', clienteExistente.id, { httpOnly: true });
        res.redirect('/mn');
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send('Erro ao fazer login'); 
    }
});

app.post('/adicionar-ao-carrinho', async function(req, res) {
    const { produtoNome, produtoPreco, quantidade } = req.body;
    const clienteId = req.cookies.clienteId;

    if (!clienteId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    try {
        const itemAdicionado = await adicionarItemAoCarrinho(clienteId, produtoNome, produtoPreco, quantidade);
        res.status(200).json(itemAdicionado);
    } catch (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        res.status(500).json({ error: 'Erro ao adicionar item ao carrinho' });
    }
});

app.post('/efetuar-pedido', async function(req, res) {
    const clienteId = req.cookies.clienteId;
    console.log("Rota /efetuar-pedido chamada. Cliente ID:", clienteId);

    if (!clienteId) {
        console.log("Usuário não autenticado.");
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    try {
        const carrinhoSequelize = await Carrinhos.findAll({
            where: { clienteId: clienteId }
        });

        console.log("Itens do carrinho:", carrinhoSequelize);

        const carrinho = carrinhoSequelize.map(item => item.dataValues);

        let pedido = 'Pedido:\n';
        carrinho.forEach(item => {
            pedido += `${item.quantidade}x ${item.produtoNome} - R$ ${item.produtoPreco.toFixed(2)}\n`;
        });

        const totalGeral = carrinho.reduce((total, item) => total + item.produtoPreco * item.quantidade, 0);
        pedido += `Total: R$ ${totalGeral.toFixed(2)}`;

        console.log("Pedido formatado:", pedido);

        // Retorna o pedido como JSON
        res.json({ pedido: pedido });
    } catch (error) {
        console.error('Erro ao efetuar pedido:', error);
        res.status(500).json({ error: 'Erro ao efetuar pedido' });
    }
});

app.get('/verificar-cadastro', async function(req, res) {
    const email = req.cookies.email;

    if (!email)
        return res.json({ cadastrado: false });

    const clienteExistente = await Clientes.findOne({ where: { email } });

    if (clienteExistente)
        res.json({ cadastrado: true });
    else
        res.json({ cadastrado: false });
});

async function adicionarItemAoCarrinho(clienteId, produtoNome, produtoPreco, quantidade = 1) {
    try {
        const cliente = await Clientes.findByPk(clienteId);
        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        const itemExistente = await Carrinhos.findOne({
            where: {
                clienteId: clienteId,
                produtoNome: produtoNome
            }
        });

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            await itemExistente.save();
            console.log('Quantidade do item atualizada no carrinho:', itemExistente);
            return itemExistente;
        } else {
            const novoItem = await Carrinhos.create({
                clienteId,
                produtoNome,
                produtoPreco,
                quantidade
            });
            console.log('Item adicionado ao carrinho:', novoItem);
            return novoItem;
        }
    } catch (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        throw error;
    }
}

initializeBot();

module.exports = app;