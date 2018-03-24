var expect  = require('chai').expect;
var stock = require("../stockexchange.js");
var resetdb = require("../reset.js");



// Disable the logs for test
stock.saveLog(false);

after(function(){
	resetdb();
	stock.close();
});

// test baseTargeting
it('should fail Base Targeting', function(done) {
	stock.getBid("EU", "Agriculture", 10)
	.then(function(){
		// if promise resolves, test has failed
		expect(1).to.equal(2);
		done();
	})
	.catch(function(err){
		expect(err.message).to.equal("No Companies Passed from Targeting");
		done();
	});
	
});

// test BudgetCheck
it('should pass Budget Check', function(done) {
	stock.getBid("US", "Finance", 10)
	.then(function( result ){
		expect(result).to.equal("C2");
		done();
	})
	.catch(function(err){
		// if promise is rejected, test has failed
		expect(1).to.equal(2);
		done();
	});
	
});


// test BaseBid
it('should Fail BaseBid Check', function(done) {
	stock.getBid("US", "Finance", 40)
	.then(function( result ){
		// if promise resolves, test has failed
		expect(1).to.equal(2);
		done();
	})
	.catch(function(err){
		expect( err.message ).to.equal("No Companies Passed from BaseBid check");
		done();
	});
	
});


