(function() {
	'use strict';

	var memoryCtrl = angular.module('memoryCtrl', ['ngRoute', 'ui.bootstrap']);

	// ==============================================================
	// =                            List                            =
	// ==============================================================
	memoryCtrl.controller('memoryList', function ($scope, Page, Memory, Asset) {
		Page.title = "Memory";

		$scope.new = {};
		var _tmpImageFile = "";

		var $memTip = $("#memTip");
		$memTip.hide();

		// Memory list
		$scope.memoryHolder = Memory.list();

		// Memory tooltip
		$scope.enterMemory = function (mem, $event) {
			var $tgt = $($event.currentTarget);
			$scope.currentMemory = mem;
			$memTip.stop().fadeIn();

			// Position
			var winWidth = $(window).width();
			var tgtOffset = $tgt.offset();
			var offset = $.extend({}, tgtOffset);
			offset.left += $tgt.outerWidth();
			offset.top -= 35;
			if(offset.left + $memTip.outerWidth() > winWidth) {
				offset.left = tgtOffset.left - $memTip.outerWidth();
			}
			$memTip.offset(offset);
		};
		$scope.leaveMemory = function () {
			$memTip.stop().fadeOut();
		};

		// Memory update
		$scope.newMemory = function () {
			$scope.new = {};
			_tmpImageFile = "";
			$("#memoryMDL").modal();
		};
		$scope.saveMemory = function () {
			_tmpImageFile = "";
			$("#memoryMDL").modal("hide");

			$scope.createTime = +new Date();
			Memory.save($scope.new);
		};
		$scope.deleteMemory = function (mem) {
			if(Page.local) {
				$.dialog({
					title: "Delete Confirm",
					content: "Do you want to delete '" + mem.title + "'?",
					confirm: true
				}, function (ret) {
					if(ret) {
						Memory.delete(mem);
					}
				});
			}
		};

		$("#memoryMDL").on("dragover", ".memoryWindow", function (event) {
			event.preventDefault();
		});
		$("#memoryMDL").on("drop", ".memoryWindow", function(event) {
			var files = event.originalEvent.dataTransfer.files;
			if(files.length) {
				event.preventDefault();
				event.stopPropagation();

				Asset.upload([files[0]]).then(function(list) {
					_tmpImageFile = list[0].name;
					$scope.new.thumbnail = "data/assets/" + _tmpImageFile;
				});
			}
		});
		$("#memoryMDL").on("hidden.bs.modal", function () {
			if(_tmpImageFile) {
				Asset.delete(_tmpImageFile);
			}
		});
	});
})();