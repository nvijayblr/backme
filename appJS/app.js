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
		.state('createproject', {
				url: '/createproject',
				templateUrl: 'templates/createproject.html',
				controller: 'createprojectCtrl'
		})
		.state('createprojectinfo', {
				url: '/createprojectinfo',
				templateUrl: 'templates/createprojectinfo.html',
				controller: 'createprojectinfoCtrl'
		})
		.state('createprojectdetails', {
				url: '/createprojectdetails',
				templateUrl: 'templates/createprojectdetails.html',
				controller: 'createprojectdetailsCtrl'
		})
		.state('createprojectrewards', {
				url: '/createprojectrewards',
				templateUrl: 'templates/createprojectrewards.html',
				controller: 'createprojectrewardsCtrl'
		})
		.state('createprojectaccount', {
				url: '/createprojectaccount',
				templateUrl: 'templates/createprojectaccount.html',
				controller: 'createprojectaccountCtrl'
		})
		.state('createprojectpreview', {
				url: '/createprojectpreview',
				templateUrl: 'templates/createprojectpreview.html',
				controller: 'createprojectpreviewCtrl'
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
