'use strict';
backMe.controller('profileCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', '$q', function(_scope, _services, _timeout, _state, _http, _appConstant, _q){
	_scope.step = 4;
	_scope.stepsTitle = "Enter Profile & Account Details:";
	_scope.projectId = _state.params.projectId;
	_scope.userImg = null;
	
	_scope.addRewardsSpendFields(_scope.projectId);
	
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
		/*if(!_scope.project.accountName || !_scope.project.accountNo || !_scope.project.ifscCode) {
			_services.toast.show('User Account Name/Account No/IFSC Code should not be blank.');
			return;
		}*/
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.showProject('Project details upated successfully !!');
			_scope.userImg = undefined;
			_state.go('create.preview', {'projectId': _scope.projectId});
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	_scope.uploadTeam = function(_projects) {
		_scope.uploadCompleted = 0;
		_scope.data = _projects;
		if(!_projects.team) {
			_projects.team = [];
		}
		function uploadTeam(_obj, index){
			var ob = {
				picture: _obj.picture,
				userId: _obj.userId,
				projectId: _obj.projectId,
				name: _obj.name,
				designation: _obj.designation,
				profileLink: _obj.profileLink,
				teamTempId: _obj.teamTempId
			};
			console.log(ob);
			var deferred = _q.defer();
			_http.upload({
				method: 'POST',
				url: _appConstant.baseUrl + 'uploadTeam',
				data: ob
			}).then(function (res) {
				_scope.team = res.data;
				angular.forEach(_projects.team, function(_obj, index) {
					if(_obj.teamTempId == _scope.team.teamTempId) {
						_obj.picture = _scope.team.teamData[0][3];
						_obj.teamTempId = -1;
					}
				});
				deferred.resolve(res);
			}, function (err) {
				console.log(err);
				deferred.reject(err);
				_services.toast.show(err.data);
			}, function (evt) {
				_scope.uploadCompleted = parseInt(100.0 * evt.loaded / evt.total);
			});
			return deferred.promise;
		}

		var promises = [];
		angular.forEach(_projects.team, function(_obj, index) {
			if(_obj.picture.name) {
				_obj.teamTempId = index+1;
				promises.push(uploadTeam(_obj));
			}
		});
		
		_q.all(promises).then(function(values) {
			//_services.toast.show('Team details uploaded successfully.');
			_scope.startPreview();
		});
	}
	
	_scope.addTeam = function(_team) {
		_team.push({
			projectId: _scope.project.projectId,
			userId: _scope.project.userId,
			picture: null,
			name: '',
			designation : '',
			profileLink : ''
		});
	}
	
	_scope.deleteTeam = function(_team, _index) {
		_team.splice(_index, 1);
	}

	
}]);