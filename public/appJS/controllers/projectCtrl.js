'use strict';
backMe.controller('projectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', function(_scope, _services, _timeout, _state, _appConstant){

	console.log('projectCtrl');
	/*if(!_scope.loggedIn) {
		_state.go('home')
	}*/
	
	_scope.projectId = _state.params.projectId;
    _scope.loggedUserId = _appConstant.currentUser.userId;
	_scope.project = {};
    _scope.support = {
        amount: ''
    }
	_scope.images = [];
    _scope.comment = {
        commentInput: ''
    };
	_scope.pieColors = ["#4d9839", "#db4d0d", "#f18b17", "#ecca34", "#01779a"];

	_scope.init = function() {
		_scope.images = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projects/' + _scope.projectId +'?userId='+_scope.loggedUserId
		}, function(data){
			if(_scope.project.length == 0) {
				_state.go('home');
			}
			_scope.project = data;
            _scope.loadSimilarProjects(_scope.project.category);
			angular.forEach(_scope.project.projectsassets, function(_obj, _index){
				_scope.images.push({
					id : _index+1,
					thumbUrl : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
					url : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
					extUrl : '',
					type: _obj.type=='Video'? 'Video' : 'Image',
					videoId: _obj.videoId,
					videoUrl: 'http://www.youtube.com/embed/'+_obj.videoId+'?autoplay=0&showinfo=0&rel=0&loop=1'
				});
			});
			_scope.images.unshift({
				id : 0,
				thumbUrl : 'uploads/'+_scope.project.coverImage,
				url : 'uploads/'+_scope.project.coverImage,
				extUrl : '',
				type: 'Image',
				videoId: '',
				videoUrl: ''
			});
			//generateRemainDaysGraph(_scope.project.remaindayshours[0].totalDays, _scope.project.remaindayshours[0].remainDays);
			_scope.spendData = [];
			angular.forEach(_scope.project.spendmoney, function(obj, index){
				_scope.spendData.push({
					label: obj.description,
					value: obj.amount,
					color: _scope.pieColors[index]
				});
			});
			generateSpendMoneyGraph(_scope.spendData);
			
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();
    
    _scope.similarProjects = {};
    _scope.loadSimilarProjects = function(_query) {
		_scope.similarProjects = {};
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'search?q=' + _query
		}, function(data){
			_scope.similarProjects = data;
		}, function(err) {
			console.log(err)
		});
	}
	//_scope.searchProjects('');


    _scope.addViews = function(_projectId, _userId) {
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'views',
            inputData: {projectId: _projectId, userId: _userId}
		}, function(data){
		}, function(err) {
		});
    }
    _scope.addViews(_scope.projectId, _scope.loggedUserId);

    _scope.addLike = function(_project) {
        if(!_appConstant.currentUser.userId)
            return;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'likes',
            inputData: {projectId: _project.projectId, userId: _scope.loggedUserId}
		}, function(data){
            _project.remaindayshours[0].likesCount = _project.remaindayshours[0].likesCount + 1;
            _project.remaindayshours[0].alreadyLiked = 1;
		}, function(err) {
		});
    }
    _scope.comments = {};
    _scope.getComments = function(_comment, _projectId) {
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'comments/'+_scope.projectId
		}, function(data){
           _scope.comments = data;
		}, function(err) {
		});
    }
    _scope.getComments();
    
    _scope.addComment = function(_comment, _projectId) {
        if(!_scope.loggedUserId)
            return;
		_services.http.serve({
			method: 'PUT',
			url: _appConstant.baseUrl + 'comments',
            inputData: {projectId: _projectId, userId: _scope.loggedUserId, comment: _comment}
		}, function(data){
           _services.toast.show('Comment added successfully.');
            _scope.comments.unshift({comments:{comment:_comment, commentedOn: new Date()}, 
                                     users:{name:_appConstant.currentUser.name, profilePicture:_appConstant.currentUser.profilePicture, loginType:_appConstant.currentUser.loginType}});
            _scope.comment.commentInput = "";
		}, function(err) {
		});
    }
    console.log('_scope.loggedUserId', _scope.loggedUserId);
    
    
	_scope.showSupportMe = true;
	
	_scope.supportMe = function() {
		_scope.showSupportMe = false;
	}

	_scope.supportMeContinue = function(_amt) {
		_state.go('checkout', {projectId: _scope.projectId, amount: _amt});
	}
	
	function generateRemainDaysGraph(totaldays, remaindays) {
		console.log(totaldays, remaindays)
		var width = 65,
			height = 65,
			twoPi = 2 * Math.PI,
			progress = 0,
			total = totaldays,
			completed = totaldays - remaindays,
			formatPercent = d3.format(".0%");

		var arc = d3.svg.arc()
			.startAngle(0)
			.innerRadius(28)
			.outerRadius(32);

		var svg = d3.select(".completed-days").append("svg")
			.attr("width", width)
			.attr("height", height)
		  	.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var meter = svg.append("g")
			.attr("class", "progress-meter");

		meter.append("path")
			.attr("class", "background")
			.attr("d", arc.endAngle(twoPi));

		var foreground = meter.append("path")
			.attr("class", "foreground");

		/*var text = meter.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em");*/
		  
		var i = d3.interpolate(progress, completed / total);
		d3.transition().tween("progress", function() {
			return function(t) {
			  progress = i(t);
			  foreground.attr("d", arc.endAngle(twoPi * progress));
			  //text.text(formatPercent(progress));
			};
		});
	}
	
	function generateSpendMoneyGraph(spendData) {

		var svg = d3.select("#spendmoneyGraph").append("svg").attr("width",300).attr("height",300);

		svg.append("g").attr("id","spendmoney");

		Donut3D.draw("spendmoney", spendData, 150, 150, 130, 100, 30, 0.4);
	}

}]);