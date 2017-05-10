'use strict';
backMe.controller('rewardsCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function(_scope, _services, _timeout, _state, _http, _appConstant){
	_scope.step = 3;
	_scope.stepsTitle = "Rewards & Services:";
	_scope.projectId = _state.params.projectId;
	
	_scope.startProfile = function () {
		_scope.data = _scope.project;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show(data.data);
			_state.go('create.profile', {'projectId': _scope.projectId});
		}, function (err) {
			_services.toast.show(data.data);
			console.log(err);
		});
	}
	
	_scope.addSupportRewards = function(_support) {
		_support.push({
			projectId: _support.projectId,
			userId: _support.userId,
			amount: '',
			title: '',
			description: ''
		});
	}
	
	_scope.addServiceRewards = function(_service) {
		_service.push({
			projectId: _service.projectId,
			userId: _service.userId,
			amount: '',
			activityName: '',
			availableDate: '',
			description: ''
		});
	}
	
}]);