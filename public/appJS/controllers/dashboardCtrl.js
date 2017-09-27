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
	
	/*if(_rootScope.projectCreated) {
		_timeout(function(){
			$("#thankyouModal").modal('show');
		}, 1000);
		_rootScope.projectCreated = false;
	}*/
	var profile_config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [],
                backgroundColor: [
                    window.chartColors.red,
                    window.chartColors.orange
                ],
                label: 'Profile Completion'
            }],
            labels: [
                "Completed",
                "Pending"
            ]
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
			legend: {
				display: false
			},
			tooltips: {
			  callbacks: {
				label: function(tooltipItem, data) {
				  //get the concerned dataset
				  var dataset = data.datasets[tooltipItem.datasetIndex];
				  //calculate the total of this data set
				  var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
					return previousValue + currentValue;
				  });
				  //get the current items value
				  var currentValue = dataset.data[tooltipItem.index];
				  //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
				  var precentage = Math.floor(((currentValue/total) * 100)+0.5);
					if(tooltipItem.index==0) 
					  precentage = "Profile Completed " + precentage;
					else 
					  precentage = "Profile Pending " + precentage;
						
				  return precentage + "%";
				}
			  }
			} 
        }
    };
	var ctx = document.getElementById("profile-comp-graph").getContext("2d");
	var profileChart = new Chart(ctx, profile_config);

	
	_scope.getUserInfo = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'users/'+_scope.userId
		}, function(data){
			_scope.user = data[0];
			if(_appConstant.currentUser.userId == _scope.user.userId) {
				localStorage.setItem('backMeUser', JSON.stringify(_scope.user));
			}
			_scope.total = 10;
			_scope.notCompleted = 0;
			if(!_scope.user.aboutMe)	 _scope.notCompleted ++;
			if(!_scope.user.city)	 _scope.notCompleted ++;
			if(!_scope.user.coverPicture)	 _scope.notCompleted ++;
			if(!_scope.user.email)	 _scope.notCompleted ++;
			if(!_scope.user.mobileNumber)	 _scope.notCompleted ++;
			if(!_scope.user.myGoals)	 _scope.notCompleted ++;
			if(!_scope.user.myHobbies)	 _scope.notCompleted ++;
			if(!_scope.user.name)	 _scope.notCompleted ++;
			if(!_scope.user.profilePicture)	 _scope.notCompleted ++;
			if(!_scope.user.facebook)	 _scope.notCompleted ++;
			//_scope.notCompleted = 0;
			profile_config.data.datasets[0].data = [];
			profile_config.data.datasets[0].data.push(_scope.total - _scope.notCompleted);
			profile_config.data.datasets[0].data.push(_scope.notCompleted);
			profileChart.update();
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
	
	/*_scope.$on('event:social-sign-in-success', function(event, userDetails){
		if(userDetails.provider == 'google') {
			_scope.user.googleplus = userDetails.uid;
			_scope.$apply();
		}
		if(userDetails.provider == 'facebook')
			_scope.user.facebook = userDetails.uid;
	});
	
	_scope.$on('event:social-sign-out-success', function(event, logoutStatus){
		console.log('logoutStatus', logoutStatus)
	})*/
	

	_scope.updateUserProfile = function(_user) {
		if(_scope.userId != _scope.user.userId) return;
		/*if(!_scope.userCoverPhoto && !_user.coverPicture) {
			_services.toast.show('Please upload the cover photo.');
			return;
		}
		if(!_scope.userProfilePhoto && !_user.profilePicture) {
			_services.toast.show('Please upload profile picture.');
			return;
		}*/
		if(_scope.userCoverPhoto) {
			_user.userCoverPhoto = _scope.userCoverPhoto;
		}
		if(_scope.userProfilePhoto) {
			_user.userProfilePhoto = _scope.userProfilePhoto;
		}
		if(_scope.userProfilePhoto) {
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
			_scope.myCroppedProfileImage = undefined;
			_services.toast.show('Profile updated successfully');
			_scope.getUserInfo();
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
	_scope.updateUserAccount = function(user) {
		console.log(user);
	}
	_scope.showProjectExpired = function(_project) {
		if(_project.status == 'DISCONTINUE')
			_services.toast.show('Project has been Discontinued !!');
		else
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
		_discontinue.userId = _scope.user.userId;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'update',
			inputData: _discontinue
		}, function(data){
			_services.toast.show('Project discontinued successfully !!');
			_scope.getProjectByUser();
			$("#discontinueProjectModal").modal('hide');
		}, function(err) {
			console.log(err)
		});

	}
	_scope.extendProject = function(_extend) {
		if(_scope.userId != _scope.user.userId) return;
		_extend.userId = _scope.user.userId;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'update',
			inputData: _extend
		}, function(data){
			_services.toast.show('Project extended successfully !!');
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
	
	_scope.userPassword = {
		password: '',
		newPassword: '',
		newPasswordVerify: ''
	}

	_scope.updateUserPassword = function(_userPassword) {
		/*if(_userPassword.password != _scope.user.password) {
			_services.toast.show('Your current password is invalid.');
			return;
		}*/
		if(_userPassword.newPassword != _userPassword.newPasswordVerify) {
			_services.toast.show('Your new password is mismatched.');
			return;
		}
		_userPassword.userId = _scope.user.userId;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'changepassword',
			inputData: _userPassword
		}, function(data){
			if(data=='INVALID') {
				_services.toast.show('Password mismatched.');
			} else {
				_services.toast.show('Password updated successfully.');
				_scope.userPasswordForm.$setPristine();
				_scope.userPasswordForm.$setUntouched();
				_scope.userPasswordForm.$submitted = false;
				_scope.userPassword = {
					password: '',
					newPassword: '',
					newPasswordVerify: ''
				}
			}
		}, function(err) {
			console.log(err)
		});
	}
	_scope.editFields = function(_field) {
		_scope.tab = 2;
		_timeout(function() {
			$("#"+_field).focus();
		}, 1000);
	}
	
	_scope.updatePicture = function(_field) {
		_scope.tab = 2;
		_timeout(function() {
			$("#"+_field).trigger('click');
		}, 1000);
	}
	/*Autocomplete - City related functions*/
	_scope.cities = [];
	_scope.loadAllCities = function() {
		_scope.cities = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'cities'
		}, function(data){
			for(var i=0; i<data.length; i++) {
				_scope.cities.push({
					value: data[i].city.toLowerCase(),
					display: data[i].city
				});
			}
		}, function(err) {
			console.log(err)
		});
    }
	_scope.loadAllCities();

}]);

