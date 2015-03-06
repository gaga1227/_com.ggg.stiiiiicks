window.App = (function(app) {
	var App = app || {};

	// view module
	App.view = {

		// properties
		// -------------------------------------------------------------------------------------------

		// data
		canvasData: null,
		sticksData: [],

		// elems
		$document: $('document'),
		$sticksLayer: $('#sticksLayer'),
		$gridLayer: $('#gridLayer'),

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
		onTouchStart: function(e) {
			// make target stick active
			this.$activeStick = this.getTargetStick(e);
			this.$activeStick
				.addClass('active')
				.siblings('.stick').removeClass('active');
		},
		onTouchMove: function(e) {
			// update target stick to active
			var $activeStick = this.$activeStick;
			var $newActiveStick = this.getTargetStick(e);

			if ($activeStick.index() !== $newActiveStick.index()) {
				this.$activeStick = $newActiveStick;
			}

			this.$activeStick
				.addClass('active')
				.siblings('.stick').removeClass('active');
		},
		onTouchEnd: function(e) {
			// remove active stick
			this.$sticksLayer.find('.stick').removeClass('active');
		},

		// register touch inputs
		initTouch: function(levelData) {
			this.$sticksLayer
				.off(this.touchEvents.join(' '))
				.on(this.touchEvents[0], _.bind(this.onTouchStart, this))
				.on(this.touchEvents[1], _.bind(this.onTouchMove, this))
				.on(this.touchEvents[2], _.bind(this.onTouchEnd, this))
				.on(this.touchEvents[3], _.bind(this.onTouchEnd, this))
				.on(this.touchEvents[4], _.bind(this.onTouchEnd, this));
		},

		// register touch gestures
		initHammer: function(levelData) {
			this.hammer = new Hammer(this.$sticksLayer[0]);
			this.hammer.on('swipe', _.bind(function(e) {
				// get primary stick from touch position
				var touchCenterY = e.center.y;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var primaryStickIndex = Math.ceil(touchCenterY / stickHeight);
				var deterRatioDivider = 1 / levelData.moveDeterRatio;

				// update sticks data
				_.forEach(this.sticksData, _.bind(function(stickData) {
					stickData.deterLevel = Math.abs(stickData.id - primaryStickIndex);
					var posShiftAmount = this.maxMoveSegments / Math.pow(deterRatioDivider, stickData.deterLevel);

					if (e.direction == 2) {
						// on swipe left
						stickData.newpos = stickData.pos - posShiftAmount;
						if (stickData.newpos < 0) {
							stickData.newpos += this.maxMoveSegments;
						}
					} else if (e.direction == 4) {
						// on swipe right
						stickData.newpos = stickData.pos + posShiftAmount;
						if (stickData.newpos > this.maxMoveSegments) {
							stickData.newpos = stickData.newpos - this.maxMoveSegments;
						}
					}
				}, this));

				// render all sticks
				this.renderSticks();
			}, this));
		},

		// functions
		// -------------------------------------------------------------------------------------------

		// toggleLoader
		toggleLoader: function(showflag) {
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
		getTargetStick: function(e) {
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
		getCanvasData: function() {
			var canvas = {
				width: $(document).width(),
				height: $(document).height()
			};
			return canvas;
		},

		// calculate maximum count of move segment
		getMaxMoveSegments: function(levelData) {
			// calcualte max segments on canvas
			var segs = Math.pow(1 / levelData.moveDeterRatio, levelData.sticksCount - 1);
			segs = 8;

			// calculate possible move positions
			this.canvasData.movePositions = [];
			for (var i = 0; i <= segs; i++) {
				this.canvasData.movePositions.push(i * this.canvasData.width / segs);
			}

			// removes edge cases (first/last)
			// this.canvasData.movePositions.shift();
			// this.canvasData.movePositions.pop();

			return segs;
		},

		// addSticks
		addSticks: function(count) {
			if (_.isNaN(count)) {
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

		// renderSticks
		renderSticks: function(levelData) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.renderSticks]: not enough sticks to render!');
				return false;
			}

			// get existing sticks in DOM
			var $sticks = this.$sticksLayer.find('.stick');

			// render
			_.forEach(this.sticksData, _.bind(function(stickData) {
				// basic stick properties
				var stickWidth = 8;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var stickTop = (stickData.id - 1) * stickHeight;

				// get stick pos or generate a random one
				var stickLeftPos = stickData.newpos;
				if (!stickLeftPos || _.isNaN(stickLeftPos)) {
					stickLeftPos = Math.floor(Math.random() * this.canvasData.movePositions.length);

					//TODO: need to check if all sticks are start with same random pos
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

				// apply render properties
				stickData.$el.css(cssProps);

				// append to DOM if instance is new
				if (stickData.id > $sticks.length) {
					stickData.$el.appendTo(this.$sticksLayer);
				}
			}, this));
		},

		// initGrids
		initGrids: function(levelData) {
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
			_.forEach(colsPos, _.bind(function(pos) {
				var $col = $('<div/>');
				$col
					.addClass('line vert')
					.css({
						'left': pos + 'px'
					})
					.appendTo(this.$gridLayer);
			}, this));
			_.forEach(rowsPos, _.bind(function(pos) {
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
		initGame: function(levelData) {
			// get canvas data
			this.canvasData = this.getCanvasData();
			// get max move segments count
			this.maxMoveSegments = this.getMaxMoveSegments(levelData);
			// adding sticks
			this.addSticks(levelData.sticksCount);
			// render sticks
			this.renderSticks(levelData);
			// init touch inputs
			this.initTouch(levelData);
			this.initHammer(levelData);
			// draw grids
			this.initGrids(levelData);
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function() {
			this.initGame(App.data.levels[App.data.levels.defaultLevel]);
		}
	};

	return App;
})(window.App);
