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
			$scope.date = new moment($scope.blog.createTime).format("YYYY-MM-DD HH:mm");

			var md = new Remarkable({
				html: true,
				xhtmlOut: false,
				breaks: false,
				langPrefix: 'language-',
				linkify: false,
				typographer: false
			});

			$("#article .article-cntr").html(
				md.render($scope.blog.content)
			);
			$("#article .article-cntr table").addClass("table table-bordered");
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

		Asset.list(true);

		$scope.resView = false;
		$scope.tags = "";
		$scope.blog = {content: ""};
		if($routeParams.createTime) {
			Blog.fetch($routeParams.createTime).then(function(blog) {
				$scope.blog = blog;
				$scope.tags = ($scope.blog.tags || []).join(",");
				updateMD();
			});
		}

		// ===================== Function =====================
		$scope.isImage = function(name) {
			return /\.(jpg|jpeg|bmp|png|gif)/i.test(name);
		};

		$scope.timeDesc = function(itemName) {
			var _moment =  new moment(Number(itemName.substr(0,13)));
			return _moment.toString();
		};

		$scope.selectItem = function(item) {
			if($scope.isImage(item)) {
				$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](data/assets/" + item + ")";
			} else {
				$scope.blog.content += ($scope.blog.content ? "\n" : "") + item;
			}
			updateMD();
		};

		$scope.deleteAsset = function(item) {
			$.dialog({
				title: "Delete Confirm",
				content: "Do you want to delete '" + item + "'?",
				confirm: true
			}, function(ret) {
				if(ret) {
					Asset.delete(item);
					$scope.$apply();
				}
			});
		};

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
			$("#overview .article-cntr table").addClass("table table-bordered");
		}

		$scope.update = function () {
			clearTimeout(_refreshMD_id);
			_refreshMD_id = setTimeout(updateMD, 200);
		};

		// ======================= Save =======================
		function save() {
			var _tags = {};
			var _thumbnail = $scope.blog.content.match(/^!\[[^\]]*]\(([^\)]*)(\s+"[^"]*")?\)/)[1];

			$.each($scope.tags.split(/\s*,\s*/), function(i, tag) {
				_tags[tag] = tag;
			});
			$scope.blog.tags = $.map(_tags, function(tag) {
				return tag;
			});
			$scope.blog.createTime = $scope.blog.createTime || +new Date();

			$scope.blog.thumbnail = _thumbnail;

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
		$("#editArticle").on("drop", function(event) {
			var files = event.originalEvent.dataTransfer.files;
			if(files.length) {
				event.preventDefault();
				event.stopPropagation();

				Asset.upload(files).then(function(list) {
					Asset.list(true);
					$.each(list, function(i, file) {
						$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](data/assets/" + file.name + ")";
					});
					updateMD();
				});
			} else {
				var content = event.originalEvent.dataTransfer.getData("Text");
				if($scope.isImage(content)) {
					event.preventDefault();
					event.stopPropagation();

					$scope.blog.content += ($scope.blog.content ? "\n" : "") + "![](" + content + ")";
					$scope.$apply();
					updateMD();
				}
			}
		});

		// Window resize
		$scope.resize = function(delay) {
			$("body").addClass("lockSidebar");
			setTimeout(function() {
				var $article = $("#editArticle");
				var $overview = $("#overview .article-cntr");
				var $resView = $("#resView");
				$article.css("min-height", $win.height() - $article.offset().top - 15);
				$overview.outerHeight($win.height() - ($overview.offset() || {top: 0}).top - 25);
				$resView.outerHeight($win.height() - ($resView.offset() || {top: 0}).top - 15);
				$("body").removeClass("lockSidebar");
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