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

		//touch delay
		touchDelay: 100,
		
		//double click treshold
		dblClickTresh: 400,
		lastClick: { 
			el:			undefined, 
			timestamp:	undefined
		},
		
		/* ------------------------------------------------------------------------------ */
		/* common */
		
		//initButtonsEvents
		initButtonsEvents: function() {
			var $doc = $(document);
			//common
			$doc.on('touchstart', '[data-role="button"], .btnTap', function(e) {
					console.log('------------------------------------------------');
					console.log('e:touchstart');
					var $this = $(this);
					$this.data('touchend', false);
					setTimeout( function(){
						if ( !$this.data('touchmove') && !$this.data('touchend') ) {
							$this.addClass('active');
						}
					}, App.view.touchDelay );
				})
				.on('touchmove', '[data-role="button"], .btnTap', function(e) {
					console.log('e:touchmove');
					$(this)
						.data('touchmove', true)
						.removeClass('active');
				})
				.on('touchend', '[data-role="button"], .btnTap', function(e) {
					console.log('e:touchend');
					$(this)
						.data('touchmove', false)
						.data('touchend', true)
						.removeClass('active');
				})
				.on('tap', '[data-role="button"], .btnTap', function(e) {
					console.log('e:tap');
				})
				.on('longTap', '[data-role="button"], .btnTap', function(e) {
					console.log('e:longTap');
				})
				.on('click', '[data-role="button"], .btnTap', function(e) {
					//vars
					var tgt = e.target,
						ts = new Date().getTime(),
						lastClick = App.view.lastClick;
 					//if has last click, check if is double
					if (lastClick.el && lastClick.timestamp) {
						if ( ((ts - lastClick.timestamp) < App.view.dblClickTresh) && (tgt === lastClick.el) ) {
							console.log('Invalid double e:click blocked');
							e.preventDefault();
							return false;
						}
					}
					//otherwise, click is valid	
					App.view.lastClick = { el: tgt, timestamp: ts };
					console.log('e:click');
				});
		},
		
		//toggleLoader
		toggleLoader: function(showflag) {
			var $loader = $('#loader'),
				activeCls = 'active';
			if (!$loader.length) return 'no loader elem found';
			showflag ? $loader.addClass(activeCls) : $loader.removeClass(activeCls);
		},
		
		//initExternalLinks
		initExternalLinks: function(){
			$(document).on('click', '[data-link=external]', function(e){
				e.preventDefault();
				var $link = $(this),
					href = $link.attr('href');
				window.open(href, '_blank', 'location=yes,closebuttoncaption=Close,enableViewportScale=yes,transitionstyle=fliphorizontal');
			});
		},
		
		/* ------------------------------------------------------------------------------ */
		/* init */
		init: function(){
			this.initButtonsEvents();
			this.initExternalLinks();
		}

	};

	return App;

})(window.App);
