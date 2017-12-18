module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	var React = __webpack_require__(5);

	var DEFAULT_DRAG_THRESHOLD = 10;
	var RESTRICT_DRAGGING = true;
	var MATCH_MOUSE_DOWN_BUTTON = 0;

	module.exports = React.createClass({
	  displayName: 'DraggableList',
	  propTypes: {
	    onOrderChanged: React.PropTypes.func.isRequired,
	    items: React.PropTypes.array.isRequired,
	    dragStartThreshold: React.PropTypes.number,
	    restrictDragging: React.PropTypes.bool,
	    className: React.PropTypes.string,
	    previewClassName: React.PropTypes.string,
	    matchMouseDownButton: React.PropTypes.number
	  },

	  /* Parameters access */
	  getDragThreshold: function getDragThreshold() {
	    return this.props.dragStartThreshold || DEFAULT_DRAG_THRESHOLD;
	  },
	  getRestrictDragging: function getRestrictDragging() {
	    return this.props.restrictDragging || RESTRICT_DRAGGING;
	  },
	  getMatchMouseDownButton: function getMatchMouseDownButton() {
	    return this.props.matchMouseDownButton || MATCH_MOUSE_DOWN_BUTTON;
	  },


	  /* Lifecycle */
	  componentDidMount: function componentDidMount() {
	    document.addEventListener('mouseup', this.onMouseUp);
	    document.addEventListener('mousemove', this.onMouseMove);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    document.removeEventListener('mouseup', this.onMouseUp);
	    document.removeEventListener('mousemove', this.onMouseMove);
	  },
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    if (this.state.isItemMoving) return;

	    var updateList = false;
	    if (this.props.items.length != nextProps.items.length) {
	      updateList = true;
	    } else {
	      for (var i = 0; i < this.props.items.length; i++) {
	        if (this.props.items[i] != nextProps.items[i]) {
	          updateList = true;
	          break;
	        }
	      }
	    }
	    if (updateList) this.setState(this.getInitialState(nextProps));
	  },


	  /* Data lifecycle */
	  getInitialState: function getInitialState() {
	    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

	    return { movingIndex: null, items: props.items, preventAnimation: false };
	  },
	  reorderList: function reorderList() {
	    var item = this.state.items.splice(this.state.movingIndex, 1)[0];
	    this.state.items.splice(this.state.movingItemPosition, 0, item);
	    this.setState({ items: this.state.items, preventAnimation: true });
	    this.props.onOrderChanged(this.state.items.slice().map(function (item) {
	      return item.key;
	    }));
	  },
	  cleanUpMovement: function cleanUpMovement() {
	    this.setState({
	      selectedIndex: null,
	      isItemMoving: false,
	      movingIndex: null,
	      initialMouseY: null,
	      previewTop: null,
	      movingItemPosition: null,
	      mouseDown: undefined
	    });
	  },


	  /* User interaction */
	  onMouseDown: function onMouseDown(evt, index) {
	    /* Apply mouse down button constraint, if applicable */
	    if (evt && evt.nativeEvent && this.getMatchMouseDownButton() >= 0 && this.getMatchMouseDownButton() != evt.nativeEvent.button) return;

	    this.setState({ mouseDown: true, selectedIndex: index });
	    this.measureDimensions();
	  },
	  onMouseUp: function onMouseUp() {
	    if (this.state.movingItemPosition != null && this.state.movingIndex != null && this.state.movingItemPosition != this.state.movingIndex) {
	      this.reorderList();
	    } else {
	      this.setState({ items: this.props.items });
	    }
	    this.cleanUpMovement();
	  },
	  onMouseMove: function onMouseMove(evt) {
	    /* Only handle mouse move if mousedown was triggered on a list element */
	    if (!this.state.mouseDown) return;

	    /* If initial mouse position was not saved, save it and return. We need this for calculating mouseDiff */
	    var currentMouseY = evt.screenY;
	    if (!this.state.initialMouseY) {
	      this.setState({ initialMouseY: currentMouseY });
	      return;
	    }

	    /* Calculate Y distance in pixels from the current mouse position to the initial mouse position */
	    var mouseYDiff = this.state.initialMouseY - currentMouseY;

	    /* Only consider actual movement if difference is greater than the drag threshold */
	    if (Math.abs(mouseYDiff) >= this.getDragThreshold()) {
	      this.setState({ isItemMoving: true });
	    }

	    /* Only handle actual item movement from now on */
	    if (!this.state.isItemMoving) return;

	    /* Calculate moving item top based on mouse position */
	    var root = this.refs.listRoot;
	    var rootRect = root.getBoundingClientRect();
	    this.setState({
	      movingIndex: this.state.selectedIndex,
	      preventAnimation: false,
	      previewTop: this.state.itemsTop[this.state.selectedIndex] - rootRect.top
	    });

	    /* Only continue if movingIndex indicates item that is moving */
	    if (this.state.movingIndex == null) return;

	    /* Apply dragging restrictions, if applicable */
	    var previewTop = this.state.itemsTop[this.state.selectedIndex] - (mouseYDiff != null ? mouseYDiff : 0);
	    if (this.getRestrictDragging()) {
	      previewTop = previewTop < 0 ? 0 : previewTop;
	      var maxTop = rootRect.height - this.refs['selectedItem' + this.state.selectedIndex].getBoundingClientRect().height;
	      previewTop = previewTop > maxTop ? maxTop : previewTop;
	    }
	    this.setState({ previewTop: previewTop });

	    /* Find current position in the list */
	    var movingItemPosition = 0;
	    for (var i = 0; i < this.state.items.length; i++) {
	      var selectedItemTop = this.state.itemsTop[i];
	      var selectedItemThreshold = this.state.itemsThreshold[i];
	      if (previewTop > selectedItemTop + selectedItemThreshold) movingItemPosition++;
	    }
	    this.setState({ movingItemPosition: movingItemPosition });
	  },
	  measureDimensions: function measureDimensions() {
	    var _this = this;

	    var itemsTop = [];
	    var itemsThreshold = [];
	    var rootMeasures = this.refs.listRoot.getBoundingClientRect();

	    /* Calculate top and `swap` threshold for each element in the list */
	    this.state.items.forEach(function (item, index) {
	      var itemMeasures = _this.refs['selectedItem' + index].getBoundingClientRect();
	      itemsTop.push(itemMeasures.top - rootMeasures.top);
	      itemsThreshold.push(itemMeasures.height / 2);
	    });

	    this.setState({ itemsTop: itemsTop, itemsThreshold: itemsThreshold });
	  },


	  /* Rendering */
	  render: function render() {
	    var _this2 = this;

	    var _state = this.state,
	        movingIndex = _state.movingIndex,
	        items = _state.items,
	        movingItemPosition = _state.movingItemPosition,
	        preventAnimation = _state.preventAnimation,
	        previewTop = _state.previewTop;
	    var _props = this.props,
	        className = _props.className,
	        previewClassName = _props.previewClassName;


	    return React.createElement(
	      'div',
	      { className: 'dynamic-list-root ' + (className || ''), ref: 'listRoot' },
	      items.map(function (item, index) {
	        var moveUp = movingItemPosition != null && movingItemPosition > movingIndex && index <= movingItemPosition && index > movingIndex;
	        var moveDown = movingItemPosition != null && movingItemPosition < movingIndex && index >= movingItemPosition && index < movingIndex;
	        return React.createElement(
	          'div',
	          { className: 'dynamic-list-item ' + (movingIndex == index ? 'selected' : '') + ' ' + (moveUp ? 'move-up' : '') + ' ' + (moveDown ? 'move-down' : ''),
	            style: preventAnimation ? { transition: 'none' } : {},
	            ref: 'selectedItem' + index,
	            key: item.key,
	            onMouseDown: function onMouseDown(evt) {
	              _this2.onMouseDown(evt, index);
	            } },
	          item
	        );
	      }),
	      movingIndex != null && previewTop >= 0 && React.createElement(
	        'div',
	        { className: 'dynamic-list-item-preview ' + (previewClassName || ''), style: { top: previewTop } },
	        items[movingIndex]
	      )
	    );
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/less-loader/index.js!./draggableList.less", function() {
				var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/less-loader/index.js!./draggableList.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, ".dynamic-list-root {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-height: fit-content;\n  -webkit-app-region: no-drag;\n}\n.dynamic-list-root .dynamic-list-item {\n  transition: 0.1s ease-in-out;\n  -webkit-app-region: no-drag;\n}\n.dynamic-list-root .dynamic-list-item.selected {\n  opacity: 0.0;\n}\n.dynamic-list-root .dynamic-list-item.move-up {\n  transform: translate3d(0, -100%, 0);\n}\n.dynamic-list-root .dynamic-list-item.move-down {\n  transform: translate3d(0, 100%, 0);\n}\n.dynamic-list-root .dynamic-list-item-preview {\n  position: absolute;\n  z-index: 99999;\n  cursor: pointer;\n}\n.dynamic-list-root .dynamic-list-item-preview > * {\n  pointer-events: none;\n}\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ }
/******/ ]);