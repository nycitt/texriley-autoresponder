var _ = require('underscore');
var moment = require('moment');
var Parse = require('parse').Parse;
var Promise = require("bluebird");
// Twilio Credentials 
var accountSid = 'ACec21b791308d32a6f438faa2b87efd33'; 
var authToken = '174df1a0c2a29c780671bec868fa1161'; 
var myNumber = '+17404784021';

var express = require('express');
var app = express();
 
//require the Twilio module and create a REST client 
var twilioClient = require('twilio')(accountSid, authToken);

Parse.initialize('Es8deGxZvGQBZJLClhbhb0AhKfHW4GOLtbOpkLlf', '3MGdFUhC1xZX1WTDg9cxXDIoFYwoeXdgUdVaWF3B', 'gTbPLI6z35fNWD3GwO9Q5cd0BR1RbZ1aevYT9Iei');

var TextMessage = Parse.Object.extend('TextMessage');

var app = {
	messageCache: {},

	init: function () {
		var express = require('express');
		var app = express();

		app.get('/refreshMessages', _.bind(this.refreshMessages, this));

		var server = app.listen(3000, function () {
		  var host = server.address().address;
		  var port = server.address().port;

		  console.log('Example app listening at http://%s:%s', host, port);

		});
	},

	refreshMessages: function (req, res) {
		Promise.all([
			twilioClient.messages.list(),
			(new Parse.Query(TextMessage)).find()
		])
			.then(_.bind(this.processNewMessages, this))
			.then(_.bind(this.logThreads, this, res))
			.catch(function(reason){
				res.send('Oh shit');
				console.log(reason);
			});
	},

	logThreads: function (res) {
		var out = _.map(this.messageCache, function (thread, number) {
			var header = 'Interaction With ' + number + '<br/>';

			return header + _(thread)
				.sort(function (message1, message2) {
					return message1.dateSent > message2.dateSent;
				})
				.map(function(message) {
					return message.dateSent + ': ' + message.body;
				})
				.join('<br/>')
		}).join('<br/>');

		res.send(out);
	},

	processNewMessages: function (data) {
		var twilioTexts = data[0];
		var dbTexts = data[1];

		twilioTexts.messages.forEach(_.bind(function(message) { 
			var messages = this.messageCache;
			var number = message.from === myNumber ? message.to : message.from;

			var userThread = messages[number];

			if (!userThread) {
				userThread = messages[number] = [];
			}

			var messageExists = _.findWhere(userThread, {
				dateSent: message.dateSent
			});

			if (messageExists) {
				return;
			}

			console.log(userThread, message.dateSent);

			messages[number].push({
				dateSent: message.dateSent,
				body: message.body
			});
		}, this));
	},
};

app.init();