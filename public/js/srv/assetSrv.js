(function() {
	'use strict';

	angular.module('app').factory("Asset", function (File, $http, $q) {
		var _list;
		var Asset = function() {};

		Asset.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || [];
				File.list("data/assets").then(function (list) {
					_list = list;
				});
			}

			return _list;
		};

		Asset.upload = function(files) {
			var _timestamp = +new Date();

			var _promiseList = $.map(files, function(file) {
				var _fileName = _timestamp + "_" + file.name;
				return File.copy(file.path, "data/assets/" + _fileName).then(function() {
					return {
						name: _fileName,
					};
				});
			});

			return $q.all(_promiseList);
		};

		Asset.delete = function(item) {
			var FS = require("fs");
			FS.unlinkSync(File.path("data/assets/" + item));
			Asset.list(true);
		};

		return Asset;
	});
})();