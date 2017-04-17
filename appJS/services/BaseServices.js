'use strict';
backMe
.service('BaseServices', ['HttpServices', function(_httpServices){
	this.http = _httpServices;
}]);