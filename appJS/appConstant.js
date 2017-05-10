'use strict';

var _currentUser = '';
if(localStorage.getItem('backMeUser'))
	_currentUser = JSON.parse(localStorage.getItem('backMeUser'));

backMe.constant('appConstant', {
	currentUser: _currentUser,
	//baseUrl: 'http://backme-backend-api.au-syd.mybluemix.net/api/v1.0/',
	baseUrl: 'http://localhost:3001/',
	googleClientId: '47668821926-a6d2btq3e6o0up035mpv8sekqte7hfp9'
});
