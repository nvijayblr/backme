'use strict';
backMe.controller('previewCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', '$rootScope', function(_scope, _services, _timeout, _state, _http, _appConstant, _rootScope){
	_scope.step = 5;
	_scope.stepsTitle = "Your Project Preview";
	_scope.projectId = _state.params.projectId;
	
	if(_rootScope.images.length == 0) {
		angular.forEach(_scope.project.projectsassets, function(_obj, _index){
			_rootScope.images.push({
				id : _index+1,
				/*title : _scope.project.title,
				alt : _scope.project.title,*/
				thumbUrl : 'uploads/'+_obj.location,
				bubbleUrl : 'uploads/'+_obj.location,
				url : 'uploads/'+_obj.location,
				extUrl : ''
			});
		});
	}
	_scope.submitProject = function() {
		if(_scope.project.posterImg || _scope.project.projectImages) {
			delete _scope.project.posterImg;
		  	delete _scope.project.projectImages;
		}		
		_scope.project.status = 'ACTIVE';
		_scope.data = _scope.project;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Project created successfully.');
			_state.go('home');
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
}]);