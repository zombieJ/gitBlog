(function() {
	'use strict';

	angular.module('app').factory("Blog", function (File, $http, $q) {
		var _list;

		var Blog = function() {};

		Blog.snapshot = function(blog) {
			return {
				title: blog.title,
				introduction: blog.introduction || blog.content.substr(0, 200),
				tags: blog.tags,
				thumbnail: blog.thumbnail,
				createTime: blog.createTime
			};
		};

		// Blog list
		Blog.list = function(forceRefresh) {
			if(!_list || forceRefresh) {
				_list = {};
				$http.get("data/list.json?_=" + (+new Date())).then(function(data) {
					_list = data.data;
				});
			}
			return _list;
		};

		// Fetch
		Blog.fetch = function(createTime) {
			var FS = require("fs");
			var _path = "";

			// Get current path
			if(!FS.existsSync("index.html")) {
				_path = process.execPath.replace(/[^\\\/]+\.exe$/, '');
			}

			return File.read(_path + "data/articles/" + createTime + ".json").then(function(data) {
				return JSON.parse(data);
			});
		};

		// Save blog
		Blog.save = function(blog) {
			var FS = require("fs");
			var _path = "", _path_article, _path_list;
			var _deferred = $q.defer();

			// Get current path
			if(!FS.existsSync("index.html")) {
				_path = process.execPath.replace(/[^\\\/]+\.exe$/, '');
			}

			_path_article = _path + "data/articles/";
			_path_list = _path + "data/list.json";

			// Write blog
			File.write(_path_article + blog.createTime + ".json", JSON.stringify(blog, null, "\t")).then(function() {
				var data;

				// Read blog list
				File.read(_path_list).then(function(_data) {
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
					File.write(_path_list, JSON.stringify(_list, null, "\t")).then(function() {
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

		// Rebuild blog
		Blog.rebuild = function() {
			var FS = require("fs");
			var _path = "";
			var _deferred = $q.defer();

			// Get current path
			if(!FS.existsSync("index.html")) {
				_path = process.execPath.replace(/[^\\\/]+\.exe$/, '');
			}

			File.list(_path + "data/articles/").then(function(list) {
				var _list = {
					articles: []
				};
				var _articles = list.sort();
				var _promiseList = $.map(_articles, function(file) {
					return File.read(_path + "data/articles/" + file).then(function(data) {
						try {
							var _entity = Blog.snapshot(JSON.parse(data));
							_list.articles.unshift(_entity);
						} catch(err) {
							console.error(err);
						}
					});
				});

				$q.all(_promiseList).then(function() {
					File.write(_path + "data/list.json", JSON.stringify(_list, null, "\t")).finally(function() {
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