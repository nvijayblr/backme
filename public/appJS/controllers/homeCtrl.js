'use strict';
backMe.controller('homeCtrl', ['$scope', 'BaseServices', '$timeout', 'appConstant', function(_scope, _services, _timeout, _appConstant){
	
	//Call serach projects function in app.ctrl
	console.log('Home Ctrl...')
	_scope.title = [];
	_scope.title['trending'] = 'Trending';
	_scope.title['latest'] = 'Latest';
	_scope.title['hot'] = 'Hot';
	_scope.title['popular'] = 'Popular';
	_scope.title['topfunded'] = 'Top Funded';
	_scope.title['recommended'] = 'Recommended';
	_scope.title['currentlywatched'] = 'Currently Watched';
	
	_scope.init = function(_category) {
		_scope.categoryKey = _category;
		_scope.homeProjects = {};
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'bySocial?q=all&limit=6&category='+_category+'&userId='+_appConstant.currentUser.userId
		}, function(data){
			_scope.homeProjects = data;
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.loadCategory = function(_category) {
		if(_category)
			location.href="/#/home?search-category="+_category;
		else
			location.href="/#/home";
		_scope.init(_category);
	}
	
	_scope.addtoFavourite = function(_project) {
		_scope.data = {
			projectId: _project.projectId,
			userId: _appConstant.currentUser.userId,
			status: 'ACTIVE'
		}
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'favourites',
			inputData: _scope.data
		}, function(data){
			_services.toast.show('Project added into your favourites.');
			_project.favCount = 1;
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.removeFromFavourite = function(_project) {
		_scope.data = {
			projectId: _project.projectId,
			userId: _appConstant.currentUser.userId,
			status: 'ACTIVE'
		}
		_services.http.serve({
			method: 'DELETE',
			url: _appConstant.baseUrl + 'favourites',
			inputData: _scope.data
		}, function(data){
			_services.toast.show('Project removed from your favourites.');
			_project.favCount = 0;
		}, function(err) {
			console.log(err)
		});
	}
	if(location.href.split('?search-category=')[1]) {
		_scope.init(location.href.split('?search-category=')[1]);
	} else if(location.href.indexOf('?favourites') > 0) {
		_scope.loadFaouriteProjects();
	}else {
		_scope.init('');
	}
	
    _scope.$on('loadInitProjects', function(e) {  
		_scope.init('');
	});

}]);

