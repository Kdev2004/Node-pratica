//========== [VARIABLES] ==========
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const {sequelize, registers} = require('./src/assets/scripts/sequelize.js');
//========== [VARIABLES] ==========

//========== [SEQUELIZE] ==========
  sequelize.authenticate()
  .then(() => {
      console.log('MySQL conectado com sucesso!');
      return registers.sync({force: true});
    })
  .then(() => {
      console.log('Tabelas criadas com sucesso!');}) 

  .catch((error) => {
      console.error('Erro ao conectar MySQL:', error)});
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
  });
//========== [POST ROUTES] ==========

//========== [INIT SERVER] ==========
  app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);  
  });
//========== [INIT SERVER] ==========