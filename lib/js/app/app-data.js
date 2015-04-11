window.App = (function (app) {
	var App = app || {};

	// data module
	App.data = {

		// data
		// -------------------------------------------------------------------------------------------

		// game
		game: {
			// flags
			areAllSticksAligned: false,

			// score
			totalMoves: 0,
			totalAlignments: 0,
			stiiiiicks: 0,

			// difficulty
			scrambleMoves: 1
		},

		// levels
		levels: {
			defaultLevel: 0,
			0: {
				sticksCount: 3,
				moveDeterRatio: 0.5
			},
			1: {
				sticksCount: 4,
				moveDeterRatio: 0.5
			},
			2: {
				sticksCount: 5,
				moveDeterRatio: 0.5
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
