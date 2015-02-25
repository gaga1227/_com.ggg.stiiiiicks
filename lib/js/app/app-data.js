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
		
	}

	return App;

})(window.App);
