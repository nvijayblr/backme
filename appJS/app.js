'use strict';
var backMe = angular.module('backMe', ['ui.router', 'angular-loading-bar', 'ngMaterial']);

backMe
.config(['$stateProvider', '$urlRouterProvider', function(_stateProvider, _urlRouterProvider) {
    
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
		;

}]);
