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

			// prep msg elem
			var $msg = $('#message');

			// if has previous msg
			if ($msg.length) {
				$msg.find('.msgText').html(options.text);
			}
			// otherwise create new msg
			else {
				$msg = $(App.view.templates.message);
				$msg.find('.msgText').html(options.text);
				$msg.appendTo('body');
			}

			// prep options
			options.duration = options.duration ? options.duration : 1;

			// anim vars
			var $modal = $msg.find('.modal');
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
					App.view.popMsg = TweenLite.to($modal[0], App.view.animSpeed.norm, propsOut);
				}, this)
			};
			var propsOut = {
				css: {
					scale: 0,
					rotationX: -90
				},
				delay: options.duration,
				onComplete: _.bind(function () {
					if (typeof (options.onComplete) === 'function') {
						_.bind(options.onComplete, this)();
					}
					$msg.remove();
					App.view.popMsg = null;
				}, this)
			};

			// anim tween
			TweenLite.set($modal[0], propsReset);
			App.view.popMsg = TweenLite.to($modal[0], App.view.animSpeed.norm, propsIn);
		},

		// init
		// -------------------------------------------------------------------------------------------
		init: function () {
			this.addDeviceClass();
		}
	};

	return App;
})(window.App);
