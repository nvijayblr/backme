'use strict';
backMe
.filter('isEmpty', [function() {
    return function(obj) {
		for (var i in obj) if (obj.hasOwnProperty(i)) return false;
		return true;
    };
}])
.filter('getDays', [function() {
    return function(hours) {
		if(hours)
			return ''+Math.floor(hours/24)+'';
		else
			return '0';
    };

}])
.filter('getHours', [function() {
    return function(hours) {
		if(hours)
			return ''+Math.floor(hours%24)+'';
		else
			return '0';
    };
}])
.filter('toLocale', [function() {
    return function(_amt) {
		if(_amt)
			return parseFloat(_amt).toLocaleString();
		else
			return '0';
    };
}])
.filter('toAchivedPercent', [function() {
    return function(_achivedPercent, _amtRec, _amtRaised) {
		if(!_amtRec || !_amtRaised) {
			return 0;
		}
		return Math.round((parseInt(_amtRec)/parseInt(_amtRaised))*100);
    };
}])
.filter('numberToArray', [function() {
    return function(_num) {
		if(_num) {
			return new Array(_num);
		}
    };
}])
.filter('toDayMonth', [function() {
    return function(_date) {
		if(_date) {
			return moment(_date).format('DD MMM');
		}
    };
}])
.filter('trustAsResourceUrl', ['$sce', function(_sce) {
    return function(_videoUrl) {
		return _sce.trustAsResourceUrl(_videoUrl);
    };
}]);