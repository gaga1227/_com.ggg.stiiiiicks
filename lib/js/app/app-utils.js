/* ------------------------------------------------------------------------------ */
/* rAF */
/* ------------------------------------------------------------------------------ */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/* ------------------------------------------------------------------------------ */
/* App - utils */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* utils - logger */
	window.Logger = function() {
		var oldConsoleLog = null,
			pub = {};
		pub.enableLogger = function enableLogger() {
			if(oldConsoleLog == null) return;
			window['console']['log'] = oldConsoleLog;
		};
		pub.disableLogger = function disableLogger() {
			oldConsoleLog = console.log;
			window['console']['log'] = function() {};
		};
		return pub;
	}();

	/* ------------------------------------------------------------------------------ */
	/* utils - Platform */
	window.Platform = new function(){
		//vars
		var ua = navigator.userAgent.toLowerCase();
		//detecting functions
		function checkPlatform(os) 	{ return (ua.indexOf(os.toLowerCase()) > -1); }
		function checkEvent(e) 		{ return (e in document.documentElement); }
		//add properties
		this.iPhone = checkPlatform('iPhone');
		this.iPad = checkPlatform('iPad');
		this.iPod = checkPlatform('iPod');
		this.iOS = this.iPhone||this.iPad||this.iPod;
		this.android = checkPlatform('android');
		this.touchOS = checkEvent('ontouchstart');
		this.chrome = ua.indexOf('chrome') > -1;
		this.debugLog = function(){
			console.log('iPhone: '+this.iPhone);
			console.log('iPad: '+this.iPad);
			console.log('iPod: '+this.iPod);
			console.log('iOS: '+this.iOS);
			console.log('android: '+this.android);
			console.log('touchOS: '+this.touchOS);
		}
		//return self
		return this;
	}

	/* ------------------------------------------------------------------------------ */
	/* utils - alert */
	if ( !window.Platform.iOS && !window.Platform.android ) {
		window.alert = function(msg){ console.log('window.alert: '+msg); }
	}

	/* ------------------------------------------------------------------------------ */
	/* utils */
	App.utils = {

		/* ------------------------------------------------------------------------------ */
		/* addDeviceClass */
		addDeviceClass:	function() {
			var p = Platform;
				$html = $('html:eq(0)');
			$html.removeClass('no-js').addClass('js');
			if (p.touchOS) {
				$html.addClass('touch');
			}
			else {
				$html.addClass('no-touch');
			}
			if (p.iOS) {
				$html.addClass('ios');
				if (p.iPhone) {	$html.addClass('iphone'); }
				else if (p.iPod) {	$html.addClass('ipod'); }
				else if (p.iPad) {	$html.addClass('ipad'); }
			}
			else if (p.android) {
				$html.addClass('android');
			}
		},

		/* ------------------------------------------------------------------------------ */
		/* checkConnection */
		checkConnection: function() {
			//exit if no API
			if ( !navigator.connection ) return false;
			//vars
			var networkState = navigator.connection.type;
			//return state
			return networkState;
		},

		/* -------------------------------------------------------------------------- */
		/* popMsg */
		popMsg: function(msg){
			//exit
			if (!msg || msg.length < 2) return 'Invalid title or message text';
			//show msg
			if ( navigator.notification ) {
				navigator.notification.alert(
					// message
					msg[1],
					// callback
					function(){},
					// title
					msg[0],
					// buttonName
					msg[2] ? msg[2] : 'OK'		
				);
			} else {
				alert('['+ msg[0] +']: ' + msg[1]);
			}
		},
		
		/* ------------------------------------------------------------------------------ */
		/* reloadApp */
		reloadApp: function() {
			//update to main app file address without page id
			window.location = String(window.location).substr(0, String(window.location).indexOf('#'));
		},
		
		/* -------------------------------------------------------------------------- */
		/* attachCSSAnim */
		attachCSSAnim: function($target, animCls) {
			if ( !$target.length || !animCls ) return false;
			//vars
			var scopeCls = 'animated',
				cls = scopeCls + ' ' + animCls,
				animationEndSupport = false,
				animDuration = 1000;
			//apply anim
			$target
				.addClass(cls)
				.one('webkitAnimationEnd', function(e) {
					$target.removeClass(cls);
					animationEndSupport = true;
				});
			//fallback when no webkitAnimationEnd support
			setTimeout( function(){ 
				if (!animationEndSupport) {
					$target.removeClass(cls);
				}
			}, animDuration * 1.1 );
		},
		
		/* -------------------------------------------------------------------------- */
		/* UA push */
		updatePushService: function(on) {
			//exit
			if (typeof(push) === 'undefined' || typeof(push.enablePush) !== 'function' || typeof(push.disablePush) !== 'function') {
				return 'UA service API unavailable';
			}
			//call service API
			if (on) {
				push.enablePush();
			} else {
				push.disablePush();
			}
		},
		
		/* -------------------------------------------------------------------------- */
		/* updateWebviewColor */
		updateWebviewColor: function(color) {
			//exit
			if (!Platform.iOS) return 'not on iOS'; 
			if (typeof(window.plugins) === 'undefined' || typeof(window.plugins.webviewcolor) === 'undefined') {
				return 'webviewcolor plugin API unavailable';	
			}
			//vars
			var c = color ? color : '#FFFFFF';
			//call API
			window.plugins.webviewcolor.change(c, function(){
				console.log('[webviewcolor.change] Success!', c);
			}, function(){
				console.log('[webviewcolor.change] Failed!', c);
			});
		},
		
		/* -------------------------------------------------------------------------- */
		/* updateStatusBarStyle */
		updateStatusBarStyle: function(bgc, dark) {
			//exit
			if (!Platform.iOS) return 'not on iOS'; 
			if (typeof(StatusBar) === 'undefined') {
				return 'StatusBar plugin API unavailable';	
			}
			//vars
			var s = !!dark,
				c = bgc ? bgc : s ? 'black' : 'white';
			//apply style
			s ? StatusBar.styleLightContent() : StatusBar.styleDefault(); 
			//apply bgc
			if (c.indexOf('#') > -1) {
				StatusBar.backgroundColorByHexString(c);
			} else {
				StatusBar.backgroundColorByName(c);
			}
			console.log('[StatusBar] ', c, s);
		},
		
		/* -------------------------------------------------------------------------- */
		/* debug */
		checkDOMAttrUpdates: function(id, attr) {
			//exit
			if (typeof(WebKitMutationObserver) != 'function') return;
			//vars
			var el = document.getElementById(id),
				bubbles = false,
				observer = new WebKitMutationObserver(function (mutations) {
			  		mutations.forEach(attrModified);
				});
			//init
			observer.observe(el, { attributes: true, subtree: bubbles });
			//functions
			function attrModified(mutation) {
				var name = mutation.attributeName,
					newValue = mutation.target.getAttribute(name),
					d = new Date(); 
				if (name !== attr) return;
				console.log('[DOMAttrUpdate: ' + name + '] ', 'T: ' + d.getTime(), 'V: ' + newValue); 
				console.log('[DOMAttrUpdate: ' + 'style' + '] ', 'T: ' + d.getTime(), 'V: ' + mutation.target.getAttribute('style')); 
			}
		},
		
		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function() {
			this.addDeviceClass();
		}

	};

	return App;

})(window.App);
