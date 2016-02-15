(function() {
	'use strict';

	var blogCtrl = angular.module('blogCtrl', ['ngRoute', 'ui.bootstrap']);

	blogCtrl.controller('listCtrl', function ($scope, Page) {
		Page.title = "Home";
	});

	blogCtrl.controller('blogCtrl', function ($http, $scope, $routeParams, Page, Blog) {
		Page.hideTitle = true;

		$http.get("data/articles/" + $routeParams.createTime + ".json", {params: {_: Math.random()}}).then(function(data) {
			$scope.blog = data.data;

			var md = new Remarkable({
				html: true,
				xhtmlOut: false,
				breaks: false,
				langPrefix: 'language-',
				linkify: false,
				typographer: false
			});

			$("#article").html(
				md.render($scope.blog.content)
			);
		}, function() {
			$.dialog({
				title: "OPS",
				content: "Can't load blog."
			});
		});
	});

	blogCtrl.controller('createCtrl', function ($scope, $routeParams, Page, Blog) {
		var _refreshMD_id;
		var $win = $(window);

		Page.title = "Create";
		Page.hideTitle = true;
		Page.menu = [
			{name: "Save", func: save, disabled: saveDisabled}
		];

		$scope.tags = "";
		$scope.blog = {};
		if($routeParams.createTime) {
			Blog.fetch($routeParams.createTime).then(function(blog) {
				$scope.blog = blog;
				updateMD();
			});
		}

		// Edit
		var md = new Remarkable({
			html: true,
			xhtmlOut: false,
			breaks: false,
			langPrefix: 'language-',
			linkify: false,
			typographer: false
		});

		function updateMD() {
			$("#overview .article-cntr").html(
				md.render($scope.blog.content)
			);
		}

		$scope.update = function () {
			clearTimeout(_refreshMD_id);
			_refreshMD_id = setTimeout(updateMD, 200);
		};

		// Save
		function save() {
			var _tags = {};
			$.each($scope.tags.split(/\s*,\s*/), function(i, tag) {
				_tags[tag] = tag;
			});
			$scope.blog.tags = $.map(_tags, function(tag) {
				return tag;
			});
			$scope.blog.createTime = $scope.blog.createTime || +new Date();

			Blog.save($scope.blog).then(function() {
				$.dialog({
					title: "Success",
					content: "Save complete!"
				});
			}, function(err) {
				$.dialog({
					title: "OPS",
					content: "Save error: " + err
				});
			});
		}

		function saveDisabled() {
			return !$scope.blog.title || !$scope.blog.content;
		}

		// Window resize
		$scope.resize = function(delay) {
			setTimeout(function() {
				var $article = $("#article");
				var $overview = $("#overview .article-cntr");
				$article.css("min-height", $win.height() - $article.offset().top - 15);
				$overview.outerHeight($win.height() - $overview.offset().top - 25);
			}, delay);
		};
		$win.on("resize.edit", $scope.resize);
		$scope.resize(100);

		// Clean up
		$scope.$on("$destroy", function() {
			$win.off("resize.edit");
		});
	});
})();