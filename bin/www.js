#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');

var debug = require('debug')('transcribe:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
	// named pipe
	return val;
  }

  if (port >= 0) {
	// port number
	return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
	throw error;
  }

  var bind = typeof port === 'string'
	? 'Pipe ' + port
	: 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
	case 'EACCES':
	  console.error(bind + ' requires elevated privileges');
	  process.exit(1);
	  break;
	case 'EADDRINUSE':
	  console.error(bind + ' is already in use');
	  process.exit(1);
	  break;
	default:
	  throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
	? 'pipe ' + addr
	: 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/**
 * Websockets
 */

var io = require('socket.io')(server)
//var history = require('../data/history')
//var manuscript = require('../data/manuscript')

// function receiveCaption(text) {
// 	console.log('caption: ' + text);

// 	// make a time string
// 	var timeString;
// 	{
// 		var date = new Date();
// 		timeString = date.getHours() + ':' + date.getMinutes();
// 	}

// 	var caption = {
// 		"text" : text,
// 		"timeString" : timeString
// 	};

// 	io.emit('caption', caption);
// 	history.get("items")
// 		.push(caption)
// 		.write();
// }

// function receiveMicrophoneTranslation(text) {
// 	console.log('microphone : ' + text);

// 	io.emit('manuscript add', text);
// 	manuscript.get("items")
// 		.push(text)
// 		.write();
// }

// function clearHistory() {
// 	history.set("items", [])
// 		.write();
// 		io.emit('refresh history');
// }

// function deleteManuscript() {
// 	manuscript.set("items", [])
// 		.write();
// 	io.emit('refresh manuscript');
// }

io.on('connection', function(socket) {
	console.log('a user connected');
	// socket.on('disconnect', function() {
	// 	console.log('user disconnected');
	// });
	// socket.on('chat message', function(msg) {
	// 	receiveCaption(msg)
	// });
	// socket.on('clear history', function() {
	// 	clearHistory();
	// });
	// socket.on('delete manuscript', function() {
	// 	deleteManuscript();
	// });
	// socket.on('microphone translation', function(text) {
	// 	receiveTranslation(text);
	// });
});

