var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
	initialize: function (options) {
		this._clientId = options.clientId;
	},

	url: function () {
		return '/api/v1/textMessages/?clientId=' + this._clientId
	}
})