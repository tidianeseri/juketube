	var socket = io.connect('/', {
		port : 4000
	});
	
	//webfaction
	/*var socket = io.connect('http://nodejuketube.tidianeseri.webfactional.com/');*/

	socket.on('connect', function() {
		$('#connection-status').html("<em>Connected<em>");
		console.log("connected");
		socket.emit('playlist', playlist_slug);
		socket.emit('new-user', user);
	});

	socket.on('refresh', function(message) {
		refreshPlaylist(playlist_id);
	});
	
	socket.on('users-list', function(list) {
		var user_list = "";
		for (var key in list) {
			   var obj = list[key];
			   user_list = user_list + "<a href='#'> " + obj +"</a>,";
			}
		$("#current-listeners").html(user_list.slice(0, -1));
	});
	
	socket.on('rcv_command', function(func, param) {
		//Create the function
		var fn = window[func];
		 
		//Call the function
		fn(param);
	});
	
	socket.on('jukebox-list', function(message) {
		var options = $("#jukebox-select");
		for (var key in message) {
		    options.append($("<option />").val(key).text(key));
		};
	});

	$(document).ready(function() {

		var entry_el = $('#ping');
		//console.log(entry_el);
		socket.emit('get_jukeboxes', playlist_slug);

		entry_el.click(function() {
			//When enter is pressed send input value to node server
			//var recver = "tab2";
			//console.log("msg envoye");
			if (playlist_slug) {
				socket.emit('send_command', playlist_slug, $("#jukebox-select").val(), "loadVideo", "LTs7djCH5yE");
			}
		});
	});