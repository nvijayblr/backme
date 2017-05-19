'use strict';
backMe.controller('checkoutCtrl', ['$scope', 'BaseServices', '$timeout', '$state', '$sce', function(_scope, _services, _timeout, _state, _sce){

	console.log('checkoutCtrl', _scope.loggedIn);
	_scope.ccAvenue = {
		merchant_id: '86540',
		access_code: 'AVKE63CL31CH33EKHC',
		working_key: '0B66015989C8CD68B53219345F8C8484'
	};
	_scope.makeCCAvenuePayment = function() {
		console.log('_scope.makeCCAvenuePayment');
		/*_services.http.serve({
			method: 'GET',
			url: 'http://localhost:3001/make-payment'
		}, function(data){
			console.log(data);
			_scope.myText = _sce.trustAsHtml(data);

		}, function(err) {
			console.log(err)
		});*/
		
		_services.http.serve({
			method: 'POST',
			url: 'http://localhost:3001/generate_checksum',
			inputData: {
				"REQUEST_TYPE": "SEAMLESS",
				"MID": "Huroof23707312295888",
				"ORDER_ID": '7',
				"CUST_ID": "1",
				"TXN_AMOUNT": "1",
				"CHANNEL_ID": "WEB",
				"INDUSTRY_TYPE_ID": "Retail",
				"WEBSITE": "WEB_STAGING",
				"PAYMENT_DETAILS": "",
				"AUTH_MODE": "3D",
				"PAYMENT_TYPE_ID": "CC",
				"CHECKSUMHASH": "",
				"CALLBACK_URL": "http://localhost:3001/#/home",
				"MOBILE_NO": "9591191405",
				"EMAIL": "nvijay.ooty@gmail.com"
			}
		}, function(data){
			console.log(data);
			_services.http.serve({
				method: 'POST',
				url: 'http://localhost:3001/verify_checksum',
				inputData: data
				}, function(data){
					console.log(data);
					_scope.myText = _sce.trustAsHtml(data);
				}, function(err) {
					console.log(err)
				});
		}, function(err) {
			console.log(err)
		});
	}

}]);