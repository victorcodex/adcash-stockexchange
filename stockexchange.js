var mysql      = require('mysql');
var fs         = require('fs');
var eol = require('os').EOL;
var connection = mysql.createConnection({
  host     : process.env.DB_HOST || 'localhost',
  user     : process.env.DB_USER || 'root',
  password : process.env.DB_PASS || 'root',
  database : process.env.DB || 'stockexchange'
});
connection.connect();


var keys = [];
var allCompanyIds = {};
var saveLogs = true;

// Load all company Ids from the DB
connection.query("SELECT * from stocks where 1", function(err, results, fields){
	for(i in results){
		allCompanyIds[ results[i].CompanyID ] = "Failed"; 
		keys[keys.length] = results[i].CompanyID;
	}
});

function log(stage, ids){
	
	// I should be able to turn off logging to run tests
	if(saveLogs === false){ return; }
	
	if(!ids){
		fs.appendFile("stockexchange_log.txt", stage + eol, (err) => {});
	}else{
		// reset status of each company
		for(i in keys){
			key = keys[i];
			allCompanyIds[ key ] = "Failed";
		}
		// Only Company Ids passed to log function should be set as passed
		for(i in ids){
			id = ids[i];
			allCompanyIds[ id ] = "Passed";
		}
		// JSON to String
		var tostrings = [];
		for(i in keys){
			key = keys[i];
			tostrings[ tostrings.length] = "{"+ key + ": " + allCompanyIds[key] + "}";
		}
		var tostring = tostrings.join(" , ");
		
		var finalLog = stage + " " + tostring;
		fs.appendFile("stockexchange_log.txt", finalLog + eol, (err) => {});
	}
}


var stockexchange = {
	saveLog: function( state ){
		saveLogs = state;
	},
	close: function(){
		connection.end(function(err){});
	},
	
	getBid: function(country, category, basebid){
		
		return new Promise(function(resolve, reject){
			var promise = baseTargeting(country, category);
			promise.then(function(companyIDs){
				ids = getIDs( companyIDs );
				return budgetCheck( ids, basebid );
			})
			.then(function(companyIDs){
				ids = getIDs( companyIDs );
				return baseBidCheck(ids, basebid);
			})
			.then(function(result){
				return shortList(result, basebid);
			})
			.then(function(data){
				return updateBudget(data.companyid, data.newBudget);
			})
			.then(function(companyID){
				resolve(companyID);
			})
			.catch(function(err){
				reject( err );
			});
		});
	}
}

function getIDs( companyIDs, arr ){
	ids = [];
	for(i in companyIDs){
		id = companyIDs[i];
		ids[ ids.length ] = id.CompanyID;
	}
	if(!arr){
		// if arr is defined, return as array
		ids = '"' + ids.join('", "') + '"';
	}
	return ids;
}

function baseTargeting( country, category ){
	country = "%" + country + "%";
	category = "%" + category + "%";
	return new Promise(function(resolve, reject){
		var query = "SELECT CompanyID from stocks where Countries LIKE "+ connection.escape(country) +" AND Category LIKE " + connection.escape(category);

		connection.query(query, 
		function(err, results, fields){
			if(err){ 
				console.log(err);
				log("Base Targeting:", []); 
				reject(new Error("No Companies Passed from Targeting"));  
			}
			else if(results.length === 0){ 
				log("Base Targeting:", []);
				reject(new Error("No Companies Passed from Targeting")); 
			}
			else{
				log( "Base Targeting:", getIDs( results, true ));
				resolve(results);
			}
		});
	});
}

function budgetCheck( companyIDs, basebid ){
	return new Promise(function(resolve, reject){
		basebidInDollar = basebid / 100;
		connection.query('SELECT CompanyID from stocks where CompanyID IN (' + companyIDs + ') AND Budget > ' + basebidInDollar, function(err, results, fields){
			if(err){
				log("BudgetCheck:", []);
				reject(new Error("No Companies Passed from Budget")); 
			}
			else if(results.length === 0){ 
				log("BudgetCheck:", []); 
				reject(new Error("No Companies Passed from Budget")); 
			}
			else{
				log("BudgetCheck:", getIDs( results, true ) );
				resolve(results);
			}
		});
	});
}

function baseBidCheck(companyIDs, baseBid){
	return new Promise(function(resolve, reject){
		connection.query('SELECT * from stocks where CompanyID IN (' + companyIDs + ') AND Bid > ' + baseBid, function(err, results, fields){
			if(err){
				log("BaseBid:", []);
				reject(new Error("No Companies Passed from BaseBid check")); 
			}
			else if(results.length === 0){ 
				log("BaseBid:", []);
				reject(new Error("No Companies Passed from BaseBid check")); 
			}
			else{
				log("BaseBid:", getIDs( results, true ));
				resolve(results);
			}
		});
	});
}

function shortList(result, basebid){
	return new Promise(function(resolve, reject){
		var cp = null;
		if(result.length === 1){
			cp = result[0];
			log("Winner = " + result[0].CompanyID);
			// resolve after computing the new budget for selected company
			//resolve(result[0].CompanyID);
		}else{
			high_bid = 0;
			cid = "";
			for(i in result){
				company = result[i];
				if(company.Bid > high_bid){
					cid = company.CompanyID;
					high_bid = company.Bid;
					cp = result[i];
				}
			}
			log("Winner = " + cid);
			//resolve( cid );
		}
		
		var budget = cp.Budget; // in $
		var bid = cp.Bid; // cents
		var bidInDollars = bid / 100;
		var newBudget = budget - bidInDollars;
		
		resolve({companyid: cp.CompanyID, newBudget: newBudget});
		
		
	});
}

function updateBudget(companyId, newBudget){
	return new Promise(function(resolve, reject){
		connection.query("UPDATE stocks set Budget = " + newBudget + "WHERE companyID = '" + companyId + "'",
		function(err, result, fields){
			if(err){ reject(new Error("Error Updating Bid in the Database")); }
			else{
				resolve(companyId);
			}
		});
	});
}


module.exports = stockexchange;