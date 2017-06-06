'use strict';
backMe.controller('checkoutCtrl', ['$scope', 'BaseServices', '$timeout', '$state', '$sce', 'appConstant', function(_scope, _services, _timeout, _state, _sce, _appConstant){

	_scope.projectId = _state.params.projectId;

	_scope.ccAvenue = {
		merchant_id: '86540',
		access_code: 'AVKE63CL31CH33EKHC',
		working_key: '0B66015989C8CD68B53219345F8C8484'
	};
	
	_scope.checkout = {
		projectId: _scope.projectId,
		userId: '',
		TXN_AMOUNT: '1',
		firstName: '',
		lastName: '',
		email: '',
		mobileNumber: ''
	};
    _scope.checkout.TXN_AMOUNT = _state.params.amount;
    
	_scope.project = {};

	_scope.init = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projects/' + _scope.projectId
		}, function(data){
			_scope.project = data;
			if(_scope.project.length == 0) {
				_state.go('home');
			} else {
				_scope.checkout.userId = _scope.project.userId;
			}
		}, function(err) {
			console.log(err)
		});
	}
	_scope.init();
	
	_scope.makeCCAvenuePayment = function() {
		//Paytm Integration
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'pay-paytm',
			inputData: _scope.checkout
		}, function(data){
			_scope.checkoutFrm = _sce.trustAsHtml(data);
		}, function(err) {
			console.log(err)
		});
	}

}]);