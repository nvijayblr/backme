'use strict';
backMe.controller('appCtrl', ['$scope', 'BaseServices', '$timeout', '$rootScope', '$window', function(_scope, _services, _timeout, _rootScope, _window){

	console.log('app controller...')
	_scope.loginSettings = {
		loginId : '',
		password: ''
	}
	_scope.signUpSettings = {
		loginId : '',
		password: ''
	}
	_scope.showPassword = true;
	_scope.showLogin = function() {
		_scope.showPassword = true;
		$('#signUpModal').modal('hide');
		$('#loginModal').modal('show');
	}
	_scope.showSignUp = function() {
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
		console.log('ddd')
		window.scrollTo(0, 0);
	});
	
    var auth2;
    
    _scope.user = {};

    _window.appStart = function() {
        console.log('appStart()');
        gapi.load('auth2', initSigninV2);
    };

    var initSigninV2 = function() {
        console.log('initSigninV2()');
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged);

        if(auth2.isSignedIn.get() == true) {
            auth2.signIn();
        }
    };

    var signinChanged = function(isSignedIn) {
        console.log('signinChanged() = ' + isSignedIn);
        if(isSignedIn) {
            console.log('the user must be signed in to print this');
            var googleUser = auth2.currentUser.get();
            var authResponse = googleUser.getAuthResponse();
            var profile = googleUser.getBasicProfile();
            _scope.user.id          = profile.getId();
            _scope.user.fullName    = profile.getName();
            _scope.user.firstName   = profile.getGivenName();
            _scope.user.lastName    = profile.getFamilyName();
            _scope.user.photo       = profile.getImageUrl();
            _scope.user.email       = profile.getEmail();
            _scope.user.domain      = googleUser.getHostedDomain();
            _scope.user.timestamp   = moment().format('x');
            _scope.user.ip          = VIH_HostIP;
            _scope.user.idToken     = authResponse.id_token;
            _scope.user.expiresAt   = authResponse.expires_at;
            _scope.$digest();
        } else {
            console.log('the user must not be signed in if this is printing');
            _scope.user = {};
            _scope.$digest();
        }
    };

    var userChanged = function(user) {
        console.log('userChanged()');
    };
    
    _scope.signOut = function() {
        console.log('signOut()');
        auth2.signOut().then(function() {
            signinChanged(false);    
        });
        console.log(auth2);
    };
    
    _scope.disconnect = function() {
        console.log('disconnect()');
        auth2.disconnect().then(function() {
            signinChanged(false);
        });
        console.log(auth2);
    };

}]);

