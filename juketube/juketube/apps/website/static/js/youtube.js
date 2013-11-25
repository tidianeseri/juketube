//bonne inspi: http://cueyoutube.com/
//http://www.9lessons.info/2010/09/youtube-instant-search-with-jquery-and.html

function onYouTubePlayerReady(playerId) {
	ytplayer = document.getElementById("myytplayer");
	ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

var results = [];
var current_track;

function onytplayerStateChange(evt)
{
	//console.log("Player's new state: " + evt);
	if(evt == 0)
	{
		current_track.removeClass("active")
		var next = current_track.next();

		if(next.attr("id"))
			loadVideo(next.attr("id"));
	}
}

function play() {
	if (ytplayer) {
		if (ytplayer.getPlayerState() == 1) {
			ytplayer.pauseVideo();
			$('.playbutton').attr('class', 'glyphicon glyphicon-play playbutton')
		}
		else {
			ytplayer.playVideo();
			$('.playbutton').attr('class', 'glyphicon glyphicon-pause playbutton');
		}
		current_title = "";
		if(current_track != null) current_title = current_track.children('.results-item').html();
		$(document).attr("title", "JukeTube - "+current_title);
	}
}

function stop() {
	if (ytplayer) {
		ytplayer.stopVideo();
	}
}

function loadVideo(videoID) {
	if (ytplayer) {
		ytplayer.loadVideoById(videoID);
		if(current_track != null) current_track.removeClass("active");
		current_track = $('#'+videoID);
		current_track.addClass("active");
		play();
	}
}

function cueVideo(index) {
	$('#playlist-table').append( "<li class='list-group-item' id='" + results[index].id + "'><a href='javascript:removeSong(\"" + results[index].id + "\");' class='cueButton'><span class='badge'>-</span></a><a href='javascript:loadVideo(\"" + results[index].id + "\");' class='results-item'>" + results[index].title + "</a></li>" );
	
}

function clearPlaylist() {
	$('#playlist-table').empty();
}

function removeSong(videoID) {
	$('#'+videoID).remove();
}

function my_js_callback(data){
    alert(data.message);
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
					items.push( "<li class='list-group-item'><a href='javascript:cueVideo("+i+");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + key + "\");' class='results-item'>" + val + "</a></li>" );
					i++;
				});
				$('#results-table').fadeOut('fast', function(){
					$('#results-table').html();
					$('#results-table').html(items);
					$('#results-table').fadeIn('fast');
				});
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
						items.push( "<li class='list-group-item'><a href='javascript:cueVideo("+i+");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + data.id + "\");' class='results-item'>" + data.title + "</a></li>" );
						i++;
					});
					$('#results-table').fadeOut('fast', function(){
						$('#results-table').html();
						$('#results-table').html(items);
						$('#results-table').fadeIn('fast');
					});
					
				}
			}
		});
	});
});