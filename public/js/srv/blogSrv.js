(function() {
	'use strict';

	angular.module('app').factory("Blog", function (File, $http, $q) {
		var _list;

		var Blog = function() {};

		Blog.ready = false;

		Blog.snapshot = function(blog) {
			var md = new Remarkable({
				html: true,
				xhtmlOut: false,
				breaks: false,
				langPrefix: 'language-',
				linkify: false,
				typographer: false
			});
			var $content = $(md.render(blog.content));

			return {
				title: blog.title,
				introduction: blog.introduction || $content.text().substr(0, 200),
				tags: blog.tags,
				thumbnail: blog.thumbnail,
				createTime: blog.createTime
			};
		};

		// Blog list
		Blog.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = _list || {};
				$http.get("data/list.json?_=" + (+new Date())).then(function(data) {
					_list = data.data;

					// Parse tags
					_list.tags = {};
					$.each(_list.articles, function(i, article) {
						$.each(article.tags || [], function(j, tag) {
							if(!tag) return;

							var tagArticles = _list.tags[tag] = _list.tags[tag] || [];
							tagArticles.push(article);
						});
					});
				}).finally(function() {
					Blog.ready = true;
				});
			}
			return _list;
		};

		// Fetch
		Blog.fetch = function(createTime) {
			return File.read(File.path("data/articles/" + createTime + ".json")).then(function(data) {
				return JSON.parse(data);
			});
		};

		// Save blog
		Blog.save = function(blog) {
			var _path_article = "data/articles/";
			var _path_list = "data/list.json";

			var _deferred = $q.defer();

			// Write blog
			File.write(File.path(_path_article + blog.createTime + ".json"), JSON.stringify(blog, null, "\t")).then(function() {
				var data;

				// Read blog list
				File.read(File.path(_path_list)).then(function(_data) {
					data = _data;
				}).finally(function() {
					var _list, _entity, i, _match;
					try {
						_list = JSON.parse(data);
					} catch (err) {
						_list = {};
					}
					_list.articles = _list.articles || [];
					_entity = Blog.snapshot(blog);

					// Update if edit mode
					_match = false;
					for (i = 0 ; i < _list.articles.length ; i += 1) {
						if(_list.articles[i].createTime === blog.createTime) {
							_match = i;
							break;
						}
					}

					if(_match === false) {
						_list.articles.unshift(_entity);
					} else {
						_list.articles[_match] = _entity;
					}

					// Update list
					File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
						_deferred.resolve();
						Blog.list(true);
					}, function(err) {
						_deferred.reject(err);
					});
				}, function(err) {
					_deferred.reject(err);
				});
			});

			return _deferred.promise;
		};

		// Delete blog
		Blog.delete = function(createTime) {
			var data;
			var FS = require("fs");
			var _path_article = "data/articles/";
			var _path_list = "data/list.json";
			var _deferred = $q.defer();

			FS.unlinkSync(File.path(_path_article + createTime + ".json"));

			// Clean list record
			File.read(File.path(_path_list)).then(function(_data) {
				data = _data;
			}).finally(function() {
				var _list;
				try {
					_list = JSON.parse(data);
				} catch (err) {
					_list = {};
				}

				common.array.remove(Number(createTime), _list.articles || [], "createTime");
				// Update list
				File.write(File.path(_path_list), JSON.stringify(_list, null, "\t")).then(function() {
					_deferred.resolve();
					Blog.list(true);
				}, function(err) {
					_deferred.reject(err);
				});
			});

			return _deferred.promise;
		};

		// Rebuild blog
		Blog.rebuild = function() {
			var _deferred = $q.defer();

			File.list(File.path("data/articles/")).then(function(list) {
				var _list = {
					articles: []
				};
				var _promiseList = $.map(list, function(file) {
					return File.read(File.path("data/articles/" + file)).then(function(data) {
						try {
							var _entity = Blog.snapshot(JSON.parse(data));
							_list.articles.push(_entity);
						} catch(err) {
							console.error(err);
						}
					});
				});

				$q.all(_promiseList).then(function() {
					_list.articles.sort(function(a, b) {
						return b.createTime - a.createTime;
					});

					File.write(File.path("data/list.json"), JSON.stringify(_list, null, "\t")).finally(function() {
						_deferred.resolve();
						Blog.list(true);
					});
				});
			});

			return _deferred.promise;
		};

		return Blog;
	});
})();