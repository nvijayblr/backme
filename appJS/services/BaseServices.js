'use strict';
backMe
.service('BaseServices', ['HttpServices', 'toastServices', function(_httpServices, _toastServices){
	this.http = _httpServices;
	this.toast = _toastServices;
}]);