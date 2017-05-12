'use strict';
backMe
.filter('isEmpty', [function() {
    return function(obj) {
		for (var i in obj) if (obj.hasOwnProperty(i)) return false;
		return true;
    };
}])
.filter('getHours', [function() {
    return function(mins) {
		if(mins)
			return ''+parseInt(mins/60)+'';
		else
			return '0';
    };

}]);