'use strict';
backMe.controller('adminAdminsCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', '$filter', '$q',  function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope, _filter, _q){
	
	_rootScope.adminTab = 'admins';
	_scope.admins = [];
	_scope.filter = {
		search: ''
	};
	_scope.init = function() {
		_scope.admins = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'admin'
		}, function(data){
			_scope.admins = data;
			_scope.adminsAll = data;
			_scope.pageSize = 10;
			_services.pagination.init(_scope, _scope.admins);
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();
	
	_services.main.applySorting(_scope);
	
	_scope.applySearch = function(_key) {
		_scope.admins = _filter('filter')(_scope.adminsAll, _key);
		_services.pagination.init(_scope, _scope.admins);
	}
	
	_scope.admin = {
		name: '',
		email: '',
		password: '',
		mobileNumber: '',
		location: '',
		role: 'ADMIN',
		status: 'ACTIVE'
	}
	_scope.mode = 'POST';
	_scope.app = {};
	_scope.showAddEditModal = function(_mode, _modal) {
		_scope.mode = _mode;
		_scope.app.addEditFrm.$setPristine();
		_scope.app.addEditFrm.$setUntouched();
		_scope.app.addEditFrm.$submitted = false;
		_scope.admin = {
			name: '',
			email: '',
			password: '',
			mobileNumber: '',
			location: '',
			role: 'ADMIN',
			status: 'ACTIVE'
		}
		if(_scope.mode == 'PUT') {
			angular.copy(_modal, _scope.admin);
		}
		$('#addEditModal').modal('show');
	}

	_scope.cityList = {};

    _scope.createFilterFor = function(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(state) {
			return (state.value.indexOf(lowercaseQuery) === 0);
		};
    }
	
	_scope.querySearch = function (query) {
		var results = query ? _scope.cityList.filter(_scope.createFilterFor(query) ) : _scope.cityList;
		console.log(results);
		var deferred = _q.defer();
		_timeout(function () { 
			deferred.resolve( results ); 
		},0);
		return deferred.promise;
    }
	
	_scope.loadAllCities(function(cityList) {
		_scope.cityList = cityList;
	});
	
	_scope.registerAddEdit = function() {
		_services.http.serve({
			method: _scope.mode,
			url: _appConstant.baseUrl + 'admin',
			inputData: _scope.admin
		}, function(data){
			if(_scope.mode == 'POST') {
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>admin created successfully !!');
			} else {
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>admin updated successfully !!');
			}
			$('#addEditModal').modal('hide');
			_scope.init();
		}, function(err) {
			_services.toast.show(err.data);
		});
	}
	
	_scope.deleteAdmin = function(_modal) {
		_services.popup.init("Delete", "Are you sure want delete?", function(){
			_services.http.serve({
				method: 'DELETE',
				url: _appConstant.baseUrl + 'admin',
				inputData: _modal
			}, function(data){
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>admin deleted successfully !!');
				_scope.init();
			}, function(err) {
				console.log(err)
			});
		}, function() {});
	}	
	
	_scope.deActivateAdmin = function(_state, _modal) {
		console.log(_state, _modal);
		_scope.temp = {};
		if(_state == _modal.status) return;
		angular.copy(_modal, _scope.temp);
		_scope.temp.status = _state;
		_services.popup.init(_scope.temp.status=='ACTIVE'? "Activate":"Deactivate", _scope.temp.status=='ACTIVE'?"Are you sure want Activate the admin?" : "Are you sure want Deactivate the admin?", function(){
			_services.http.serve({
				method: 'PUT',
				url: _appConstant.baseUrl + 'admin',
				inputData: _scope.temp
			}, function(data){
				if(_scope.temp.status=='ACTIVE')
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>admin activated successfully !!');
				else 
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>admin deactivated successfully !!');
				_scope.init();
			}, function(err) {
				console.log(err)
			});
		}, function() {});
	}	
	
}]);
