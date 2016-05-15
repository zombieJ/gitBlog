(function() {
	'use strict';

	var app = angular.module('app', ['ngRoute', 'configCtrl', 'blogCtrl', 'memoryCtrl', 'ui.bootstrap']);

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
		// =                 Memory                 =
		// ==========================================
		}).when('/memory', {
			templateUrl: 'partials/memory/list.html',
			controller: 'memoryList'

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

	app.controller('main', function ($scope, Page, Blog, Config, Asset, Git) {
		window.Config = $scope.Config = Config;
		window.Page = $scope.Page = Page;
		window.Blog = $scope.Blog = Blog;
		window.Asset = $scope.Asset = Asset;
		window.Git = $scope.Git = Git;

		$scope.lock = false;

		$scope.$on('$routeChangeStart', function(event, next, current) {
			Page.reset();
		});

		$scope.upload = function() {
			$scope.lock = true;
			Git.push().finally(function() {
				$scope.lock = false;
			});
		};

		$scope.rebuild = function() {
			$scope.lock = true;
			Blog.rebuild().then(function() {
				$.dialog({
					title: "Success",
					content: "Rebuild successfully."
				});
				$scope.lock = false;
			});
		};
	});
})();