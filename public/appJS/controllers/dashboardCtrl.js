'use strict';
backMe.controller('dashboardCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', function(_scope, _services, _appConstant, _timeout, _state, _http){
	console.log()
	if(_appConstant.currentUser == '' || angular.equals(_appConstant.currentUser, {})) {
		_state.go('home');
		return false;
	}
	
	_scope.user = _appConstant.currentUser;
	
	
	_scope.getProjectByUser = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projectsByUser?userId='+_scope.user.userId+'&status=ACTIVE'
		}, function(data){
			console.log(data);
			_scope.projects = data;
		}, function(err) {
			console.log(err)
		});
	}
	_scope.getProjectByUser();
	
	_scope.userCoverPhoto = null;
	_scope.userProfilePhoto = null;
	
	_scope.updateUserProfile = function(_user) {
		if(!_scope.userCoverPhoto && !_user.coverPicture) {
			_services.toast.show('Please upload the cover photo.');
			return;
		}
		if(!_scope.userProfilePhoto && !_user.profilePicture) {
			_services.toast.show('Please upload profile picture.');
			return;
		}
		if(_scope.userCoverPhoto) {
			_user.userCoverPhoto = _scope.userCoverPhoto;
		}
		if(_scope.userProfilePhoto) {
			_user.userProfilePhoto = _scope.userProfilePhoto;
		}
		
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'users',
			data: _user
		}).then(function (res) {
			_scope.user = res.data.user;
			localStorage.setItem('backMeUser', JSON.stringify(res.data.user));
			_scope.userCoverPhoto = undefined;
			_scope.userProfilePhoto = undefined;
			_services.toast.show('Profile updated successfully');
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
}]);

