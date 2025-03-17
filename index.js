const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const {Sequelize} = require('sequelize');
const port = 3000;
const configSQL = require('./config/database.js')
const sequelize = new Sequelize(configSQL.local.db, configSQL.local.user, configSQL.local.pass, {
  host: configSQL.local.host,
  dialect: configSQL.local.dialect
})

//========== [SEQUELIZE] ==========
  sequelize.authenticate()
    .then(() => {
      console.log('MySQL conectado com sucesso!');})

    .catch((erro) => {
      console.error('Erro ao conectar MySQL:', erro)});
//========== [SEQUELIZE] ==========

//========== [EXPRESS-HANDLEBARS] ==========
  app.engine('handlebars', handlebars.engine(
    {
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views/layouts')
    })
  );

  app.set('view engine', 'handlebars');
  app.set('views', 'views/pages');
  app.use(bodyParser.urlencoded({ extended: true }));
//========== [EXPRESS-HANDLEBARS] ==========

//========== [GET ROUTES] ==========
  app.get('/', (req, res) => {
    res.render('init');
  });

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/register', (req, res) => {
    res.render('register');
  });
//========== [GET ROUTES] ==========

//========== [POST ROUTES] ==========
  app.post('/register', (req, res) => {
    const user = req.body.cusuario, pass = req.body.csenha;

    console.log(`User ${user}`);

    if(pass != 'teste'){
      res.send('Senha incorreta');
    }
    else{
      res.send('Logado com sucesso');
    }
  });
//========== [POST ROUTES] ==========

//========== [INIT SERVER] ==========
  app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);  
  });
//========== [INIT SERVER] ==========