var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var express = require('express');
var Parse = require('parse').Parse;
var Promise = require("bluebird");
var bodyParser = require('body-parser');

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
var Client = Parse.Object.extend('Client');

var app = module.exports = {
    messageCache: {},

    init: function () {
        var app = express();

        app.use(express.static(__dirname + '/public'));
       	app.use(bodyParser.json())
        
        app.get('/api/v1/refreshMessages', _.bind(this.refreshMessages, this));
        app.get('/api/v1/clients', _.bind(this.getClients, this));
        app.get('/api/v1/clients/*', _.bind(this.getClient, this));
        app.get('/api/v1/textMessages/*',  _.bind(this.getTextMessages, this));
        app.post('/api/v1/textMessages',  _.bind(this.sendTextMessage, this));
  
        app.get('*', function(request, response){
			response.sendFile(__dirname + '/public/index.html');
		});

		setInterval(_.bind(this.refreshMessages, this), 10000);

        this.server = app.listen(3000);
    },

    error: function (res, reason) {
        debugger;
        if (res) {
            res.send('Oh shit');
        } 
    },

    refreshMessages: function (req, res) {
        Promise.all([
                twilioClient.messages.list(), 
                (new Parse.Query(TextMessage)).find(),
                (new Parse.Query(Client)).find()
            ])
            .then(_.bind(this.processNewMessages, this))
    },

    getClients: function (req, res) {
    	(new Parse.Query(Client)).find()
    		.then(function (results) {
    			res.json(results);
    		})
    },

    getClient: function (req, res) {
    	(new Parse.Query(Client))
			.equalTo('objectId', req.params[0])
			.first()
    		.then(function (result) {
    			res.json(result);
    		})
	},

    getTextMessages: function (req, res) {
    	(new Parse.Query(TextMessage))
    		.equalTo('client', new Client({
    			objectId: req.query.clientId
		    }))
    		.find()
    		.then(function (results) {
    			res.json(results);
    		})
    },

    sendTextMessage: function (req, res) {
    	var client;
    	var message;

    	(new Parse.Query(Client))
    		.equalTo('objectId', req.body.clientId)
    		.first()
    		.then(_.bind(function (result) {
    			client = result;

    			return twilioClient.messages.create({
				    body: req.body.body,
				    to: client.get('phoneNumber'),
				    from: myNumber
				})
    		}, this))
    		.then(_.bind(function (data) {
    			return this.createMessage({
    				body: req.body.body,
    				dateSent: new Date(data.date_created),
    				client: client,
    				status: 'delivered'
    			}, client)
    		}, this))
    		.then(_.bind(function (message) {
    			res.send(message.toJSON())
    		}, this))
    		.fail(_.bind(function (err) {
    			console.log(err);
    		}, this))
    },

    createMessage: function (messageData, client) {
    	messageData.client = client;

		var message = _.find(this.messages, function (m) {
			return m.get('client').id === messageData.client.id &&
                moment(m.get('dateSent')).isSame(messageData.dateSent)
        });

        if (message) return Promise.resolve(message);

        message = new TextMessage();
        this.messages.push(message);

        return message.save(messageData);
	},

	createClient: function (clientData) {
		var client = _.find(this.clients, function (c) {
			return c.get('phoneNumber') === clientData.phoneNumber;
		});

		if (client) return Promise.resolve(client);

		client = new Client();
		this.clients.push(client);

        return client.save(clientData);
	},

    processNewMessages: function(data) {
        var twilioTexts = data[0];
        this.messages = data[1];
        this.clients = data[2];

        Promise.map(twilioTexts.messages, _.bind(function(message) {
            var number = message.from === myNumber ? message.to : message.from;

            message = _(message).pick('body', 'dateSent', 'status');

            return this.createClient({
            	phoneNumber: number
            }).then(_.bind(
            	this.createMessage, this, message
            ));
        }, this));
    },
};

app.init();