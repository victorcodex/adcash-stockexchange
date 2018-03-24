var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST || 'localhost',
  user     : process.env.DB_USER || 'root',
  password : process.env.DB_PASS || 'root',
  database : process.env.DB || 'stockexchange'
});

connection.connect();

connection.query("CREATE TABLE IF NOT EXISTS stocks (CompanyID VARCHAR(2), Countries VARCHAR(30), Budget FLOAT(6,2), Bid INTEGER(11), Category VARCHAR(100))", function(err, result, fields){
	if(err){ 
		console.log("error creating table"); 
		console.log(err);
		return;
	}
	console.log("Table stocks created. Populating ...");
	
	connection.query('INSERT INTO stocks values ("C1", "US, FR", 1, 10, "Automobile, Finance"), ("C2", "IN, US", 2, 30, "Finance, IT"), ("C3", "US, RU", 3, 5, "IT, Automobile")', function(err, result, fields){
		if(err){ 
			console.log("error populating stocks table"); 
			console.log(err);
			return;
		}
		console.log("Table stocks successfully populated");
		console.log("Setup Complete");
		
		connection.end(function(err) {
		  // The connection is terminated now
		});
	});
});