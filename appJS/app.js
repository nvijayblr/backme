'use strict';
var backMe = angular.module('backMe', ['ui.router', 'angular-loading-bar', 'ngMaterial', 'facebook']);

backMe
.config(['$stateProvider', '$urlRouterProvider', 'FacebookProvider', function(_stateProvider, _urlRouterProvider, FacebookProvider) {
    
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
		.state('create.createproject', {
				url: '/createproject',
				templateUrl: 'templates/createproject.html',
				controller: 'createprojectCtrl'
		})
		.state('create.projectinfo', {
				url: '/projectinfo',
				templateUrl: 'templates/projectinfo.html',
				controller: 'projectinfoCtrl'
		})
		.state('create.projectdetails', {
				url: '/projectdetails',
				templateUrl: 'templates/projectdetails.html',
				controller: 'projectdetailsCtrl'
		})
		.state('create.rewards', {
				url: '/rewards',
				templateUrl: 'templates/rewards.html',
				controller: 'rewardsCtrl'
		})
		.state('create.profile', {
				url: '/profile',
				templateUrl: 'templates/profile.html',
				controller: 'profileCtrl'
		})
		.state('create.preview', {
				url: '/preview',
				templateUrl: 'templates/preview.html',
				controller: 'previewCtrl'
		})
		.state('project', {
				url: '/project',
				templateUrl: 'templates/project.html',
				controller: 'projectCtrl'
		})
		.state('checkout', {
				url: '/checkout',
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

}]);

backMe.run(['$rootScope', '$window', function(_rootScope, _window) {
	console.log('app run phase...')
}]);
