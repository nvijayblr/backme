'use strict';
backMe.controller('dashboardCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope){
	/*if(_appConstant.currentUser == '' || angular.equals(_appConstant.currentUser, {})) {
		_state.go('home');
		return false;
	}*/
	_scope.user = {};
	_scope.userId = _state.params.userId;
	_scope.curUser = false;
	if(_scope.userId == _appConstant.currentUser.userId) _scope.curUser = true;
	console.log('_scope.curUser', _scope.curUser);
	
	_scope.statistics = {
		viewsCount: 0,
		supportersCount: 0,
		commentsCount: 0,
		amountReceived: 0
	};
	
	if(_rootScope.projectCreated) {
		_timeout(function(){
			$("#thankyouModal").modal('show');
		}, 1000);
	}
	_scope.getUserInfo = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'users/'+_scope.userId
		}, function(data){
			_scope.user = data[0];
			if(_appConstant.currentUser.userId == _scope.user.userId) {
				localStorage.setItem('backMeUser', JSON.stringify(_scope.user));
			}
		}, function(err) {
			console.log(err)
		});
	}
	_scope.getUserInfo();
	
	_scope.getProjectByUser = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projectsByUser?userId='+_scope.userId+'&status=ALL'
		}, function(data){
			_scope.projects = data;
			angular.forEach(_scope.projects, function(_obj) {
				if(_obj.remaindayshours.length) {
					_scope.statistics.viewsCount = _scope.statistics.viewsCount + _obj.remaindayshours[0].viewsCount;
					_scope.statistics.supportersCount = _scope.statistics.supportersCount + _obj.remaindayshours[0].supportersCount;
					_scope.statistics.commentsCount = _scope.statistics.commentsCount + _obj.remaindayshours[0].commentsCount;
				}
				if(_obj.payments && _obj.payments.length) {
					_scope.statistics.amountReceived = _scope.statistics.amountReceived + _obj.payments[0].amount;
				}
			});
		}, function(err) {
			console.log(err)
		});
	}
	_scope.getProjectByUser();
	
	_scope.userCoverPhoto = null;
	_scope.userProfilePhoto = null;
	
	_scope.updateUserProfile = function(_user) {
		if(_scope.userId != _scope.user.userId) return;
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
		if(_scope.myCroppedProfileImage) {
			_user.userProfilePhoto = _http.dataUrltoBlob(_scope.myCroppedProfileImage, _scope.userProfilePhoto.name);
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
			_scope.myCroppedImage = undefined;
			_services.toast.show('Profile updated successfully');
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
	_scope.updateUserAccount = function(user) {
		console.log(user);
	}
	_scope.showProjectExpired = function() {
		_services.toast.show('Project has been expired. Please Extend the project !!');
	}
	
	_scope.discontinue = {
		reason: '',
		projectId: '',
		userId: _scope.user.userId,
		status: 'DISCONTINUE'
	};
	_scope.extend = {
		reason: '',
		projectId: '',
		userId: _scope.user.userId,
		noOfDays: '',
		endByDate: '',
		daysDate: 'Days'
	};
	_scope.projectMinDate = moment().add(1, 'days').toDate();
	_scope.projectMaxDate = moment().add(999, 'days').toDate();
	
	_scope.showDiscontinueProjectModal = function(_project) {
		if(_scope.userId != _scope.user.userId) return;
		_scope.app.discontinueProject.$setPristine();
		_scope.app.discontinueProject.$setUntouched();
		_scope.app.discontinueProject.$submitted = false;
		_scope.discontinue.reason = '';
		_scope.discontinue.projectId = _project.projectId;
		$("#discontinueProjectModal").modal('show');
		_timeout(function() {
			$(".focus-txt").focus();
		}, 500);
	}
	
	_scope.showExtendProjectModal = function(_project) {
		if(_scope.userId != _scope.user.userId) return;
		_scope.app.extendProject.$setPristine();
		_scope.app.extendProject.$setUntouched();
		_scope.app.extendProject.$submitted = false;
		_scope.extend.reason = '';
		_scope.extend.noOfDays = 30;
		_scope.extend.endByDate = moment().add(30, 'days').toDate();
		_scope.extend.daysDate = 'Days';
		_scope.extend.projectId = _project.projectId;
		$("#extendProjectModal").modal('show');
		_timeout(function() {
			$(".focus-txt").focus();
		}, 500);
	}
	
	_scope.closeDiscontinueProjectModal = function() {
		$("#discontinueProjectModal").modal('hide');
	}
	_scope.closeExtendProjectModal = function() {
		$("#extendProjectModal").modal('hide');
	}
	_scope.discontinueProject = function(_discontinue) {
		if(_scope.userId != _scope.user.userId) return;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'update',
			inputData: _discontinue
		}, function(data){
			_scope.getProjectByUser();
			$("#discontinueProjectModal").modal('hide');
		}, function(err) {
			console.log(err)
		});

	}
	_scope.extendProject = function(_extend) {
		if(_scope.userId != _scope.user.userId) return;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'update',
			inputData: _extend
		}, function(data){
			_scope.getProjectByUser();
			$("#extendProjectModal").modal('hide');
		}, function(err) {
			console.log(err)
		});
	}

	_scope.changeDays = function(_noOfDays) {
		if(_noOfDays) {
			_scope.extend.endByDate = moment().add(_noOfDays, 'days').toDate();
		}
	}

	_scope.changeDate = function(_endByDate) {
		if(_endByDate) {
			_scope.extend.noOfDays = moment(_endByDate).diff(moment(), 'days')+1;
		} 
	}

}]);

