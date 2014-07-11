var playheadInterval = 0;
var YT_PLAYER;
var YT_PLAYLIST;

/***********************************************************************/
/*                      Media Class     						       */
/***********************************************************************/
function Media(id) {
	//this.id = id;
	this.jkt_id = id;
	this.jkt_pos = null;
}

function MediaYoutube(data) {
	Media.call(this, data.jkt_id);
	this.id=data.id;
	this.jkt_pos = data.jkt_pos;
	this.title=data.title;
	if(data.thumbnail)
		this.img=data.thumbnail.hqDefault;
	this.duration=data.duration;
	/*var minutes = Math.floor(data.duration / 60);
	var seconds = data.duration - minutes * 60;
	seconds = ( seconds < 10 ? "0"+seconds : seconds ); */
	this.time = durationToTime(data.duration);
}

MediaYoutube.prototype = new Media();
MediaYoutube.prototype.constructor = MediaYoutube;

/***********************************************************************/
/*                      Player Class     						       */
/***********************************************************************/

$('#control-play').click(function(){
	YT_PLAYER.play();
});
$('#control-back').click(function(){
	YT_PLAYER.previous();
});
$('#control-next').click(function(){
	YT_PLAYER.next();
});

function setVideoLoad() {
	$('.loadVideo').off("click");
	$('.loadVideo').on("click", function(){
		video_id = $(this).closest('.video-element').attr('yt-id');
		YT_PLAYER.loadVideo(video_id);
		YT_PLAYLIST.currentTrackIndex = $("#table-playlist .video-element[yt-id='"+video_id+"']").parent().index();
		
		$('#search-results').fadeOut('fast');
	});
}

function setClickBarPlaying() {
	$(".player-time").on("click", getClickPosition);
}

function onYouTubePlayerReady(playerId) {
	loadVideoPage();
	setClickBarPlaying();
	//setVideoCue();
	YT_PLAYER.player.cueVideoById(YT_PLAYLIST.medias.item(0).id);
	YT_PLAYLIST.currentTrackIndex = 0;
}
YT_PLAYER = new Player();
YT_PLAYLIST = new Playlist();
setVideoLoad();
setClear();
setRefresh();

function onytplayerStateChange(evt) {
	//Unstarted
	if(evt.data == -1)
	{
		YT_PLAYER.setInfo();
		YT_PLAYER.setPlaybackInfo();
		$('.main').css('background-image', "url(http://img.youtube.com/vi/"+YT_PLAYER.current+"/1.jpg)");
		YT_PLAYLIST.setCurrent(YT_PLAYLIST.currentTrackIndex);
		YT_PLAYLIST.setNext();
	}
	//Ended
	else if(evt.data == 0){
		$('#control-play').removeClass("glyphicon-pause");
		$('#control-play').addClass("glyphicon-play");
		
		YT_PLAYER.next();
	}
	//Playing
	else if(evt.data == 1)
	{
		YT_PLAYER.setInfo();
		YT_PLAYER.setPlaybackInfo();
		//While playing, update the progress bar
		playerheadInterval = setInterval(function(){YT_PLAYER.updatePlayhead()}, 1000);
		
		$('#control-play').removeClass("glyphicon-play");
		$('#control-play').addClass("glyphicon-pause");
	}
	//Paused
	else if(evt.data == 2){
		$('#control-play').removeClass("glyphicon-pause");
		$('#control-play').addClass("glyphicon-play");
	}
}

function Player() {
	if (typeof ytplayer !== 'undefined')
		this.player = ytplayer;
	this.current = null;
	this.currentPlaylistIndex = null;
}

Player.prototype.getPlayer = function() {
	return this.player;
}

Player.prototype.setInfo = function() {
	var datas = this.player.getVideoData(); 
	this.current = datas.video_id;
	this.author = datas.author;
	this.title = datas.title;
	this.duration = this.player.getDuration();
	this.time = durationToTime(this.duration);
}

Player.prototype.setPlaybackInfo = function() {
	//this.setInfo();
	$('.info #current-img img').attr('src', 'http://img.youtube.com/vi/'+this.current+'/0.jpg');
	$('.info #current-title').html(this.title);
}

Player.prototype.updatePlayhead = function() {
	if( this.player.getPlayerState() != 1) {
		clearInterval(playheadInterval);
		return;
	}
	$('#time-elapsed').width((this.player.getCurrentTime() / this.player.getDuration())*100 + "%");
	$('#time-elapsing').html(" "+durationToTime(this.player.getCurrentTime()) + "/" + this.time);
}

Player.prototype.loadVideo = function(videoID) {
	try{
		if (ytplayer) {
			ytplayer.loadVideoById(videoID);
			
		}
	}
	catch(e) {
		if(('#idremote') != undefined)
			socket.emit('send_command', YT_PLAYLIST.slug, $("#jukebox-select").val(), "loadVideo", videoID);
	}
}

Player.prototype.play = function() {
	
	if (typeof this.player !== 'undefined' && this.player) {
		if (this.player.getPlayerState() == 1) {
			this.player.pauseVideo();
			//$('.glyphicon-pause').attr('class', 'glyphicon glyphicon-play pull-right')
		}
		else {
			this.player.playVideo();
			//$('.glyphicon-play').attr('class', 'glyphicon glyphicon-pause pull-right')
		}
		/*current_title = "";
		if(current_track != null) current_title = current_track.children('.results-item').html();
		$(document).attr("title", "JukeTube - "+current_title);*/
	}
}

Player.prototype.previous = function() {
	var vid_index;
	if(YT_PLAYLIST.currentTrackIndex > 0)
		vid_index  = --YT_PLAYLIST.currentTrackIndex;
	YT_PLAYER.loadVideo(YT_PLAYLIST.medias.item(vid_index).id);
}

Player.prototype.next = function() {
	var vid_index;
	if(YT_PLAYLIST.currentTrackIndex < (YT_PLAYLIST.medias.size()-1) )
		vid_index  = ++YT_PLAYLIST.currentTrackIndex;
	YT_PLAYER.loadVideo(YT_PLAYLIST.medias.item(vid_index).id);
}

Player.prototype.goTo = function(fraction) {
	this.player.seekTo(parseInt(this.duration*fraction));
}

/***********************************************************************/
/*                      Playlist Class     						       */
/***********************************************************************/
function Playlist() {
	this.medias = new LinkedList();
	//this.medias = {};
	this.currentTrackIndex = null;
	this.slug = null;
	if($('#playlist-slug').length)
		this.slug = $('#playlist-slug').html().trim();
}

Playlist.prototype.add = function(Media, autoConstruct) {
	this.medias.add(Media);
	//this.medias[Media.id] = Media;
	if(autoConstruct == undefined) {
		var item = playlistHTML(Media, 0);
		$("#table-playlist").append(item);
	}
	setVideoLoad();
	setRemoveVideo();
}

Playlist.prototype.remove = function(index) {
	/*var index = this.medias.indexOf(Media);
	if (index > -1) {
		this.medias.splice(index, 1);
	}*/
	this.medias.remove(index);
}

Playlist.prototype.clear = function() {
	this.medias = new LinkedList();
	this.currentTrackIndex = null;
}

Playlist.prototype.clean = function() {
	this.medias = new LinkedList();
	$("#table-playlist").empty();
}

Playlist.prototype.setCurrent = function(index) {
	$("#table-playlist").find(".current_track").removeClass("current_track");
	$current = $("#table-playlist").find(".video-element[yt-id='"+this.medias.item(index).id+"']");
	$current.addClass("current_track");
}

Playlist.prototype.setNext = function() {
	$('#next-song img').attr('src', 'http://img.youtube.com/vi/'+this.medias.item(this.currentTrackIndex+1).id+'/0.jpg');
	$('#next-song p').html(this.medias.item(this.currentTrackIndex+1).title);
	$('#next-song .video-element').attr('yt-id', this.medias.item(this.currentTrackIndex+1).id);
}

function refreshPlaylist() {
	if ($("#is_auth").length) {
		post_object = {};
		post_object["playlist_id"]=$("#playlist_id").val();
		post_object["url"]="/getUpdatedPlaylist/";
		toServer(post_object, false);
	}		
}
function setVideoCue() {
	$('.cueVideo').off("click");
	$('.cueVideo').on("click",function() {
		data = new Object();
		data.id = $(this).closest('.video-element').attr('yt-id');
		data.title = $(this).closest('.video-element').attr('yt-title');
		data.duration = $(this).closest('.video-element').attr('yt-duration');
		
		if ($("#is_auth").length) {
			post_object = {};
			post_object["idmedia"]=data.id;
			post_object["title"]=data.title;
			post_object["length"]=data.duration;
			post_object["operation"]="add";
			post_object["playlist_id"]=$("#playlist_id").val();
			post_object["url"]="/updatePlaylist/";
			toServer(post_object, true);
		}		
		else {
			var new_media = new MediaYoutube(data);
			YT_PLAYLIST.add(new_media);
		}
		$('#search-results').fadeOut('fast');
	});
}

function setRemoveVideo() {
	$('.remVideo').off("click");
	$('.remVideo').on("click",function() {
		$elemToRemove = $(this).closest('.video-element');
		video_id = $elemToRemove.attr('yt-id');
		indexToRemove = $("#table-playlist .video-element[yt-id='"+video_id+"']").parent().index();
		
		if ($("#is_auth").length) {
			post_object = {};
			post_object["idmedia"]= $elemToRemove.attr('jkt-id');
			post_object["position"]= $elemToRemove.attr('jkt-pos');
			post_object["operation"]="rem";
			post_object["playlist_id"]=$("#playlist_id").val();
			post_object["url"]="/updatePlaylist/";
			toServer(post_object, true);
		}		
		else {
			YT_PLAYLIST.remove(indexToRemove);
			$elemToRemove.parent().remove();
		}
	});
}

function setClear() {
	$('#clear-playlist').click(function(){
		YT_PLAYLIST.clear();
		$("#table-playlist").empty();
	})
}

function setRefresh() {
	$('#refresh-playlist').click(function(){
		refreshPlaylist();
	})
}
/***********************************************************************/
/*                      NodeJS Functions   						       */
/***********************************************************************/
function notifyListeners(slug) {
	if(slug){
		socket.emit('send_notification', slug, function(data){
			//console.log(data);
		});
	}
}

//Detecter le changement de l'etat d'activation
$("#jukebox_mode").change(function() {
	if($(this).prop("checked")) {
		$("#jukebox_name").parent().parent().show();
		if($("#jukebox_name").val())
			socket.emit('declare_jukebox', playlist_slug, $("#jukebox_name").val());
    }
	else {
		$("#jukebox_name").parent().parent().hide();
		socket.emit('remove_jukebox', $("#jukebox_name").val());
	}
});
$("#jukebox_name_ok").click(function() {
	if($("#jukebox_name").val())
		socket.emit('declare_jukebox', playlist_slug, $("#jukebox_name").val());
});

/***********************************************************************/
/*                      Helper Functions   						       */
/***********************************************************************/
function durationToTime(duration) {
	var minutes = Math.floor(duration / 60);
	var seconds = parseInt(duration - minutes * 60);
	seconds = ( seconds < 10 ? "0"+seconds : seconds ); 
	var time = minutes + ":" + seconds;
	
	return time;
}

//using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
var csrftoken = getCookie('csrftoken');

//Add/Rem To Server by AJAX
function toServer(postData, notify) {
	var urlSubmit = postData["url"];
	$.ajax({
		type: "POST",
		url: urlSubmit,
		beforeSend: function(xhr, settings) {
	        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	            xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        }
	    },
		data      : postData,
		success: function(response) {
			var items = [];
			var i = 0;
			YT_PLAYLIST.clean();
			$.each( response, function(i,data) {
				new_data = new Object();
				new_data.id = data.fields.media.fields.media_id;
				new_data.jkt_id = data.fields.media.pk;
				new_data.jkt_pos = data.fields.position;
				new_data.title = data.fields.media.fields.name;
				new_data.duration = data.fields.media.fields.length;
				var new_media = new MediaYoutube(new_data);
				YT_PLAYLIST.add(new_media);
				i++
			});
			
			//Send notification to all listeners
			if( typeof notify === 'undefined' || notify == true)
				notifyListeners(YT_PLAYLIST.slug);
			
			YT_PLAYLIST.setCurrent(YT_PLAYLIST.currentTrackIndex);
		}
	});
return false;
}

/*To bind click event
 * http://www.kirupa.com/html5/getting_mouse_click_position.htm
 * */
function getClickPosition(e) {
    var parentPosition = getPosition(e.currentTarget);
    var xPosition = e.clientX - parentPosition.x;
    var yPosition = e.clientY - parentPosition.y;
    var size = $("div.player-time").width()
    YT_PLAYER.goTo(xPosition/size);
}
 
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
      
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}