(function() {
	var common = {};

	common.getValueByPath = function (unit, path, defaultValue) {
		if(unit === null || unit === undefined) throw "Unit or path can't be empty!";
		if(path === "" || path === null || path === undefined) return unit;

		path = path.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "").split(/\./);
		$.each(path, function(i, path) {
			unit = unit[path];
			if(unit === null || unit === undefined) {
				unit = null;
				return false;
			}
		});
		if(unit === null && defaultValue !== undefined) {
			unit = defaultValue;
		}
		return unit;
	};

	common.setValueByPath = function(unit, path, value) {
		if(!unit || typeof path !== "string" || path === "") throw "Unit or path can't be empty!";

		var _inArray = false;
		var _end = 0;
		var _start = 0;
		var _unit = unit;

		function _nextPath(array) {
			var _key = path.slice(_start, _end);
			if(_inArray) {
				_key = _key.slice(0, -1);
			}
			if(!_unit[_key]) {
				if(array) {
					_unit[_key] = [];
				} else {
					_unit[_key] = {};
				}
			}
			_unit = _unit[_key];
		}

		for(; _end < path.length ; _end += 1) {
			if(path[_end] === ".") {
				_nextPath(false);
				_start = _end + 1;
				_inArray = false;
			} else if(path[_end] === "[") {
				_nextPath(true);
				_start = _end + 1;
				_inArray = true;
			}
		}

		_unit[path.slice(_start, _inArray ? -1 : _end)] = value;

		return unit;
	};

	// ====================== Array =======================
	common.array = {};

	common.array.find = function(val, list, path, findAll) {
		path = path || "";
		var _list = $.grep(list, function(unit) {
			return val === common.getValueByPath(unit, path);
		});
		return findAll ? _list : (_list.length === 0 ? null : _list[0]);
	};

	common.array.filter = function(val, list, path) {
		return common.array.find(val, list, path, true);
	};

	common.array.remove = function(val, list, path) {
		path = path || "";

		for(var i = 0 ; i < list.length ; i += 1) {
			if(common.getValueByPath(list[i], path) === val) {
				list.splice(i, 1);
				i -= 1;
			}
		}

		return list;
	};

	// ===================== Register =====================
	if(!window.common) {
		window.common = common;
	} else {
		window.COMMON = common;
	}
})();