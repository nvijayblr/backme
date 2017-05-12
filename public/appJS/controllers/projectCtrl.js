'use strict';
backMe.controller('projectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', function(_scope, _services, _timeout, _state, _appConstant){

	console.log('projectCtrl');
	/*if(!_scope.loggedIn) {
		_state.go('home')
	}*/
	
	_scope.projectId = _state.params.projectId;
	_scope.project = {};
	_scope.images = [];

	_scope.init = function() {
		_scope.images = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projects/' + _scope.projectId
		}, function(data){
			_scope.project = data;
			angular.forEach(_scope.project.projectsassets, function(_obj, _index){
				_scope.images.push({
					id : _index+1,
					thumbUrl : 'uploads/'+_obj.location,
					url : 'uploads/'+_obj.location,
					extUrl : ''
				});
			});

			if(_scope.project.length == 0) {
				_state.go('home');
			}
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();

	_scope.showSupportMe = true;
	
	_scope.supportMe = function() {
		_scope.showSupportMe = false;
	}

	_scope.supportMeContinue = function() {
		_state.go('checkout');
	}

}]);