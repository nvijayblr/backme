'use strict';
backMe.controller('profileCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function(_scope, _services, _timeout, _state, _http, _appConstant){
	_scope.step = 4;
	_scope.stepsTitle = "Enter Profile & Account Details:";
	_scope.projectId = _state.params.projectId;
	
	_scope.startPreview = function() {
		_scope.data = _scope.project;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show(data.data);
			_state.go('create.preview', {'projectId': _scope.projectId});
		}, function (err) {
			_services.toast.show(data.data);
			console.log(err);
		});
	}
	
}]);