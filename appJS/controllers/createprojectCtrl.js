'use strict';
backMe.controller('createprojectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', function(_scope, _services, _timeout, _state){

	console.log('createprojectCtrl', _scope.loggedIn);
	if(!_scope.loggedIn) {
		_state.go('home')
	}

}]);