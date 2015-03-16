window.App = (function (app) {
	var App = app || {};

	// view module
	App.view = {

		// properties
		// -------------------------------------------------------------------------------------------

		// data
		canvasData: null,
		sticksData: [],
		animSpeed: {
			norm: 0.25
		},
		cssAnimProps: {
			stickActive: {
				'opacity': 1
			},
			stickInactive: {
				'opacity': 0.4
			}
		},

		// elems
		$document: $('document'),
		$sticksLayer: $('#sticksLayer'),
		$gridLayer: $('#gridLayer'),

		// animations
		// -------------------------------------------------------------------------------------------
		animateStickActive: function (ele) {
			console.log('a');
			TweenLite.to(ele, this.animSpeed.norm, this.cssAnimProps.stickActive);
		},
		animateStickInactive: function (ele) {
			console.log('in');
			TweenLite.to(ele, this.animSpeed.norm, this.cssAnimProps.stickInactive);
		},

		// touch
		// -------------------------------------------------------------------------------------------

		// events
		touchEvents: [
			'touchstart.sticksLayer',
			'touchmove.sticksLayer',
			'touchend.sticksLayer',
			'touchleave.sticksLayer',
			'touchcancel.sticksLayer'
		],

		// touch input handlers
		onTouchStart: function (e) {
			// get target active stick
			this.$activeStick = this.getTargetStick(e);

			// animate sticks
			this.animateStickActive(this.$activeStick[0]);
			this.$activeStick.siblings('.stick').each(_.bind(function (idx, ele) {
				this.animateStickInactive(ele);
			}, this));
		},
		onTouchMove: function (e) {
			// update target stick to active
			var $activeStick = this.$activeStick;
			var $newActiveStick = this.getTargetStick(e);

			if ($activeStick.index() !== $newActiveStick.index()) {
				this.$activeStick = $newActiveStick;
			}

			// animate sticks
			this.animateStickActive(this.$activeStick[0]);
			this.$activeStick.siblings('.stick').each(_.bind(function (idx, ele) {
				this.animateStickInactive(ele);
			}, this));
		},
		onTouchEnd: function (e) {
			// remove active stick
			this.$sticksLayer.find('.stick').each(_.bind(function (idx, ele) {
				this.animateStickInactive(ele);
			}, this));
		},

		// register touch inputs
		initTouch: function () {
			this.$sticksLayer
				.off(this.touchEvents.join(' '))
				.on(this.touchEvents[0], _.bind(this.onTouchStart, this))
				.on(this.touchEvents[1], _.bind(this.onTouchMove, this))
				.on(this.touchEvents[2], _.bind(this.onTouchEnd, this))
				.on(this.touchEvents[3], _.bind(this.onTouchEnd, this))
				.on(this.touchEvents[4], _.bind(this.onTouchEnd, this));
		},

		// register touch gestures
		initHammer: function () {
			this.hammer = new Hammer(this.$sticksLayer[0]);
			this.hammer.on('swipe', _.bind(function (e) {

				// get primary stick from touch position
				var touchCenterY = e.center.y;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var primaryStickIndex = Math.ceil(touchCenterY / stickHeight);

				// get swipe direction
				var swipeDirection;
				if (e.direction == 2) {
					swipeDirection = 'left';
				} else if (e.direction == 4) {
					swipeDirection = 'right';
				}

				// calculate stick positions
				this.calculateStickPositions(primaryStickIndex, swipeDirection);

				// render all sticks
				this.renderSticks();
			}, this));
		},

		// functions
		// -------------------------------------------------------------------------------------------

		// toggleLoader
		toggleLoader: function (showflag) {
			var $loader = $('#loader'),
				activeCls = 'active';
			if (!$loader.length) return 'no loader elem found';
			if (showflag) {
				$loader.addClass(activeCls);
			} else {
				$loader.removeClass(activeCls);
			}
		},

		// getTargetStick
		getTargetStick: function (e) {
			var touchY = e.originalEvent.touches[0].clientY;
			var rowsCount = this.sticksData.length;
			var rowHeight = this.canvasData.height / rowsCount;
			var targetIndex;

			while (rowsCount--) {
				if (touchY > rowHeight * rowsCount) {
					targetIndex = rowsCount;
					break;
				}
			}

			return (targetIndex >= 0) ? this.sticksData[targetIndex].$el : false;
		},

		// getCanvasData
		getCanvasData: function () {
			var canvas = {
				width: $(document).width(),
				height: $(document).height()
			};
			return canvas;
		},

		// calculate maximum count of move segment
		getMaxMoveSegments: function () {
			// calcualte max segments on canvas
			var segs = 8;

			// calculate possible move positions
			this.canvasData.movePositions = [];
			for (var i = 0; i <= segs; i++) {
				this.canvasData.movePositions.push(Math.round(i * this.canvasData.width / segs));
			}

			return segs;
		},

		// addSticks
		addSticks: function (count) {
			if (_.isUndefined(count) || _.isNaN(count)) {
				console.log('[view.addSticks]: invalid sticks count supplied!');
				return false;
			}
			while (count--) {
				// construct stick data
				var idNum = this.sticksData.length + 1;
				var $stick = $('<div>');
				$stick
					.addClass('stick')
					.attr('id', 'stick-' + idNum);
				this.sticksData.push({
					$el: $stick,
					id: idNum
				});
			}
		},

		// positionSticks
		positionSticks: function (repeat) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.renderSticks]: not enough sticks to render!');
				return false;
			}

			// validate repeat count
			if (_.isUndefined(repeat) || _.isNaN(repeat)) {
				repeat = 1;
			}

			// pick and apply final align position
			var alignPosIndex = Math.floor(Math.random() * this.canvasData.movePositions.length);
			_.forEach(this.sticksData, _.bind(function (stickData) {
				stickData.pos = stickData.newpos = alignPosIndex;
			}, this));

			// pick random stick and swipe direction
			var primaryStickIndex = Math.ceil(Math.random() * this.sticksData.length);
			var swipeDirection = Math.random() < 0.5 ? 'left' : 'right';

			// calculate stick positions
			while (repeat--) {
				this.calculateStickPositions(primaryStickIndex, swipeDirection);
			}
		},

		// calculateStickPositions
		calculateStickPositions: function (primaryStickIndex, swipeDirection) {
			// get level data
			var levelData = App.data.levels[App.data.levels.defaultLevel];

			// stick deter factor
			var deterRatioDivider = 1 / levelData.moveDeterRatio;

			console.group('[calculateStickPositions]');
			console.log('primaryStickIndex: ', primaryStickIndex);
			console.log('swipeDirection: ', swipeDirection);

			// update sticks data
			_.forEach(this.sticksData, _.bind(function (stickData) {
				stickData.deterLevel = Math.abs(stickData.id - primaryStickIndex) + 1;
				var posShiftAmount = this.maxMoveSegments / Math.pow(deterRatioDivider, stickData.deterLevel);

				console.group('Stick: ', stickData.id);
				console.log('deterLevel: ', stickData.deterLevel);
				console.log('posShiftAmount: ', posShiftAmount);
				console.log('pos: ', stickData.pos);

				if (swipeDirection == 'left') {
					// on swipe left
					stickData.newpos = stickData.pos - posShiftAmount;
					if (stickData.newpos < 0) {
						stickData.newpos = Math.abs(stickData.newpos);
					}
				} else if (swipeDirection == 'right') {
					// on swipe right
					stickData.newpos = stickData.pos + posShiftAmount;
					if (stickData.newpos > this.maxMoveSegments) {
						stickData.newpos = this.maxMoveSegments * 2 - stickData.newpos;
					}
				}

				console.log('newpos: ', stickData.newpos);
				console.groupEnd();
			}, this));

			console.groupEnd();
		},

		// renderSticks
		renderSticks: function () {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.renderSticks]: not enough sticks to render!');
				return false;
			}

			// get existing sticks in DOM
			var $sticks = this.$sticksLayer.find('.stick');

			// render
			_.forEach(this.sticksData, _.bind(function (stickData) {
				// basic stick properties
				var stickWidth = 8;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var stickTop = (stickData.id - 1) * stickHeight;

				// get stick pos or generate a random one
				var stickLeftPos = stickData.newpos;

				if (_.isUndefined(stickLeftPos) || _.isNaN(stickLeftPos)) {
					stickLeftPos = Math.floor(Math.random() * this.canvasData.movePositions.length);
				}

				// store pos data
				stickData.pos = stickLeftPos;

				// get stick left position
				var stickLeft = this.canvasData.movePositions[stickLeftPos];

				// no margin if new pos is on edges
				var marginLeft = -1 * stickWidth / 2;
				if (stickLeftPos === 0) {
					marginLeft = 0;
				}
				if (stickLeftPos == this.canvasData.movePositions.length - 1) {
					marginLeft = -1 * stickWidth;
				}

				// construct render properties
				var cssProps = {
					'position': 'absolute',
					'width': stickWidth + 'px',
					'height': stickHeight + 'px',
					'top': stickTop + 'px',
					'left': stickLeft + 'px',
					'marginLeft': marginLeft
				};

				// anim to render properties
				TweenLite.to(stickData.$el[0], this.animSpeed.norm, cssProps);

				// append to DOM if instance is new
				if (stickData.id > $sticks.length) {
					stickData.$el.appendTo(this.$sticksLayer);
				}
			}, this));
		},

		// initGrids
		initGrids: function () {
			// get grid data
			var cols = this.maxMoveSegments;
			var rows = this.sticksData.length;

			// calculate grid positions
			var colsPos = [];
			var rowsPos = [];

			for (var i = 1; i < cols; i++) {
				colsPos.push(Math.round(this.canvasData.width / (cols) * i));
			}
			for (var j = 1; j < rows; j++) {
				rowsPos.push(Math.round(this.canvasData.height / (rows) * j));
			}

			// render grid
			_.forEach(colsPos, _.bind(function (pos) {
				var $col = $('<div/>');
				$col
					.attr('data-index', colsPos.indexOf(pos) + 1)
					.addClass('line vert')
					.css({
						'left': pos + 'px'
					})
					.appendTo(this.$gridLayer);
			}, this));
			_.forEach(rowsPos, _.bind(function (pos) {
				var $row = $('<div/>');
				$row
					.addClass('line horz')
					.css({
						'top': pos + 'px'
					})
					.appendTo(this.$gridLayer);
			}, this));
		},

		// initGame
		initGame: function (levelData) {
			// get canvas data
			this.canvasData = this.getCanvasData();
			// get max move segments count
			this.maxMoveSegments = this.getMaxMoveSegments();
			// adding sticks
			this.addSticks(levelData.sticksCount);
			// position sticks
			this.positionSticks();
			// render sticks
			this.renderSticks();
			// init touch inputs
			this.initTouch();
			this.initHammer();
			// draw grids
			this.initGrids();
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {
			this.initGame(App.data.levels[App.data.levels.defaultLevel]);
		}
	};

	return App;
})(window.App);
