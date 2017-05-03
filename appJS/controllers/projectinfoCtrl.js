'use strict';
backMe.controller('projectinfoCtrl', ['$scope', 'BaseServices', '$timeout', 'Upload', 'appConstant', function(_scope, _services, _timeout, _http, _appConstant){
	_scope.step = 1;
	_scope.stepsTitle = "Enter Basic Project Information:";
	_scope.posterImg = null;

	_scope.startProjectDetails = function() {
		_scope.data = _scope.project;
		_scope.data.posterImg = _scope.posterImg ? _scope.posterImg : {};
		
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function(data) {
			console.log(data);
		}, function(err) {
			console.log(err);
		});
	}
}]);
