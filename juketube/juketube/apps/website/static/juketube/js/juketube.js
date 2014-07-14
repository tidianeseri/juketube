//function loadVideoPage() {}

function setCueLoad() {
	setVideoLoad();
	setVideoCue();
}

function searchResultHTML(objVideo) {
	var searchHTML = "<div class='result video-element' yt-id='"+objVideo.id+"' yt-title=\""+objVideo.title+"\" yt-duration='"+objVideo.duration+"'>"+
		"<div class='col-xs-2 col-sm-2 col-md-2 img-thumb loadVideo'>"+
			"<img class='img-responsive' src='http://img.youtube.com/vi/"+objVideo.id+"/0.jpg'>"+
		"</div>"+
		"<div class='col-xs-8 col-sm-8 col-md-8 loadVideo'>"+objVideo.title+" "+objVideo.time+"</div>"+
		"<div class='col-xs-2 col-xs-2 col-md-2'><span class='glyphicon glyphicon-plus cueVideo'></span></div>"+
		"<div class='clearfix'></div>"+
	"</div>";
	return searchHTML;
}

function playlistHTML(objVideo, index) {
	var itemHTML = "<div class='media'>" +
		"<div class='row video-element' yt-id='"+objVideo.id+"' yt-title=\""+objVideo.title+"\" yt-duration='"+objVideo.duration+"' jkt-id='"+objVideo.jkt_id+"' jkt-pos='"+objVideo.jkt_pos+"'>"+
			"<div class='media-img  pull-left col-xs-2 col-sm-2 col-md-2 loadVideo '>"+
				"<img src='http://img.youtube.com/vi/"+objVideo.id+"/0.jpg' alt='About' width='90' height='90'>"+
			"</div>"+
			"<div class='media-body col-xs-8 col-sm-8 col-md-8 loadVideo'>"+
				"<h4 class='media-heading'><a href='#'>"+objVideo.title+"</a></h4>"+
				/*"<p class='hidden-sm'>"+objVideo.time+"</p>"+*/
			"</div>"+
			"<div class='col-xs-2 col-sm-2 col-md-2'><span class='glyphicon glyphicon-remove remVideo'></span></div>"+
		"</div>"+
	"</div>";
	
	return itemHTML;
}

$(document).ready(function() {
	//Load variables when remote controller mode
	loadForRemoteControl();
	
	//Nice scroll
	$("#table-playlist").niceScroll({cursorcolor:"#428bca", cursorborder:"none", cursorwidth:"5px", autohidemode:"false", railoffset:{left:7}});
	$("#search-results").niceScroll({cursorcolor:"#428bca", cursorborder:"none", cursorwidth:"5px", autohidemode:"false"});
	
	//Hide Search Box
	$('html').click(function() {
		$('#search-results').fadeOut('fast');
	});
	$('#search-results').click(function(event){
		//$('#search-results').fadeIn('fast');
		event.stopPropagation();
	});
	$('.search-input').click(function(event){
		event.stopPropagation();
		$('#search-results').fadeIn('fast');
	});
	
	//Youtube Instant Search
	$("#search").keyup(function() 
	{
		var search_input = $(this).val();
		var keyword= encodeURIComponent(search_input);
		// Youtube API 
		var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&max-results=15&v=2&alt=jsonc'; 
		//console.log('here');
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
						var objVideo = new MediaYoutube(data); 
						results.push(objVideo);
						//console.log(data);
						//items.push( '<div class="result video-element" yt-id="'+objVideo.id+'"><div class="col-md-2 img-thumb loadVideo"><img class="img-responsive" src="http://img.youtube.com/vi/'+objVideo.id+'/0.jpg"></div><div class="col-md-8 loadVideo">'+objVideo.title+'</div><div class="col-md-2"><span class="glyphicon glyphicon-plus cueVideo"></span></div><div class="clearfix"></div></div>' );
						items.push( searchResultHTML(objVideo) );
						i++;
					});
					//console.log(results);
					//$('#search-results').fadeOut('fast', function(){
						$('#search-results').html();
						$('#search-results').html(items);
						$('#search-results').fadeIn('fast');
					//});
					setCueLoad();
				}
			}
		});
	});
});
