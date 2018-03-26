var stockexchange = require('./stockexchange.js');
const express = require('express')
const app = express()
const http = require('http');

app.get('/:company/:department/:bid', (req, res) => {
	if(req.params.company == "" || req.params.department == "" || req.params.bid == ""){
		res.send("Empty parameter set. Provide Company, Department and Bid");
		return;
	}
	if(Number.isNaN( Number.parseInt(req.params.bid) )){
		res.send('Error. Bid set is not a number');
		return;
	}
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
