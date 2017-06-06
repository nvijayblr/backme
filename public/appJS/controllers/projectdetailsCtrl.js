'use strict';
backMe.controller('projectdetailsCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', '$q', 'appConstant', 'uploadImages', '$rootScope', function (_scope, _services, _timeout, _state, _http, _q, _appConstant, _uploadImages, _rootScope) {
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
		
		if(!_scope.validateSpendMoney(_scope.project.spendmoney, _scope.project.moneyNeeded, 'Submit')) {
			return;
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
				
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.inputData
		}).then(function (data) {
			_services.toast.showProject('Project details upated successfully !!');
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
				projectId: _scope.project.projectId,
				title: _scope.project.title,
				url:  _obj.type.indexOf('video/')==0 ? 'uploadVideo' : 'projectImages'
			};
			console.log(ob);
			var deferred = _q.defer();
			_http.upload({
				method: 'POST',
				url: _appConstant.baseUrl + ob.url,
				data: ob
			}).then(function (res) {
				_scope.assets = res.data[0];
				if(_scope.data.projectsassets) {
					_scope.data.projectsassets.push({
						assetId: _scope.assets[4],
						projectId: _scope.assets[0],
						userId: _scope.assets[1],
						type: _scope.assets[2],
						location: _scope.assets[3],
						videoId: _scope.assets[5] ? _scope.assets[5] : '',
						title: _scope.assets[6] ? _scope.assets[6] : '',
						description: _scope.assets[7] ? _scope.assets[7] : ''
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

		var promises = [];
		console.log(_scope.projectImages)
		angular.forEach(_scope.projectImages, function(_obj, index) {
			promises.push(uploadFiles(_obj));
		});
		
		_q.all(promises).then(function(values) {
			if(promises.length) {
				_services.toast.show('Images/Video uploaded successfully.');
				_scope.projectImages = undefined;
				_scope.disableDragDrop = false;
				_rootScope.images = [];
			} else {
				_services.toast.show('Selected Invalid Video format.');
				_scope.disableDragDrop = false;
			}
		});

	}

	_scope.validateSpendMoney = function(_spendmoney, moneyNeeded, type) {
		_scope.totAmt = 0, _scope.showError=false;
		if((!_spendmoney[0].amount && !_spendmoney[0].description) && type=='Submit') {
			_spendmoney[0].amount = moneyNeeded;
			_spendmoney[0].description = 'Others';
			return true;
		}
		for(var i=0; i<_spendmoney.length; i++) {
			_scope.totAmt = _scope.totAmt + parseInt(_spendmoney[i].amount);
			_spendmoney[i].showAmtError = false;
			_spendmoney[i].showDescError = false;
			if(!_spendmoney[i].amount) {
				_spendmoney[i].showAmtError = true;
				_scope.showError=true;
			}
			if(!_spendmoney[i].description) {
				_spendmoney[i].showDescError = true;
				_scope.showError=true;
			}
		}
		if(_scope.totAmt > moneyNeeded) {
			_services.toast.show('Total of the spend amount should not be greater than Money needed.');
			return false; 
		}
		console.log(_scope.totAmt, moneyNeeded )
		if((_scope.totAmt >= moneyNeeded && type=='AddSpend') || _scope.showError) {
			return false; 
		}
		_scope.amt = moneyNeeded - _scope.totAmt;
		if(_scope.totAmt < moneyNeeded && type=='Submit') {
			_spendmoney.push({
				projectId: _scope.projectId,
				userId: _scope.userId,
				amount: _scope.amt,
				description: 'Others'
			});
		}
		return true;
	}
	
	_scope.addSpendMoney = function (_spendmoney, moneyNeeded) {
		if(!_scope.validateSpendMoney(_spendmoney, moneyNeeded, 'AddSpend'))
			return;
		_spendmoney.push({
			projectId: _scope.projectId,
			userId: _scope.userId,
			amount: _scope.amt,
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
	
	_scope.deleteSpendMoney = function(_spend, _index) {
		_spend.splice(_index, 1);
	}


}]);
