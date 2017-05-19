'use strict';
var _currentUser = '';
if(localStorage.getItem('backMeUser'))
	_currentUser = JSON.parse(localStorage.getItem('backMeUser'));

backMe.constant('appConstant', {
	currentUser: _currentUser,
	baseUrl: 'http://localhost:3001/',
	//baseUrl: 'http://52.66.189.23:3001/',
	googleClientId: '47668821926-a6d2btq3e6o0up035mpv8sekqte7hfp9',
	projectMaxDays: 999
});
