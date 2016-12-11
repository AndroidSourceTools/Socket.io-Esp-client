#! /usr/bin/env node
 /////////
//	index.js: WebSocket server 
//	MIT License
//  Copyright (c) [2016] [Dolapo Toki]
var fs = require('fs');
var opt = require('optimist');
var url = require('url');
var argv = opt.usage('Usage: $0 [flags]')
	.alias('p', 'port')
	.describe('p', 'TCP port for the http server (3000)')
	.alias('d', 'debug')
	.describe('d', 'Enable debug output')
	.alias('l', 'log')
	.describe('l', 'Log arduino output to file')
	.argv;

if (argv.help) {
	opt.showHelp();
	process.exit();
}

var port = argv.port || 3000;
var log_file = "datalog.txt";


console.log('WebSocket Commander here!', argv);
//Load the needed keys
var privateKey = fs.readFileSync('keys/key.pem', 'utf8');
var certificate = fs.readFileSync('keys/cert.pem', 'utf8');
var credentials = {
	key: privateKey,
	cert: certificate,
	passphrase: 'socketio'
};

//////////
//
//	Configure HTTP server
//
var express = require('express');
var app = express();
var https = require('https');
var server = https.Server(credentials, app);
var io = require('socket.io')(server);
io.set('log level', argv.debug ? 3 : 1);

//Variables
var devices= new Array();


//Serve the needed static files
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/src',  express.static(__dirname + '/src'));
app.use('/manifest.json', express.static(__dirname + '/manifest.json'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
//Make a secure endpoint that will 


server.listen(port);
console.log('Listening on port:', port);

//////////
//
//	Socket.io browser power
//
var output_socket;
var fs = require('fs');
var browserClient = io
	.of('/browser-client')
	.on('connection', function (socket) {
		console.log('Browser connected.');
		//Emit connection to connected message from the browser
		socket.emit('message', 'Connected to server at ' + new Date().toString() + '\n');
		//Emit the list of device connected
		socket.emit('device-list',devices);

		socket.on('message', function (data) {
			console.log('from client: ', data);
			//if (output_socket) output_socket.emit(data);
		});
		socket.on('disconnect',function(data){
			console.log("Browser disconnect");
			clearInterval(sendPingToBrowser);
		});
		var sendPingToBrowser=setInterval(function () {
			console.log("Pinging Browser...");
			socket.emit('message','Ping from server...'+'\n');
		},30000);
		//Returns the id of the client
		console.log("On init browser "+socket.client.id);
	});
//var test = io.of('/'+(socket.client.id).toString());
//////////
//
//	Socket.io Esp connected
//
//When the browser this also runs because i have not found a way to isolate the esp to connect using the .of('protocol')
io.on('connection', function (socket) {
	//This should only happen if it's a browser
	//var test = (socket.client.id).toString();
	socket.on('device status', function (data) {
		//If device begins to communicate 
		if (data.status == "200") {
			console.log("On device ready: "+socket.client.id);
			console.log("device ready to recieve data");
			//push the id of the connection to a socket
			devices.push(socket.client.id);
			browserClient.emit('device-list',devices);
			//Send ping to client ever 10000ms
			sendPing = setInterval(function () {
				console.log("emittng message...");
				io.emit('server status', {
					status: '100'
				});
			}, 10000);
		} else if (data.status == "100") {
			console.log("Recieved ping from client", data)
			io.emit('server status', {
				status: '100'
			});
		} else {
			console.log("device not ready");
			console.log(data);
		}
	});
	//On getting a message form the server
	socket.on('message', function (data) {
		//Tempoarly removed 
		//console.log("Recieved Message");
		//console.log(data);
		//Emit to that socket id channel only (Not working)
		//console.log("Atempting to emmit to" + (socket.client.id).toString());
		io.to((socket.client.id).toString()).emit('message', data);
		//io.emit('message', data);
	});

	output_socket = socket; // save global ugh
	//On disconnect stop emitting
	socket.on('disconnect', function () {
		io.emit('Esp disconnecting ' + socket.client.id );
	});
});

//////////
//
//	Keyboard handling
//
var cmd = '';
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (key) {
	if ((key === '\u0003') || (key == 'q')) process.exit();
	else if ((key === '\r') || (key == '\n')) {
		process.stdout.write('\r\n');
		output_socket.emit(cmd);
		cmd = '';
	} else {
		process.stdout.write(key);
		cmd = cmd + key;
	}
});