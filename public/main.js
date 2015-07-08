var Router = require('./app/router');
var Parse = require('parse').Parse;
var $ = require('jquery')
Parse.$ = $;

Parse.initialize('Es8deGxZvGQBZJLClhbhb0AhKfHW4GOLtbOpkLlf', '3MGdFUhC1xZX1WTDg9cxXDIoFYwoeXdgUdVaWF3B');

module.exports = new Router();