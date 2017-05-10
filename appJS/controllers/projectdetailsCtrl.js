'use strict';
backMe.controller('projectdetailsCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function (_scope, _services, _timeout, _state, _http, _appConstant) {
	_scope.step = 2;
	_scope.stepsTitle = "Enter Project Details:";
	_scope.projectId = _state.params.projectId;

	_scope.posterImg = null;
	_scope.startRewards = function () {
		_scope.data = _scope.project;
		console.log(_scope.project);
		//_scope.data.posterImg = _scope.posterImg ? _scope.posterImg : {};
		_scope.data.projectImages = _scope.projectImages;
		console.log(_scope.projectImages);
		//return;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show(data.data);
			_state.go('create.rewards', {'projectId': _scope.projectId});
		}, function (err) {
			console.log(err);
			_services.toast.show(err.data);
		});
	}

	_scope.addSpendMoney = function (_spendmoney) {
		_spendmoney.push({
			projectId: _scope.projectId,
			userId: _scope.userId,
			amount: '',
			description: ''
		});
	}

}]);
