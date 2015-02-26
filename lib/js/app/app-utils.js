/* ------------------------------------------------------------------------------ */
/* rAF */
/* ------------------------------------------------------------------------------ */
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());

/* ------------------------------------------------------------------------------ */
/* App - utils */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* utils - Platform */
	window.Platform = function(){
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
		};
		//return self
		return this;
	}();

	/* ------------------------------------------------------------------------------ */
	/* utils - alert */
	if ( !window.Platform.iOS && !window.Platform.android ) {
		window.alert = function(msg){ console.log('window.alert: '+msg); };
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

		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function() {
			this.addDeviceClass();
		}

	};

	return App;

})(window.App);
