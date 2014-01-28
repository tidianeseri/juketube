function buildTable(items, objVideo, index)
{
	var minutes = Math.floor(objVideo.duration / 60);
	var seconds = objVideo.duration - minutes * 60;
	objVideo.time = minutes + ":" + seconds;
	items.push("<tr>" +
					"<td class='thumbvideo'><div class='arrow-left'></div>" +
						"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'><img src='" + objVideo.img + "' alt='Miniature' width='100%'></a>" +
					"</td>" +
					"<td>" +
						"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'>" + objVideo.title + " " + objVideo.time +"</a>" +
						"</td>" +
					"<td>" +
						"<div class='cueButton'>" +
						"<a href='javascript:cueVideo("+ index +");'><i class='icon-plus pull-right'></i></a>" +
						"</div>" +
					"</td>" +
				"</tr>");
}

function buildPlaylistTable(items, objVideo, index)
{
	var minutes = Math.floor(objVideo.duration / 60);
	var seconds = objVideo.duration - minutes * 60;
	objVideo.time = minutes + ":" + seconds;
	items.push("<tr id=\"" + objVideo.id + "\">" +
					"<td class='thumbvideo'><div class='arrow-left'></div>" +
						"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'>" +
						"<img src='http://i.ytimg.com/vi/" + objVideo.id + "/hqdefault.jpg' alt='Miniature' width='100%'></a>" +
					"</td>" +
					"<td>" +
						"<a href='javascript:loadVideo(\"" + objVideo.id + "\");'>" + objVideo.title +"</a>" +
						"</td>" +
					"<td><h5>" + objVideo.time +"</h5></td>" +
					"<td>" +
						"<div class='cueButton'>" +
						"<a href='javascript:removeVideo(\""+ objVideo.pk +"\",\""+ objVideo.position +"\");'><i class='icon-minus pull-right'></i></a>" +
						"</div>" +
					"</td>" +
				"</tr>");
	/*
	<tr id="jGJ1I-b29mw">
	<td class="thumbvideo">
		<div class="arrow-left"></div>
		<a href='javascript:loadVideo("{{ media.media_id }}");'>
		<img src="http://i.ytimg.com/vi/{{ media.media_id }}/hqdefault.jpg" alt="Miniature" width="100%">
		</a>
	</td>
	<td><a href='javascript:loadVideo("{{ media.media_id }}");'>{{ media.name }}</a></td>
	<td><h5>78:16</h5></td>
	{% if is_listener %}<td><div class="cueButton"><a href='javascript:removeVideo("{{ media.id }}","{{ media.position }}");'><i class="icon-minus pull-right"></i></a></div></td>{% endif %}
	</tr>*/
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
					buildTable(items, objVideo);
					//items.push( "<li class='list-group-item'><a href='javascript:cueVideo("+i+");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + key + "\");' class='results-item'>" + val + "</a></li>" );
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
		
		if($('#search-div').is(":hidden")) {
			$('#search-div').fadeIn('fast').delay(10000).fadeOut('slow');
		}
		var search_input = $(this).val();
		var keyword= encodeURIComponent(search_input);
		// Youtube API 
		var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&max-results=10&v=2&alt=jsonc'; 
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
						objVideo=new Object();
						objVideo.id=data.id;
						objVideo.title=data.title;
						objVideo.img=data.thumbnail.hqDefault;
						objVideo.duration=data.duration;
						buildTable(items, objVideo, i);
						//console.log(objVideo);
						results.push(objVideo);
						//console.log(data);
						//items.push( "<li class='list-group-item'><a href='javascript:cueVideo("+i+");' class='cueButton'><span class='badge'>+</span></a><a href='javascript:loadVideo(\"" + data.id + "\");' class='results-item'>" + data.title + "</a></li>" );
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