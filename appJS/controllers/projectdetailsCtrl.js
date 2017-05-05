'use strict';
backMe.controller('projectdetailsCtrl', ['$scope', 'BaseServices', '$timeout', '$state', function(_scope, _services, _timeout, _state){
	_scope.step = 2;
	_scope.stepsTitle = "Enter Project Details:";
	_scope.projectId = _state.params.projectId;
	console.log('projectdetailsCtrl', _scope.projectId);
}]);