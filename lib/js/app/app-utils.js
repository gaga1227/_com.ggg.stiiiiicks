window.App = (function (app) {
	var App = app || {};

	// RAF Polyfill
	(function () {
		var lastTime = 0,
			vendors = ['webkit'],
			x;

		for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				window.clearTimeout(id);
			};
		}
	}());

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
	// if (!window.Platform.iOS && !window.Platform.android) {
	// 	window.alert = function (msg) {
	// 		console.log('window.alert: ' + msg);
	// 	};
	// }

	// app cache update
	if (window.applicationCache) {
		window.applicationCache.addEventListener('updateready', function () {
			if (confirm('An update is available. Reload now?')) {
				window.location.reload();
			}
		});
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

		// disable touch scroll bounce on elem
		noTouchBounce: function (elem) {
			var $target = elem ? $(elem) : $('body');
			$target
				.off('touchmove.noTouchBounce')
				.on('touchmove.noTouchBounce', function (e) {
					e.preventDefault();
				});
		},

		// pop message
		loadTemplates: function () {
			var $templates = $('script[id|="template"]');
			if (!$templates.length) {
				return;
			}

			var templates = {};
			_.forEach($templates, function (tmpl) {
				var $tmpl = $(tmpl);
				var name = $tmpl.attr('id').split('-')[1];
				tmplHtml = $.trim($tmpl.html());
				if (tmplHtml) {
					templates[name] = tmplHtml;
				}
			});

			return templates;
		},

		// pop message
		popMsg: function (options) {
			// exit
			if (!_.isPlainObject(options) || _.isUndefined(options.text)) {
				return 'invalid message text!';
			}

			// when message modal is active
			if ($('#message').length) {
				// put new message into queue
				if (App.view.activeMsg) {
					App.view.messages.push(options);
					return '[popMsg]: message modal active, putting into messages queue...';
				}
				return 'previous message not finished!';
			}

			// prep options
			options.duration = _.isUndefined(options.duration) ? 1 : options.duration;

			// prep message elems
			var $msg = $(App.view.templates.message);
			var $overlay = $msg.find('.overlay');
			var $modal = $msg.find('.modal');

			// modal anim props
			var propsReset = {
				scale: 0,
				rotationX: 90
			};
			var propsIn = {
				css: {
					scale: 1,
					rotationX: 0
				},
				onComplete: _.bind(function () {
					// if modal is persistent
					if (options.duration === 0) {
						// call out animation on dismiss
						$modal.one('click', function () {
							TweenLite.to($overlay[0], App.view.animSpeed.msg / 2, overlayPropsOut);
							App.view.activeMsg = TweenLite.to($modal[0], App.view.animSpeed.msg / 2, propsOut);
						});
					}
					// otherwise
					else {
						// call out animation
						TweenLite.to($overlay[0], App.view.animSpeed.msg / 2, overlayPropsOut);
						App.view.activeMsg = TweenLite.to($modal[0], App.view.animSpeed.msg / 2, propsOut);
					}
				}, this)
			};
			var propsOut = {
				css: {
					scale: 0,
					rotationX: -90
				},
				delay: options.duration,
				onComplete: _.bind(function () {
					// apply complete callback
					if (typeof (options.onComplete) === 'function') {
						_.bind(options.onComplete, this)();
					}

					// clean up
					$msg.remove();
					App.view.activeMsg = null;

					// check and run next message
					if (App.view.messages.length) {
						this.popMsg(App.view.messages.shift());
					}
				}, this)
			};

			// overlay anim props
			var overlayPropsReset = {
				opacity: 0
			};
			var overlayPropsIn = {
				opacity: 1
			};
			var overlayPropsOut = {
				opacity: 0,
				delay: options.duration
			};

			// update message text
			$msg.find('.msgText').html(options.text);
			$msg.appendTo('body');

			// anim message elems
			TweenLite.set($overlay[0], overlayPropsReset);
			TweenLite.to($overlay[0], App.view.animSpeed.msg, overlayPropsIn);

			TweenLite.set($modal[0], propsReset);
			App.view.activeMsg = TweenLite.to($modal[0], App.view.animSpeed.msg, propsIn);
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {
			this.addDeviceClass();
		}
	};

	return App;
})(window.App);
