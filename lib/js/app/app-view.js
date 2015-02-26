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
