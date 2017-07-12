'use strict';
backMe.controller('adminUsersCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', '$filter', function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope, _filter){
	
	_rootScope.adminTab = 'users';
	_scope.users = [];
	_scope.filter = {
		search: ''
	};
	_scope.init = function() {
		_scope.users = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'users'
		}, function(data){
			_scope.users = data;
			_scope.usersAll = data;
			_scope.pageSize = 10;
			_services.pagination.init(_scope, _scope.users);
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();
	
	_services.main.applySorting(_scope);
	
	_scope.applySearch = function(_key) {
		_scope.users = _filter('filter')(_scope.usersAll, _key);
		_services.pagination.init(_scope, _scope.users);
	}
	
	_scope.deActivateUsers = function(_state, _modal) {
		_scope.temp = {};
		if(_state == _modal.status) return;
		//angular.copy(_modal, _scope.temp);
		_scope.temp = {
			status: _state,
			userId: _modal.userId
		}
		_services.popup.init(_scope.temp.status=='ACTIVE'? "Activate":"Deactivate", _scope.temp.status=='ACTIVE'?"Are you sure want Activate the user?" : "Are you sure want Deactivate the user?", function(){
			_services.http.serve({
				method: 'PUT',
				url: _appConstant.baseUrl + 'admin/users',
				inputData: _scope.temp
			}, function(data){
				if(_scope.temp.status=='ACTIVE')
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>User activated successfully !!');
				else 
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>User deactivated successfully !!');
				_scope.init();
			}, function(err) {
				console.log(err)
			});
		}, function() {});
	}	
	
}]);

