(function() {
	'use strict';

	angular.module('app').factory("Page", function () {
		var _origin = {
			title: "",
			subTitle: "",
			hideTitle: false,

			menu: []
		};

		var Page = {
			local: !!window.require
		};

		Page.reset = function() {
			$.extend(Page, _origin);
		};
		Page.reset();

		return Page;
	});
})();