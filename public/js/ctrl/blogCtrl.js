(function() {
	'use strict';

	var blogCtrl = angular.module('blogCtrl', ['ngRoute', 'ui.bootstrap']);

	// ==============================================================
	// =                            List                            =
	// ==============================================================
	blogCtrl.controller('listCtrl', function ($scope, Page, Blog) {
		Page.title = "Home";

		$scope.tag = "";
		$scope.setTag = function(tag, force) {
			if(force) {
				$scope.tag = tag;
			} else {
				$scope.tag = $scope.tag === tag ? "" : tag;
			}

			$("#tags").collapse('show');
		};

		$scope.articles = function() {
			var _list = Blog.list();
			if(!$scope.tag) return _list.articles;

			return _list.tags[$scope.tag];
		};
	});

	// ==============================================================
	// =                            View                            =
	// ==============================================================
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

		$scope.delete = function() {
			$.dialog({
				title: "Delete Confirm",
				content: "Are you sure to delete this article?",
				confirm: true
			}, function(ret) {
				if(!ret) return;

				Blog.delete($routeParams.createTime).then(function() {
					$.dialog({
						title: "Delete success",
						content: "Delete success. Close dialog to go to the home page.",
					}, function() {
						location.href = "#/home";
					});
				}, function() {
					$.dialog({
						title: "Delete failed",
						content: "Unknown exception for deleting.",
					});
				});
			});
		};
	});

	// ==============================================================
	// =                            Edit                            =
	// ==============================================================
	blogCtrl.controller('createCtrl', function ($scope, $routeParams, Page, Blog, Asset) {
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

		// ======================= Edit =======================
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

		// ======================= Save =======================
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
					content: "Save complete! Go to home page?",
					confirm: true
				}, function(ret) {
					if(ret) {
						location.href = "#/home";
					}
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

		// ======================== UI ========================
		// Asset drop
		$("#article").on("drop", function(event) {
			var files = event.originalEvent.dataTransfer.files;
			//if(files.length) {
				event.preventDefault();
				//event.stopPropagation();


				/*Asset.upload(files).then(function() {
					console.log("done!!!");
				});*/
				setTimeout(function() {
					var pos = $('#article').prop("selectionStart");
					console.log(pos, event.originalEvent);
				});
			//}
		});

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