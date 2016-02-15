(function() {
	'use strict';

	var configCtrl = angular.module('configCtrl', ['ngRoute', 'ui.bootstrap']);

	configCtrl.controller('configCommonCtrl', function ($scope, Page, Config) {
		Page.title = "Config";
		$scope.config = Config.get();

		$scope.save = function() {
			Config.save().then(function() {
				$.dialog({
					title: "Success",
					content: "Save successfully!"
				});
			}, function(err) {
				$.dialog({
					title: "OPS",
					content: "Save failed! " + err
				});
			});
		};
	});
})();