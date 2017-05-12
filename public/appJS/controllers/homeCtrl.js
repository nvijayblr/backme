'use strict';
backMe.controller('homeCtrl', ['$scope', 'BaseServices', '$timeout', 'appConstant', function(_scope, _services, _timeout, _appConstant){
	
	//Call serach projects function in app.ctrl
	console.log('Home Ctrl...')
	_scope.searchProjects('');
	
}]);

