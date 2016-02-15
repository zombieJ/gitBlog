(function() {
	'use strict';

	angular.module('app').factory("File", function ($q) {
		var File = function() {};

		// Assume folder
		File.assumeFolder = function(path) {
			var FS = require("fs");
			var PATH = require('path');

			path = PATH.normalize(path);
			if(!FS.existsSync(path)) {
				File.assumeFolder(PATH.dirname(path));
				FS.mkdirSync(path);
			}
		};

		File.write = function(path, data) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);
			File.assumeFolder(PATH.dirname(path));

			FS.writeFile(path, data, "utf8", function (err) {
				if(err) {
					_deferred.reject(err);
				} else {
					_deferred.resolve();
				}
			});

			return _deferred.promise;
		};
		File.read = function(path, sync) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);

			if(sync) {
				return FS.readFileSync(path, "utf8");
			} else {
				FS.readFile(path, "utf8", function (err, data) {
					if (err) {
						_deferred.reject(err);
					} else {
						_deferred.resolve(data);
					}
				});
			}

			return _deferred.promise;
		};

		File.list = function(path) {
			var FS = require("fs");
			var PATH = require('path');

			var _deferred = $q.defer();
			path = PATH.normalize(path);

			FS.readdir(path, function(err, list) {
				if(err) {
					_deferred.reject(err);
				} else {
					_deferred.resolve(list);
				}
			});

			return _deferred.promise;
		};

		return File;
	});
})();