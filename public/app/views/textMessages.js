var _ = require('underscore');
var $ = require('jquery');
var moment = require('moment');
var TextMessageCollection = require('../collections/textMessage');
var Parse = require('parse').Parse;
var ClientModel = require('../models/client');
var TextMessageModel = require('../models/textMessage');

var template = require('../templates/textMessages.hbs');

var TextMessage = Parse.Object.extend('TextMessage')
var Client = Parse.Object.extend('Client')

module.exports = Backbone.View.extend({
	events: {
		'keypress .text-body': sendMessage
	},

	initialize: function (options) {
		this.client = new ClientModel({
			id: options.clientId
		});

		this.textMessages = new TextMessageCollection({
			clientId: options.clientId
		});

		this.listenTo(this.textMessages, 'add', _.bind(this.render, this, 'loaded'));
	},

	render: function (state) {
		if (state === 'loaded') {
			this.$el.html(template({
				phoneNumber: this.client.get('phoneNumber'),
				textMessages: this.textMessages.map(function(message){
					return {
						body: message.get('body'),
						dateSent: moment(message.get('dateSent').iso).fromNow(),
						direction: message.get('status') === 'delivered' ? 'to': 'from'
					}
				})
			}));

			setTimeout(_.bind(function(){
				this.$('.texts')[0].scrollTop = this.$('.texts')[0].scrollHeight;
			}, this))
		}

		if (!state) {
			$.when(
				this.textMessages.fetch(),
				this.client.fetch()
			).then(_.bind(this.render, this, 'loaded'))
		}
	}
});

function sendMessage (e) {
	if (e.keyCode == 13) {
		var text = new TextMessageModel({
			body: this.$('.text-body').val(),
			clientId: this.client.get('objectId')
		})

		text.save().then(_.bind(function(){
			this.textMessages.add(text);
		}, this));
	}
}