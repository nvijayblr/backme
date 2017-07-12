'use strict';
var _currentUser = '';
if(localStorage.getItem('backMeUser'))
	_currentUser = JSON.parse(localStorage.getItem('backMeUser'));

backMe.constant('appConstant', {
	currentUser: _currentUser,
	baseUrl: 'http://localhost:3001/',
	googleClientId: '47668821926-o59d17ntaav3fi8jvbkl0pc9d5gjukrm',
	/*baseUrl: 'http://supportmytalent.in/',
	googleClientId: '1022772628270-d0a4laj9hasu9ahg4gqjshqhq3pvboch',*/
	projectMaxDays: 999
});
