window.App = (function (app) {
	var App = app || {};

	// data module
	App.data = {

		// data
		// -------------------------------------------------------------------------------------------

		// levels
		levels: {
			defaultLevel: 0,
			0: {
				sticksCount: 5,
				moveRatioToCanvas: 0.25,
				moveRatioToParent: 0.5
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
