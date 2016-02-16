(function() {
	'use strict';

	var _configPath = "data/config.json";

	angular.module('app').factory("Config", function (File, Page, $http) {
		var _config;
		var Config = function() {};

		Config.get = function(forceRefresh) {
			if(!Page.local) {
				if(!_config) {
					_config = {};
					$http.get(_configPath, {params: {_: Math.random()}}).then(function (data) {
						_config = data.data;
					});
				}
			} else if(!_config || forceRefresh) {
				try {
					_config = JSON.parse(File.read(_configPath, true));
				} catch (err) {
					_config = {};
				}
			}
			return _config;
		};

		Config.save = function(config) {
			if(config) _config = config;
			return File.write(_configPath, JSON.stringify(_config, null, "\t"));
		};

		return Config;
	});
})();