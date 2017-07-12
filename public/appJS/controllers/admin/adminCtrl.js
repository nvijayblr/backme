'use strict';
backMe.controller('adminCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope){
	
	/*if(_appConstant.currentUser == '' || angular.equals(_appConstant.currentUser, {})) {
		_state.go('home');
		return false;
	}*/
	_rootScope.adminTab = 'dashboard';
	console.log('adminCtrl...');

}]);

