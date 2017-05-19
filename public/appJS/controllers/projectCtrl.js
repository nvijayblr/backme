'use strict';
backMe.controller('projectCtrl', ['$scope', 'BaseServices', '$timeout', '$state', 'appConstant', function(_scope, _services, _timeout, _state, _appConstant){

	console.log('projectCtrl');
	/*if(!_scope.loggedIn) {
		_state.go('home')
	}*/
	
	_scope.projectId = _state.params.projectId;
	_scope.project = {};
	_scope.images = [];
	_scope.pieColors = ["#4d9839", "#db4d0d", "#f18b17", "#ecca34", "#01779a"];

	_scope.init = function() {
		_scope.images = [];
		_services.http.serve({
			method: 'GET',
			url: _appConstant.baseUrl + 'projects/' + _scope.projectId
		}, function(data){
			_scope.project = data;
			angular.forEach(_scope.project.projectsassets, function(_obj, _index){
				_scope.images.push({
					id : _index+1,
					thumbUrl : 'uploads/'+_obj.location,
					url : 'uploads/'+_obj.location,
					extUrl : ''
				});
			});
			generateRemainDaysGraph(_scope.project.remaindayshours[0].totalDays, _scope.project.remaindayshours[0].remainDays);
			_scope.spendData = [];
			angular.forEach(_scope.project.spendmoney, function(obj, index){
				console.log(obj);
				_scope.spendData.push({
					label: obj.description,
					value: obj.amount,
					color: _scope.pieColors[index]
				});
			});
			generateSpendMoneyGraph(_scope.spendData);
			
			if(_scope.project.length == 0) {
				_state.go('home');
			}
		}, function(err) {
			console.log(err)
		});
	}
	
	_scope.init();

	_scope.showSupportMe = true;
	
	_scope.supportMe = function() {
		_scope.showSupportMe = false;
	}

	_scope.supportMeContinue = function() {
		_state.go('checkout');
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