'use strict';
backMe.controller('dashboardCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', function(_scope, _services, _appConstant, _timeout, _state, _http){

	if(_appConstant.currentUser == '' || angular.equals(_appConstant.currentUser, {})) {
		_state.go('home');
		return false;
	}
	_scope.user = _appConstant.currentUser;
	
	_scope.statistics = {
		viewsCount: 0,
		supportersCount: 0,
		commentsCount: 0,
		amountReceived: 0
	};
	
	_scope.getUserInfo = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'users/'+_scope.user.userId
		}, function(data){
			_scope.user = data[0];
			localStorage.setItem('backMeUser', JSON.stringify(_scope.user));
		}, function(err) {
			console.log(err)
		});
	}
	_scope.getUserInfo();
	
	_scope.getProjectByUser = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projectsByUser?userId='+_scope.user.userId+'&status=ACTIVE'
		}, function(data){
			_scope.projects = data;
			angular.forEach(_scope.projects, function(_obj) {
				_scope.statistics.viewsCount = _scope.statistics.viewsCount + _obj.remaindayshours[0].viewsCount;
				_scope.statistics.supportersCount = _scope.statistics.supportersCount + _obj.remaindayshours[0].supportersCount;
				_scope.statistics.commentsCount = _scope.statistics.commentsCount + _obj.remaindayshours[0].commentsCount;
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
	
	_scope.updateUserAccount = function(user) {
		console.log(user);
	}
	_scope.showProjectExpired = function() {
		_services.toast.show('Profile has been expired. Please Extend the project !!');
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

