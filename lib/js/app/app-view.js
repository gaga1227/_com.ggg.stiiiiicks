window.App = (function (app) {
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
			console.log('onTouchStart', e);
		},
		onTouchMove: function (e) {
			console.log('onTouchMove', e);
		},
		onTouchEnd: function (e) {
			console.log('onTouchEnd', e);
		},

		// register touch inputs
		initTouch: function () {
			this.$sticksLayer
				.off(this.touchEvents.join(' '))
				.on(this.touchEvents[0], this.onTouchStart)
				.on(this.touchEvents[1], this.onTouchMove)
				.on(this.touchEvents[2], this.onTouchEnd)
				.on(this.touchEvents[3], this.onTouchEnd)
				.on(this.touchEvents[4], this.onTouchEnd);
		},

		// register touch gestures
		initHammer: function () {
			this.hammer = new Hammer(this.$sticksLayer[0]);
			this.hammer.on('swipe', _.bind(function (e) {
				this.renderSticks();
				if (e.direction == 2) {
					// on swipe left

				} else if (e.direction == 4) {
					// on swipe right
				}
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

		// getCanvasData
		getCanvasData: function () {
			var canvas = {
				width: $(document).width(),
				height: $(document).height()
			};
			return canvas;
		},

		// calculate maximum count of move segment
		getMaxMoveSegments: function (levelData) {
			var segs = 1;
			segs = 8;
			// segs /= levelData.moveRatioToCanvas;
			// for (var i = 1; i < levelData.sticksCount; i++) {
			// 	segs /= levelData.moveRatioToParent;
			// }

			// calculate possible move positions
			this.canvasData.movePositions = [];
			for (var i = 0; i <= segs; i++) {
				this.canvasData.movePositions.push(i * this.canvasData.width / segs);
			}

			// removes edge cases (first/last)
			this.canvasData.movePositions.shift();
			this.canvasData.movePositions.pop();

			return segs;
		},

		// addSticks
		addSticks: function (count) {
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
		renderSticks: function (levelData) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.renderSticks]: not enough sticks to render!');
				return false;
			}

			var $sticks = this.$sticksLayer.find('.stick');

			// render
			_.forEach(this.sticksData, _.bind(function (stickData) {
				var stickWidth = 4;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var stickTop = (stickData.id - 1) * stickHeight;

				var stickLeftPos = Math.floor(Math.random() * this.canvasData.movePositions.length);
				var stickLeft = this.canvasData.movePositions[stickLeftPos];

				var cssProps = {
					'position': 'absolute',
					'width': stickWidth + 'px',
					'height': stickHeight + 'px',
					'top': stickTop + 'px',
					'left': stickLeft + 'px',
					'marginLeft': -1 * stickWidth / 2
				};

				stickData.$el.css(cssProps);
				if (stickData.id > $sticks.length) {
					stickData.$el.appendTo(this.$sticksLayer);
				}
			}, this));
		},

		// initGame
		initGame: function (levelData) {
			// get canvas data
			this.canvasData = this.getCanvasData();
			// get max move segments count
			this.maxMoveSegments = this.getMaxMoveSegments(levelData);
			// adding sticks
			this.addSticks(levelData.sticksCount);
			// render sticks
			this.renderSticks(levelData);
			// init touch inputs
			this.initTouch();
			this.initHammer();
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {
			this.initGame(App.data.levels[App.data.levels.defaultLevel]);
		}
	};

	return App;
})(window.App);
