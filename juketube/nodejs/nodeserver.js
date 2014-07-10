var http = require('http');
//local
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');

//webfaction
/*var server = http.createServer().listen(32439, '127.0.0.1');
var io = require('/home/tidianeseri/bin/node_modules/socket.io').listen(server);
var cookie_reader = require('/home/tidianeseri/bin/node_modules/cookie');*/

var querystring = require('querystring');

/*var redis = require('socket.io/node_modules/redis');
var sub = redis.createClient();

//Subscribe to the Redis chat channel
sub.subscribe('chat');*/

//Configure socket.io to store cookie set by Django
io.configure(function(){
	io.set('authorization', function(data, accept){
		if(data.headers.cookie){
			data.cookie = cookie_reader.parse(data.headers.cookie);
			return accept(null, true);
		}
		return accept('error', false);
	});
	io.set('log level', 1);
});

//usernames which are currently connected to the playlist
var basket = {};

io.sockets.on('connection', function (socket) {
	var list = {};
	
	socket.on('playlist', function (playlist) {
		socket.join(playlist);		
		socket.room = playlist;
		//console.log(rooms[playlist]);
	});
	
	//When a new user connects to the playlist
	socket.on('new-user', function (username) {
		socket.nickname = username;
		var roster = io.sockets.clients(socket.room);
		roster.forEach(function(client) {
	          //list.push(client.id);
			list[client.id] = client.nickname;
	      });
		socket.broadcast.to(socket.room).emit('users-list', list);
		socket.emit('users-list', list); //send to self
	});
	
	//When a new jukebox is announced to the playlist
	socket.on('declare_jukebox', function (playlist, jukebox_name) {
		if(basket[playlist] == undefined)
			basket[playlist] = {};
		basket[playlist][jukebox_name] = socket.id;
	});
	
	socket.on('remove_jukebox', function (jukebox_name) {
		delete basket[playlist][jukebox_name];
	});
	
	socket.on('get_jukeboxes', function (playlist) {
		socket.emit('jukebox-list', basket[playlist]);
	});
	
	socket.on("send_command", function(playlist, jukebox_name, command, param){
		var to = basket[playlist][jukebox_name];
		io.sockets.socket(to).emit('rcv_command', command, param);;
	});
	
	//Client is sending message through socket.io
	socket.on('send_notification', function (playlist) {
		socket.broadcast.to(playlist).emit('refresh', "");
		console.log("notification received");
	});
	
	//Send commands
	/*socket.on('send_command', function (playlist, command, param) {
		socket.broadcast.to(playlist).emit('rcv_command', command, param);
	});*/
	
	//A la deconnection, enlever le user de la playlist
	socket.on('disconnect', function() {
	    delete list[socket.id];
		socket.broadcast.to(socket.room).emit('users-list', list);
	});
});