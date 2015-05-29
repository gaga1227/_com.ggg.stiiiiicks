window.App = (function (app) {
	var App = app || {};

	// data module
	App.data = {

		// data
		// -------------------------------------------------------------------------------------------

		// game
		game: {
			// status
			status: '',

			// score
			totalMoves: 0,
			totalCheats: 0,
			totalAlignments: 0,
			stiiiiicks: 5,

			// difficulty
			scrambleMoves: 1
		},

		// levels
		levels: {
			currentLevel: null,
			defaultLevel: 1,
			0: {
				id: 0,
				sticksCount: 2,
				moveDeterRatio: 0.5,
				initialStiiiiicks: 3
			},
			1: {
				id: 1,
				sticksCount: 3,
				moveDeterRatio: 0.5,
				initialStiiiiicks: 5
			},
			2: {
				id: 2,
				sticksCount: 4,
				moveDeterRatio: 0.5,
				initialStiiiiicks: 15
			},
			3: {
				id: 3,
				sticksCount: 5,
				moveDeterRatio: 0.5,
				initialStiiiiicks: 25
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
