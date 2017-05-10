'use strict';
backMe.controller('previewCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function(_scope, _services, _timeout, _state, _http, _appConstant){
	_scope.step = 5;
	_scope.stepsTitle = "Your Project Preview";
	_scope.projectId = _state.params.projectId;
	
	_scope.submitProject = function() {
		_scope.project.status = 'ACTIVE';
		_scope.data = _scope.project;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show('Project created successfully.');
			_state.go('home');
		}, function (err) {
			_services.toast.show(data.data);
			console.log(err);
		});
	}
	
}]);