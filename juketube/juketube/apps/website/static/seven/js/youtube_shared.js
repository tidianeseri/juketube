function notifyListeners(slug) {
	console.log("msg envoye: "+slug);
	if(slug){
		socket.emit('send_message', slug, function(data){
			console.log(data);
		});
	}
}

function updateQueueVideo(idmedia, operation) {
	$("#toQueue #idmedia").val(idmedia);
	var title = $("#results-table li a[data-id='"+idmedia+"']").html();
	$("#toQueue #title").val(title);
	if (operation == undefined)
		$("#toQueue #operation").val("add");
	else if (operation == "rem")
		$("#toQueue #operation").val("rem");
	else if (operation == "clear")
		$("#toQueue #operation").val("clr");
	$("#toQueue").submit();	
}

//Fonction qui permet de refresh la table de la playlist
//Elle est appelee chez les listeners
function refreshPlaylist(playlistID){
	var urlSubmit = "/getUpdatedPlaylist/";
	$.ajax({
		type: "GET",
		url: urlSubmit,
		data      : {id:playlistID},
		success: function(response) {
			var items = [];
			var position = 0;
			$.each( response, function(i,data) {
				//console.log(data);
				items.push( "<li class='list-group-item' id='" + data.fields.media_id + "'><a href='javascript:updateQueueVideo(\"" + data.pk + "\", \"rem\");' class='cueButton'><span class='badge'>-</span></a><a href='javascript:loadVideo(\"" + data.fields.media_id + "\", "+position+");' class='playlists-item'>" + data.fields.name + "</a></li>" );
				position++;
			});
			
			$('#playlist-table').fadeOut('fast', function(){
				$('#playlist-table').html();
				$('#playlist-table').html(items);
				$('#playlist-table').fadeIn('fast');
				refreshCurrentPlaying();
			});
		}
	});
}

$(document).ready(function(){
	
	// Formulaire POST AJAX
	$("#ajax2").submit( function() {
		var urlSubmit = $(this).attr('action');
		$.ajax({  
			type: "POST",
			url: urlSubmit,
			data      : $(this).serializeArray(),
			success: function(data) {
				var items = [];
				results = [];
				var i = 0;
				$.each( data, function( key, val ) {
					objVideo=new Object();
					objVideo.id=key;
					objVideo.title=val;
					//console.log(objVideo);
					results.push(objVideo);
					items.push( "<li class='list-group-item'><a href='javascript:updateQueueVideo("+key+");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + key + "\");' class='results-item'>" + val + "</a></li>" );
					i++;
				});
				$('#results-table').fadeOut('fast', function(){
					$('#results-table').html();
					$('#results-table').html(items);
					$('#results-table').fadeIn('fast');
				});
				updateQueueVideo();
			}
		});
		return false;
	});

	//Youtube Instant Search

	$("#search").keyup(function() 
	{
		var search_input = $(this).val();
		var keyword= encodeURIComponent(search_input);
		// Youtube API 
		var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&max-results=10&v=2&alt=jsonc'; 

		$.ajax
		({
			type: "GET",
			url: yt_url,
			dataType:"jsonp",
			success: function(response)
			{
				if(response.data.items)
				{					
					var items = [];
					results = [];
					var i = 0;
					$.each( response.data.items, function(i,data) {
						objVideo=new Object();
						objVideo.id=data.id;
						objVideo.title=data.title;
						//console.log(objVideo);
						results.push(objVideo);
						items.push( "<li class='list-group-item'><a href='javascript:updateQueueVideo(\"" + data.id + "\");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + data.id + "\");' data-id='" + data.id + "' class='results-item'>" + data.title + "</a></li>" );
						i++;
					});
					$('#results-table').fadeOut('fast', function(){
						$('#results-table').html();
						$('#results-table').html(items);
						$('#results-table').fadeIn('fast');
					});
					//updateQueueVideo();
				}
			}
		});
	});
	
	// Add To Playlist AJAX
	$("#toQueue").submit( function() {
		var urlSubmit = $(this).attr('action');
		$.ajax({
			type: "POST",
			url: urlSubmit,
			data      : $(this).serializeArray(),
			success: function(response) {
				var items = [];
				var position = 0;
				$.each( response, function(i,data) {
					//console.log(data);
					items.push( "<li class='list-group-item' id='" + data.fields.media_id + "'><a href='javascript:updateQueueVideo(\"" + data.pk + "\", \"rem\");' class='cueButton'><span class='badge'>-</span></a><a href='javascript:loadVideo(\"" + data.fields.media_id + "\", "+position+");' class='playlists-item'>" + data.fields.name + "</a></li>" );
					position++;
				});
				
				//Refresh playlist table
				$('#playlist-table').fadeOut('fast', function(){
					$('#playlist-table').html();
					$('#playlist-table').html(items);
					$('#playlist-table').fadeIn('fast');
					refreshCurrentPlaying();
				});
				
				//Send notification to all listeners
				notifyListeners(playlist);
			}
		});
	return false;
	});
});
