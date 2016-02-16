(function() {
	'use strict';

	angular.module('app').factory("Asset", function (File, $http, $q) {
		var _list;
		var Asset = function() {};

		Asset.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = [];
				File.list("data/assets").then(function (list) {
					_list = list;
				});
			}

			return _list;
		};

		Asset.upload = function(files) {
			var _timestamp = +new Date();

			var _promiseList = $.map(files, function(file) {
				return File.copy(file.path, "data/assets/" + _timestamp + "_" + file.name);
			});

			return $q.all(_promiseList);
		};

		return Asset;
	});
})();