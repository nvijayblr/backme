'use strict';
backMe
.service('BaseServices', ['HttpServices', 'toastServices', 'paginationServices', function(_httpServices, _toastServices, _paginationServices){
	this.http = _httpServices;
	this.toast = _toastServices;
	this.pagination = _paginationServices;
}]);