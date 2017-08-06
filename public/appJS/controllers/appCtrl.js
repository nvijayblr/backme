'use strict';
backMe.controller('appCtrl', ['$scope', 'BaseServices', '$timeout', '$rootScope', '$window', '$state', '$mdToast', 'appConstant', 'Facebook', '$http', '$anchorScroll', '$location', 'socialLoginService', function(_scope, _services, _timeout, _rootScope, _window, _state, _mdToast, _appConstant, Facebook, _http, _anchorScroll, _location, _socialLoginService){
	console.log('appCtrl');
	_scope.appConstant = _appConstant;
	_scope.isAdmin = false;
	_rootScope.isAdminLoginPage = false;	
	_scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		_scope.isAdmin = false;
		if(toState.name.substr(0,5) == 'admin') {
			_scope.isAdmin = true;
		}
	});
	
	_scope.loginSettings = {
		email : '',
		password: ''
	}
	_scope.signUpSettings = {
		email : '',
		password: '',
		name: '',
		agree: false
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

	_scope.bankList = [
		{'name': 'AB Bank'},
		{'name': 'Abu Dhabi Commercial Bank'},
		{'name': 'Allahabad Bank'},
		{'name': 'American Express'},
		{'name': 'Andhra Bank'},
		{'name': 'Antwerp Diamond Bank'},
		{'name': 'Australia and New Zealand Banking Group'},
		{'name': 'Axis bank'},
		{'name': 'Bandhan Bank'},
		{'name': 'Bank Internasional Indonesia'},
		{'name': 'Bank of America'},
		{'name': 'Bank of Bahrain and Kuwait'},
		{'name': 'Bank of Baroda'},
		{'name': 'Bank of Ceylon'},
		{'name': 'Bank of India'},
		{'name': 'Bank of Maharashtra'},
		{'name': 'Bank of Nova Scotia'},
		{'name': 'Bank of Tokyo-Mitsubishi'},
		{'name': 'Barclays Bank'},
		{'name': 'BNP Paribas'},
		{'name': 'Canara Bank'},
		{'name': 'Catholic Syrian Bank'},
		{'name': 'Central Bank of India'},
		{'name': 'Chinatrust Commercial Bank'},
		{'name': 'Citibank'},
		{'name': 'City Union Bank'},
		{'name': 'Commonwealth Bank of Australia'},
		{'name': 'Corporation Bank'},
		{'name': 'Credit Agricole'},
		{'name': 'Credit Suisse'},
		{'name': 'DBS Bank'},
		{'name': 'DCB Bank'},
		{'name': 'Dena Bank'},
		{'name': 'Deutsche Bank'},
		{'name': 'Dhanlaxmi Bank'},
		{'name': 'Doha bank'},
		{'name': 'FirstRand Bank'},
		{'name': 'HDFC Bank'},
		{'name': 'HSBC'},
		{'name': 'HSBC Bank Oman'},
		{'name': 'ICICI Bank'},
		{'name': 'IDBI Bank'},
		{'name': 'IDFC Bank'},
		{'name': 'Indian Bank'},
		{'name': 'IndusInd Bank'},
		{'name': 'Industrial & Commercial Bank of China'},
		{'name': 'Jammu and Kashmir Bank'},
		{'name': 'Karnataka Bank'},
		{'name': 'Karur Vysya Bank'},
		{'name': 'Krung Thai Bank'},
		{'name': 'Mashreq Bank'},
		{'name': 'Mizuho Corporate Bank'},
		{'name': 'National Australia Bank'},
		{'name': 'Rabobank'},
		{'name': 'RBL Bank'},
		{'name': 'Royal Bank of Scotland (RBS N.V)'},
		{'name': 'Sberbank'},
		{'name': 'Shinhan Bank'},
		{'name': 'Societe Generale'},
		{'name': 'Sonali Bank'},
		{'name': 'South Indian Bank'},
		{'name': 'Standard Chartered Bank'},
		{'name': 'State Bank of Mauritius'},
		{'name': 'Sumitomo Mitsui Banking'},
		{'name': 'UBS AG'},
		{'name': 'United Bank of India'},
		{'name': 'United Overseas Bank'},
		{'name': 'VTB'},
		{'name': 'Westpac Banking Corporation'},
		{'name': 'Woori Bank'},
		{'name': 'Equitas Small Finance Bank'},
		{'name': 'Federal Bank'},
		{'name': 'Indian Overseas Bank'},
		{'name': 'J.P. Morgan Chase Bank'},
		{'name': 'Kotak Mahindra Bank'},
		{'name': 'Lakshmi Vilas Bank'},
		{'name': 'Nainital Bank'},
		{'name': 'Oriental Bank of Commerce'},
		{'name': 'Punjab & Sindh Bank'},
		{'name': 'Punjab National Bank'},
		{'name': 'State Bank of India'},
		{'name': 'Syndicate Bank'},
		{'name': 'Tamilnad Mercantile Bank Limited'},
		{'name': 'UCO Bank'},
		{'name': 'Union Bank of India'},
		{'name': 'Vijaya Bank'},
		{'name': 'Yes Bank'}
	];

	/*Autocomplete - City related functions*/
	_scope.cityList = {};
	_scope.loadAllCities = function(_callback) {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'cities'
		}, function(data){
			_scope.cityList = data.map( function (_obj) {
				return {
					value: _obj.city.toLowerCase(),
					display: _obj.city
				};
			});
			return _callback(_scope.cityList);
		}, function(err) {
		});
    }	
	
	_rootScope.projectCreated = false;
	
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
		_scope.isSeeAll = false;
		_scope.categoryKey = _query;
		_scope.projects = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'search?q=' + _query+'&userId='+_appConstant.currentUser.userId
		}, function(data){
			_scope.projects = data;
			_scope.pageSize = 6;
			_services.pagination.init(_scope, _scope.projects);
		}, function(err) {
			console.log(err)
		});
	}
	//_scope.searchProjects('');
	_scope.isSeeAll = false;
	_scope.seeAll = function(_type) {
		_scope.type = _type;
		_scope.isSerchPage = true;
		_scope.isSeeAll = true;
		_scope.projects = [];
		_scope.category = '';
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'bySocial?q='+_type+'&limit=1000000&category='+_scope.category+'&userId='+_appConstant.currentUser.userId
		}, function(data){
			_scope.projects = data[_type];
			_scope.pageSize = 6;
			_services.pagination.init(_scope, _scope.projects);
			/*_location.hash('banner');
			_anchorScroll();*/
			$('#backme-page').scrollTop(0);
		}, function(err) {
			console.log(err)
		});

	}
	_scope.loadFaouriteProjects = function() {
		_scope.isSerchPage = true;
		_scope.isSeeAll = true;
		_scope.projects = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'favProjects?userId=' + _appConstant.currentUser.userId
		}, function(data){
			_scope.projects = data;
			_scope.pageSize = 6;
			_services.pagination.init(_scope, _scope.projects);
		}, function(err) {
			console.log(err)
		});

	}
	
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
		if (_keyEvent.which == 13) {
			_scope.startSearch();
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
		if($(".md-chip-input-container input.md-input").eq(0).val()) {
			_scope.searchKeywords.push($(".md-chip-input-container input.md-input").eq(0).val());
			$(".md-chip-input-container input.md-input").eq(0).val('');
		}
		if(_scope.searchKeywords.length) {
			if(_state.current.url != '/home') {
				_state.go('home');
			}
			location.href="/#/home?search="+_scope.searchKeywords.join(',')
			_scope.isSerchPage = true;
			_scope.searchKeywordsList = _scope.searchKeywords.join(', ')
			_scope.searchProjects(_scope.searchKeywords.join('|'));
		}
	}
	if(location.href.split('?search=')[1]) {
		_scope.showSearchBar()
		_scope.searchKeywords = location.href.split('?search=')[1].split(',');
		_scope.startSearch();
	}
	
	_scope.gotoHome = function() {
		if(_scope.isSerchPage) {
			_scope.closeSearch();
			location.href="/#/home";
			_scope.$broadcast('loadInitProjects');
		} else {
			_state.go('home');
			_scope.$broadcast('loadInitProjects');
		}
		_scope.isFavouritePage = false;
	}
	_scope.isFavouritePage = false;
	_scope.gotoFavourites = function() {
		if(_state.current.name == 'home') {
			location.href="/#/home?favourites";
			_scope.loadFaouriteProjects();
		} else {
			_scope.isSerchPage = false;
			location.href="/#/home?favourites";
		}
		_scope.isFavouritePage = true;
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
	_scope.signupFrom = '';
	_scope.showSignUp = function(_signupFrom) {
		_scope.app.signupForm.$setPristine();
		_scope.app.signupForm.$setUntouched();
		_scope.app.signupForm.$submitted = false;
		_scope.signupFrom = _signupFrom;
		_scope.signUpSettings = {
			email : '',
			password: '',
			name: '',
			agree: false
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
			if(_scope.signupFrom == 'basicInfo') {
				_timeout(function() {
					$("#basicNext").trigger('click');
				}, 1000);
			}
			_scope.signupFrom = '';
		}, function(err){
			_services.toast.show('Invalid Email/Password.');
		});
	}
	
	_scope.finishSignup = function(_email, _pass, _name) {
		if(!_email || !_pass) {
			_services.toast.show('Email/Password should not be blank.');
			return;
		}
		/*_scope.signUpData = {
			email : _email,
			password: _pass,
			name: _name
		}*/
		_scope.signUpData = {
			email : _email,
			password: _pass
		}
		$('#signUpFinishModal').modal('hide');
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signup',
			inputData: _scope.signUpData
		}, function(res){
			$('#signUpModal').modal('hide');
			$('#signUpFinishModal').modal('hide');
			_appConstant.currentUser.name = _email;
			_appConstant.currentUser.email = _email;
			_appConstant.currentUser.userId = res.insertId;
			console.log(_appConstant.currentUser)
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Your account has created successfully.');
			if(_scope.signupFrom != 'basicInfo') {
				_state.go('create.startproject');
			} else {
				_timeout(function() {
					$("#basicNext").trigger('click');
				}, 1000);
			}
			_scope.signupFrom = '';
		}, function(err) {
			_services.toast.show(err.data);
		});
	}
	
	_scope.appSignup = function(_email, _pass, _name) {
		_scope.finishSignup(_email, _pass, _name);
		//$('#signUpModal').modal('hide');
		//$('#signUpFinishModal').modal('show');
	}

	_scope.showForgetPassword = function() {
		_scope.signUpSettings.email = '';
		$('#loginModal').modal('hide');
		$('#signUpModal').modal('hide');
		$('#forgetPasswordModal').modal('show');
	}

	_scope.appForgetPassword = function(_email) {
		if(!_email) return;
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'forgotpassword/'+_email
		}, function(res){
			$('#forgetPasswordModal').modal('hide');
			if(res=='EMAILNOTFOUND')
				_services.toast.show('Email not found.');
			else
				_services.toast.show('Temporary password has been sent to your email.');
		}, function(err) {
			_services.toast.show(err.data);
		});
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
		_scope.socialLoginData = {
			email: _email,
			loginType: _type
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'loginsocial',
			inputData: _scope.socialLoginData
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
		_scope.accessToken = _googleUser.Zi.access_token;
		_scope.profile = _googleUser.getBasicProfile();
		_scope.googleUser = {
			name: _scope.profile.getName(),
			email: _scope.profile.getEmail(),
			profilePicture: _scope.profile.getImageUrl(),
			loginType: 'GOOGLE',
			googleplus: _scope.profile.getId()
		}
		console.log(_scope.googleUser);
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
			console.log(_scope.googleUser.email);
			if(err.data == 'ER_DUP_ENTRY') {
				_scope.socialLogin(_scope.googleUser.email, 'GOOGLE');
			} else {
				_services.toast.show(err.data);
			}
		});
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
	_scope.facebookLoginSuccess = function(_fbUser) {
		_scope.fbUser = {
			name: _fbUser.name,
			email: _fbUser.email ? _fbUser.email : _fbUser.id,
			loginType: 'FACEBOOK',
			profilePicture: _fbUser.picture.data.url ? _fbUser.picture.data.url : '',
			facebook: _fbUser.id
		}
		_services.http.serve({
			method: 'POST',
			url: _appConstant.baseUrl + 'signupsocial',
			inputData: _scope.fbUser
		}, function(res){
			_appConstant.currentUser.name = _fbUser.name;
			_appConstant.currentUser.email = _fbUser.id;
			_appConstant.currentUser.userId = res.insertId;
			_appConstant.currentUser.loginType = 'FACEBOOK';
			_scope.loggedUser = _appConstant.currentUser;
			localStorage.setItem('backMeUser', JSON.stringify(_appConstant.currentUser));
			_scope.loggedIn = true;
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Your account has created successfully.');
			$('#signUpModal').modal('hide');
			$('#loginModal').modal('hide');
		}, function(err) {
			if(err.data == 'ER_DUP_ENTRY') {
				_scope.socialLogin(_scope.fbUser.email, 'FACEBOOK');
			} else {
				_services.toast.show(err.data);
			}
		});
	}

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
		Facebook.api('/me', {fields: ['name', 'link', 'email', 'picture']}, function(response) {
			console.log(response);
			_scope.facebookLoginSuccess(response);
		});
	}
	
	Facebook.getLoginStatus(function(response) {
		if (response.status == 'connected') {
			_scope.$apply(function() {
				_scope.userIsConnectedInFB = true;
			});
			_scope.getFacebookUser(response);
		}
	});
      
	_scope.loginWithFacebook = function() {
		if(!_scope.userIsConnectedInFB) {
			Facebook.login(function(response) {
				if (response.status == 'connected') {
					_scope.getFacebookUser(response);
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
	$("body").on('click', '.pagination-link', function() {
		$('#backme-page').scrollTop(0);
	});
	/*End the common functions for the application*/

}]);

