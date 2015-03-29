window.App = (function (app) {
	var App = app || {};

	// data module
	App.data = {

		// data
		// -------------------------------------------------------------------------------------------

		// game
		game: {
			allSticksAligned: false,
			sticksAligned: 0,
			scrambleMoves: 1
		},

		// levels
		levels: {
			defaultLevel: 0,
			0: {
				sticksCount: 3,
				moveDeterRatio: 0.5
			}
		},

		// messages
		msg: {
			connection_error: [
				"Data Request Failed",
				"Please make sure your device has a working connection and try again."
			],
			content_unavailable: [
				"Content Unavailable",
				"The content you requested is not available in this version of the app, please contact support."
			],
			offline: [
				"No Connection Found",
				"This app requires a working internet connection to work properly."
			]
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {

		}
	};

	return App;
})(window.App);

window.App = (function (app) {
	var App = app || {};

	// Platform
	window.Platform = function () {
		//vars
		var ua = navigator.userAgent.toLowerCase();
		//detecting functions
		function checkPlatform(os) {
			return (ua.indexOf(os.toLowerCase()) > -1);
		}

		function checkEvent(e) {
			return (e in document.documentElement);
		}
		//add properties
		this.iPhone = checkPlatform('iPhone');
		this.iPad = checkPlatform('iPad');
		this.iPod = checkPlatform('iPod');
		this.iOS = this.iPhone || this.iPad || this.iPod;
		this.android = checkPlatform('android');
		this.touchOS = checkEvent('ontouchstart');
		this.chrome = ua.indexOf('chrome') > -1;
		this.debugLog = function () {
			console.log('iPhone: ' + this.iPhone);
			console.log('iPad: ' + this.iPad);
			console.log('iPod: ' + this.iPod);
			console.log('iOS: ' + this.iOS);
			console.log('android: ' + this.android);
			console.log('touchOS: ' + this.touchOS);
		};
		//return self
		return this;
	}();

	// Alert
	if (!window.Platform.iOS && !window.Platform.android) {
		window.alert = function (msg) {
			console.log('window.alert: ' + msg);
		};
	}

	// utils module
	App.utils = {

		// addDeviceClass
		addDeviceClass: function () {
			var p = Platform;
			$html = $('html:eq(0)');
			$html.removeClass('no-js').addClass('js');
			if (p.touchOS) {
				$html.addClass('touch');
			} else {
				$html.addClass('no-touch');
			}
			if (p.iOS) {
				$html.addClass('ios');
				if (p.iPhone) {
					$html.addClass('iphone');
				} else if (p.iPod) {
					$html.addClass('ipod');
				} else if (p.iPad) {
					$html.addClass('ipad');
				}
			} else if (p.android) {
				$html.addClass('android');
			}
		},

		// checkConnection
		checkConnection: function () {
			//exit if no API
			if (!navigator.connection) return false;
			//vars
			var networkState = navigator.connection.type;
			//return state
			return networkState;
		},

		// popMsg
		popMsg: function (msg) {
			//exit
			if (!msg || msg.length < 2) return 'Invalid title or message text';
			//show msg
			if (navigator.notification) {
				navigator.notification.alert(
					// message
					msg[1],
					// callback
					function () {},
					// title
					msg[0],
					// buttonName
					msg[2] ? msg[2] : 'OK'
				);
			} else {
				alert('[' + msg[0] + ']: ' + msg[1]);
			}
		},

		// reloadApp
		reloadApp: function () {
			//update to main app file address without page id
			window.location = String(window.location).substr(0, String(window.location).indexOf('#'));
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {
			this.addDeviceClass();
		}
	};

	return App;
})(window.App);

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
				'opacity': '1'
			},
			stickInactive: {
				'opacity': '0.4'
			}
		},

		// elems
		$gameCanvas: $('#gameCanvas'),
		$sticksLayer: $('#sticksLayer'),
		$bgAnimLayer: $('#bgAnimLayer'),
		$gridLayer: $('#gridLayer'),

		// animations
		// -------------------------------------------------------------------------------------------
		animateStickActive: function (ele) {
			TweenLite.to(ele, this.animSpeed.norm, this.cssAnimProps.stickActive);
		},
		animateStickInactive: function (ele) {
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
			this.updateSticksOnTouch(e);
			this.addBgAnimsOnTouch(e);
		},
		onTouchMove: function (e) {
			this.updateSticksOnTouch(e);
			this.addBgAnimsOnTouch(e);
		},
		onTouchEnd: function (e) {
			this.updateSticksOnTouch(e);
			this.addBgAnimsOnTouch(e);
		},

		// update sticks on touch events
		updateSticksOnTouch: function (e) {
			if (e.type === 'touchstart') {
				// get target active stick
				this.$activeStick = this.getTargetStick(e);
				// animate sticks
				this.animateStickActive(this.$activeStick[0]);
				this.$activeStick.siblings('.stick').each(_.bind(function (idx, ele) {
					this.animateStickInactive(ele);
				}, this));
			} else if (e.type === 'touchmove') {
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
			} else {
				// remove active stick
				this.$sticksLayer.find('.stick').each(_.bind(function (idx, ele) {
					this.animateStickInactive(ele);
				}, this));
			}
		},

		// adding background animations on touch
		addBgAnimsOnTouch: function (e) {
			if (e.type === 'touchstart') {

			} else if (e.type === 'touchmove') {
				// add particles on touch move
				var repeat = 1;
				while (repeat--) {
					this.addParticle(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY);
				}
			} else {

			}
		},

		// add bg particle
		addParticle: function (x, y) {
			if (!_.isNumber(x) || !_.isNumber(y)) {
				return false;
			}

			// create particle elem
			var $particle = $('<div/>');

			// add to DOM with initial props
			var cssPropsStart = {
				'top': y + 'px',
				'left': x + 'px',
				'width': '0px',
				'height': '0px',
				'opacity': '0.2'
			};
			$particle
				.addClass('particle')
				.css(cssPropsStart)
				.appendTo(this.$bgAnimLayer);

			// generate end props
			var radius = 60;
			var radiusOffset = 55;
			var offsetX = (Math.random() * radiusOffset + (radius - radiusOffset)) * (Math.random() > 0.5 ? -1 : 1);
			var offsetY = Math.sqrt(Math.pow(radius, 2) - Math.pow(offsetX, 2)) * (Math.random() > 0.5 ? -1 : 1);
			var endX = Math.round(x + offsetX);
			var endY = Math.round(y + offsetY);
			var size = 50;
			var sizeOffset = Math.round(Math.random() * (size * 0.6));
			size += sizeOffset;

			var cssPropsEnd = {
				'top': endY + 'px',
				'left': endX + 'px',
				'width': size + 'px',
				'height': size + 'px',
				'opacity': '0',
				// handlers
				onComplete: _.bind(function () {
					$particle.remove();
				}, this)
			};

			// animate particle to end props
			TweenLite.to($particle[0], 0.6, cssPropsEnd);
		},

		// register touch inputs
		initTouch: function () {
			this.$gameCanvas
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

			// add events handler
			this.hammer.on('tap doubletap press swipe', _.bind(function (e) {

				// get primary stick from touch position
				var touchCenterY = e.center.y;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var primaryStickIndex = Math.ceil(touchCenterY / stickHeight);

				// user move inputs
				var swipeDirection;
				if (e.type == 'tap') {
					if (e.center.x < this.canvasData.width / 2) {
						swipeDirection = 'left';
					} else {
						swipeDirection = 'right';
					}
				} else if (e.type == 'swipe') {
					if (e.direction == 2) {
						swipeDirection = 'left';
					} else if (e.direction == 4) {
						swipeDirection = 'right';
					}
				}

				// debug inputs
				if (e.type == 'press') {
					this.$gridLayer.toggleClass('debug');
				}

				// calculate stick positions
				this.calculateStickPositions(primaryStickIndex, swipeDirection);
				// render all sticks
				this.renderSticks(true);
			}, this));
		},

		// functions
		// -------------------------------------------------------------------------------------------

		// toggle loader
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

		// get touch target stick
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

		// get canvas data
		getCanvasData: function () {
			var canvas = {
				width: this.$gameCanvas.width(),
				height: this.$gameCanvas.height()
			};
			return canvas;
		},

		// calculate maximum count of move segment
		getMaxMoveSegments: function (levelData) {
			// calcualte max segments on canvas
			var segs = Math.pow(1 / levelData.moveDeterRatio, levelData.sticksCount);

			// calculate possible move positions
			this.canvasData.movePositions = [];
			for (var i = 0; i <= segs; i++) {
				this.canvasData.movePositions.push(Math.round(i * this.canvasData.width / segs));
			}

			return segs;
		},

		// add sticks to scene
		addSticks: function (count) {
			if (_.isUndefined(count) || _.isNaN(count)) {
				console.log('[view.addSticks]: invalid sticks count supplied!');
				return false;
			}

			var canvasData = this.getCanvasData();

			while (count--) {
				// construct stick data
				var idNum = this.sticksData.length + 1;
				var $stick = $('<div/>');

				$stick
					.addClass('stick')
					.attr('id', 'stick-' + idNum)
					.css({
						'width': '0px',
						'height': '0px',
						'top': Math.round(canvasData.height / 2) + 'px',
						'left': Math.round(canvasData.width / 2) + 'px',
						'opacity': '0',
					});

				this.sticksData.push({
					$el: $stick,
					id: idNum
				});
			}
		},

		// position sticks, from a random or given aligned position
		positionSticks: function (repeat, fromAligned, fromAlignedPos) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.positionSticks]: not enough sticks to position!');
				return false;
			}

			// validate repeat count
			if (_.isUndefined(repeat) || _.isNaN(repeat)) {
				repeat = 1;
			}

			// pick and apply final align position
			if (!fromAligned) {
				var alignPosIndex = fromAlignedPos ? fromAlignedPos : Math.floor(Math.random() * this.canvasData.movePositions.length);

				_.forEach(this.sticksData, _.bind(function (stickData) {
					if (stickData.pos !== alignPosIndex) {
						stickData.pos = stickData.newpos = alignPosIndex;
					}
				}, this));
			}

			// repeat calculation
			while (repeat--) {
				// pick random stick and swipe direction
				var primaryStickIndex = Math.ceil(Math.random() * this.sticksData.length);
				var swipeDirection = Math.random() < 0.5 ? 'left' : 'right';

				// calculate stick positions
				this.calculateStickPositions(primaryStickIndex, swipeDirection, true);
			}
		},

		// calculate all sticks positions, given swipe target stick index and swipe direction
		calculateStickPositions: function (primaryStickIndex, swipeDirection, noAlignedNewPos) {
			// get level data
			var levelData = App.data.levels[App.data.levels.defaultLevel];

			// stick deter factor
			var deterRatioDivider = 1 / levelData.moveDeterRatio;

			console.groupCollapsed('[view.calculateStickPositions]');
			console.log('primaryStickIndex: ', primaryStickIndex);
			console.log('swipeDirection: ', swipeDirection);

			// update sticks data
			_.forEach(this.sticksData, _.bind(function (stickData) {
				stickData.deterLevel = Math.abs(stickData.id - primaryStickIndex) + 1;
				var posShiftAmount = this.maxMoveSegments / Math.pow(deterRatioDivider, stickData.deterLevel);

				console.groupCollapsed('Stick: ', stickData.id);
				console.log('deterLevel: ', stickData.deterLevel);
				console.log('posShiftAmount: ', posShiftAmount);
				console.log('pos: ', stickData.pos);

				stickData.bounce = false;

				if (swipeDirection == 'left') {
					// on swipe left
					stickData.newpos = stickData.pos - posShiftAmount;
					if (stickData.newpos < 0) {
						stickData.bounce = 'left';
						stickData.newpos = Math.abs(stickData.newpos);
					}
				} else if (swipeDirection == 'right') {
					// on swipe right
					stickData.newpos = stickData.pos + posShiftAmount;
					if (stickData.newpos > this.maxMoveSegments) {
						stickData.bounce = 'right';
						stickData.newpos = this.maxMoveSegments * 2 - stickData.newpos;
					}
				}

				// store newly calculated position to pos
				stickData.pos = stickData.newpos;

				console.log('newpos: ', stickData.pos);
				console.groupEnd();
			}, this));

			console.groupEnd();

			// recalculate positions if new positions are aligned
			if (noAlignedNewPos && this.ifSticksAligned()) {
				this.calculateStickPositions(primaryStickIndex, swipeDirection, true);
			}
		},

		// get possible swipe direction, given end position and shift amount
		getSwipeDirection: function (pos, posShiftAmount) {
			var swipeDirection;

			// check possible direction(s)
			var canFromLeft = pos > posShiftAmount;
			var canFromLRight = Math.abs(this.maxMoveSegments - pos) > posShiftAmount;

			// if position can be divided by posShiftAmount
			if (pos % posShiftAmount === 0) {
				// if position is on left edge
				if (pos === 0) {
					swipeDirection = 'left';
				}
				// if position is on right edge
				else if (pos == this.maxMoveSegments) {
					swipeDirection = 'right';
				}
				// otherwise choose either one
				else {
					swipeDirection = Math.random() < 0.5 ? 'left' : 'right';
				}
			}
			// otherwise
			else {
				if (canFromLeft && canFromLRight) {
					swipeDirection = Math.random() < 0.5 ? 'left' : 'right';
				} else if (canFromLeft && !canFromLRight) {
					swipeDirection = 'left';
				} else {
					swipeDirection = 'right';
				}
			}

			return swipeDirection;
		},

		// render sticks
		renderSticks: function (userMove) {
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

				// store pos data if not already
				if (stickData.pos != stickLeftPos) {
					stickData.pos = stickLeftPos;
				}

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

				// calculate delay
				var delay = userMove ? 0 : ((stickData.id - 1) * (0.6 / this.sticksData.length));

				// final position CSS properties
				var cssProps = {
					'width': stickWidth + 'px',
					'height': stickHeight + 'px',
					'top': stickTop + 'px',
					'left': stickLeft + 'px',
					'marginLeft': marginLeft + 'px',
					'opacity': '0.4',
					//anim props
					'delay': delay
				};

				// extend final position CSS properties, with complete function on last stick
				if (stickData.id == this.sticksData.length) {
					_.merge(cssProps, {
						onComplete: _.bind(function () {
							if (userMove) {
								// check if sticks are aligned and update aligned sticks count
								this.updateAlignedSticks();
							}
						}, this)
					});
				}

				// edge bounce CSS properties
				var bounceLeftCssProps = {
					'width': stickWidth + 'px',
					'height': stickHeight + 'px',
					'top': stickTop + 'px',
					'left': 0 + 'px',
					'marginLeft': 0 + 'px'
				};
				var bounceRightCssProps = {
					'width': stickWidth + 'px',
					'height': stickHeight + 'px',
					'top': stickTop + 'px',
					'left': this.canvasData.movePositions[this.maxMoveSegments] + 'px',
					'marginLeft': -1 * stickWidth + 'px'
				};

				// animate to final position with edge bounce
				if (userMove && (stickData.bounce == 'left' || stickData.bounce == 'right')) {
					TweenLite.to(stickData.$el[0], this.animSpeed.norm / 2,
						_.merge(
							(stickData.bounce == 'left') ? bounceLeftCssProps : bounceRightCssProps, {
								onComplete: _.bind(function () {
									TweenLite.to(stickData.$el[0], this.animSpeed.norm / 2, cssProps);
								}, this)
							}
						)
					);
				}
				// animate directly to final position
				else {
					TweenLite.to(stickData.$el[0], this.animSpeed.norm, cssProps);
				}

				// append to DOM if instance is new
				if (stickData.id > $sticks.length) {
					stickData.$el.appendTo(this.$sticksLayer);
				}
			}, this));
		},

		// update aligned sticks count
		updateAlignedSticks: function () {
			// check sticks positions
			App.data.game.allSticksAligned = this.ifSticksAligned();
			if (App.data.game.allSticksAligned) {
				// update total aligned sticks
				App.data.game.sticksAligned += this.sticksData.length;

				// update game complexity
				if (App.data.game.sticksAligned < 30) {
					App.data.game.scrambleMoves = 1;
				} else if (App.data.game.sticksAligned < 90) {
					App.data.game.scrambleMoves = 2;
				} else if (App.data.game.sticksAligned < 180) {
					App.data.game.scrambleMoves = 3;
				} else if (App.data.game.sticksAligned < 390) {
					App.data.game.scrambleMoves = 4;
				} else {
					App.data.game.scrambleMoves = 5;
				}

				console.log('[Total Stiiiiicks Aligned]: ', App.data.game.sticksAligned);
				console.log('[scrambleMoves]: ', App.data.game.scrambleMoves);

				// shrink sticks from the top
				this.shrinkStick();
			}
		},

		// check if all sticks are aligned
		ifSticksAligned: function () {
			for (var i = 1; i < this.sticksData.length; i++) {
				if (this.sticksData[i].newpos !== this.sticksData[0].newpos) {
					return false;
				}
			}
			return true;
		},

		// shrink sticks from an index
		shrinkStick: function (idx) {
			// shrink from top if not specified
			idx = _.isUndefined(idx) ? 0 : idx;

			// check target stick is valid
			if (!this.sticksData[idx].$el.length) {
				return '[view.shrinkStick]: Invalid stick element!';
			}

			// get stick elem
			var stickEle = this.sticksData[idx].$el[0];

			// prep anim params
			var cssProps = {
				'width': '8px',
				'height': '0px',
				'top': '0px',
				'left': '50%',
				'marginLeft': '-4px',
				onComplete: _.bind(function () {
					// mark stick state and reset
					this.sticksData[idx].shrunk = true;

					// reset CSS styles
					var resetCSSProps = {
						'width': '8px',
						'height': this.canvasData.height / this.sticksData.length + 'px',
						'top': this.canvasData.rowsPos[idx] + 'px',
						'left': ((idx % 2 !== 0) ? (this.canvasData.width + 50) : -50) + 'px',
						'marginLeft': '0px',
						'opacity': '0'
					};
					this.sticksData[idx].$el.css(resetCSSProps);

					// reset all sticks after shrinking second-to-last stick
					if (idx == (this.sticksData.length - 1)) {
						this.resetSticks();
					}
					// otherwise, shrink next one
					else {
						this.shrinkStick(idx + 1);
					}
				}, this)
			};

			// start animation
			TweenLite.to(stickEle, 0.6 / this.sticksData.length, cssProps);
		},

		// reset sticks for next round
		resetSticks: function () {
			console.log('[view.resetSticks]');

			// position all sticks
			this.positionSticks(App.data.game.scrambleMoves);
			// render all sticks
			this.renderSticks();
		},

		// render background grids
		initGrids: function () {
			// get grid data
			var cols = this.maxMoveSegments;
			var rows = this.sticksData.length;

			// calculate grid positions
			var colsPos = this.canvasData.colsPos = [];
			var rowsPos = this.canvasData.rowsPos = [];

			for (var i = 0; i <= cols; i++) {
				colsPos.push(Math.round(this.canvasData.width / (cols) * i));
			}
			for (var j = 0; j <= rows; j++) {
				rowsPos.push(Math.round(this.canvasData.height / (rows) * j));
			}

			// render grid
			this.$gridLayer.empty();
			_.forEach(colsPos, _.bind(function (pos) {
				// skip edges
				if (pos === 0 || pos === this.canvasData.width) {
					return;
				}
				// add grid line
				var $col = $('<div/>');
				$col
					.attr('data-index', colsPos.indexOf(pos))
					.addClass('line vert')
					.css({
						'left': pos + 'px'
					})
					.appendTo(this.$gridLayer);
			}, this));
			_.forEach(rowsPos, _.bind(function (pos) {
				// skip edges
				if (pos === 0 || pos === this.canvasData.height) {
					return;
				}
				// add grid line
				var $row = $('<div/>');
				$row
					.addClass('line horz')
					.css({
						'top': pos + 'px'
					})
					.appendTo(this.$gridLayer);
			}, this));
		},

		// calculating and update game canvas data
		updateGameCanvas: function (levelData, updateSticks) {
			// get canvas data
			this.canvasData = this.getCanvasData();
			// get max move segments count
			this.maxMoveSegments = this.getMaxMoveSegments(levelData);
			// draw grids
			this.initGrids();

			// update sticks
			if (updateSticks && this.sticksData.length) {
				// get common stick height
				var stickHeight = this.canvasData.height / this.sticksData.length;
				// get individual stick props and apply
				_.forEach(this.sticksData, _.bind(function (stickData) {
					var stickTop = (stickData.id - 1) * stickHeight;
					var stickLeft = this.canvasData.movePositions[stickData.newpos];
					stickData.$el.css({
						'height': stickHeight + 'px',
						'top': stickTop + 'px',
						'left': stickLeft + 'px'
					});
				}, this));
			}
		},

		// start game with level data
		initGame: function (levelData) {
			// adding sticks
			this.addSticks(levelData.sticksCount);

			// init game canvas data
			// and update on resize
			this.updateGameCanvas(levelData);
			$(window).on('resize.updateGameCanvas', _.bind(function () {
				this.updateGameCanvas(levelData, true);
			}, this));

			// position sticks
			this.positionSticks();
			// render sticks
			this.renderSticks();

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

window.App = (function (app) {
	App = app || {};

	// properties
	// -------------------------------------------------------------------------------------------

	App.name = 'StiiiiickS';
	App.version = '0.0.1';
	App.lastUpdate = '2015-02';

	// handlers
	// -------------------------------------------------------------------------------------------

	// onDeviceReady
	App.onDeviceReady = function (e) {
		console.log('[device] e:deviceready');

		//disable back button default behavior
		/*
		if (App.onDevice && device && typeof(device.overrideBackButton) == 'function') {
			device.overrideBackButton(true);
		}
		// */
	};

	// onPause
	App.onPause = function (e) {
		console.log('[device] e:pause');
	};

	// onResume
	App.onResume = function (e) {
		console.log('[device] e:resume');
	};

	// onOnline
	App.onOnline = function (e) {
		console.log('[device] e:online');
	};

	// onOffline
	App.onOffline = function (e) {
		console.log('[device] e:offline');
		App.utils.popMsg(App.data.msg.offline);
	};

	// onBackbutton
	App.onBackbutton = function (e) {
		console.log('[device] e:backbutton');

		//handle backbutton manually
		window.history.back();

		//exit app
		/*
		if (device && typeof(device.exitApp) == 'function') {
			device.exitApp();
		}
		// */
	};

	// onMenubutton
	App.onMenubutton = function (e) {
		console.log('[device] e:menubutton');
	};

	// init
	// -------------------------------------------------------------------------------------------

	App.init = function () {
		//starting app
		if (!window.Platform.iOS && !window.Platform.android) {
			//alert('NOT running on iOS/Android');
			console.log('NOT running on iOS/Android');
			//set onDevice flag
			App.onDevice = false;
			//manually start app when not on a device
			this.onDeviceReady();
		} else {
			//alert('running on iOS/Android');
			console.log('running on iOS/Android');
			//set onDevice flag
			App.onDevice = true;
			//attach phoneGap events
			document.addEventListener('deviceready', this.onDeviceReady, false);
			document.addEventListener("pause", this.onPause, false);
			document.addEventListener("resume", this.onResume, false);
			document.addEventListener("online", this.onOnline, false);
			document.addEventListener("offline", this.onOffline, false);
			document.addEventListener("backbutton", this.onBackbutton, false);
			document.addEventListener("menubutton", this.onMenubutton, false);
		}

		//only continue if there's jQuery/Zepto
		if (!$) return false;

		//init app modules
		App.utils.init();
		App.view.init();
		App.data.init();
	};

	return App;
})(window.App);

// init App
App.init();
