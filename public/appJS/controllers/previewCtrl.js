'use strict';
backMe.controller('previewCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', function(_scope, _services, _timeout, _state, _http, _appConstant){
	_scope.step = 5;
	_scope.stepsTitle = "Your Project Preview";
	_scope.projectId = _state.params.projectId;
	
	angular.forEach(_scope.project.projectsassets, function(_obj, _index){
		if(_scope.images.length == 0) {
			_scope.images.push({
				id : _index+1,
				/*title : _scope.project.title,
				alt : _scope.project.title,*/
				thumbUrl : 'uploads/'+_obj.location,
				url : 'uploads/'+_obj.location,
				extUrl : ''
			});
		}
	});
	/*_scope.images = [
		{
			id : 1,
			title : 'This is <b>amazing photo</b> of <i>nature</i>',
			alt : 'amazing nature photo',
			thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793__340.jpg',
			url : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793_960_720.jpg',
			extUrl : 'http://mywebsitecpm/photo/1453793'
		},
		{
			id : 2,
			url : 'https://pixabay.com/static/uploads/photo/2016/06/10/22/25/ortler-1449018_960_720.jpg',
			deletable : true,
		},
		{
			id : 3,
			thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701__340.jpg',
			url : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701_960_720.jpg'
		}
	];*/

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
			_services.toast.show('Project created successfully.');
			_state.go('home');
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
}]);