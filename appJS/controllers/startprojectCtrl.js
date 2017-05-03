'use strict';
backMe.controller('startprojectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', function(_scope, _services, _timeout, _state, _appConstant){
	console.log('startprojectCtrl');
	if(!_scope.loggedIn) {
		_state.go('home')
	}
}]);