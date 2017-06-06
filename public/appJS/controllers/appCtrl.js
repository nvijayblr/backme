'use strict';
backMe.controller('appCtrl', ['$scope', 'BaseServices', '$timeout', '$rootScope', '$window', '$state', '$mdToast', 'appConstant', 'Facebook', '$http',   function(_scope, _services, _timeout, _rootScope, _window, _state, _mdToast, _appConstant, Facebook, _http){
	
	_scope.appConstant = _appConstant;
	_scope.loginSettings = {
		email : '',
		password: ''
	}
	_scope.signUpSettings = {
		email : '',
		password: '',
		name: '',
		agree: true
	}
	
	_scope.loggedUser = {};
	_scope.loggedIn = false;
	_scope.showPassword = true;
	_scope.showSearch = false;
	_scope.categoryList = [
		  {'name': 'Art'},
		  {'name': 'Comics'},
		  {'name': 'Crafts'},
		  {'name': 'Dance'},
		  {'name': 'Design'},
		  {'name': 'Fashion'},
		  {'name': 'Film & Video'},
		  {'name': 'Food'},
		  {'name': 'Games'},
		  {'name': 'Journalism'},
		  {'name': 'Music'},
		  {'name': 'Photography'},
		  {'name': 'Publishing'},
		  {'name': 'Sports'},
		  {'name': 'Technology'},
		  {'name': 'Theater'}
	];
	
	if(_appConstant.currentUser != '') {
		_scope.loggedUser = _appConstant.currentUser;
		_scope.loggedIn = true;
	} else {
		_appConstant.currentUser = {};
	}

	//Begin the Search related functions
	_scope.projects = {};
	_scope.serach = {
		serachBox: ''
	};
	_scope.searchKeywords = [];
	_scope.categoryKey = '';
	_scope.isSerchPage = false;
	_scope.searchProjects = function(_query) {
		_scope.categoryKey = _query;
		_scope.projects = {};
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'search?q=' + _query
		}, function(data){
			_scope.projects = data;
		}, function(err) {
			console.log(err)
		});
	}
	//_scope.searchProjects('');
	
	_scope.location = {
		projects: {}
	}
	
	_scope.getLocationBasedProjects = function(_query) {
		_scope.location.projects = {};
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'search?q=' + _query
		}, function(data){
			_scope.location.projects = data;
		}, function(err) {
			console.log(err)
		});
	}

	_scope.getUserLocation = function(_query) {
		console.log('getUserLocation');
		_services.http.serve({
			method: 'GET',
			url: 'http://ipinfo.io'
		}, function(data){
			console.log(data.city);
			_scope.getLocationBasedProjects(data.city);
		}, function(err) {
			console.log(err)
		});
	}
	//_scope.getUserLocation();
	
	_scope.searchKeywordsList = '';
	_scope.searchKeyPress = function(_keyEvent) {
		if (_keyEvent.which == 13 && _scope.searchKeywords) {
			_scope.isSerchPage = true;
			_scope.searchKeywordsList = _scope.searchKeywords.join(', ')
			_scope.searchProjects(_scope.searchKeywords.join('|'));
		}
	}
	_scope.showSearchBar = function() {
		_scope.searchKeywords = [];
		_scope.showSearch = true;
		$(".ts-search-txt").focus();
	}
	
	_scope.closeSearch = function() {
		_scope.showSearch = false;
		_scope.searchProjects('');
		_scope.isSerchPage = false;
		_scope.searchKeywords = [];
	}

	_scope.startSearch = function() {
		if(_scope.searchKeywords) {
			if(_state.current.url != '/home') {
				_state.go('home');
			}
			_scope.isSerchPage = true;
			_scope.searchKeywordsList = _scope.searchKeywords.join(', ')
			_scope.searchProjects(_scope.searchKeywords.join('|'));
		}
	}
	//End of the Search related functions
	
	_scope.showLogin = function() {
		_scope.app.loginForm.$setPristine();
		_scope.app.loginForm.$setUntouched();
		_scope.app.loginForm.$submitted = false;
		_scope.loginSettings = {
			email : '',
			password: ''
		}
		_scope.showPassword = true;
		$('#signUpModal').modal('hide');
		$('#loginModal').modal('show');
	}
	_scope.showSignUp = function() {
		_scope.app.signupForm.$setPristine();
		_scope.app.signupForm.$setUntouched();
		_scope.app.signupForm.$submitted = false;
		_scope.signUpSettings = {
			email : '',
			password: '',
			name: '',
			agree: true
		}
		_scope.showPassword = true;
		$('#loginModal').modal('hide');
		$('#signUpModal').modal('show');
	}
	
	_scope.showSignUpComplete = function() {
		$('#signUpModal').modal('hide');
		$('#signUpFinishModal').modal('show');
	}
	
	_scope.showHidePassword = function() {
		_scope.showPassword = !_scope.showPassword;
	}

	_scope.startProject = function() {
		_state.go('create.startproject');
		/*if(_scope.loggedIn) {
			_state.go('create.startproject');
		} else {
			_scope.showLogin();
		}*/
	}
	
	_scope.appLogin = function(_email, _pass) {
		if(!_email || !_pass) {
			_services.toast.show('Please enter the Email or password');
			return;
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'login',
			inputData: _scope.loginSettings
		}, function(data){
			_appConstant.currentUser = data[0];
			_appConstant.currentUser.name = _appConstant.currentUser.name?_appConstant.currentUser.name:_email;
			_scope.loggedUser = _appConstant.currentUser;
			console.log(_appConstant.currentUser);
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			$('#loginModal').modal('hide');
		}, function(err){
			_services.toast.show('Invalid Email/Password.');
		});
	}
	
	_scope.finishSignup = function(_email, _pass, _name) {
		if(!_email || !_pass || !_name) {
			_services.toast.show('Email/Password/Name should not be blank.');
			return;
		}
		_scope.signUpData = {
			email : _email,
			password: _pass,
			name: _name
		}
		$('#signUpFinishModal').modal('hide');
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signup',
			inputData: _scope.signUpData
		}, function(res){
			$('#signUpModal').modal('hide');
			_appConstant.currentUser.name = _name;
			_appConstant.currentUser.userId = res.insertId;
			console.log(_appConstant.currentUser)
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Your account has created successfully.');
		}, function(err) {
			_services.toast.show(err.data);
		});
	}
	

	_scope.appSignup = function(_email, _pass) {
		$('#signUpModal').modal('hide');
		$('#signUpFinishModal').modal('show');
	}
	
	/*Begin the google sign in*/
	var auth2; 
	$(window).load(function() {
		gapi.load('auth2', function(){
			auth2 = gapi.auth2.init({
				client_id: _appConstant.googleClientId + '.apps.googleusercontent.com',
				cookiepolicy: 'single_host_origin',
				scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
			});
			_scope.attachGoogleLogin(document.getElementById('googleLogin'));
			_scope.attachGoogleLogin(document.getElementById('googleSignup'));
		});

		_scope.attachGoogleLogin = function (element) {
			auth2.attachClickHandler(element, {},
				function(googleUser) {
					_scope.googleLoginSuccess(googleUser);
				}, function(error) {
					_scope.googleLoginFailure(error);
				}
			);
		}
	});
	
	_scope.profile = {};
	_scope.googleUser = {
		name: '',
		email: '',
		profilePicture: ''
	}
	_scope.socialLogin = function(_email, _type) {
		if(!_email || !_type) {
			_services.toast.show('Please enter the Email/login type.');
			return;
		}
		_scope.socialLogin = {
			email: _email,
			loginType: _type
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'loginsocial',
			inputData: _scope.socialLogin
		}, function(data){
			_appConstant.currentUser = data[0];
			_appConstant.currentUser.name = _appConstant.currentUser.name?_appConstant.currentUser.name:_email;
			_scope.loggedUser = _appConstant.currentUser;
			console.log(_appConstant.currentUser);
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			$('#signUpModal').modal('hide');
			$('#loginModal').modal('hide');
		}, function(err){
			_services.toast.show('Invalid Email/Password.');
		});
	}
	
	_scope.googleLoginSuccess = function(_googleUser) {
		console.log(_googleUser);
		_scope.accessToken = _googleUser.Zi.access_token;
		_scope.profile = _googleUser.getBasicProfile();
		_scope.googleUser.name = _scope.profile.getName();
		_scope.googleUser.email = _scope.profile.getEmail();
		_scope.googleUser.profilePicture = _scope.profile.getImageUrl();
		
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signupsocial',
			inputData: _scope.googleUser
		}, function(res){
			_appConstant.currentUser.name = _scope.googleUser.name;
			_appConstant.currentUser.email = _scope.googleUser.email;
			_appConstant.currentUser.userId = res.insertId;
			_appConstant.currentUser.profilePicture = _scope.googleUser.profilePicture;
			_appConstant.currentUser.loginType = 'GOOGLE';
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Your account has created successfully.');
			$('#signUpModal').modal('hide');
			$('#loginModal').modal('hide');
		}, function(err) {
			if(err.data == 'ER_DUP_ENTRY') {
				_scope.socialLogin(_scope.googleUser.email, 'GOOGLE');
			} else {
				_services.toast.show(err.data);
			}
		});
		/*console.log('ID: ' + _scope.profile.getId()); 
		console.log('Name: ' + _scope.profile.getName());
		console.log('Image URL: ' + _scope.profile.getImageUrl());
		console.log('Email: ' + _scope.profile.getEmail());*/ 
	}
	
	_scope.googleLoginFailure = function(obj) {
		console.log(obj)
	}
	
	/*log out from app, google, fb*/
	_scope.doLogout = function() {
		_appConstant.currentUser = {};
		_scope.loggedUser = {};
		_scope.loggedIn = false;
		localStorage.removeItem('backMeUser');
		gapi.auth2.getAuthInstance().disconnect().then(function(){
			_appConstant.currentUser = {};
			_scope.loggedUser = {}
			_scope.$apply();
		});
		Facebook.logout(function() {
			_scope.$apply(function() {
				_scope.loggedUser = {}
			});
		});
		_state.go('home')
	}
	
	_window.renderGoogleButton = function() {
		gapi.signin2.render('googleLogin', {
			'scope': 'profile email',
			'width': 240,
			'height': 50,
			'longtitle': true,
			'theme': 'dark',
			'onsuccess': _scope.googleLoginSuccess,
			'onfailure': _scope.googleLoginFailure
		});
    }
	/*End the google sign in*/
	
	/*begin the facebook login*/
	_scope.$watch(
		function() {
		  return Facebook.isReady();
		},
		function(newVal) {
		  if (newVal)
			_scope.facebookReady = true;
		}
	);
      
	_scope.userIsConnectedInFB = false;

	_scope.getFacebookUser = function() {
		Facebook.api('/me', function(response) {
			_scope.$apply(function() {
				_appConstant.currentUser.name = response.name;
				_appConstant.currentUser.email = response.name;
				_scope.loggedUser = _appConstant.currentUser;
				localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
				_scope.loggedIn = true;
				$('#signUpModal').modal('hide');
				$('#loginModal').modal('hide');
			});
		});
	}
	
	Facebook.getLoginStatus(function(response) {
		if (response.status == 'connected') {
			_scope.$apply(function() {
				_scope.userIsConnectedInFB = true;
			});
			_scope.getFacebookUser();
		}
	});
      
	_scope.loginWithFacebook = function() {
		if(!_scope.userIsConnectedInFB) {
			Facebook.login(function(response) {
				if (response.status == 'connected') {
					_scope.getFacebookUser();
				}
			});
		}
	};
  /*end the facebook login*/	
	/*Begin the common functions for the application*/
	$(document).off('hidden.bs.modal');
	$(document).on('hidden.bs.modal', function () {
		if($(".modal.fade.in").length > 0) {
			$('body').addClass('modal-open');
		}
		if(!$(".modal.fade.in").length) {
			$('body').css('padding-right',0);
		}
	});
	
	_rootScope.$on("$locationChangeSuccess", function (event, currentRoute, previousRoute) {
		$('#backme-page').scrollTop(0);
	});
	/*End the common functions for the application*/

}]);

