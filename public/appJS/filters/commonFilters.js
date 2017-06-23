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
.filter('convertToK', [function() {
    return function(_amt) {
		if(_amt) {
			if(parseInt(_amt) < 1000) 
				return _amt;
			else if(parseInt(_amt) < 100000) 
				return Math.round(parseInt(_amt)/1000,2) + 'K';
			else
				return Math.round(parseInt(_amt)/100000,2) + 'L';
		} else {
			return '0';
		}
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
.filter('getFirstLetter', [function() {
	var str = '';
    return function(_display, _name, _email,) {
		if(_name) {
			str = _name.substring(0,1);
			if(_name.split(' ')[1])
				str = str + _name.split(' ')[1].substring(0,1);
			return str;
		} else if(_email) {
			return _email.substring(0,1);
		} else {
			return '';
		}
    };
}])
.filter('trustAsResourceUrl', ['$sce', function(_sce) {
    return function(_videoUrl) {
		return _sce.trustAsResourceUrl(_videoUrl);
    };
}]);