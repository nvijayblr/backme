'use strict';
backMe.controller('basicinfoCtrl', ['$scope', 'BaseServices', '$timeout', 'Upload', 'appConstant', '$state', function(_scope, _services, _timeout, _http, _appConstant, _state){
	_scope.step = 1;
	_scope.stepsTitle = "Enter Basic Project Information:";
	_scope.posterImg = null;
	_scope.projectId = _state.params.projectId;
  
	_scope.startProjectDetails = function() {
		console.log(_appConstant.currentUser);
		
		if(!_scope.loggedIn && !_appConstant.currentUser.userId) {
			_scope.showLogin();
			return;
		}
		
		
		if(!_scope.project.userId) {
		  _scope.project.userId = _appConstant.currentUser.userId;
		}
		_scope.data = _scope.project;
		_scope.data.posterImg = _scope.posterImg ? _scope.posterImg : {};
		_scope.method = 'POST'; //update project
		if(_scope.projectId == 'new')
		  _scope.method = 'PUT'; //create project
		if(!_scope.project.location || !_scope.project.category || !_scope.project.description || !_scope.project.about || !_scope.project.title) {
		_services.toast.show('Project Title/Location/Category/About should not be blank.');
		return;
		}
		_scope.addRewardsSpendFields(_scope.projectId);
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
			  _scope.project.coverImage = data.data.coverImage;
			  _services.toast.show('Project saved in draft successfully.');
			  _scope.posterImg = undefined;
		  }
		  _state.go('create.projectdetails', { 'projectId': _scope.projectId});
		}, function(err) {
		  console.log(err);
		  _services.toast.show(err.data);
		}, function(evt) {

		});
	}
	
}]);
