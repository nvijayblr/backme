'use strict';
backMe.controller('basicinfoCtrl', ['$scope', 'BaseServices', '$timeout', 'Upload', 'appConstant', '$state', function(_scope, _services, _timeout, _http, _appConstant, _state){
	_scope.step = 1;
	_scope.stepsTitle = "Enter Basic Project Information:";
	_scope.posterImg = null;
	_scope.projectId = _state.params.projectId;
	console.log('basicinfoCtrl',_scope.project)
	_scope.startProjectDetails = function() {
		if(!_scope.project.userId) {
			_scope.project.userId = _appConstant.currentUser.userId;
		}
		_scope.data = _scope.project;
		_scope.data.posterImg = _scope.posterImg ? _scope.posterImg : {};
		_scope.method = 'POST'; //update project
		if(_scope.projectId == 'new')
			_scope.method = 'PUT'; //create project
    console.log(_scope.project);
		_http.upload({
			method: _scope.method,
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function(data) {
			console.log(data.data);
			if(_scope.method == 'POST') {
				_services.toast.show(data.data);
			} else {
				_scope.projectId = data.data.insertId;
				_scope.project.projectId = _scope.projectId;
				_services.toast.show('Project saved in draft successfully.');
			}
			_scope.addRewardsSpendFields(_scope.projectId);
			_state.go('create.projectdetails', { 'projectId': _scope.projectId});
		}, function(err) {
			console.log(err);
			_services.toast.show(err.data);
		});
	}
	
	_scope.addRewardsSpendFields = function(_projectId) {
		if(!_scope.project.supportrewards) {
			_scope.project.supportrewards = [];
			_scope.project.supportrewards.push({
				amount: '',
				title: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}
		if(!_scope.project.servicerewards) {
			_scope.project.servicerewards = [];
			_scope.project.servicerewards.push({
				amount: '',
				activityName: '',
				availableDate: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}
		if(!_scope.project.spendmoney) {
			_scope.project.spendmoney = [];
			_scope.project.spendmoney.push({
				amount: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}	
	}
}]);
