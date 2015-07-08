var $ = require('jquery');
var Backbone = require('backbone');

var ClientsView = require('./views/clients');
var TextMessagesView = require('./views/textMessages');

module.exports = Backbone.Router.extend({
	initialize: function () {
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
});

function dashboardView () {
	this.view = new ClientsView({
		el: $('.container')
	}).render()
}

function clientView (id) {
	this.view = new TextMessagesView({
		el: $('.container'),
		clientId: id
	}).render();
}