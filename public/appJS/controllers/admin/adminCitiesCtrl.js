'use strict';
backMe.controller('adminCitiesCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', '$filter', function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope, _filter){
	
	_rootScope.adminTab = 'cities';
	_scope.cities = [];
	_scope.filter = {
		search: ''
	};
	_scope.init = function() {
		_scope.cities = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'cities'
		}, function(data){
			_scope.cities = data;
			_scope.citiesAll = data;
			_scope.pageSize = 10;
			_services.pagination.init(_scope, _scope.cities);
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();
	
	_services.main.applySorting(_scope);
	
	_scope.applySearch = function(_key) {
		_scope.cities = _filter('filter')(_scope.citiesAll, _key);
		_services.pagination.init(_scope, _scope.cities);
	}
	
	_scope.city = {
		city: '',
		state: ''
	}
	_scope.mode = 'POST';
	_scope.app = {};
	_scope.showAddEditModal = function(_mode, _modal) {
		_scope.mode = _mode;
		_scope.app.addEditFrm.$setPristine();
		_scope.app.addEditFrm.$setUntouched();
		_scope.app.addEditFrm.$submitted = false;
		_scope.city = {
			city: '',
			state: ''
		}
		if(_scope.mode == 'PUT') {
			angular.copy(_modal, _scope.city);
		}
		$('#addEditModal').modal('show');
	}
	
	_scope.registerAddEdit = function() {
		_services.http.serve({
			method: _scope.mode,
			url: _appConstant.baseUrl + 'cities',
			inputData: _scope.city
		}, function(data){
			if(_scope.mode == 'POST') {
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>City created successfully !!');
			} else {
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>City updated successfully !!');
			}
			$('#addEditModal').modal('hide');
			_scope.init();
		}, function(err) {
			_services.toast.show(err.data);
		});
	}
	
	_scope.deleteCity = function(_modal) {
		_services.popup.init("Delete", "Are you sure want delete?", function(){
			_services.http.serve({
				method: 'DELETE',
				url: _appConstant.baseUrl + 'cities',
				inputData: _modal
			}, function(data){
				_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>City deleted successfully !!');
				_scope.init();
			}, function(err) {
				console.log(err)
			});
		}, function() {});
	}	
}]);

