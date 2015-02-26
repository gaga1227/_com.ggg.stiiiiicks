/* ------------------------------------------------------------------------------ */
/* App - data */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* data */
	App.data = {

		/* ------------------------------------------------------------------------------ */
		/* data */

		//msg
		msg: {
			connection_error:[
				"Data Request Failed",
				"Please make sure your device has a working connection and try again."
			],
			content_unavailable:[
				"Content Unavailable",
				"The content you requested is not available in this version of the app, please contact support."
			],
			offline:[
				"No Connection Found",
				"This app requires a working internet connection to work properly."
			]
		},

		/* ------------------------------------------------------------------------------ */
		//init
		init: function() {

		}

	};

	return App;

})(window.App);

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

/* ------------------------------------------------------------------------------ */
/* App - view */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* view */
	App.view = {

		/* ------------------------------------------------------------------------------ */
		/* properties */

		/* ------------------------------------------------------------------------------ */
		/* common */

		//toggleLoader
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

		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function(){
		}

	};

	return App;

})(window.App);

/* ------------------------------------------------------------------------------ */
/* App */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* properties */
	App.name = 'StiiiiickS';
	App.version = '0.0.1';
	App.lastUpdate = '2015-02';

	/* ------------------------------------------------------------------------------ */
	/* handlers */

	//onDeviceReady
	App.onDeviceReady = function(e) {
		console.log('[device] e:deviceready');

		//disable back button default behavior
		/*
		if (App.onDevice && device && typeof(device.overrideBackButton) == 'function') {
			device.overrideBackButton(true);
		}
		// */
	};

	//onPause
	App.onPause = function(e) {
		console.log('[device] e:pause');
	};

	//onResume
	App.onResume = function(e) {
		console.log('[device] e:resume');
	};

	//onOnline
	App.onOnline = function(e) {
		console.log('[device] e:online');
	};

	//onOffline
	App.onOffline = function(e) {
		console.log('[device] e:offline');
		App.utils.popMsg(App.data.msg.offline);
	};

	//onBackbutton
	App.onBackbutton = function(e) {
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

	//onMenubutton
	App.onMenubutton = function(e) {
		console.log('[device] e:menubutton');
	};

	/* ------------------------------------------------------------------------------ */
	/* init */
	App.init = function() {
		//starting app
		if ( !window.Platform.iOS && !window.Platform.android ) {
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

//init App
App.init();
