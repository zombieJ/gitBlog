(function() {
	'use strict';

	var memoryCtrl = angular.module('memoryCtrl', ['ngRoute', 'ui.bootstrap']);

	// ==============================================================
	// =                            List                            =
	// ==============================================================
	memoryCtrl.controller('memoryList', function ($scope, Page, Blog) {
		Page.title = "Memory";

		var $memTip = $("#memTip");
		$memTip.hide();

		$scope.memoryList = [
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
			{title: "真皮沙发", description: "黑黑的，里面有好多弹簧！"},
			{title: "冰冻蚊子", description: "蚊子被空调冻得飞不动啦！"},
		];

		$scope.enterMemory = function (mem, $event) {
			var $tgt = $($event.currentTarget);
			$scope.currentMemory = mem;
			$memTip.stop().fadeIn();

			// Position
			var winWidth = $(window).width();
			var tgtOffset = $tgt.offset();
			var offset = $.extend({}, tgtOffset);
			offset.left += $tgt.outerWidth();
			if(offset.left + $memTip.outerWidth() > winWidth) {
				offset.left = tgtOffset.left - $memTip.outerWidth();
			}
			$memTip.offset(offset);
		};
		$scope.leaveMemory = function () {
			$memTip.stop().fadeOut();
		};
	});
})();