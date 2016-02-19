(function() {
	'use strict';

	angular.module('app').factory("Git", function () {
		var Git = function() {};

		function dialogErr(title, content) {
			$.dialog({
				title: title,
				content: content
			});
		}

		Git.push = function() {
			var exec = require('child_process').exec;

			// Git: status
			exec("git status", function (error, stdout, stderr) {
				if(stderr) {
					dialogErr("Git Status Error", stderr);
				} else {
					$.dialog({
						title: "Git Status Confirm",
						content: $("<pre>").text(stdout.trim()),
						confirm: true
					}, function(ret) {
						if(!ret) return;

						// Git: add .
						exec("git add .", function (error, stdout, stderr) {
							if(stderr) dialogErr("Git Add Error", stderr);
							exec("git commit -m 'update blog'", function (error, stdout, stderr) {
								if(stderr) dialogErr("Git Commit Error", stderr);
								exec("git push", function (error, stdout, stderr) {
									$.dialog({
										title: "Git Push Done",
										content: $("<pre>").text((stdout + "\n" + stderr).trim())
									});
								});
							});
						});
					});
				}
			});
		};

		return Git;
	});
})();