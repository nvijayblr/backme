'use strict';
backMe.controller('appCtrl', ['$scope', 'BaseServices', '$timeout', '$rootScope', '$window', '$state', '$mdToast', 'appConstant', 'Facebook',  function(_scope, _services, _timeout, _rootScope, _window, _state, _mdToast, _appConstant, Facebook){
	
	_scope.appConstant = _appConstant;
	_scope.loginSettings = {
		email : '',
		password: ''
	}
	_scope.signUpSettings = {
		email : '',
		password: ''
	}
	
	_scope.loggedUser = {};
	_scope.loggedIn = false;
	_scope.showPassword = true;
	_scope.showSearch = false;
	
	if(_appConstant.currentUser != '') {
		_scope.loggedUser = _appConstant.currentUser;
		_scope.loggedIn = true;
	} else {
		_appConstant.currentUser = {};
	}

	_scope.startSearch = function() {
		_scope.showSearch = true;
	}
	_scope.closeSearch = function() {
		_scope.showSearch = false;
	}
	
	_scope.showLogin = function() {
		_scope.loginSettings = {
			email : '',
			password: ''
		}
		_scope.showPassword = true;
		$('#signUpModal').modal('hide');
		$('#loginModal').modal('show');
	}
	_scope.showSignUp = function() {
		_scope.signUpSettings = {
			email : '',
			password: ''
		}
		_scope.showPassword = true;
		$('#loginModal').modal('hide');
		$('#signUpModal').modal('show');
	}
	
	_scope.showSignUpComplete = function() {
		$('#signUpModal').modal('hide');
		$('#signUpFinishModal').modal('show');
	}
	
	_scope.finishSignup = function() {
		$('#signUpFinishModal').modal('hide');
	}
	
	_scope.showHidePassword = function() {
		_scope.showPassword = !_scope.showPassword;
	}

	_scope.startProject = function() {
		if(_scope.loggedIn) {
			_state.go('create.startproject')
		} else {
			_scope.showLogin();
		}
	}
	
	_scope.appLogin = function(_email, _pass) {
		if(!_email || !_pass) {
			_services.toast.show('Please enter the Email or password');
			return;
		}
		_scope.data
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'login',
			inputData: _scope.loginSettings
		}, function(data){
			_appConstant.currentUser = data[0];
			_appConstant.currentUser.name = _email;
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			$('#loginModal').modal('hide');
		}, function(err){
			_services.toast.show('Invalid Email/Password.');
		});
	}
	

	_scope.appSignup = function(_email, _pass) {
		if(!_email || !_pass) {
			_services.toast.show('Please enter the email id or password');
			return;
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signup',
			inputData: _scope.signUpSettings
		}, function(data){
			$('#signUpModal').modal('hide');
			_appConstant.currentUser.name = _email;
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
		}, function(err) {
			_services.toast.show(err.data);
		});
	}
	
	/*Begin the google sign in*/
	var auth2; 
	//uncomment this
	gapi.load('auth2', function(){
		auth2 = gapi.auth2.init({
			client_id: _appConstant.googleClientId + '.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile'
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
	
	_scope.profile = {};
	_scope.googleLoginSuccess = function(_googleUser) {
		_scope.profile = _googleUser.getBasicProfile();
		_appConstant.currentUser.name = _scope.profile.getName();
		_appConstant.currentUser.email = _scope.profile.getId();
		_scope.loggedUser = _appConstant.currentUser;
		_scope.loggedIn = true;
		localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
		_scope.$apply();
		$('#signUpModal').modal('hide');
		$('#loginModal').modal('hide');
		/*console.log('ID: ' + _scope.profile.getId()); 
		console.log('Name: ' + _scope.profile.getName());
		console.log('Image URL: ' + _scope.profile.getImageUrl());
		console.log('Email: ' + _scope.profile.getEmail());*/ 
	}
	
	_scope.googleLoginFailure = function(obj) {
		console.log(obj)
	}
	
	/*log out from app, google, fb*/
	_scope.doLotout = function() {
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
		_appConstant.currentUser = {};
		_scope.loggedUser = {};
		_scope.loggedIn = false;
		localStorage.removeItem('backMeUser');
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

