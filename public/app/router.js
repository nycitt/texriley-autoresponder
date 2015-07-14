var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var io = require('socket.io-client')

var ClientsView = require('./views/clients');
var TextMessagesView = require('./views/textMessages');

module.exports = Backbone.Router.extend({
	initialize: function () {
		this.socket = io.connect('http://localhost:3000');

		Backbone.history.start({
			pushState: true,
			hashChange: false,
			root: '/'
		});
	},

	routes: {
	    '': dashboardView,
	    'clients/:id': clientView
	},

	addMainView: function (View, options) {
		if (this.view) {
			this.view.remove()
		}
		
		this.view = new View(_.extend({}, options, {
			el: $('.container'),
			socket: this.socket
		})).render();
	}
});

function dashboardView () {
	this.addMainView(ClientsView);
}

function clientView (id) {
	this.addMainView(TextMessagesView, {
		clientId: id
	});
}