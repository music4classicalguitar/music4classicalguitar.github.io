// size A4 : 2976 × 4209 pixels

var scoresJSONfile, scoreInfo, image_width, image_height, div_score_viewer, slider_bar, turnjs_slider;
var display, f, sv;

function getSize() {
	let rect = div_score_viewer.getBoundingClientRect();
	let w = window.innerWidth;
	let h = window.innerHeight-rect.top-div_slider_bar.getBoundingClientRect().height;
	let scale = Math.min(h/scoreInfo.image.height,w/scoreInfo.image.width/f);
	return { "scale":scale, "w": Math.floor(scoreInfo.image.width * scale*f), "h": Math.floor(scoreInfo.image.height * scale) };
}

function addImage(image, alt, id) {
	//var img = $('<img></img>').attr('src',image).css('width',image_width+'px').css('height',image_height+"px").css('background-color','#FCEBB3');
	var img = $('<img></img>').attr('src',image).css('width','100%').css('height','100%').css('background-color','#FCEBB3');
	var div = $('<div></div>');
	div.append(img);
	//console.log("Add: "+image);
	$('.score_viewer').append(div); 
}

function loadImages(scoreInfo) {
	console.log('Load images w/h '+scoreInfo.image.width+'/'+scoreInfo.image.height+' scale '+sv.scale+' -> '+sv.w+'/'+sv.h);
	for (var s=0;s<scoreInfo.scores.length; s++) {
		for (var p=1; p<=scoreInfo.scores[s].pages; p++) {
			//console.log(scoreInfo.directory+"/"+scoreInfo.scores[s].name+"-"+p+".png");
			addImage(encodeURI(scoreInfo.directory+"/"+scoreInfo.scores[s].name+"-"+p+".png",scoreInfo.scores[s].name),"",'p_'+p);
			//addImage(scoreInfo.directory+"/"+scoreInfo.scores[s].name+"-"+p+".png",scoreInfo.scores[s].name);
		}
	}
}

function loadJSON(url, callback) {
	var req = new XMLHttpRequest();
	req.addEventListener("error", function(e) {window.console.log('load JSON error '+JSON.stringify(e));});
	req.addEventListener("abort", function(e) {window.console.log('load JSON error '+JSON.stringify(e));});
	req.overrideMimeType("application/json");
	req.open('GET', url, true);
	scoreDirectory = url.split('/').slice( 0,-1).join('/');
	req.onreadystatechange = function() {
		if (req.readyState === 4) {
			var status = req.status;
			switch (status) {
				case 0: // local file
				case 200:
				case 304:
					callback(req.responseText);
					break;
				default:
					window.alert("url " + url + " status " + status + " : " + req.statusText);
					//_this.errors++;
					//_this.errorMessage = "url " + url + " status " + status + " : " + req.statusText;
					break;
			}
		}
	};
	req.send(null);
}

function loadApp() {
	if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
		display='single';
		f=1;
	} else {
		display='double';
		f=2;
	}

	var query = window.location.search;
	if (query.substring(0, 1) == '?') query = query.substring(1);
	var data = query.split('&'); 
	var name='', path='', lang='';
	for (i = 0; (i < data.length); i++) {
		data[i] = decodeURIComponent(data[i]);
		var temp = data[i].split('=');
		if (temp[0]=='scores') { scoresJSONfile=temp[1]; console.log('scoresJSONfile: '+scoresJSONfile); }
	}
	//console.log('scoresJSONfile >'+scoresJSONfile+'<');
	if (scoresJSONfile) {
		loadJSON(scoresJSONfile,setup);
	} else {
		window.alert('Score viewer: no scores specified');
	}
}

function slider_change() {
	//console.log("turnjs_slider.value: "+turnjs_slider.value+" "+f);
	$('.score_viewer').turn('page',turnjs_slider.value);
	//console.log("Page: "+p+" of "+scoreInfo.pages+" : "+turnjs_slider.value);
}

function setup(response) {
	div_score_viewer = document.getElementById('score_viewer');
	div_slider_bar = document.getElementById('slider_bar');
	slider_bar = document.getElementById('slider_bar');
	turnjs_slider = document.getElementById('turnjs_slider');

	scoreInfo = JSON.parse(response);
	
	sv = getSize();

	//slider_bar.style.setProperty('width', sv.w).setProperty('text-align', 'center');
	slider_bar.setAttribute("style", 'width:'+sv.w+'px;text-align:center');
	//slider_bar.style;
	//style="text-align:center"
	turnjs_slider.max = scoreInfo.pages;

	turnjs_slider.value = 1;
	//console.log("value:"+Math.floor((scoreInfo.pages+2)/2));
	
	loadImages(scoreInfo);

	// keyboard arrows, left <- and right ->
	$(document).keydown(function(e){

		var previous = 37, next = 39;

		switch (e.keyCode) {
			case previous:
				console.log('previous');
				$('.score_viewer').turn('previous');
			break;
			case next:
				console.log('next');
				$('.score_viewer').turn('next');
			break;
		}
	});

	// Create the score_viewer

	$('.score_viewer').turn({
			// Width
			width: sv.w,
			// Height
			height: sv.h,
			// Elevation
			elevation: 50,
			// Enable gradients
			gradients: true,
			// Auto center this score_viewer
			autoCenter: false,
			display : display,
			when: {
				turning: function(e, page, view) {
					var book = $(this),
					currentPage = book.turn('page'),
					pages = book.turn('pages');

					if (currentPage>3 && currentPage<pages-3) {
						if (page==1) {
							book.turn('page', 2).turn('stop').turn('page', page);
							e.preventDefault();
							return;
						} else if (page==pages) {
							book.turn('page', pages-1).turn('stop').turn('page', page);
							e.preventDefault();
							return;
						}
					} else if (page>3 && page<pages-3) {
						if (currentPage==1) {
							book.turn('page', 2).turn('stop').turn('page', page);
							e.preventDefault();
							return;
						} else if (currentPage==pages) {
							book.turn('page', pages-1).turn('stop').turn('page', page);
							e.preventDefault();
							return;
					}
				}
			}
		}
	});
	
	$('.score_viewer').bind('turning', function(event, page, obj){
		turnjs_slider.value = page;
	});

}

window.addEventListener('resize', function() {
	sv = getSize() ;
	$('.score_viewer').turn('size',sv.w, sv.h);
	$('.score_viewer').turn('resize');
	slider_bar.setAttribute("style", 'width:'+sv.w+'px;text-align:center');
	//console.log('resize '+sv.w+'/'+sv.h);
});

// Load the HTML4 version if there's not CSS transform

yepnope({
	test : Modernizr.csstransforms,
	yep: ['js/turn/turn.min.js'],
	nope: ['js/turn/turn.html4.min.js'],
	both: ['css/score_viewer/score_viewer.css'],
	complete: loadApp
});

