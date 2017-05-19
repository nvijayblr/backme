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
			return _amt.toLocaleString();
		else
			return '0';
    };
}]);