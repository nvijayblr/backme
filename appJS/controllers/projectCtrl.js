'use strict';
backMe.controller('projectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', function(_scope, _services, _timeout, _state){

	console.log('projectCtrl');
	/*if(!_scope.loggedIn) {
		_state.go('home')
	}*/
	_scope.showSupportMe = true;
	
	_scope.supportMe = function() {
		_scope.showSupportMe = false;
	}

	_scope.supportMeContinue = function() {
		_state.go('checkout');
	}

}]);