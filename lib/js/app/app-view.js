window.App = (function (app) {
	var App = app || {};

	// view module
	App.view = {

		// properties
		// -------------------------------------------------------------------------------------------

		// status
		areAllSticksAligned: false,

		// data
		canvasData: null,
		sticksData: [],
		sticksHintData: [],
		activeMsg: null,
		messages: [],
		animSpeed: {
			norm: 0.25,
			msg: 0.5,
			scoreUp: 0.1,
			scoreDown: 0.8
		},

		// GUI
		gui: {
			$scoreText: $('#game .gui.top .title .text'),
			$scoreLabel: $('#game .gui.top .title .label'),
			levelClasses: [
				'level0',
				'level1',
				'level2',
				'level3'
			]
		},

		// elems
		$game: $('#game'),
		$gameCanvas: $('#gameCanvas'),
		$sticksLayer: $('#sticksLayer'),
		$sticksHintLayer: $('#sticksHintLayer'),
		$bgAnimLayer: $('#bgAnimLayer'),
		$gridLayer: $('#gridLayer'),
		$settings: $('#settings'),

		// animations
		// -------------------------------------------------------------------------------------------
		animateStickActive: function (ele) {
			TweenLite.to(ele, this.animSpeed.norm, {
				'opacity': '1'
			});
			$(ele).addClass('active');
		},
		animateStickInactive: function (ele) {
			TweenLite.to(ele, this.animSpeed.norm, {
				'opacity': '0.8'
			});
			$(ele).removeClass('active');
		},

		// touch
		// -------------------------------------------------------------------------------------------

		// events
		touchEvents: [
			'touchstart.gameCanvas',
			'touchmove.gameCanvas',
			'touchend.gameCanvas',
			'touchleave.gameCanvas',
			'touchcancel.gameCanvas'
		],

		// touch input handlers
		onTouchStart: function (e) {
			this.updateSticksOnTouch(e);
			this.updateHintSticksOnTouch(e);
			// this.addBgAnimsOnTouch(e);
		},
		onTouchMove: function (e) {
			this.updateSticksOnTouch(e);
			this.updateHintSticksOnTouch(e);
			// this.addBgAnimsOnTouch(e);
		},
		onTouchEnd: function (e) {
			this.updateSticksOnTouch(e);
			this.updateHintSticksOnTouch(e);
			// this.addBgAnimsOnTouch(e);
		},

		// update sticks on touch events
		updateSticksOnTouch: function (e) {
			if (e.type === 'touchstart') {
				// get target active stick
				this.$activeStick = this.sticksData[this.getTargetStickIndex(e)].$el;
				// animate sticks
				this.animateStickActive(this.$activeStick[0]);
				this.$activeStick.siblings('.stick').each(_.bind(function (idx, ele) {
					this.animateStickInactive(ele);
				}, this));
			} else if (e.type === 'touchmove') {
				// update target stick to active
				var $activeStick = this.$activeStick;
				var $newActiveStick = this.sticksData[this.getTargetStickIndex(e)].$el;
				if (!$activeStick || !$newActiveStick) {
					return false;
				}
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

		// update hint sticks on touch events
		updateHintSticksOnTouch: function (e) {
			if (e.type === 'touchstart') {
				// add hint sticks by clone sticks
				this.$sticksHintLayer.empty();
				_.forEach(this.sticksData, _.bind(function (stickData) {
					var stickHintData = {};
					stickHintData.$el = stickData.$el.clone();
					stickHintData.$el
						.addClass('hint')
						.removeClass('active')
						.attr('id', stickHintData.$el.attr('id') + '-hint')
						.appendTo(this.$sticksHintLayer);
					stickHintData.id = stickData.id;
					stickHintData.pos = stickData.pos;
					this.sticksHintData[stickData.id - 1] = stickHintData;
				}, this));

				// get primary stick and direction from touch point
				var primaryStickIndex = this.getTargetStickIndex(e) + 1;
				var swipeDirection;
				var touchX = e.originalEvent.touches[0].clientX - this.canvasData.offset.left;
				if (touchX < this.canvasData.width / 2) {
					swipeDirection = 'left';
				} else {
					swipeDirection = 'right';
				}

				// calculate positions to hint sticks data
				this.calculateStickPositions(this.sticksHintData, primaryStickIndex, swipeDirection);

				// render hint sticks
				_.forEach(this.sticksHintData, _.bind(function (stickHintData) {


				}, this));
			} else if (e.type === 'touchmove') {
				// update primary stick and direction from touch point

				// check if any changes to above two

				// if changed, recalculate positions

				// render updates

			} else {
				// animate hint sticks back to sticks positions

				// remove elements

			}
		},

		// adding background animations on touch
		addBgAnimsOnTouch: function (e) {
			if (e.type === 'touchstart') {

			} else if (e.type === 'touchmove') {
				// add particles on touch move
				var touchX = e.originalEvent.touches[0].clientX - this.canvasData.offset.left;
				var touchY = e.originalEvent.touches[0].clientY - this.canvasData.offset.top;
				var repeat = 1;
				while (repeat--) {
					this.addParticle(touchX, touchY);
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
			// clean up old hammer
			if (this.hammer) {
				this.hammer.off('tap swipe');
				this.hammer.destroy();
				this.hammer = null;
			}

			// new hammer
			this.hammer = new Hammer(this.$gameCanvas[0]);

			// add events handler
			this.hammer.on('tap swipe', _.bind(function (e) {
				// update moves
				App.data.game.totalMoves++;

				// deduct move from score
				App.data.game.stiiiiicks -= 1;
				this.$game.trigger({
					type: 'update.score',
					amount: -1
				});

				// get primary stick from touch position
				var touchX = e.center.x - this.canvasData.offset.left;
				var touchY = e.center.y - this.canvasData.offset.top;
				var stickHeight = this.canvasData.height / this.sticksData.length;
				var primaryStickIndex = Math.ceil(touchY / stickHeight);

				// user move inputs
				var swipeDirection;
				if (e.type == 'tap') {
					if (touchX < this.canvasData.width / 2) {
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

				// calculate stick positions
				this.calculateStickPositions(false, primaryStickIndex, swipeDirection);
				// render all sticks
				this.renderSticks(true);
			}, this));
		},

		// functions - utils
		// -------------------------------------------------------------------------------------------

		// get canvas data
		getCanvasData: function () {
			var canvas = {
				width: this.$gameCanvas.width(),
				height: this.$gameCanvas.height(),
				offset: this.$gameCanvas.offset()
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

		// get touch target stick's index
		getTargetStickIndex: function (e) {
			var touchY = e.originalEvent.touches[0].clientY - this.canvasData.offset.top;
			var rowsCount = this.sticksData.length;
			var rowHeight = this.canvasData.height / rowsCount;
			var targetIndex = Math.floor(touchY / rowHeight);

			return (targetIndex >= 0) ? targetIndex : false;
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

		// functions - sticks
		// -------------------------------------------------------------------------------------------

		// add sticks to scene
		addSticks: function (count) {
			if (_.isUndefined(count) || _.isNaN(count)) {
				console.log('[view.addSticks]: invalid sticks count supplied!');
				return false;
			}

			// clean up old sticks data
			if (this.sticksData.length) {
				this.sticksData = [];
			}

			// get latest canvas data
			var canvasData = this.getCanvasData();

			// get existing sticks in DOM
			var $sticks = this.$sticksLayer.find('.stick');

			// update sticks data
			while (count--) {
				// get individual instance id
				var idNum = this.sticksData.length + 1;
				// check individual stick DOM existance
				var hasOldStick = (idNum <= $sticks.length);
				// use old instance or create new one depending on DOM existance
				var $stick = hasOldStick ? $($sticks[idNum - 1]) : $('<div/>');

				// update stick properties
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

				// add to data collection
				this.sticksData.push({
					$el: $stick,
					id: idNum
				});
			}
		},

		// position sticks, from a random or given aligned position
		// - repeat: Number (iterations required for reposition scrambling)
		// - fromAlignedPos: Number (array index for a specified resulting aligned position)
		positionSticks: function (repeat, fromAlignedPos) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.positionSticks]: not enough sticks to position!');
				return false;
			}

			// validate repeat count
			if (_.isUndefined(repeat) || _.isNaN(repeat)) {
				repeat = 1;
			}

			// vars
			var alignPosIndex;
			var swipeDirection;
			var primaryStickIndex;
			var isSimpleMove = App.data.game.totalAlignments === 0 || App.data.game.scrambleMoves === 1;

			// assign if one is supplied
			if (_.isNumber(fromAlignedPos)) {
				alignPosIndex = fromAlignedPos;
			}
			// otherwise randomly generate one
			else {
				alignPosIndex = Math.floor(Math.random() * this.canvasData.movePositions.length);
			}

			// apply resulting align position index to sticks
			_.forEach(this.sticksData, _.bind(function (stickData) {
				if (stickData.pos !== alignPosIndex) {
					stickData.pos = stickData.newpos = alignPosIndex;
				}
			}, this));

			// repeat calculation
			while (repeat--) {
				// pick virtual primary stick
				primaryStickIndex = Math.ceil(Math.random() * this.sticksData.length);

				// pick virtual swipe direction
				if (isSimpleMove) {
					// if resulting position on right
					if (alignPosIndex > this.maxMoveSegments / 2) {
						swipeDirection = 'left';
					}
					// if resulting position on left
					else if (alignPosIndex < this.maxMoveSegments / 2) {
						swipeDirection = 'right';
					}
					// if resulting position at center
					else {
						swipeDirection = Math.random() < 0.5 ? 'left' : 'right';
					}
				} else {
					swipeDirection = Math.random() < 0.5 ? 'left' : 'right';
				}

				// calculate stick positions
				this.calculateStickPositions(false, primaryStickIndex, swipeDirection, true);
			}
		},

		// calculate all sticks positions, given swipe target stick index and swipe direction
		// - sticksData: Array (array of stick data)
		// - primaryStickIndex: Number (array index of primary stick)
		// - swipeDirection: String (virtual swipe direction, 'left' or 'right')
		// - noAlignedNewPos: Boolean (no aligned position allowed for new stick positions)
		calculateStickPositions: function (sticksData, primaryStickIndex, swipeDirection, noAlignedNewPos) {
			// get level data
			var levelData = App.data.levels[App.data.levels.defaultLevel];

			// stick deter factor
			var deterRatioDivider = 1 / levelData.moveDeterRatio;

			console.groupCollapsed('[view.calculateStickPositions]');
			console.log('primaryStickIndex: ', primaryStickIndex);
			console.log('swipeDirection: ', swipeDirection);

			// update supplied sticks data
			if (!sticksData) {
				sticksData = this.sticksData;
			}
			_.forEach(sticksData, _.bind(function (stickData) {
				stickData.deterLevel = Math.abs(stickData.id - primaryStickIndex) + 1;
				var posShiftAmount = this.maxMoveSegments / Math.pow(deterRatioDivider, stickData.deterLevel);

				console.groupCollapsed('Stick: ', stickData.id);
				console.log('deterLevel: ', stickData.deterLevel);
				console.log('posShiftAmount: ', posShiftAmount);
				console.log('pos: ', stickData.pos);

				stickData.bounce = false;
				stickData.cheat = false;

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
				console.log('bounce: ', stickData.bounce);
				console.log('cheat: ', stickData.cheat);
				console.groupEnd();
			}, this));

			console.groupEnd();

			// recalculate positions if new positions are aligned
			this.areAllSticksAligned = this.ifSticksAligned();
			if (noAlignedNewPos && this.areAllSticksAligned) {
				this.calculateStickPositions(false, primaryStickIndex, swipeDirection, true);
			}
		},

		// cheat all sticks to an aligned position
		// - cheatPos: Number (index of final aligned position)
		cheatStickPositions: function (cheatPos) {
			// vars
			var cheatData = 'cheat';
			var centerPos = this.maxMoveSegments / 2;
			var alignedPos = _.isNumber(cheatPos) ? cheatPos : centerPos;

			console.groupCollapsed('[view.cheatStickPositions]');
			console.log('primaryStickIndex: ', cheatData);
			console.log('swipeDirection: ', cheatData);

			// update sticks data
			_.forEach(this.sticksData, _.bind(function (stickData) {
				stickData.cheat = true;
				stickData.deterLevel = cheatData;

				console.groupCollapsed('Stick: ', stickData.id);
				console.log('deterLevel: ', stickData.deterLevel);
				console.log('posShiftAmount: ', cheatData);
				console.log('pos: ', stickData.pos);

				stickData.bounce = false;
				stickData.newpos = alignedPos;
				stickData.pos = stickData.newpos;

				console.log('newpos: ', stickData.pos);
				console.log('bounce: ', stickData.bounce);
				console.log('cheat: ', stickData.cheat);
				console.groupEnd();
			}, this));

			console.groupEnd();
		},

		// render sticks
		// - userMove: Boolean (if the rendering is for a user input reposition)
		renderSticks: function (userMove) {
			if (!this.sticksData || this.sticksData.length < 1) {
				console.log('[view.renderSticks]: not enough sticks to render!');
				return false;
			}

			// clean up extra sticks
			while (this.$sticksLayer.find('.stick').length > this.sticksData.length) {
				var lastStickIdx = this.$sticksLayer.find('.stick').length - 1;
				var $lastStick = this.$sticksLayer.find('.stick')[lastStickIdx];
				$lastStick.remove();
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
					'opacity': '0.8',
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

		// reset sticks for next round
		resetSticks: function () {
			// reset sticks data
			_.forEach(this.sticksData, _.bind(function (stickData) {
				stickData.shrunk = false;
			}, this));

			// update game difficulty
			this.updateDifficulty();

			console.log('[view.resetSticks]');

			// position all sticks
			this.positionSticks(App.data.game.scrambleMoves);
			// render all sticks
			this.renderSticks();
		},

		// shrink sticks from an index
		shrinkStick: function (idx) {
			// shrink from top if not specified
			idx = _.isUndefined(idx) ? 0 : idx;

			// check target stick is valid
			if (!this.sticksData[idx].$el.length) {
				return '[view.shrinkStick]: Invalid stick element!';
			}

			// get stick data
			var stickEle = this.sticksData[idx].$el[0];
			var isCheatMove = this.sticksData[0].cheat;

			// prep anim params
			var cssProps = {
				'width': '8px',
				'height': '0px',
				'top': '-30px',
				'left': '50%',
				'marginLeft': '-4px',
				onComplete: _.bind(function () {
					// if not a cheat move
					if (!isCheatMove) {
						// update total aligned sticks
						App.data.game.stiiiiicks += App.data.game.scrambleMoves;
						this.$game.trigger({
							type: 'update.score',
							amount: App.data.game.scrambleMoves
						});
					}

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

					// reset all sticks after shrinking all sticks
					if (idx == (this.sticksData.length - 1)) {
						this.checkAlignBonus();
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

		// functions - game mechanics
		// -------------------------------------------------------------------------------------------

		// check if all sticks are aligned
		ifSticksAligned: function () {
			for (var i = 1; i < this.sticksData.length; i++) {
				if (this.sticksData[i].newpos !== this.sticksData[0].newpos) {
					return false;
				}
			}
			return true;
		},

		// update aligned sticks count
		updateAlignedSticks: function () {
			// check sticks alignment
			this.areAllSticksAligned = this.ifSticksAligned();
			// if all sticks are aligned
			if (this.areAllSticksAligned) {
				// increment total alignment
				App.data.game.totalAlignments++;
				// shrink sticks from the top
				this.shrinkStick();
			}
		},

		// check if alignment move qualifies for a bonus
		checkAlignBonus: function () {
			// bonus vars
			var bounceBonus = false;
			var bounceBonusAmount = this.sticksData.length;

			// edge bounce bonus
			_.forEach(this.sticksData, _.bind(function (stickData) {
				if (stickData.bounce) {
					bounceBonus = true;
				}
			}, this));

			// apply bonus
			if (bounceBonus) {
				App.data.game.stiiiiicks += bounceBonusAmount;
				this.$game.trigger({
					type: 'update.score',
					amount: bounceBonusAmount
				});

				App.utils.popMsg({
					text: 'Edge Bounce!<br><b>+' + bounceBonusAmount + '</b>'
				});
				console.log('[checkAlignBonus]: bounceBonus', bounceBonusAmount);
			}
		},

		// update game complexity
		updateDifficulty: function () {
			// vars
			var oldDifficulty = App.data.game.scrambleMoves;
			var msg = null;

			// first align
			if (App.data.game.totalAlignments === 1) {
				App.data.game.scrambleMoves = 1;
				App.utils.popMsg({
					text: '<b>Great</b><br>Start!'
				});
			}
			// keep difficulty
			else if (App.data.game.stiiiiicks < 30 && App.data.game.scrambleMoves <= 1) {
				App.data.game.scrambleMoves = 1;
			}
			// advance difficulty
			else if (App.data.game.stiiiiicks < 90 && App.data.game.scrambleMoves <= 2) {
				App.data.game.scrambleMoves = 2;
				msg = {
					text: 'Too<br><b>Easy!</b>'
				};
			}
			// advance difficulty
			else if (App.data.game.stiiiiicks < 180 && App.data.game.scrambleMoves <= 3) {
				App.data.game.scrambleMoves = 3;
				msg = {
					text: 'Getting<br><b>Harder!</b>'
				};
			}
			// advance difficulty
			else if (App.data.game.stiiiiicks < 390 && App.data.game.scrambleMoves <= 4) {
				App.data.game.scrambleMoves = 4;
				msg = {
					text: 'Much More<br><b>Harder!</b>'
				};
			}
			// advance difficulty
			else if (App.data.game.scrambleMoves <= 5) {
				App.data.game.scrambleMoves = 5;
				msg = {
					text: 'You<br><b>Master!</b>'
				};
			}

			// show message when difficulty advances
			if (msg && App.data.game.scrambleMoves !== oldDifficulty) {
				App.utils.popMsg(msg);
			}

			console.log('[Total Moves]: ', App.data.game.totalMoves);
			console.log('[Total Cheats]: ', App.data.game.totalCheats);
			console.log('[Total Alignments]: ', App.data.game.totalAlignments);
			console.log('[StiiiiickS]: ', App.data.game.stiiiiicks);
			console.log('[view.updateDifficulty]: scrambleMoves', App.data.game.scrambleMoves);
		},

		// calculating and update game canvas data
		updateGameCanvas: function (levelData, updateSticks) {
			// get canvas data
			this.canvasData = this.getCanvasData();
			// get max move segments count
			this.maxMoveSegments = this.getMaxMoveSegments(levelData);
			// draw grids
			this.initGrids(false, true);

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

		// start gameplay related events
		initGameEvents: function (levelData) {
			// canvas resize
			$(window)
				.off('resize.updateGameCanvas')
				.on('resize.updateGameCanvas', _.bind(function () {
					this.updateGameCanvas(levelData, true);
				}, this));

			// score update
			this.$game
				.off('update.score')
				.on('update.score', _.bind(function (e) {
					// update score text
					this.updateScoreText();
				}, this));
		},

		// start game with level data
		initGame: function (levelData) {
			// update game level id
			App.data.levels.currentLevel = levelData.id;
			// update game canvas style
			this.$game.removeClass(this.gui.levelClasses.join(' ')).addClass(this.gui.levelClasses[levelData.id]);
			// update game gui title label with level index
			this.gui.$scoreLabel.find('.count').text(new Array(levelData.sticksCount + 1).join('i'));

			// adding sticks
			this.addSticks(levelData.sticksCount);

			// init game canvas data
			// and update on resize
			this.updateGameCanvas(levelData);

			// position sticks
			this.positionSticks();
			// render sticks
			this.renderSticks();

			// init touch inputs
			this.initTouch();
			this.initHammer();

			// init events
			this.initGameEvents(levelData);
		},

		// functions - GUI
		// -------------------------------------------------------------------------------------------

		// update score text
		updateScoreText: function () {
			// score text elem
			var $score = this.gui.$scoreText;
			// old score from text elem
			var oldScore = parseInt($score.text(), 10);

			// anim props
			var scoreUpProps = {
				'transform': 'translate(0, -8px) scale(1.2)',
				ease: 'easeIn',
				onComplete: _.bind(function () {
					TweenLite.to($score[0], this.animSpeed.scoreUp, {
						'transform': 'translate(0) scale(1)',
						ease: 'easeIn'
					});
				}, this)
			};
			var scoreDownProps = {
				'transform': 'translate(0, -60px) scale(0.6)',
				'opacity': '0',
				ease: 'Power3.easeOut',
				onComplete: _.bind(function () {
					// remove animation clone
					$clone.remove();
				}, this)
			};

			// update score text with animations
			if (App.data.game.stiiiiicks !== oldScore) {
				// update to new score
				$score.text(App.data.game.stiiiiicks);

				// trigger animations
				if (App.data.game.stiiiiicks > oldScore) {
					TweenLite.to($score[0], this.animSpeed.scoreUp, scoreUpProps);
				} else {
					var $clone = $score.clone()
						.addClass('clone')
						.text('-1')
						.insertAfter($score);
					TweenLite.to($clone[0], this.animSpeed.scoreDown, scoreDownProps);
				}
			}
		},

		// render background grids
		initGrids: function (renderRows, renderCols) {
			// get grid data
			var cols = this.maxMoveSegments;
			var rows = this.sticksData.length;

			// column position index
			var colPosIndex = '123456789abcdefghijklmnopqrstuvwxyz'.split('');

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
			if (renderCols) {
				_.forEach(colsPos, _.bind(function (pos) {
					// skip edges
					if (pos === 0 || pos === this.canvasData.width) {
						return;
					}
					// add grid line
					var $col = $('<div/>');
					$col
						.attr('data-index', colPosIndex[colsPos.indexOf(pos) - 1])
						.addClass('line vert')
						.css({
							'left': pos + 'px'
						})
						.appendTo(this.$gridLayer);
				}, this));
			}
			if (renderRows) {
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
			}
		},

		// init settings view
		initSettings: function () {
			// highlight default game level
			this.$settings.find('.btnLevel[data-level="' + App.data.levels.defaultLevel + '"]')
				.addClass('selected')
				.siblings('.btnLevel').removeClass('selected');

			// common buttons
			$(document)
				.off('touchstart.button', '[data-role="button"]')
				.on('touchstart.button', '[data-role="button"]', function (e) {
					$(this).addClass('active');
				})
				.off('touchend.button', '[data-role="button"]')
				.on('touchend.button', '[data-role="button"]', function (e) {
					$(this).removeClass('active');
				});

			// cheat
			$('.btnCheat')
				.off('click.button')
				.on('click.button', _.bind(function (e) {
					e.preventDefault();
					// update cheats
					App.data.game.totalCheats++;
					// deduct cheat from score
					App.data.game.stiiiiicks -= 10;
					this.$game.trigger({
						type: 'update.score',
						amount: -10
					});
					// calculate cheat position and render as user move
					this.cheatStickPositions();
					this.renderSticks(true);
				}, this));

			// settings
			$('.btnSettings')
				.off('click.button')
				.on('click.button', _.bind(function (e) {
					e.preventDefault();
					this.$settings.toggleClass('active');
					console.log('[View]: Toggle Settings: ' + (this.$settings.hasClass('active') ? 'On' : 'Off'));
				}, this));

			// hints
			$('.btnHints')
				.off('click.button')
				.on('click.button', _.bind(function (e) {
					e.preventDefault();
					$(e.target).toggleClass('selected');
					this.$gridLayer.toggleClass('active');
					console.log('[View]: Toggle Hints Grid: ' + (this.$gridLayer.hasClass('active') ? 'On' : 'Off'));

					// close settings
					this.$settings.removeClass('active');
				}, this));

			// levels
			$('.btnLevel')
				.off('click.button')
				.on('click.button', _.bind(function (e) {
					e.preventDefault();
					var $btn = $(e.target);
					var level = $btn.data().level;
					$btn
						.addClass('selected')
						.siblings('.btnLevel').removeClass('selected');
					this.initGame(App.data.levels[level]);
					console.log('[View]: Jump to Level: ' + level);

					// close settings
					this.$settings.removeClass('active');
				}, this));
		},

		// init
		// -------------------------------------------------------------------------------------------

		init: function () {
			App.utils.noTouchBounce(document.body);
			this.templates = App.utils.loadTemplates();
			this.initSettings();
			this.initGame(App.data.levels[App.data.levels.defaultLevel]);
		}
	};

	return App;
})(window.App);
