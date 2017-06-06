'use strict';
backMe.controller('previewCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'Upload', 'appConstant', '$rootScope', '$sce', function(_scope, _services, _timeout, _state, _http, _appConstant, _rootScope, _sce){
	_scope.step = 5;
	_scope.stepsTitle = "Your Project Preview";
	_scope.projectId = _state.params.projectId;
	
	if(_rootScope.images.length == 0) {
		angular.forEach(_scope.project.projectsassets, function(_obj, _index){
			console.log(_obj);
			_rootScope.images.push({
				id : _index+1,
				thumbUrl : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
				url : _obj.type=='Video' ? _obj.location : 'uploads/'+_obj.location,
				extUrl : '',
				type: _obj.type=='Video' ? 'Video' : 'Image',
				videoId: _obj.videoId,
				videoUrl: 'http://www.youtube.com/embed/'+_obj.videoId+'?autoplay=0&showinfo=0&rel=0&loop=1'
			});
		});
	}

	_scope.spendData = [];
	angular.forEach(_scope.project.spendmoney, function(obj, index){
		_scope.spendData.push({
			label: obj.description,
			value: obj.amount,
			color: _scope.pieColors[index]
		});
	});

	generateSpendMoneyGraph(_scope.spendData);
	
	_scope.submitProject = function() {
		if(_scope.project.posterImg || _scope.project.projectImages) {
			delete _scope.project.posterImg;
		  	delete _scope.project.projectImages;
		}		
		_scope.project.status = 'ACTIVE';
		_scope.data = _scope.project;
		_http.upload({
			method: 'POST',
			url: _appConstant.baseUrl + 'projects',
			data: _scope.data
		}).then(function (data) {
			_services.toast.show('<img src="../assets/icons/checked.png" class="toast-tick"/>Project created successfully !!');
			_state.go('dashboard');
		}, function (err) {
			_services.toast.show(err.data);
			console.log(err);
		});
	}
	
	function generateSpendMoneyGraph(spendData) {
		var svg = d3.select("#spendmoneyGraph").append("svg").attr("width",300).attr("height",300);
		svg.append("g").attr("id","spendmoney");
		Donut3D.draw("spendmoney", spendData, 150, 150, 130, 100, 30, 0.4);
	}

	_scope.playVideo = function(img) {
		console.log('Play Video', img.videoId);
	}
	
}]);