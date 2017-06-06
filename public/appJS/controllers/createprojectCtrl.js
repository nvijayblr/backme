'use strict';
backMe.controller('createprojectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', '$rootScope', function(_scope, _services, _timeout, _state, _appConstant, _rootScope){
	console.log('createprojectCtrl');
	console.log(_state);
	
	if(!_scope.loggedIn && _state.current.url != '/startproject' && _state.current.url != '/basicinfo/:projectId') {
		_state.go('home');
	}
	_scope.projectId = 'new';
	
	_scope.userId = _appConstant.currentUser.userId;
	
	_scope.pieColors = ["#4d9839", "#db4d0d", "#f18b17", "#ecca34", "#01779a"];

	_scope.projectMinDate = moment().toDate();
	_scope.projectMaxDays = _appConstant.projectMaxDays;
	_scope.projectMaxDate = moment().add(_appConstant.projectMaxDays,'days').toDate();
	
	console.log(_appConstant.currentUser.email);
	
	_scope.project = {
		"title": "",
		"category": "",
		"location": "",
		"coverImage": "",
		"about": "",
		"description": "",
		"videosImages": "",
		"moneyNeeded": "",
		"endByDate": moment().toDate(),
		"userId": _scope.userId,
		"name": "",
		"userPhoto": "",
		"email": _appConstant.currentUser.email,
		"mobileNumer": "",
		"accountName": "",
		"accountNo": "",
		"ifscCode": "",
		"facebook": "",
		"twitter": "",
		"googleplus": "",
		"status": "DRAFT",
		"noOfDays": "",
		"daysDate": "Days"
	  };
	_scope.disableStartProject = true;
	_scope.bankList = [
		  {'name': 'ICICI'},
		  {'name': 'HDFC'},
		  {'name': 'SBI'},
		  {'name': 'CITI'}
	];
	
	
	_rootScope.images = [];
	_scope.getProjectByUser = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projectsByUser?userId='+_scope.userId+'&status=DRAFT'
		}, function(data){
			if(data.length) {
				_scope.projectId = data[0].projectId;
				_scope.project = data[0];
				if(_scope.project.category.substr(0,7) == 'Others|') {
					_scope.project.otherCategory = _scope.project.category.substr(7, _scope.project.category.length);
					_scope.project.category = 'Others';
				}
				_scope.project.location = {
					value: _scope.project.location.toLowerCase(),
					display: _scope.project.location
				}
				_scope.project.endByDate = _scope.project.endByDate ? moment(_scope.project.endByDate).toDate() : moment().toDate();
				_scope.project.endByDate = _scope.project.endByDate=='Invalid Date' ? moment().toDate() : _scope.project.endByDate;
				_scope.project.facebook = Boolean(_scope.project.facebook);
				_scope.project.twitter = Boolean(_scope.project.twitter);
				_scope.project.googleplus = Boolean(_scope.project.googleplus);
				_scope.project.email = _scope.project.email ? _scope.project.email : _appConstant.currentUser.email;
				_scope.project.name = _scope.project.name ? _scope.project.name : _appConstant.currentUser.name;
				_scope.addRewardsSpendFields(_scope.projectId);			
			}
			angular.forEach(_scope.project.projectsassets, function(_obj, _index){
				_rootScope.images.push({
					id : _index+1,
					thumbUrl : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
					url : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
					extUrl : '',
					type: _obj.type=='Video'? 'Video' : 'Image',
					videoId: _obj.videoId,
					videoUrl: 'http://www.youtube.com/embed/'+_obj.videoId+'?autoplay=0&showinfo=0&rel=0&loop=1'
				});
			});
			
			_scope.spendData = [];
			angular.forEach(_scope.project.spendmoney, function(obj, index){
				_scope.spendData.push({
					label: obj.description,
					value: obj.amount,
					color: _scope.pieColors[index]
				});
			});
			generateSpendMoneyGraph(_scope.spendData);
			
			_scope.disableStartProject = false;
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.getProjectByUser();
	
	
	_scope.addRewardsSpendFields = function(_projectId) {
		if(_projectId == 'new') return;
		if(!_scope.project.supportrewards) {
			_scope.project.supportrewards = [];
			_scope.project.supportrewards.push({
				amount: '',
				title: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}
		if(!_scope.project.servicerewards) {
			_scope.project.servicerewards = [];
			_scope.project.servicerewards.push({
				amount: '',
				activityName: '',
				availableDate: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}
		if(!_scope.project.spendmoney) {
			_scope.project.spendmoney = [];
			_scope.project.spendmoney.push({
				amount: '',
				description: '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}	
		if(!_scope.project.team) {
			_scope.project.team = [];
			_scope.project.team.push({
				picture: null,
				name: '',
				designation : '',
				profileLink : '',
				projectId : _projectId,
				userId: _appConstant.currentUser.userId
			});
		}	
		/*if(!_scope.project.projectsassets) {
			_scope.project.projectsassets = [];
		}*/	
	}
	
	function generateSpendMoneyGraph(spendData) {
		var svg = d3.select("#spendmoneyGraph").append("svg").attr("width",300).attr("height",300);
		svg.append("g").attr("id","spendmoney");
		Donut3D.draw("spendmoney", spendData, 150, 150, 130, 100, 30, 0.4);
	}

}]);

 /* {
    "projectId": 1,
    "title": "Sample Title",
    "category": "Drama",
    "location": "Mysore",
    "coverImage": "posterImg-1493801657189.jpg",
    "about": "about aboutabout aboutabout aboutabout aboutabout about",
    "description": "Sample description",
    "videosImages": "",
    "moneyNeeded": 1000,
    "endDate": "2017-05-03T09:24:13.000Z",
    "createdDate": "2017-04-29T11:09:58.000Z",
    "userId": 1,
    "name": "Vijay",
    "userPhoto": "",
    "email": "vijay@gmail.com",
    "mobileNumer": "234234234",
    "accountName": "VIJAY",
    "accountNo": "",
    "ifscCode": "",
    "facebook": "",
    "twitter": "",
    "googleplus": "",
    "status": "DRAFT"
  },
*/