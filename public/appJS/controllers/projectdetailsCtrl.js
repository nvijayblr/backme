'use strict';
backMe.controller('projectdetailsCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', '$q', 'appConstant', 'uploadImages', function (_scope, _services, _timeout, _state, _http, _q, _appConstant, _uploadImages) {
	_scope.step = 2;
	_scope.stepsTitle = "Enter Project Details:";
	_scope.projectId = _state.params.projectId;
	_scope.disableDragDrop = false;
	_scope.posterImg = null;
	_scope.uploadCompleted = 0;
	
	_scope.addRewardsSpendFields(_scope.projectId);
	_scope.startRewards = function () {
		if(_scope.disableDragDrop) {
			_services.toast.show('Images/Video upload in progress.');
			return;
		}
		if(_scope.project.posterImg) {
			delete _scope.project.posterImg;
		}
		_scope.data = _scope.project;
		
		if(!_scope.project.projectsassets) {
			_scope.project.projectsassets = [];
		}	

		if(!_scope.project.moneyNeeded || !_scope.project.spendmoney[0].amount || !_scope.project.spendmoney[0].description) {
			_services.toast.show('Money Needed/Spend Money should not be blank.');
			return;
		}
		if(_scope.project.daysDate == 'Days' && !_scope.project.noOfDays) {
			_services.toast.show('No. of days should not be blank.');
			return;
		}
		if(_scope.project.daysDate == 'Date' && (!_scope.project.endByDate || moment(_scope.project.endByDate).format('MM/DD/YYYY') ==  moment().format('MM/DD/YYYY'))) {
			_services.toast.show('End by date should not be blank/current date.');
			return;
		}
		if(!_scope.projectImages && _scope.project.projectsassets.length==0) {
			_services.toast.show('Project gallery images/videos should not be empty.');
			return;
		}
		
		_scope.inputData = {};
		angular.copy(_scope.project, _scope.inputData);
		if(_scope.inputData) {
			delete _scope.inputData.projectImages;
			delete _scope.inputData.projectsassets;
		}
		
		//_scope.uploadImagesVideos();
		
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.inputData
		}).then(function (data) {
			_services.toast.show(data.data);
			_state.go('create.rewards', {'projectId': _scope.projectId});
		}, function (err) {
			console.log(err);
			_services.toast.show(err.data);
		});
	}

	_scope.uploadImagesVideos = function() {
		_scope.uploadCompleted = 0;
		_scope.disableDragDrop = true;
		_scope.data = _scope.project;
		if(!_scope.project.projectsassets) {
			_scope.project.projectsassets = [];
		}
		
		function uploadFiles(_obj, index){
			//_scope.data.projectImages = _obj;
			var ob = {
				projectImages: _obj,
				userId: _scope.project.userId,
				projectId: _scope.project.projectId
			};
			let deferred = _q.defer();
			_http.upload({
				method: 'POST',
				url: _appConstant.baseUrl + 'projectImages',
				data: ob
			}).then(function (res) {
				_scope.assets = res.data[0];
				if(_scope.data.projectsassets) {
					_scope.data.projectsassets.push({
						assetId: _scope.assets[4],
						projectId: _scope.assets[0],
						userId: _scope.assets[1],
						type: _scope.assets[2],
						location: _scope.assets[3]
					});
				}
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

		let promises = [];
		angular.forEach(_scope.projectImages, function(_obj, index) {
			promises.push(uploadFiles(_obj));
		});
		
		_q.all(promises).then(function(values) {
			_services.toast.show('Images/Video uploaded successfully.');
			_scope.projectImages = undefined;
			_scope.disableDragDrop = false;
		});

		/*if(_scope.projectImages.length > 0)
			uploadFiles(_scope.projectImages[0], 0);
		function _callBack(index){
			if(_scope.projectImages.length > index+1)
				uploadFiles(_scope.projectImages[index+1], index+1);
			else
				_services.toast.show('Everything is donre');
		};
		function uploadFiles(_obj, index){
			_scope.data.projectImages = _obj;
			_http.upload({
				method: 'POST',
				url: _appConstant.baseUrl + 'projectImages',
				data: _scope.data
			}).then(function (res) {
				_scope.assets = res.data[0];
				if(_scope.data.projectsassets) {
					_scope.data.projectsassets.push({
						assetId: _scope.assets[4],
						projectId: _scope.assets[0],
						userId: _scope.assets[1],
						type: _scope.assets[2],
						location: _scope.assets[3]
					});
				}
			}, function (err) {
				console.log(err);
				_services.toast.show(err.data);
			}, function (evt) {
				console.log(evt);
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				console.log('progress: ' + progressPercentage + '% ' + evt.config.data.projectImages.name);
			}).finally(function(){
				_callBack(index);
			});
		};*/
		
	}

	_scope.addSpendMoney = function (_spendmoney) {
		_spendmoney.push({
			projectId: _scope.projectId,
			userId: _scope.userId,
			amount: '',
			description: ''
		});
	}
	
	_scope.changeDays = function(_noOfDays) {
		if(_noOfDays) {
			_scope.project.endByDate = moment(_scope.project.endByDate).add(_noOfDays, 'days').toDate();
		}
	}

	_scope.changeDate = function(_endByDate) {
		if(_endByDate) {
			_scope.project.noOfDays = moment(_endByDate).diff(moment(), 'days')+1;
		} 
	}

}]);
