'use strict';
var backMe = angular.module('backMe', ['ui.router', 'angular-loading-bar', 'ngMaterial', 'ngMessages', 'facebook', 'ngFileUpload', 'thatisuday.ng-image-gallery', '720kb.socialshare', 'ngImgCrop']);

backMe
.config(['$stateProvider', '$urlRouterProvider', 'FacebookProvider', '$mdDateLocaleProvider', function(_stateProvider, _urlRouterProvider, FacebookProvider, _mdDateLocaleProvider) {
    
    _urlRouterProvider.otherwise('/home');
    
    _stateProvider
		.state('home', {
				url: '/home',
				templateUrl: 'templates/home.html',
				controller: 'homeCtrl'
		})
		.state('about', {
				url: '/about',
				templateUrl: 'templates/about.html',
				controller: 'aboutCtrl'
		})
		.state('team', {
				url: '/team',
				templateUrl: 'templates/team.html',
				controller: 'teamCtrl'
		})
		.state('create', {
				abstract: true,
				url: '/create',
				template: '<div ui-view class="fade-view"/>',
				controller: 'createprojectCtrl'
		})
		.state('create.startproject', {
				url: '/startproject',
				templateUrl: 'templates/startproject.html',
				controller: 'startprojectCtrl'
		})
		.state('create.basicinfo', {
				url: '/basicinfo/:projectId',
				templateUrl: 'templates/basicinfo.html',
				controller: 'basicinfoCtrl'
		})
		.state('create.projectdetails', {
				url: '/projectdetails/:projectId',
				templateUrl: 'templates/projectdetails.html',
				controller: 'projectdetailsCtrl'
		})
		.state('create.rewards', {
				url: '/rewards/:projectId',
				templateUrl: 'templates/rewards.html',
				controller: 'rewardsCtrl'
		})
		.state('create.profile', {
				url: '/profile/:projectId',
				templateUrl: 'templates/profile.html',
				controller: 'profileCtrl'
		})
		.state('create.preview', {
				url: '/preview/:projectId',
				templateUrl: 'templates/preview.html',
				controller: 'previewCtrl'
		})
		.state('project', {
				url: '/project/:projectId',
				templateUrl: 'templates/project.html',
				controller: 'projectCtrl'
		})
		.state('checkout', {
				url: '/checkout/:projectId/:amount',
				templateUrl: 'templates/checkout.html',
				controller: 'checkoutCtrl'
		})
		.state('dashboard', {
				url: '/dashboard',
				templateUrl: 'templates/dashboard.html',
				controller: 'dashboardCtrl'
		})
		;

		/*config facebook login button*/
		var myAppId = '211137599382729';
		FacebookProvider.init(myAppId);
	
		_mdDateLocaleProvider.formatDate = function(date) {
		   return moment(date).format('MM/DD/YYYY');
		};

}]);

backMe.run(['$rootScope', '$window', function(_rootScope, _window) {
	console.log('app run phase...')
}]);
/*.state('app.extendreservation', {
		url: 'extendreservation/:userId/:reservationId/:outTime',
		templateUrl: 'templates/extendreservation.html',
		controller: 'extendreservationCtrl'
})*/
