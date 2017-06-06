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
		_scope.homeProjects = {};
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'bySocial?q=all&limit=6&category='+_category
		}, function(data){
			_scope.homeProjects = data;
		}, function(err) {
			console.log(err)
		});
	}
	_scope.init('');

}]);

