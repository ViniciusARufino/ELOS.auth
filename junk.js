testSqlConnection (req,res){  
  let sql = require("mssql");
  let configDB = {
    user: 'vinicius',
    password: 'Gabi0312',
    server: '10.128.75.18', 
    database: 'PORTAL' 
  };

  sql.connect(configDB,err => {
    if (err) console.log('DEU ERRO!!!!'+ err);


    var sqlObjReq = new sql.Request();
    sqlObjReq.query('select top 10 * from TB_GER_Usuario', (err,recordset) => {
      if (err) console.log(err);
      res.send(recordset);
    });
  });
}