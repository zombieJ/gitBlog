(function() {
	'use strict';

	angular.module('app').factory("Memory", function (File, Asset, $http, $q) {
		var _list;
		var _path_list = "data/memoryList.json";

		var Memory = function() {};

		Memory.ready = false;

		// Blog list
		Memory.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || {};
				$http.get("data/memoryList.json?_=" + (+new Date())).then(function(data) {
					_list = $.extend(_list, data.data);
				}).finally(function() {
					Memory.ready = true;
				});
			}
			return _list;
		};

		// Save blog
		Memory.save = function(memory) {
			var _deferred = $q.defer();

			// Write blog
			var data;

			// Read blog list
			File.read(File.path(_path_list)).then(function(_data) {
				data = _data;
			}).finally(function() {
				var _list;
				try {
					_list = JSON.parse(data);
				} catch (err) {
					_list = {};
				}
				_list.memories = _list.memories || [];
				_list.memories.push(memory);

				// Update list
				File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
					_deferred.resolve();
					Memory.list(true);
				}, function(err) {
					_deferred.reject(err);
				});
			}, function(err) {
				_deferred.reject(err);
			});

			return _deferred.promise;
		};

		Memory.delete = function (mem) {
			var _deferred = $q.defer();
			common.array.remove(mem, _list.memories);

			// Update list
			File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
				_deferred.resolve();
				Memory.list(true);
				if(mem.thumbnail) {
					Asset.delete(mem.thumbnail.replace("data/assets/", ""));
				}
			}, function(err) {
				_deferred.reject(err);
			});

			return _deferred.promise;
		};

		return Memory;
	});
})();