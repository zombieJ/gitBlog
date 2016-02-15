(function() {
	'use strict';

	var app = angular.module('app', ['ngRoute', 'configCtrl', 'blogCtrl', 'ui.bootstrap']);

	app.config(function ($routeProvider) {
		// ==========================================
		// =                  Blog                  =
		// ==========================================
		$routeProvider.when('/home', {
			templateUrl: 'partials/blog/list.html',
			controller: 'listCtrl'
		}).when('/create', {
			templateUrl: 'partials/blog/create.html',
			controller: 'createCtrl'
		}).when('/edit/:createTime', {
			templateUrl: 'partials/blog/create.html',
			controller: 'createCtrl'
		}).when('/blog/:createTime', {
			templateUrl: 'partials/blog/blog.html',
			controller: 'blogCtrl'

		// ==========================================
		// =                 Config                 =
		// ==========================================
		}).when('/config/common', {
			templateUrl: 'partials/config/common.html',
			controller: 'configCommonCtrl'

		}).otherwise({
			redirectTo: '/home'
		});
	});

	app.controller('main', function ($scope, Page, Blog, Config) {
		window.Config = $scope.Config = Config;
		window.Page = $scope.Page = Page;
		window.Blog = $scope.Blog = Blog;

		$scope.$on('$routeChangeStart', function(event, next, current) {
			Page.reset();
		});

		$scope.rebuild = function() {
			Blog.rebuild().then(function() {
				$.dialog({
					title: "Success",
					content: "Rebuild successfully."
				});
			});
		};
	});
})();