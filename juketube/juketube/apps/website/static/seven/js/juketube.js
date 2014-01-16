var results = [];
var playlist = new Playlist('#playlist-table');
var playlist2 = new Playlist('#playlist-table2');

function onYouTubePlayerReady(playerId) {
	//console.log("player loaded");
}

function onytplayerStateChange(evt)
{
	if(evt.data == 0)
	{
		//console.log("Player's new state: " + evt);
		playlist.current_track.removeClass("active")
		//playlist.next_track = playlist.current_track.next();
		//console.log("next:"+playlist.next_track);
		if(playlist.next_track.attr("id")) {
			//current_track = next;
			playlist.loadVideo(playlist.next_track.attr("id"), "suivant");
		}
	}
}

//Playlist Class
function Playlist(idPlaylist) {
	this.idPlaylist = idPlaylist;
	this.medias = {};
	var id_player;
	var current_track;
	var next_track;
}

Playlist.prototype.cueVideo = function(objVideo) {
	$(this.idPlaylist)
			.append("<tr id='" + objVideo.id + "'>" +
					"<td class='thumbvideo'><div class='arrow-left'></div>" +
					"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'><img src='" + objVideo.img + "' alt='Miniature' width='100%'></a>" +
					"</td><td>" +
					"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'>" + objVideo.title + "</a>" +
					"</td><td><h5>" + objVideo.time + "</h5></td><td>" +
					"<div class='cueButton'>" +
					"<a href='javascript:removeVideo(\""+ objVideo.id +"\");'><i class='icon-minus pull-right'></i></a>" +
					"</div></td></tr>");
	this.medias[objVideo.id] = objVideo;
}

Playlist.prototype.updateQueueVideo = function(objVideo, operation) {
	$("#toQueue #idmedia").val(objVideo.id);
	
	var title = $("#results-table li a[data-id='"+objVideo.id+"']").html();
	$("#toQueue #title").val(objVideo.title);
	$("#toQueue #length").val(objVideo.duration);
	if (operation == undefined || operation =="add")
		$("#toQueue #operation").val("add");
	else if (operation == "rem") {
		$("#toQueue #operation").val("rem");
		$("#toQueue #title").val(objVideo.position);
	}
	else if (operation == "clear")
		$("#toQueue #operation").val("clr");
	$("#toQueue").submit();	
}

Playlist.prototype.removeVideo = function(videoID) {
	$('#'+videoID).remove();
}

Playlist.prototype.loadVideo = function(videoID) {
	if (ytplayer) {
		ytplayer.loadVideoById(videoID);
		
		//Si aucune track courante n'est definie, enlever la classe active
		if(this.current_track != null && this.current_track.val() != undefined) 
			this.current_track.removeClass("active");
		
		//Mettre actif la next track (erreur)
		//if(this.next_track != null && this.next_track.val() != undefined) 
		//	this.current_track = this.next_track;
		//else
			this.current_track = $('#playlist-table #'+videoID).first();
		
		this.current_track.addClass("active");
		this.play();
		this.setNext();
	}
}

Playlist.prototype.setNext = function() {
	this.next_track = this.current_track.next();
	if(this.next_track != null && this.next_track.val() != undefined){
		//console.log(this.medias);
		$('#next-video .next-video-img img').attr('src', this.medias[this.next_track.attr('id')].img);
		$('#next-video a').attr('href', 'javascript:loadVideo(\"' + this.medias[this.next_track.attr('id')].id + '\");');
		$('#next-video .next-video-infos strong').html(this.medias[this.next_track.attr('id')].title);
		$('#next-video .next-video-infos h5').html(this.medias[this.next_track.attr('id')].time);
	}
}

Playlist.prototype.play = function() {
	if (ytplayer) {
		if (ytplayer.getPlayerState() == 1) {
			ytplayer.pauseVideo();
			//$('.playbutton').attr('class', 'glyphicon glyphicon-play playbutton')
		}
		else {
			ytplayer.playVideo();
			//$('.playbutton').attr('class', 'glyphicon glyphicon-pause playbutton');
		}
		/*current_title = "";
		if(current_track != null) current_title = current_track.children('.results-item').html();
		$(document).attr("title", "JukeTube - "+current_title);*/
	}
}

Playlist.prototype.loadMedias = function() {
	//this.medias = {}
	medias = this.medias;
	$('#playlist-table tr').each(function(){
		var objVideo = new Object();
		objVideo.id = $(this).attr('id');
		objVideo.title=$(this).find('.track-title a').html();
		objVideo.img=$(this).find('.thumbvideo img').attr('src');
		objVideo.time=$(this).find('.track-time h5').html();
		medias[objVideo.id] = objVideo;
	})
}

//Local functions
function cueVideo(index) {	
	results[index].time = getTime(results[index].duration);
	playlist.cueVideo(results[index]);
	//playlist2.cueVideo(results[index]);
	
	var element =  document.getElementById('toQueue');
	if (typeof(element) != 'undefined' && element != null)
	{
		playlist.updateQueueVideo(results[index], "add");
	}
}
function removeVideo(id, pos) {	
	playlist.removeVideo(id);
	//playlist2.removeVideo(id);
	var element =  document.getElementById('toQueue');
	mediaDel=new Object();
	mediaDel.id = id;
	mediaDel.position = pos;
	if (typeof(element) != 'undefined' && element != null)
	{
		playlist.updateQueueVideo(mediaDel, "rem");
	}
}
function loadVideo(id) {	
	playlist.loadVideo(id);
}
function getTime(duration) {
	var minutes = Math.floor(duration / 60);
	var seconds = duration - minutes * 60;
	return (minutes + ":" + seconds);
}

// Add To Playlist AJAX
$("#toQueue").submit( function() {
	var urlSubmit = $(this).attr('action');
	$.ajax({
		type: "POST",
		url: urlSubmit,
		data      : $(this).serializeArray(),
		success: function(response) {
			var items = [];
			var i = 0;
			$.each( response, function(i,data) {
				objVideo=new Object();
				objVideo.id=data.fields.media.fields.media_id;
				objVideo.title=data.fields.media.fields.name;
				objVideo.pk=data.fields.media.pk;
				//objVideo.img=data.thumbnail.hqDefault;
				objVideo.duration=data.fields.media.fields.length;
				objVideo.position=data.fields.position;
				buildPlaylistTable(items, objVideo, i);
				i++;
			});
			
			//Refresh playlist table
			$('#playlist-table').fadeOut('fast', function(){
				$('#playlist-table').html();
				$('#playlist-table').html(items);
				$('#playlist-table').fadeIn('fast');
				//refreshCurrentPlaying();
			});
			
			//Send notification to all listeners
			//notifyListeners(playlist);
		}
	});
return false;
});

//Runtime
playlist.loadMedias();