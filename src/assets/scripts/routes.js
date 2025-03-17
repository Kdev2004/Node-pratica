const express = require('./express');

app.get('/', function(req, res){
    res.render('init'); 
});

app.get('/cadastro', function(req, res){
    res.render('register'); 
});

app.get('/login', function(req, res){
    res.render('login'); 
});

// Rota POST para cadastro
app.post('/fregistro', async function(req, res){
    const { nome, email, senha } = req.body;
    console.log('Dados recebidos:', req.body); // Log dos dados recebidos

    try {
        // Verifique se o email já está cadastrado
        const clienteExistente = await Clientes.findOne({ where: { email } });
        console.log('Resultado da busca por email:', clienteExistente); // Log do resultado da busca
        if (clienteExistente) {
            console.log('Email já cadastrado:', email); // Log se o email já estiver cadastrado
            return res.status(400).send('Email já cadastrado');
        }

        // Hash da senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        // Crie um novo cliente
        const novoCliente = await Clientes.create({ nome, email, senha: hashedSenha });
        console.log('Cliente cadastrado com sucesso:', novoCliente); // Log do cliente cadastrado

        // Envie um email de boas-vindas
        const mailOptions = {
            from: 'kaykvsfd@gmail.com', // Substitua pelo seu email
            to: email,
            subject: 'Bem-vindo ao Mercado Natela',
            text: `Olá ${nome},\n\nObrigado por se cadastrar no Mercado Natela!\n\nAtenciosamente,\nEquipe Mercado Natela`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.error('Erro ao enviar email:', error);
            } else {
                console.log('Email enviado:', info.response);
            }
        });

        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        res.status(500).send('Erro ao cadastrar cliente');
    }
});

// Rota POST para login
app.post('/flogin', async function(req, res){
    const { email, senha } = req.body;
    console.log('Dados recebidos:', req.body); // Log dos dados recebidos

    try {
        // Verifique se o email está cadastrado
        const clienteExistente = await Clientes.findOne({ where: { email } });
        console.log('Resultado da busca por email:', clienteExistente); // Log do resultado da busca
        if (!clienteExistente) {
            console.log('Email não cadastrado:', email); // Log se o email não estiver cadastrado
            return res.status(400).send('Email não cadastrado');
        }

        // Verifique a senha
        const senhaCorreta = await bcrypt.compare(senha, clienteExistente.senha);
        
        if (!senhaCorreta) {
            console.log('Senha incorreta para o email:', email); // Log se a senha estiver incorreta
            return res.status(400).send('Senha incorreta');
        }

        res.send('Login bem-sucedido');
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        res.status(500).send('Erro ao verificar login');
    }
});

// Servidor
app.listen(80, function(){
    console.log('Servidor iniciado em localhost');
});

module.exports = router;