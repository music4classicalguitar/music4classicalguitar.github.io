window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

function urlOfScript(jsfile) {
	var scriptElements = document.getElementsByTagName('script');
	var i, element, myfile;
	for (i=0; element=scriptElements[i]; i++) {
		myfile=element.src;
		if (myfile.indexOf(jsfile)>= 0) {
			var myurl=myfile.substring(0, myfile.indexOf(jsfile));
		}
	}
	return myurl;
}

if (!("ms_player" in window)) {
	(function(window) {

		var requestAnimationFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.setTimeout;
		var cancelAnimationFrame =
			window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.clearTimeout;

		var MuseScorePlayer=function() {
			
			this.scriptName = "ms_player.js";
			this.script = urlOfScript(this.scriptName)+this.scriptName;
			this.score_name=null;
			this.score_options=null;
			this.score_path="";
			
			this.rafId=null;
			this.info=null;
			this.time_space=null;
			this.loaded = 0;
			this.errors = 0;
			this.errorMessage="";
			this.loadRaf=null;
			this.audioReady = false;

			this.score_audio = new Audio();
			this.audioLoop=false;
			
			this.loop_div=null;
			this.loopMeasureStart=null;
			this.loopMeasureEnd=null;
			this.loopAudioStart=null;
			this.loopAudioEnd=null;
			this.loopIsSet=false;
			this.loopIsReverse=false;
			this.loopStartElement=null;
			this.loopEndElement=null;
			this.audioIsPlaying=false;

			this.ms_player_parent=null;
			this.ms_player_parent_is_body=null;
			this.ms_player=null;
			this.ms_score_div=null;
			this.ms_loader=null;
			this.buttonPlayPause=null;
			this.tempoElement=null;
			this.audioTime=null;
			this.audioPosition=null;
			this.elid = 0;
			this.last_elid = 0;
			this.time_space=null;
			this.space=null;
			this.div_measure=null;
			this.firstScoreImage=null;
			this.firstScoreImageReady=false;
			this.imageNaturalWidth=null;
			this.imageNaturalHeight=null;

			this.tempoScale = 100;

			this.imageScale = 1;
			this.image_skip_backward="images/media-skip-backward.svg";
			this.image_play="images/media-playback-start.svg";
			this.image_pause="images/media-playback-pause.svg";
			this.image_skip_forward="images/media-skip-forward.svg";
			this.image_metronome="images/media-playback-metronome.svg";
			this.image_loop="images/media-playback-loop.svg";
			this.image_close="images/window-close.svg";
			this.stylesheet="css/ms_player.css";
		};

		MuseScorePlayer.prototype.getPosition=function(el) {
			var rect = el.getBoundingClientRect();
			return { top: rect.top , left: rect.left };
		}

		MuseScorePlayer.prototype.setAudioPosition=function(_this) {
			_this.score_audio.currentTime = _this.audioPosition.value / 1000 * _this.score_audio.duration;
			_this.last_elid=_this.elid;
			var m=0;
			for (var i = 0; i < _this.time_space.time.length; i++) {
				if (_this.score_audio.currentTime * 1000 < _this.time_space.time[i].position) break;
				m = i;
			}
			_this.setMeasure(_this, _this.time_space.time[m].elid);
		}

		MuseScorePlayer.prototype.getAudioPosition=function(_this) {
			_this.last_elid=_this.elid;
			var m=0;
			for (var i = 0; i < _this.time_space.time.length; i++) {
				if (_this.score_audio.currentTime * 1000 < _this.time_space.time[i].position) break;
				m = i;
			}
			_this.setMeasure(_this, _this.time_space.time[m].elid);
		}

		MuseScorePlayer.prototype.gotoMeasure=function(_this, m, first) {
			console.log("gotoMeasure "+m+" first "+first);
			var s=0;
			for (var i=0; i<_this.time_space.time.length;i++) {
				if (_this.time_space.time[i].elid===m) {
					s=i;
					console.log("found "+s);
					if (first) break;
				}
			}
			_this.score_audio.currentTime=_this.time_space.time[s].position/1000;
			_this.audioPosition.value=Math.ceil(_this.score_audio.currentTime/_this.score_audio.duration*1000);
			_this.setAudioPosition(_this);
		}
		
		MuseScorePlayer.prototype.isScrolledIntoView=function(_this, elem) {
			var s=window.getComputedStyle(_this.ms_score_div);
			var pw=parseFloat(s.width);						
			var ph=parseFloat(s.height);
			var rect = elem.getBoundingClientRect();
			return (0<rect.left && rect.left+rect.width<pw && 0<rect.top-100 && rect.top+rect.height<ph);
		}
		
		MuseScorePlayer.prototype.getMeasureElement=function(_this, m) {
			for (var p=1; p<=_this.info.pages;p++) {
				var containers=_this.ms_score_div.childNodes;
				for (var c=0;c<containers.length;c++) {
					var elements=containers[c].childNodes;
					for (var e=0;e<elements.length;e++) {
						if (elements[e].getAttribute("id")==="elid_"+m) {
							return elements[e];
						}
					}
				}
			}
			console.log("Score '"+_this.score_name+"' measure "+m+" not found");
			return null;
		}
		
		MuseScorePlayer.prototype.setMeasure=function(_this, m) {
			_this.clearMeasure(_this, _this.last_elid);
			if (_this.last_elid!= _this.elid) _this.clearMeasure(_this, _this.elid);
			_this.elid=m;
			var e=_this.getMeasureElement(_this, m);
			if (e) {				
				e.style.opacity="0.2";
				e.style["background-color"]="red";
				var ps = _this.ms_score_div.getBoundingClientRect();
				var pe = e.getBoundingClientRect();
				if (!_this.isScrolledIntoView(_this, e)) {
					_this.ms_score_div.scrollTo(0,parseInt(e.style.top)-50);
				}
			}
		}

		MuseScorePlayer.prototype.clearMeasure=function(_this, m) {
			var e=_this.getMeasureElement(_this, m);
			if (e) {
				e.style.opacity=0;
				e.style["background-color"]="none";
			}
		}

		MuseScorePlayer.prototype.resize=function(_this) {
			if (_this.loaded < 3) {
				console.log("Loaded " + _this.loaded);
				return;
			}
			var pw, ph;
			if (_this.ms_player_parent_is_body) {
				pw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				ph = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			} else {
				var s=window.getComputedStyle(_this.ms_player_parent);
				pw=parseFloat(s.width);						
				ph=parseFloat(s.height);
			}
			var p = _this.getPosition(_this.ms_player);
			var s = window.getComputedStyle(_this.firstScoreImage);
			var scoreWidth = parseFloat(s.width);
			var imageScale = scoreWidth/_this.firstScoreImage.naturalWidth;
			var offset=80;
			var scaledHeight=Math.ceil(imageScale*_this.firstScoreImage.naturalHeight)+10;
			var computedHeight=Math.ceil(ph - offset);
			var h = scaledHeight<computedHeight?scaledHeight:computedHeight;
					
			_this.ms_score_div.style.cssText="height : "+h+"px";
			_this.setMeasureDivs(_this, false);
			_this.setMeasure(_this, _this.elid);
		}

		MuseScorePlayer.prototype.updateSlider=function(_this) {
			if (_this.loopIsSet) {
				if (_this.audioIsPlaying) {
					if (_this.loopIsReverse) {
						if (_this.score_audio.paused||_this.score_audio.currentTime>=_this.score_audio.duration) {
							_this.score_audio.currentTime=0;
							if (_this.score_audio.paused) _this.score_audio.play();
						}
					} else if (_this.score_audio.currentTime>=_this.loopAudioEnd) {
						_this.score_audio.currentTime=_this.loopAudioStart;
					}
				}
			}
			var c = _this.score_audio.currentTime;
			var d = _this.score_audio.duration;
			_this.audioPosition.value = Math.floor(_this.audioPosition.max * c / d);
			_this.audioTime.innerHTML = _this.getAudioTime();
			_this.getAudioPosition(_this);
			if (!_this.score_audio.paused)
				_this.rafId = requestAnimationFrame(function(timeStamp) {
					_this.updateSlider(_this);
				});
			else if (_this.audioIsPlaying) {
				if (_this.score_audio.paused||_this.score_audio.currentTime>=_this.loopAudioEnd) {
					if (_this.buttonPlayPause.src!=_this.image_play) _this.buttonPlayPause.src=_this.image_play;
				}
			}

		}

		MuseScorePlayer.prototype.changeTempo=function(_this,dir) {
			tempoScale = Number(_this.tempoElement.innerHTML.substr(0, _this.tempoElement.innerHTML.length - 1));
			if (dir === "+") {
				if (tempoScale < 200) tempoScale += 10;
			} else {
				if (tempoScale > 50) tempoScale -= 10;
			}
			_this.tempoElement.innerHTML = tempoScale + "%";
			_this.score_audio.playbackRate = tempoScale / 100;
		}

		MuseScorePlayer.prototype.skip_backward=function(_this) {
			console.log(_this.score_name+" backward 0");
			_this.gotoMeasure(_this, 0, true);
		}

		MuseScorePlayer.prototype.togglePlay=function(_this) {
			if (!_this.score_audio.paused) {
				_this.audioIsPlaying=false;
				_this.score_audio.pause();
				_this.buttonPlayPause.src = _this.image_play;
				if (_this.rafId) cancelAnimationFrame(_this.rafId);
			} else {
				_this.score_audio.play();
				_this.audioIsPlaying=true;
				_this.buttonPlayPause.src = _this.image_pause;
				_this.rafId = requestAnimationFrame(function(timeStamp) {
					_this.updateSlider(_this);
				});
			}
		}

		MuseScorePlayer.prototype.skip_forward=function(_this) {
			console.log(_this.score_name+" forward "+_this.time_space.space[_this.time_space.space.length-1].id);
			_this.gotoMeasure(_this, _this.time_space.space[_this.time_space.space.length-1].id, false);
		}

		MuseScorePlayer.prototype.setOptions=function(_this) {
			if (_this.score_options) {
				if (_this.score_options.tagId) {
					_this.ms_player_parent = document.getElementById(_this.score_options.tagId);
					if (_this.ms_player_parent===null) window.alert("Element with id '"+_this.score_options.tagId+"' not found.");
					if (_this.ms_player_parent.nodeName.toLowerCase()==="body") _this.ms_player_parent_is_body=true;
					else _this.ms_player_parent_is_body=false;
				}
				if (_this.score_options.path) {
					_this.score_path = _this.score_options.path;
					if (!_this.score_path.endsWith("/")) _this.score_path+="/";
					_this.image_skip_backward=_this.score_path+_this.image_skip_backward;
					_this.image_play=_this.score_path+_this.image_play;
					_this.image_pause=_this.score_path+_this.image_pause;
					_this.image_skip_forward=_this.score_path+_this.image_skip_forward;
					_this.image_metronome=_this.score_path+_this.image_metronome;
					_this.image_loop=_this.score_path+_this.image_loop;
					_this.image_close=_this.score_path+_this.image_close;
					_this.stylesheet=_this.score_path+_this.stylesheet;
				}
			}
		}

		MuseScorePlayer.prototype.formatTime=function(t) {
			var s = parseInt(t % 60);
			var m = parseInt((t / 60) % 60);
			if (s < 10) s = "0" + s;
			return m + ":" + s;
		}

		MuseScorePlayer.prototype.toggleShowLoop=function(_this) {
			if (_this.loop_div.style.display==="none") _this.loop_div.style.display="block";
			else _this.loop_div.style.display="none";
		}

		MuseScorePlayer.prototype.setLoop=function(_this) {
			console.log("Setloop '"+_this.loopStartElement.value+"' '"+_this.loopEndElement.value+"'");
			var message="";
			if (isNaN(_this.loopStartElement.value))
				message+=" Start measure '"+_this.loopStartElement.value+"' is not a number";
			else if (_this.loopStartElement.value !== parseInt(_this.loopStartElement.value, 10)+"")
				message+=" Start measure '"+_this.loopStartElement.value+"' is not a whole number";
			else if (_this.loopStartElement.min>Number(_this.loopStartElement.value)||_this.loopStartElement.value>Number(_this.loopStartElement.max))
				message+=" Start measure '"+_this.loopStartElement.value+"' should be in the range ["+_this.loopStartElement.min+"-"+_this.loopStartElement.max+"]";
			if (isNaN(_this.loopEndElement.value))
				message+=" End measure '"+_this.loopEndElement.value+"' is not a number";
			else if (_this.loopEndElement.value !== parseInt(_this.loopEndElement.value, 10)+"")
				message+=" End measure '"+_this.loopEndElement.value+"' is not a whole number";
			else if (_this.loopEndElement.min>Number(_this.loopEndElement.value)||Number(_this.loopEndElement.value)>Number(_this.loopEndElement.max))
				message+=" End measure should be in the range ["+_this.loopEndElement.min+"-"+_this.loopEndElement.max+"]";
			if (message==="") {
				_this.loopMeasureStart=_this.loopStartElement.value-1;
				_this.loopMeasureEnd=_this.loopEndElement.value-1;
				_this.loopAudioEnd=_this.score_audio.duration;
				var firstIsSet=false, lastIsSet=false;
				_this.loopIsReverse=_this.loopMeasureStart>_this.loopMeasureEnd;
				if (_this.loopEndElement.value===_this.loopEndElement.max) {
					_this.loopAudioEnd=_this.score_audio.duration;
					lastIsSet=true;
				}
				for (var i=0;i<_this.time_space.time.length;i++) {
					if (_this.time_space.time[i].elid===_this.loopMeasureStart) {
						_this.loopAudioStart=_this.time_space.time[i].position/1000;
						firstIsSet=true;
						if (_this.loopIsReverse&&lastIsSet) break;
					}
					if (_this.time_space.time[i].elid>_this.loopMeasureEnd) {
						if (_this.loopIsReverse||(firstIsSet&&_this.time_space.time[i].position/1000>_this.loopAudioStart)) {
							_this.loopAudioEnd=_this.time_space.time[i].position/1000;
							lastIsSet=true;
							if (!_this.loopIsReverse&&firstIsSet) break;
						}
					}
				}
				_this.loopIsSet=firstIsSet&&lastIsSet;
				if (_this.loopIsSet) {
					_this.toggleShowLoop(_this);
					_this.gotoMeasure(_this, _this.loopMeasureStart, false);
					console.log("Loop measure ["+_this.loopMeasureStart+"-"+_this.loopMeasureEnd+
				"] audio ["+_this.loopAudioStart+"-"+_this.loopAudioEnd+"]");
				} else {
					window.alert("Loop error, first is set: "+firstIsSet+", last is set: "+lastIsSet+" ["+_this.loopStartElement.value+"-"+_this.loopEndElement.value+"]");
				}
			} else window.alert(message);
		}

		MuseScorePlayer.prototype.clearLoop=function(_this) {
			_this.loopIsSet=false;
			_this.toggleShowLoop(_this);
		}

		MuseScorePlayer.prototype.getAudioTime=function() {
			var _this=this;
			return _this.formatTime(_this.score_audio.currentTime) + " / " + _this.formatTime(_this.score_audio.duration);
		}

		MuseScorePlayer.prototype.addButton=function(_this, controls, div_class, title, button_class, on_click, image_source, image_id, innerHTML, parm) {
			var button = document.createElement("button");
			if (title!=="") button.title = title;
			if (button_class!=="") button.classList.add(button_class);
			if (on_click!=="undefined") {
				if (parm!=="") {
					button.addEventListener('click', function(event) { on_click(_this,parm);});
				} else {
					button.addEventListener('click', function(event) { on_click(_this);});
				}
			}
			if (image_source!=="") {
				var img = document.createElement("img");
				img.src = image_source;
				button.appendChild(img);
				if (image_id!=="") img.id = image_id;
			}
			if (innerHTML!=="") button.innerHTML = innerHTML;
			var div = document.createElement("div");
			if (div_class!=="") div.classList.add(div_class);
			div.appendChild(button);
			controls.appendChild(div);
			return img;
		}

		MuseScorePlayer.prototype.createPlayer=function(_this) {
			var _this=this
			var controls, div, span, hr, br, label;

			controls = document.createElement("div");
			controls.classList.add("ms_controls_div");
			_this.addButton(_this, controls, "ms_controls", "Skip backward", "ms_control_button", _this.skip_backward, _this.image_skip_backward, "", "", "");
			_this.buttonPlayPause = _this.addButton(_this, controls, "ms_controls", "Play", "ms_control_button", _this.togglePlay, _this.image_play, "togglePlay", "");
			_this.addButton(_this, controls, "ms_controls", "Skip forward", "ms_control_button", _this.skip_forward, _this.image_skip_forward, "", "", "");
			
			_this.addButton(_this, controls, "ms_controls", "Loop", "ms_control_button", _this.toggleShowLoop, _this.image_loop, "", "", "");
			
			_this.loop_div = document.createElement("div");
			_this.loop_div.id="loop";
			_this.loop_div.classList.add("ms_loop");
			_this.loop_div.style.cssText="display: none";
			
			_this.addButton(_this, _this.loop_div, "", "", "ms_loop_button", _this.toggleShowLoop, _this.image_close, "", "", "");
			
			span=document.createElement("div");
			span.innerHTML="Loop";
			_this.loop_div.appendChild(span);
			
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			
			label=document.createElement("label");
			label.for="loop-start";
			label.innerHTML="Start measure";
			_this.loop_div.appendChild(label);
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			_this.loopStartElement=document.createElement("input");
			_this.loopStartElement.type="number";
			_this.loopStartElement.min=1;
			_this.loopStartElement.max=_this.info.measures;
			_this.loopStartElement.value=1;
			_this.loopStartElement.name="loop-start";
			_this.loopStartElement.id="loop-start";
			_this.loopStartElement.style.cssText="align: right;";
			_this.loop_div.appendChild(_this.loopStartElement);
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			
			label=document.createElement("label");
			label.for="loop-end";
			label.innerHTML="End measure";
			_this.loop_div.appendChild(label);
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			_this.loopEndElement=document.createElement("input");
			_this.loopEndElement.type="number";
			_this.loopEndElement.min=1;
			_this.loopEndElement.max=_this.info.measures;
			_this.loopEndElement.value=_this.info.measures;			
			_this.loopEndElement.name="loop-end";
			_this.loopEndElement.id="loop-end";
			_this.loopEndElement.style.cssText="align: right;";
			_this.loop_div.appendChild(_this.loopEndElement);
			br=document.createElement("br");
			_this.loop_div.appendChild(br);
			
			_this.addButton(_this, _this.loop_div, "ms_loop_set", "", "ms_loop_block", _this.setLoop, "", "", "Set", "");
			_this.addButton(_this, _this.loop_div, "ms_loop_set", "", "ms_loop_block", _this.clearLoop, "", "", "Remove", "");
			controls.appendChild(_this.loop_div);
			
			_this.audioTime=document.createElement("div");
			_this.audioTime.id = "time";
			_this.audioTime.innerHTML = _this.getAudioTime();
			_this.audioTime.classList.add("ms_controls_time");
			controls.appendChild(_this.audioTime);
			
			_this.addButton(_this, controls, "ms_controls", "Metronome", "ms_metronome", "", _this.image_metronome, "", "", "");
			_this.addButton(_this, controls, "ms_controls", "", "ms_tempo", _this.changeTempo, "", "", "-", "-");

			_this.tempoElement = document.createElement("span");
			_this.tempoElement.classList.add("tempo");
			_this.tempoElement.innerHTML = "100%";
			div = document.createElement("div");
			div.classList.add("ms_controls");
			div.appendChild(_this.tempoElement);
			controls.appendChild(div);

			_this.addButton(_this, controls, "ms_controls", "", "ms_tempo", _this.changeTempo, "", "", "+", "+");

			br=document.createElement("br");
			controls.appendChild(br);

			_this.audioPosition = document.createElement("input");
			_this.audioPosition.classList.add("ms_audioPosition");
			_this.audioPosition.type = "range";
			_this.audioPosition.min = 0;
			_this.audioPosition.max = 1000;
			_this.audioPosition.value = 0;
			_this.audioPosition.addEventListener("change", function(event) { _this.setAudioPosition(_this);});
			controls.appendChild(_this.audioPosition);
			_this.ms_player.appendChild(controls);
			_this.ms_player.appendChild(br);

			_this.ms_score_div = document.createElement("div");
			_this.ms_score_div.classList.add("ms_score_div");
			_this.ms_player.appendChild(_this.ms_score_div);
			
			window.addEventListener("resize", function() {
				_this.resize(_this);
			});

			document.addEventListener("keydown" , function(e) {
				if ((e || window.event).code === "Escape") {
				_this.togglePlay(_this);
				}
			});
		}
		
		MuseScorePlayer.prototype.getContainer=function(_this, c) {
			var elements=_this.ms_score_div.childNodes;
			for (var e=0;e<elements.length;e++) {
				if (elements[e].getAttribute("id")==="container_"+c) {
					return elements[e];
				}
			}
			console.log("Score '"+_this.score_name+"' container "+c+" not found");
			return null;
		}
		
		MuseScorePlayer.prototype.getImage=function(_this, n) {
			var elements=_this.ms_score_div.childNodes;
			for (var e=0;e<elements.length;e++) {
				if (elements[e].getAttribute("id")!==null&&elements[e].getAttribute("id").substr(0,10)=="container_") {
					var items=elements[e].childNodes;
					for (var i=0;i<items.length;i++) {
						if (items[i].getAttribute("id")==="img_"+n) {
							return items[i];
						}
					}
				}
			}
			console.log("Score '"+_this.score_name+"' image "+n+" not found");
			return null;
		}

		MuseScorePlayer.prototype.setMeasureDivs=function (_this, create) {
			if (create) {
				if (_this.firstScoreImage===null) {
					_this.loadRaf = requestAnimationFrame(function(timeStamp) {
						_this.setMeasureDivs(_this, create);
					});
					return;
				} else {
					if (_this.loadRaf) cancelAnimationFrame(_this.loadRaf);
				}
			}
			var s = window.getComputedStyle(_this.firstScoreImage);
			var scoreWidth = parseFloat(s.width);
			imageScale = scoreWidth/_this.firstScoreImage.naturalWidth;
			for (var i=0;i<_this.time_space.space.length;i++) {
				var space = _this.time_space.space[i];
				var container=_this.getContainer(_this, space.page);
				var img=_this.getImage(_this, space.page);
				var pc=_this.getPosition(container);
				var ps=_this.getPosition(_this.ms_score_div);
				var pi=_this.getPosition(img);
				var offset=pi.top-ps.top;
				var div=null;
				var f = 12;
				var w = Math.floor(space.sx*imageScale/f);
				var h = Math.floor(space.sy*imageScale/f);
				var x = Math.floor(space.x*imageScale/f);
				var y = Math.floor(offset+space.y*imageScale/f);
				if (create) {
					div=document.createElement("div");
					div.id="elid_"+i;
					div.classList.add("ms_elid");
					div.addEventListener('click',function(e) {
						var m=Number(e.target.id.substring(5));
						_this.gotoMeasure(_this, m, true);
					});
					container.appendChild(div);
				} else {
					var children = container.childNodes;
					for(var c = 0; c< children.length;c++) {
						if (children[c].getAttribute("id") === "elid_"+i) {
							div=children[c];
							break;
						}
					}
				}
				if (div) {
					var z=i+2;
					div.style.cssText = "z-index: "+z+"; position: absolute; ; left: " + x + "px ; top: " + y + "px ; width: " + w + "px ; height: " + h + "px ;";
				}
			}
		}
					
		MuseScorePlayer.prototype.init=function (_this) {
			_this.ms_player_parent = document.getElementsByTagName('body')[0];
			_this.ms_player_parent_is_body=true;
			_this.setOptions(_this);

			var link=document.getElementById("ms_player_style");
			if (link===null) {
				link=document.createElement("link");
				link.rel="stylesheet";
				link.type="text/css";
				link.id="ms_player_style";
				link.href=_this.stylesheet;
				document.getElementsByTagName("head")[0].appendChild(link);
			}
			
			_this.ms_player = document.createElement("div");
			_this.ms_player.classList.add("ms_player");
			_this.ms_player_parent.appendChild(_this.ms_player);
			_this.ms_loader = document.createElement("div");
			_this.ms_loader.classList.add("ms_loader");
			_this.ms_player.appendChild(_this.ms_loader);
		}
		
		MuseScorePlayer.prototype.isLoaded=function (_this) {
			if (_this.errors) {
				_this.ms_player.removeChild(_this.ms_loader);
				if (_this.errorMessage!="") _this.ms_player.innerHTML=_this.errorMessage;
				else _this.ms_player.innerHTML="MuseScorePlayer: An error occured loading score '"+_this.score_name+"'";
				return;
			}

			if (!_this.audioReady) {
				if (_this.score_audio.readyState >= 1 && _this.score_audio.duration !== Infinity) {
					_this.audioReady = true;
					_this.loaded++;
				}
			}
			switch (_this.loaded) {
				case 0:
				case 1:
				case 2:
					_this.loadRaf = requestAnimationFrame(function(timeStamp) {
						_this.isLoaded(_this);
					});
					return;
				case 3:
					_this.ms_loader.remove();
					_this.createPlayer(_this);
					var p = _this.info.pages;
					var s = window.getComputedStyle(_this.ms_score_div);
					var scoreWidth = parseFloat(s.width);
					for (var i = 1; i <= p; i++) {
						var div=document.createElement("div");
						div.id="container_"+i;
						div.classList.add("ms_container");
						var img = document.createElement("img");
						img.src = _this.score_path+_this.score_name + "-" + i + ".png";
						img.id = "img_" + i;
						img.classList.add("ms_score");
						div.appendChild(img);
						_this.ms_score_div.appendChild(div);
						if (p>1) { //(i < p) {
							var hr = document.createElement("hr");
							_this.ms_score_div.appendChild(hr);
						}
						if (i===1) _this.firstScoreImage=img;
					}
					_this.loaded++;
					_this.loadRaf = requestAnimationFrame(function(timeStamp) {
						_this.isLoaded(_this);
					});
					return;
				case 4:
					if (!isNaN(_this.firstScoreImage.naturalWidth) && _this.firstScoreImage.naturalWidth>0) {		
						_this.setMeasureDivs(_this, true);
						_this.setMeasure(_this, 0);
						_this.resize(_this);
						console.log("Ready to play '"+_this.score_name+"'");
						return;
					}
					_this.loadRaf = requestAnimationFrame(function(timeStamp) {
						_this.isLoaded(_this);
					});
					return;
			}
		}

		MuseScorePlayer.prototype.loadJSONError=function (e) {
			_this.errors++;
			_this.errorMessage="Error loading JSON file";
			window.console.log(_this.errorMessage);
		}

		MuseScorePlayer.prototype.loadJSON=function (_this, url, callback) {
			var req = new XMLHttpRequest();
			req.addEventListener("error", _this.LoadJSONError);
			req.addEventListener("abort", _this.LoadJSONError);
			req.overrideMimeType("application/json");
			req.open('GET', url, true);
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
							_this.errors++;
							_this.errorMessage = "url " + url + " status " + status + " : " + req.statusText;
							break;
					}
				}
			};
			req.send(null);
		}

		MuseScorePlayer.prototype.onAudioError = function(_this, e) {
			if (!e.target.error.code===undefined) switch (e.target.error.code) {
     			case e.target.error.code.MEDIA_ERR_ABORTED:
       				_this.errorMessage="Aborted the audio playback.";
       				break;
     			case e.target.error.code.MEDIA_ERR_NETWORK:
       				_this.errorMessage="A network error caused the audio download to fail.";
       				break;
     			case e.target.error.code.MEDIA_ERR_DECODE:
       				_this.errorMessage="The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.";
       				break;
     			case e.target.error.code.MEDIA_ERR_SRC_NOT_SUPPORTED:
       				_this.errorMessage="The audio could not be loaded, either because the server or network failed or because the format is not supported.";
       				break;
     			default:
       				_this.errorMessage="An unknown error occurred with the audio.";
       				break;
   			} else {
       				_this.errorMessage="An unknown error occurred with the audio.";
   			}
			_this.errors++;
			console.log("Error audio: "+_this.errorMessage);
		}
		
		MuseScorePlayer.prototype.load=function(name, options) {
			var _this=new MuseScorePlayer();
			if (name==="undefined"||name==="") {
				_this.init(_this);
				_this.ms_player.innerHTML=_this.scriptName+": Score name not defined/specified";
				return;
			}
			_this.score_name = name;
			_this.score_options = options;
			_this.init(_this);
			console.log("Load '"+_this.score_path+name+"'");

			var source_ogg=document.createElement("source");
			source_ogg.src=_this.score_path+name+".mp3";
			source_ogg.type="audio/mpeg";
			_this.score_audio.appendChild(source_ogg);

			source_ogg.addEventListener("error", function(e) {				
				_this.errors++;
				_this.errorMessage="Audio source error: "+this.src+" "+JSON.stringify(e.currentTarget);
			});

			var source_mp3=document.createElement("source");
			source_mp3.src=_this.score_path+name+".mp3";
			source_mp3.type="audio/mpeg";
			_this.score_audio.appendChild(source_mp3);

			source_mp3.addEventListener("error", function(e) {				
				_this.errors++;
				_this.errorMessage="Audio source error: "+this.src+" "+JSON.stringify(e.currentTarget);
			});
			
			_this.score_audio.addEventListener("error", function(e) {				
				_this.errors++;
				_this.errorMessage="Audio error: "+this.src+" "+JSON.stringify(e.currentTarget);
			});


			_this.loadRaf = requestAnimationFrame(function(timeStamp) {
				_this.isLoaded(_this);
			});

			_this.loadJSON(_this, _this.score_path+name + ".metajson", function(response) {
				try {
					_this.info=JSON.parse(response);
					_this.loopMeasureStart=0;
					_this.loopMeasureEnd=_this.info.measures;
					_this.loaded++;
				} catch (error) {
					_this.errors++;
					_this.errorMessage="Error loading "+_this.score_path+name + ".metajson";
					if (window.location.protocol == "file:") {
						_this.errorMessage	+=" Your browser might not allow local files."+
							"Place your files on a webserver or disable local file restrictions (not advisable).";
					}
				}
			});

			_this.loadJSON(_this, _this.score_path+name + "_space.json", function(response) {
				try {
					_this.time_space=JSON.parse(response);
					_this.loaded++;
				} catch (error) {
					_this.errors++;
					_this.errorMessage="Error loading "+_this.score_path+name + "_space.json";					
					if (window.location.protocol == "file:") {
						_this.errorMessage	+=" Your browser might not allow local files."+
							" Please place your files on a webserver or disable local file restrictions (not advisable).";
					}
				}
			});
		}

		window.ms_player = new MuseScorePlayer();
	})(window);
}