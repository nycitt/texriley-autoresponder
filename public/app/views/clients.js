var _ = require('underscore');

var ClientCollection = require('../collections/client');

var template = require('../templates/clients.hbs');

module.exports = Backbone.View.extend({
	initialize: function () {
		this.clients = new ClientCollection();
	},

	render: function (state) {
		if (state === 'loaded') {
			this.$el.html(template({
				clients: this.clients.toJSON()
			}));
		}

		if (!state) {
			this.clients.fetch()
				.then(_.bind(this.render, this, 'loaded'))
		}
	}
});