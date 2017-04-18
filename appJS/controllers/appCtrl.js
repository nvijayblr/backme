'use strict';
backMe.controller('appCtrl', ['$scope', 'BaseServices', '$timeout', '$rootScope', '$window', 'appConstant', function(_scope, _services, _timeout, _rootScope, _window, _appConstant){

	_scope.loginSettings = {
		loginId : '',
		password: ''
	}
	_scope.userProfile = {};
	
	_scope.signUpSettings = {
		loginId : '',
		password: ''
	}
	_scope.showPassword = true;
	_scope.showLogin = function() {
		_scope.loginSettings = {
			loginId : '',
			password: ''
		}
		_scope.showPassword = true;
		$('#signUpModal').modal('hide');
		$('#loginModal').modal('show');
	}
	_scope.showSignUp = function() {
		_scope.signUpSettings = {
			loginId : '',
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

	$(document).off('hidden.bs.modal');
	$(".modal").on('hidden.bs.modal', function () {
		if($(".modal.fade.in").length > 0) {
			$('body').addClass('modal-open');
		}
		if(!$(".modal.fade.in").length) {
			$('body').css('padding-right',0);
		}
	});

	_rootScope.$on("$locationChangeSuccess", function (event, currentRoute, previousRoute) {
		window.scrollTo(0, 0);
	});

	_scope.appLogin = function(_email, _pass) {
		if(!_email || !_pass) {
			alert('Please enter the userId or password');
			return;
		}
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'login?email='+_email+'&pass='+_pass
		}, function(data){
			_scope.userProfile.name = _email;
			$('#loginModal').modal('hide');
		});
	}
	

	_scope.appSignup = function(_email, _pass) {
		if(!_email || !_pass) {
			alert('Please enter the email id or password');
			return;
		}
		_scope.signup = {
			'email': _email,
			'pass' : _pass
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signup',
			inputData: _scope.signup
		}, function(data){
			$('#signUpModal').modal('hide');
			_scope.userProfile.name = _email;
		});
	}
	
	/*Begin the google sign in*/
	_scope.profile = {};
	_scope.googleLoginSuccess = function(_googleUser) {
		_scope.profile = _googleUser.getBasicProfile();
		_scope.userProfile.name = _scope.profile.getName();
		console.log(_scope.userProfile.name)
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
	
	_scope.googleLotout = function() {
		gapi.auth2.getAuthInstance().disconnect().then(function(){
			_scope.userProfile = {};
			_scope.$apply();
			console.log('Logged out.');
		});
		_scope.userProfile = {};
	}
	
	_window.renderButton = function() {
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


}]);

