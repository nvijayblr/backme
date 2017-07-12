'use strict';
backMe.controller('adminProjectsCtrl', ['$scope', 'BaseServices', 'appConstant', '$timeout', '$state', 'Upload', '$rootScope', '$filter', function(_scope, _services, _appConstant, _timeout, _state, _http, _rootScope, _filter){
	
	_rootScope.adminTab = 'projects';
	_scope.projects = [];
	_scope.filter = {
		search: ''
	};
	_scope.init = function() {
		_scope.projects = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'admin/projects'
		}, function(data){
			_scope.projects = data;
			_scope.projectsAll = data;
			_scope.pageSize = 20;
			_services.pagination.init(_scope, _scope.projectsAll);
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();
	
	_services.main.applySorting(_scope);
	
	_scope.applySearch = function(_key) {
		_scope.projects = _filter('filter')(_scope.projectsAll, _key);
		_services.pagination.init(_scope, _scope.projects);
	}
	
	_scope.deActivateProjects = function(_state, _modal) {
		_scope.temp = {};
		if(_state == _modal.status) return;
		//angular.copy(_modal, _scope.temp);
		_scope.temp = {
			status: _state,
			projectId: _modal.projectId
		}
		_services.popup.init(_scope.temp.status=='ACTIVE'? "Activate":"Deactivate", _scope.temp.status=='ACTIVE'?"Are you sure want Activate the project?" : "Are you sure want Deactivate the project?", function(){
			_services.http.serve({
				method: 'PUT',
				url: _appConstant.baseUrl + 'admin/projects',
				inputData: _scope.temp
			}, function(data){
				if(_scope.temp.status=='ACTIVE')
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Project activated successfully !!');
				else 
					_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Project deactivated successfully !!');
				_scope.init();
			}, function(err) {
				console.log(err)
			});
		}, function() {});
	}	
	
}]);

