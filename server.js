
const express = require('express');
const bodyParser = require('body-parser');
const sha1 = require('js-sha1');
let jwt = require('jsonwebtoken');
let config = require('./config');
let middleware = require('./middleware');

function criptografaString(stringParam){
  var getBytes = function (string) {
    var utf8 = unescape(encodeURIComponent(string));
    var arr = [];
    
    for (var i = 0; i < utf8.length; i++) {
        arr.push(utf8.charCodeAt(i));
    }
    return arr;
  }

  let stringByte = getBytes(stringParam); 
  let stringSHA1 = sha1(stringByte,'binary');
  var base64String = Buffer.from(stringSHA1, 'hex').toString('base64')
  return base64String;
}

class HandlerGenerator {
  login (req,res){
    let emailFromBody    = req.body.email;
    let passwordFromBody = req.body.password;
    let passwordFromBodySHA1 = criptografaString(passwordFromBody);

    let sql = require("mssql");
    let configDB = {
      user: 'vinicius',
      password: 'Gabi0312',
      server: '10.128.75.18', 
      database: 'PORTAL' 
    };
  
    sql.connect(configDB, err => {
      if(err) console.log('Ocorreu um erro na conexão com SQL. Erro: ' + err);

      if(emailFromBody && passwordFromBody){
        let sqlObjUsrReq = new sql.Request();
        sqlObjUsrReq.query('select top 1 * from TB_GER_Usuario where nom_Email = \'' + emailFromBody + '\'', (err,recordset) =>{
          if(err) console.log(err);    
          var passwordFromDb = recordset.recordset[0].nom_Senha;
  
          if(passwordFromBodySHA1 === passwordFromDb){
            let token = jwt.sign({emailFromBody: emailFromBody},
              config.secret,
              { expiresIn: '24h' // expires in 24 hours
              }
            );
            res.json({success: true, message: 'Autenticado!', token: token});
          }else{
            res.status(403).json({success: false, message: 'Usuário ou senha incorreto!'});
          };
        });
      }else{
        res.status(400).json({
          success: false,
          message: 'Autenticação falhou. Verifique se os dados foram informados'
        });
      }
    });
  }
  index (req, res) {
    res.json({
      success: true,
      message: 'Index page'
    });
  }
}

// Starting point of the server
function main () {
  let app = express(); // Export app for other routes to use
  let handlers = new HandlerGenerator();
  const port = process.env.PORT || 8000;
  app.use(bodyParser.urlencoded({ // Middleware
    extended: true
  }));
  app.use(bodyParser.json());
  // Routes & Handlers
  app.post('/login', handlers.login);
  app.get('/', middleware.checkToken, handlers.index);
  app.listen(port, () => console.log(`Server is listening on port: ${port}`));
}

main();