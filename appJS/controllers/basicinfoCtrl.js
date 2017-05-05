'use strict';
backMe.controller('basicinfoCtrl', ['$scope', 'BaseServices', '$timeout', 'Upload', 'appConstant', '$state', function(_scope, _services, _timeout, _http, _appConstant, _state){
	_scope.step = 1;
	_scope.stepsTitle = "Enter Basic Project Information:";
	_scope.posterImg = null;
	_scope.projectId = _state.params.projectId;
	_scope.startProjectDetails = function() {
		_scope.data = _scope.project;
		_scope.data.posterImg = _scope.posterImg ? _scope.posterImg : {};
		_scope.method = 'POST'; //update project
		if(_scope.projectId == 'new')
			_scope.method = 'PUT'; //create project
		_http.upload({
			method: _scope.method,
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function(data) {
			if(_scope.method == 'POST') {
				_services.toast.show(data.data);
			} else {
				_scope.projectId = data.insertId;
				_services.toast.show('Project saved successfully.');
			}
			_state.go('create.projectdetails', { 'projectId': _scope.projectId});
		}, function(err) {
			console.log(err);
		});
	}
}]);
