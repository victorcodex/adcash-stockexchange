var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST || 'localhost',
  user     : process.env.DB_USER || 'root',
  password : process.env.DB_PASS || 'root',
  database : process.env.DB || 'stockexchange'
});
connection.connect();

function resetdb( ){
		
	// Run Each update operation linearly
	connection.query('UPDATE stocks SET BUDGET = 1 WHERE CompanyID = "C1"', function(err, result, fields){
		if(err){ 
			connection.end(function(){});
			console.log(err); return;
		}
		connection.query('UPDATE stocks SET BUDGET = 2 WHERE CompanyID = "C2"', function(err, result, fields){
			if(err){ 
				connection.end(function(){});
				console.log(err); return;
			}
			connection.query('UPDATE stocks SET BUDGET = 3 WHERE CompanyID = "C3"', function(err, result, fields){
				if(err){ 
					connection.end(function(){});
					console.log(err); return;
				}
				
				connection.end(function(){});
			});
		});
	});

}
module.exports = resetdb;