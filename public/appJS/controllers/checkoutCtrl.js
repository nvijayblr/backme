'use strict';
backMe.controller('checkoutCtrl', ['$scope', 'BaseServices', '$timeout', '$state', '$sce', 'appConstant', function(_scope, _services, _timeout, _state, _sce, _appConstant){

	_scope.projectId = _state.params.projectId;
	_scope.type = _state.params.type;
	
	if(_scope.type == 'HP') {
		_scope.type = 'HOME_PROMOTION';
	} else if(_scope.type == 'SP') {
		_scope.type = 'SOCIAL_PROMOTION';
	} else {
		_scope.type = 'DONATION';
	}
	
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
		mobileNumber: '',
		paythrough: 'Paytm'
	};
    _scope.checkout.TXN_AMOUNT = _state.params.amount;
    
	_scope.project = {};

	_scope.init = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projects/' + _scope.projectId
		}, function(data){
			_scope.project = data;
			console.log(_scope.project);
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
	
	_scope.makePaytmPayment = function(isValidForm) {
		if(!isValidForm) {
			angular.element('md-input-container .ng-invalid').first().focus();
			return;
		}
		if(_scope.checkout.paythrough != 'Paytm') {
			_scope.rzpPayment();
			return;
		}
		//Paytm Integration
		_scope.checkout.purpose = _scope.type;
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'pay-paytm',
			inputData: _scope.checkout
		}, function(data){
			console.log(data);
			_scope.checkoutFrm = _sce.trustAsHtml(data);
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.rzpPayment = function(e) {
		var options = {
			"key": "rzp_test_jGwG0sNdTkwJrx",
			"amount": parseInt(_scope.checkout.TXN_AMOUNT)*100,
			"name": _scope.project.name,
			"description": "Donation Description",
			"image": "/assets/images/logo.png",
			"handler": function (response){
				if(response.razorpay_payment_id) {
					_scope.registerPayment(response.razorpay_payment_id);
				}
				console.log(_scope.checkout);
			},
			"prefill": {
				"name": _scope.checkout.firstName + " " + _scope.checkout.lastname,
				"email": _scope.checkout.email,
				"contact": _scope.checkout.mobileNumber
			},
			"notes": {
				"address": "Bangalore"
			},
			"theme": {
				"color": "#F37254"
			}
		};
		var rzp1 = new Razorpay(options);
		rzp1.open();
    	//e.preventDefault();
	}

	_scope.registerPayment = function(_transactionId) {
		_scope.paymentData = {
			projectId: _scope.checkout.projectId,
			userId: _scope.checkout.userId,
			amount: _scope.checkout.TXN_AMOUNT,
			currency: 'INR',
			txnId: _transactionId,
			txnStatus: 'TXN_SUCCESS',
			payThrough: 'Razorpay',
			firstName: _scope.checkout.firstName,
			lastName: _scope.checkout.lastName,
			email: _scope.checkout.email,
			mobileNumber: _scope.checkout.mobileNumber,
			purpose: _scope.type
		};
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'registerPayment',
			inputData: _scope.paymentData
		}, function(data){
			if(data.orderId) {
				_state.go('payment', {paymentId:data.orderId});
			}
		}, function(err) {
			console.log(err)
		});
	}
}]);

