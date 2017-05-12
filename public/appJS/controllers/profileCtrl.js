'use strict';
backMe.controller('profileCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function(_scope, _services, _timeout, _state, _http, _appConstant){
	_scope.step = 4;
	_scope.stepsTitle = "Enter Profile & Account Details:";
	_scope.projectId = _state.params.projectId;
	_scope.userImg = null;
	
	_scope.startPreview = function() {
		if(_scope.project.posterImg || _scope.project.projectImages) {
			delete _scope.project.posterImg;
		  	delete _scope.project.projectImages;
		}		
		_scope.data = _scope.project;
		if(!_scope.userImg && !_scope.project.userPhoto) {
			_services.toast.show('Please upload the user photo.');
			return;
		}
		_scope.data.userImg = _scope.userImg ? _scope.userImg : {};
		
		if(!_scope.project.name || !_scope.project.email || !_scope.project.mobileNumer) {
			_services.toast.show('User Name/Email/Mobile Number/Photo should not be blank.');
			return;
		}
		if(!_scope.project.accountName || !_scope.project.accountNo || !_scope.project.ifscCode) {
			_services.toast.show('User Account Name/Account No/IFSC Code should not be blank.');
			return;
		}
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show(data.data);
			_state.go('create.preview', {'projectId': _scope.projectId});
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
}]);