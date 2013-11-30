//bonne inspi: http://cueyoutube.com/
//http://www.9lessons.info/2010/09/youtube-instant-search-with-jquery-and.html

function onYouTubePlayerReady(playerId) {
	ytplayer = document.getElementById("myytplayer");
	ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

var results = [];
var current_track;
var next_track;

function onytplayerStateChange(evt)
{
	//console.log("Player's new state: " + evt);
	if(evt == 0)
	{
		current_track.removeClass("active")
		next_track = current_track.next();
		//console.log("next:"+next_track);
		if(next_track.attr("id")) {
			//current_track = next;
			loadVideo(next_track.attr("id"), "suivant");
		}
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

function nextVideo() {
	next_track = current_track.next();
	if(next_track.attr("id")) {
		loadVideo(next_track.attr("id"), "suivant");
	}
}

function prevVideo() {
	next_track = current_track.prev();
	if(next_track.attr("id")) {
		loadVideo(next_track.attr("id"), "suivant");
	}
}

function loadVideo(videoID, next) {
	if (ytplayer) {
		ytplayer.loadVideoById(videoID);
		
		if(current_track != null) current_track.removeClass("active");
		
		if(next == "suivant") {
			//console.log("suivant");
			current_track = next_track;
		}
		else if (next != undefined) {
			//console.log("position: "+next);
			current_track = $('#playlist-table li').eq(next);
		}
		else {
			//console.log("else");
			current_track = $('#playlist-table #'+videoID).first();
		}
		
		current_track.addClass("active");
		//else
		//	$('#playlist-table li').eq(index).addClass("active");
		
		play();
	}
}

function cueVideo(index) {
	var position = $('#playlist-table li').length;
	$('#playlist-table').append( "<li class='list-group-item' id='" + results[index].id + "'><a href='javascript:removeSong(\"" + results[index].id + "\");' class='cueButton'><span class='badge'>-</span></a><a href='javascript:loadVideo(\"" + results[index].id + "\", "+position+");' class='playlists-item'>" + results[index].title + "</a></li>" );
	
}

function clearPlaylist() {
	$('#playlist-table').empty();
}

function removeSong(videoID) {
	$('#'+videoID).remove();
}

function refreshCurrentPlaying(){
	if (ytplayer) {
		if (ytplayer.getPlayerState() == 1) {
			current_track = $("#"+current_track.attr('id'));
			current_track.addClass("active");
		}
	}
}