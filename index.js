var stockexchange = require('./stockexchange.js');
const express = require('express')
const app = express()
const http = require('http');

app.get('/:company/:department/:bid', (req, res) => {
	stockexchange.getBid(req.params.company, req.params.department, req.params.bid).then(function(companyID){
		res.send(companyID);
	})
	.catch(function(err){
		res.send(err.message);
	});
})

const server = http.createServer(app);
server.on('close', function(){
	stockexchange.close();
});
port = process.env.PORT || 3000;
server.listen(port, function(){ console.log("Server listening on port " + port);  });
