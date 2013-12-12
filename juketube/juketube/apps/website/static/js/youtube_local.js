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