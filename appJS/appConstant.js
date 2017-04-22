'use strict';

var _currentUser = '';
if(localStorage.getItem('backMeUser'))
	_currentUser = JSON.parse(localStorage.getItem('backMeUser'));

backMe.constant('appConstant', {
	currentUser: _currentUser,
	baseUrl: 'http://backme-backend-api.au-syd.mybluemix.net/api/v1.0/'
});
