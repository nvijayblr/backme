'use strict';
backMe.controller('createprojectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', function(_scope, _services, _timeout, _state, _appConstant){
	console.log('createprojectCtrl');
	if(!_scope.loggedIn) {
		_state.go('home')
	}
	_scope.projectId = 'new';
	
	_scope.userId = _appConstant.currentUser.userId;
	
	_scope.project = {
		"title": "",
		"category": "",
		"location": "",
		"coverImage": "",
		"about": "",
		"description": "",
		"videosImages": "",
		"moneyNeeded": "",
		"endByDate": "",
		"userId": _scope.userId,
		"name": "",
		"userPhoto": "",
		"email": "",
		"mobileNumer": "",
		"accountName": "",
		"accountNo": "",
		"ifscCode": "",
		"facebook": "",
		"twitter": "",
		"googleplus": "",
		"status": "DRAFT",
		"noOfDays": "",
		"daysDate": ""
	  };
	_scope.disableStartProject = true;
	_scope.cityList = [
		  {'state': 'KA', 'city': 'Banglore',},
		  {'state': 'KA', 'city': 'Mysore',},
		  {'state': 'TN', 'city': 'Chennai',},
		  {'state': 'TN', 'city': 'Coimbatore',}
	];
	_scope.categoryList = [
		  {'name': 'Signer'},
		  {'name': 'Drama'},
		  {'name': 'Music'},
		  {'name': 'Test'}
	];

	_scope.getProjectByUser = function() {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projectsByUser?userId=1&status=DRAFT'
		}, function(data){
			if(data.length) {
				_scope.projectId = data[0].projectId;
				_scope.project = data[0];
				_scope.project.endByDate = _scope.project.endByDate ? moment(_scope.project.endByDate).toDate() : null;
				_scope.project.endByDate = (_scope.project.endByDate == 'Invalid Date') ? null : _scope.project.endByDate;
			}
			_scope.disableStartProject = false;
		}, function(err) {
			console.log(err)
		});
	}
	_scope.getProjectByUser();
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