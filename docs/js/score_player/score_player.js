class ScorePlayer {

	constructor() {

		const requestAnimationFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.setTimeout;
		const cancelAnimationFrame =
			window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.clearTimeout;

		this.scriptName = 'score_player.js';
		this.script = this.urlOfScript(this.scriptName)+this.scriptName;
		this.script_path = this.script.match(/(.*)[\/\\]/)[1]||'';
		this.script_parent_path = this.script_path.match(/(.*)[\/\\]/)[0]||'..' ;
		var a = this.script_parent_path.split('/');
		a.pop(); a.pop();
		this.script_grand_parent_path = a.join('/');

		console.log("script_path: '" + this.script_path + "'");
		console.log("script_parent_path: '" + this.script_parent_path + "'");
		console.log("script_grand_parent_path: '" + this.script_grand_parent_path + "'");

		this.image_path = this.script_grand_parent_path+'/images/score_player/';
		this.imageScale = 1;
		this.image_skip_backward=this.image_path+'media-skip-backward.svg';
		this.image_play=this.image_path+'media-playback-start.svg';
		this.image_pause=this.image_path+'media-playback-pause.svg';
		this.image_skip_forward=this.image_path+'media-skip-forward.svg';
		this.image_metronome=this.image_path+'media-playback-metronome.svg';
		this.image_loop=this.image_path+'media-playback-loop.svg';
		this.image_close=this.image_path+'window-close.svg';

		this.css_path = this.script_grand_parent_path+'/css/score_player/';
		this.stylesheetName = 'score_player.css';
		this.stylesheet = this.css_path+this.stylesheetName;
		console.log("stylesheet: '" + this.stylesheet + "'");

		this.score_name=null;
		this.score_options=null;
		this.score_path='';

		this.rafId=null;
		this.time_space=null;
		this.loaded = 0;
		this.errors = 0;
		this.errorMessage='';
		this.loadRaf=null;
		this.audioReady = false;

		this.score_audio = new Audio();
		this.audioLoop=false;

		this.score_pages=null;
		this.score_measures=null;
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

		this.score_player_element=null;
		this.score_player_parent=null;
		this.score_player_parent_is_body=null;
		this.score_div=null;
		this.score_loader=null;
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
		this.playerCreated=false;
		this.imagesComplete=false;

		this.tempoScale = 100;
	}

	urlOfScript(jsfile) {
		let scriptElements = document.getElementsByTagName('script');
		let i, element, myfile, myurl;
		for (let i=0; element=scriptElements[i]; i++) {
			myfile=element.src;
			if (myfile.indexOf(jsfile)>= 0) {
				myurl=myfile.substring(0, myfile.indexOf(jsfile));
			}
		}
		return myurl;
	}

	getPosition(el) {
		let rect = el.getBoundingClientRect();
		return { top: rect.top , left: rect.left };
	}

	setAudioPosition(_this) {
		_this.score_audio.currentTime = _this.audioPosition.value / 1000 * _this.score_audio.duration;
		_this.last_elid=_this.elid;
		let m=0;
		for (let i = 0; i < _this.time_space.time.length; i++) {
			if (_this.score_audio.currentTime * 1000 < _this.time_space.time[i].position) break;
			m = i;
		}
		_this.setMeasure(_this, _this.time_space.time[m].elid);
	}

	getAudioPosition(_this) {
		_this.last_elid=_this.elid;
		let m=0;
		for (let i = 0; i < _this.time_space.time.length; i++) {
			if (_this.score_audio.currentTime * 1000 < _this.time_space.time[i].position) break;
			m = i;
		}
		_this.setMeasure(_this, _this.time_space.time[m].elid);
	}

	gotoMeasure(_this, m, first) {
		let s=0;
		for (let i=0; i<_this.time_space.time.length;i++) {
			if (_this.time_space.time[i].elid===m) {
				s=i;
				if (first) break;
			}
		}
		_this.score_audio.currentTime=_this.time_space.time[s].position/1000;
		_this.audioPosition.value=Math.ceil(_this.score_audio.currentTime/_this.score_audio.duration*1000);
		_this.setAudioPosition(_this);
	}

	isScrolledIntoView(_this, elem) {
		let s=window.getComputedStyle(_this.score_div);
		let pw=parseFloat(s.width);
		let ph=parseFloat(s.height);
		let srect = _this.score_div.getBoundingClientRect();
		let rect = elem.getBoundingClientRect();
		return (0<rect.left-srect.left && rect.left+rect.width-srect.left<pw && 0<rect.top-srect.top-100 && rect.top+rect.height-srect.top<ph);
	}

	getMeasureElement(_this, m) {
		for (let p=1; p<=_this.score_pages;p++) {
			let score_containers=_this.score_div.childNodes;
			for (let c=0;c<score_containers.length;c++) {
				let elements=score_containers[c].childNodes;
				for (let e=0;e<elements.length;e++) {
					if (elements[e].getAttribute('id')==='score_elid_'+m) {
						return elements[e];
					}
				}
			}
		}
		console.log("Score '"+_this.score_name+"' measure "+m+" not found");
		return null;
	}

	setMeasure(_this, m) {
		_this.clearMeasure(_this, _this.last_elid);
		if (_this.last_elid!= _this.elid) _this.clearMeasure(_this, _this.elid);
		_this.elid=m;
		let e=_this.getMeasureElement(_this, m);
		if (e) {
			e.style.opacity='0.2';
			e.style.background='blue';
			let ps = _this.score_div.getBoundingClientRect();
			let pe = e.getBoundingClientRect();
			if (!_this.isScrolledIntoView(_this, e)) {
				_this.score_div.scrollTo(0,parseInt(e.style.top)-50);
			}
		}
	}

	clearMeasure(_this, m) {
		let e=_this.getMeasureElement(_this, m);
		if (e) {
			e.style.opacity=0;
			if (e.style.background)
			e.style.background='none';
		}
	}

	resize(_this) {
		let pw, ph, offset=0;
		if (_this.score_player_parent_is_body) {
			pw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			ph = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		} else {
			let s=window.getComputedStyle(_this.score_player_element);
			pw=parseFloat(s.width);
			ph=parseFloat(s.height);
			offset=_this.getPosition(_this.score_player_element).top;
			if (ph<window.innerHeight-offset) {
				ph=window.innerHeight-offset;
				console.log("ph "+ph+" offset "+offset);
			} else console.log("--> ph "+ph+" offset "+offset);
		}
		let p = _this.getPosition(_this.score_player_element);
		let s = window.getComputedStyle(_this.firstScoreImage);
		let scoreWidth = parseFloat(s.width);
		let imageScale = scoreWidth/_this.firstScoreImage.naturalWidth;
		let scaledHeight=Math.ceil(imageScale*_this.firstScoreImage.naturalHeight)+10;
		let computedHeight=Math.ceil(ph - offset);
		let h = scaledHeight<computedHeight?scaledHeight:computedHeight;
		_this.score_div.style.height=h+'px';
		_this.score_div.style['overflow-y'] = 'scroll';
		_this.setMeasureDivs(_this, false);
	}

	updateSlider(_this) {
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
		let c = _this.score_audio.currentTime;
		let d = _this.score_audio.duration;
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

	changeTempo(_this,dir) {
		_this.tempoScale = Number(_this.tempoElement.innerHTML.substr(0, _this.tempoElement.innerHTML.length - 1));
		if (dir === '+') {
			if (_this.tempoScale < 200) _this.tempoScale += 10;
		} else {
			if (_this.tempoScale > 50) _this.tempoScale -= 10;
		}
		_this.tempoElement.innerHTML = _this.tempoScale + '%';
		_this.score_audio.playbackRate = _this.tempoScale / 100;
	}

	skip_backward(_this) {
		console.log(_this.score_name+' backward 0');
		_this.gotoMeasure(_this, 0, true);
	}

	togglePlay(_this) {
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

	skip_forward(_this) {
		console.log(_this.score_name+' forward '+_this.time_space.space[_this.time_space.space.length-1].id);
		_this.gotoMeasure(_this, _this.time_space.space[_this.time_space.space.length-1].id, false);
	}

	setOptions(_this) {
		if (_this.score_options) {
			if (_this.score_options.tagId) {
				_this.score_player_parent = document.getElementById(_this.score_options.tagId);
				if (_this.score_player_parent===null) window.alert("Element with id '"+_this.score_options.tagId+"' not found.");
				else console.log('Using element with id '+_this.score_options.tagId);
				if (_this.score_player_parent.nodeName.toLowerCase()==='body') _this.score_player_parent_is_body=true;
				else _this.score_player_parent_is_body=false;
			}
			if (_this.score_options.score_path) {
				_this.score_path = _this.score_options.score_path;
				if (!_this.score_path.endsWith('/')) _this.score_path+='/';
			}
		}
	}

	formatTime(t) {
		let s = parseInt(t % 60);
		let m = parseInt((t / 60) % 60);
		if (s < 10) s = '0' + s;
		return m + ':' + s;
	}

	toggleShowLoop(_this) {
		if (_this.loop_div.style.display==='none') _this.loop_div.style.display='block';
		else _this.loop_div.style.display='none';
	}

	setLoop(_this) {
		console.log("Setloop '"+_this.loopStartElement.value+"' '"+_this.loopEndElement.value+"'");
		let message="";
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
		if (message==='') {
			_this.loopMeasureStart=_this.loopStartElement.value-1;
			_this.loopMeasureEnd=_this.loopEndElement.value-1;
			_this.loopAudioEnd=_this.score_audio.duration;
			let firstIsSet=false, lastIsSet=false;
			_this.loopIsReverse=_this.loopMeasureStart>_this.loopMeasureEnd;
			if (_this.loopEndElement.value===_this.loopEndElement.max) {
				_this.loopAudioEnd=_this.score_audio.duration;
				lastIsSet=true;
			}
			for (let i=0;i<_this.time_space.time.length;i++) {
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
				console.log('Loop measure ['+_this.loopMeasureStart+'-'+_this.loopMeasureEnd+
			'] audio ['+_this.loopAudioStart+'-'+_this.loopAudioEnd+']');
			} else {
				window.alert('Loop error, first is set: '+firstIsSet+', last is set: '+lastIsSet+' ['+_this.loopStartElement.value+'-'+_this.loopEndElement.value+']');
			}
		} else window.alert(message);
	}

	clearLoop(_this) {
		_this.loopIsSet=false;
		_this.toggleShowLoop(_this);
	}

	getAudioTime() {
		let _this=this;
		console.log('time: '+_this.score_audio.currentTime+' '+_this.score_audio.duration);
		return _this.formatTime(_this.score_audio.currentTime) + ' / ' + _this.formatTime(_this.score_audio.duration);
	}

	addButton(_this, controls, div_class, title, button_class, on_click, image_source, image_id, innerHTML, parm) {
		let button = document.createElement('button');
		let img;
		if (title!=='') button.title = title;
		if (button_class!=='') button.classList.add(button_class);
		if (on_click!=='undefined') {
			if (parm!=='') {
				button.addEventListener('click', function(event) { on_click(_this,parm);});
			} else {
				button.addEventListener('click', function(event) { on_click(_this);});
			}
		}
		if (image_source!=='') {
			img = document.createElement('img');
			img.src = image_source;
			button.appendChild(img);
			if (image_id!=='') img.id = image_id;
		}
		if (innerHTML!=='') button.innerHTML = innerHTML;
		let div = document.createElement('div');
		if (div_class!=='') div.classList.add(div_class);
		div.appendChild(button);
		controls.appendChild(div);
		return img;
	}

	createPlayer(_this) {
		let controls, div, span, hr, br, label;

		controls = document.createElement('div');
		controls.classList.add('score_controls_div');
		_this.addButton(_this, controls, 'score_control', 'Skip backward', 'score_control_button', _this.skip_backward, _this.image_skip_backward, '', '', '');
		_this.buttonPlayPause = _this.addButton(_this, controls, 'score_control', 'Play', 'score_control_button', _this.togglePlay, _this.image_play, 'togglePlay', '');
		_this.addButton(_this, controls, 'score_control', 'Skip forward', 'score_control_button', _this.skip_forward, _this.image_skip_forward, '', '', '');

		_this.addButton(_this, controls, 'score_control', 'Loop', 'score_control_button', _this.toggleShowLoop, _this.image_loop, '', '', '');

		_this.loop_div = document.createElement('div');
		_this.loop_div.id='loop';
		_this.loop_div.classList.add('score_loop');
		_this.loop_div.style.display= 'none';

		_this.addButton(_this, _this.loop_div, '', '', 'score_loop_button', _this.toggleShowLoop, _this.image_close, '', '', '');

		span=document.createElement('div');
		span.innerHTML='Loop';
		_this.loop_div.appendChild(span);

		br=document.createElement('br');
		_this.loop_div.appendChild(br);
		br=document.createElement('br');
		_this.loop_div.appendChild(br);

		label=document.createElement('label');
		label.for='loop-start';
		label.innerHTML='Start measure';
		_this.loop_div.appendChild(label);
		br=document.createElement('br');
		_this.loop_div.appendChild(br);
		_this.loopStartElement=document.createElement('input');
		_this.loopStartElement.type='number';
		_this.loopStartElement.min=1;
		_this.loopStartElement.max=_this.score_measures;
		_this.loopStartElement.value=1;
		_this.loopStartElement.name='loop-start';
		_this.loopStartElement.id='loop-start';
		_this.loopStartElement.style['text-align'] = 'right';
		_this.loop_div.appendChild(_this.loopStartElement);
		br=document.createElement('br');
		_this.loop_div.appendChild(br);

		label=document.createElement('label');
		label.for='loop-end';
		label.innerHTML='End measure';
		_this.loop_div.appendChild(label);
		br=document.createElement('br');
		_this.loop_div.appendChild(br);
		_this.loopEndElement=document.createElement('input');
		_this.loopEndElement.type='number';
		_this.loopEndElement.min=1;
		_this.loopEndElement.max=_this.score_measures;
		_this.loopEndElement.value=_this.score_measures;
		_this.loopEndElement.name='loop-end';
		_this.loopEndElement.id='loop-end';
		_this.loopEndElement.style['text-align'] = 'right';
		_this.loop_div.appendChild(_this.loopEndElement);
		br=document.createElement('br');
		_this.loop_div.appendChild(br);

		_this.addButton(_this, _this.loop_div, 'score_loop_set', '', 'score_loop_block', _this.setLoop, '', '', 'Set', '');
		_this.addButton(_this, _this.loop_div, 'score_loop_set', '', 'score_loop_block', _this.clearLoop, '', '', 'Remove', '');
		controls.appendChild(_this.loop_div);

		_this.audioTime=document.createElement('div');
		_this.audioTime.id = 'time';
		_this.audioTime.innerHTML = _this.getAudioTime();
		_this.audioTime.classList.add('score_control_time');
		controls.appendChild(_this.audioTime);

		_this.addButton(_this, controls, 'score_control', 'Metronome', 'score_metronome', '', _this.image_metronome, '', '', '');
		_this.addButton(_this, controls, 'score_control', '', 'score_tempo', _this.changeTempo, '', '', '-', '-');

		_this.tempoElement = document.createElement('span');
		_this.tempoElement.classList.add('tempo');
		_this.tempoElement.innerHTML = '100%';
		div = document.createElement('div');
		div.classList.add('score_control');
		div.appendChild(_this.tempoElement);
		controls.appendChild(div);

		_this.addButton(_this, controls, 'score_control', '', 'score_tempo', _this.changeTempo, '', '', '+', '+');

		br=document.createElement('br');
		controls.appendChild(br);

		_this.audioPosition = document.createElement('input');
		_this.audioPosition.classList.add('score_audioPosition');
		_this.audioPosition.type = 'range';
		_this.audioPosition.min = 0;
		_this.audioPosition.max = 1000;
		_this.audioPosition.value = 0;
		_this.audioPosition.addEventListener('change', function(event) { _this.setAudioPosition(_this);});
		controls.appendChild(_this.audioPosition);
		_this.score_player_element.appendChild(controls);
		_this.score_player_element.appendChild(br);

		_this.score_div = document.createElement('div');
		_this.score_div.classList.add('score_div');
		_this.score_player_element.appendChild(_this.score_div);

		window.addEventListener('resize', function() {
			_this.resize(_this);
		});

		document.addEventListener('keydown' , function(e) {
			if ((e || window.event).code === 'Escape') {
			if (!e.repeat) _this.togglePlay(_this);
			}
		});
	}

	getScoreContainer(_this, c) {
		let elements=_this.score_div.childNodes;
		for (let e=0;e<elements.length;e++) {
			if (elements[e].getAttribute('id')==='score_container_'+c) {
				return elements[e];
			}
		}
		console.log("Score '"+_this.score_name+"' score_container "+c+" not found");
		return null;
	}

	getScoreImage(_this, n) {
		let elements=_this.score_div.childNodes;
		for (let e=0;e<elements.length;e++) {
			if (elements[e].getAttribute('id')!==null&&elements[e].getAttribute('id').substr(0,16)=='score_container_') {
				let items=elements[e].childNodes;
				for (let i=0;i<items.length;i++) {
					if (items[i].getAttribute('id')==='score_image_'+n) {
						return items[i];
					}
				}
			}
		}
		console.log("Score '"+_this.score_name+"' image "+n+" not found");
		return null;
	}

	setMeasureDivs(_this, create) {
		if (create) {
			if (_this.firstScoreImage===null) {
				_this.loadRaf = requestAnimationFrame(function(timeStamp) {
					_this.setMeasureDivs(_this, create);
				});
				return;
			} else {
				if (_this.loadRaf) cancelAnimationFrame(_this.loadRaf);
			}
		} else _this.score_div.scrollTo(0,0);
		let s = window.getComputedStyle(_this.firstScoreImage);
		let scoreWidth = parseFloat(s.width);
		_this.imageScale = scoreWidth/_this.firstScoreImage.naturalWidth;
		for (let i=0;i<_this.time_space.space.length;i++) {
			let space = _this.time_space.space[i];
			let score_container=_this.getScoreContainer(_this, space.page);
			let img=_this.getScoreImage(_this, space.page);
			let pc=_this.getPosition(score_container);
			let ps=_this.getPosition(_this.score_div);
			let pi=_this.getPosition(img);
			let offset=pi.top-ps.top;
			let div=null;
			let f = 12;
			let w = Math.floor(space.sx*_this.imageScale/f);
			let h = Math.floor(space.sy*_this.imageScale/f);
			let x = Math.floor(space.x*_this.imageScale/f);
			let y = Math.floor(offset+space.y*_this.imageScale/f);
			if (create) {
				div=document.createElement('div');
				div.id='score_elid_'+i;
				div.classList.add('score_elid');
				div.addEventListener('click',function(e) {
					let m=Number(e.target.id.substring(11));
					_this.gotoMeasure(_this, m, true);
				});
				score_container.appendChild(div);
			} else {
				let children = score_container.childNodes;
				for(let c = 0; c< children.length;c++) {
					if (children[c].getAttribute('id') === 'score_elid_'+i) {
						div=children[c];
						break;
					}
				}
			}
			if (div) {
				let z=i+2;
				div.style['z-index'] = z;
				div.style.position = 'absolute';
				div.style.left = x + 'px'; 
				div.style.top = y + 'px'; 
				div.style.width = w + 'px'; 
				div.style.height = h + 'px';
			}
		}
	}

	init(_this) {
		_this.score_player_parent = document.getElementsByTagName('body')[0];
		_this.score_player_parent_is_body=true;
		_this.setOptions(_this);

		let list = document.getElementsByTagName('link');
		let link = null;
		for (let elem of list) {
			if (elem.href.endsWith(this.stylesheetName)) {
				link = elem;
				break;
			}
		}
		//let link=document.getElementById('score_player_style');
		if (link===null) {
			link=document.createElement('link');
			link.rel='stylesheet';
			//link.type='text/css';
			//link.id='score_player_style';
			link.href=_this.stylesheet;
			document.getElementsByTagName('head')[0].appendChild(link);
		}

		if (_this.score_player_element === null) {
			_this.score_player_element = document.createElement('div');
		} else console.log('using score_player_element with tag '+_this.score_player_element.id);
		_this.score_player_element.classList.add('score_player');
		_this.score_player_parent.appendChild(_this.score_player_element);
		_this.score_loader = document.createElement('div');
		_this.score_loader.classList.add('score_loader');
		_this.score_player_element.appendChild(_this.score_loader);
	}

	loadState(_this) {
		console.log('errors '+_this.errors+' loaded '+_this.loaded+' pages '+_this.score_pages+' audio '+_this.audioReady);
	}

	isLoaded(_this) {
		//_this.loadState(_this);
		if (_this.errors) {
			_this.score_player_element.removeChild(_this.score_loader);
			if (_this.errorMessage!='') _this.score_player_element.innerHTML=_this.errorMessage;
			else _this.score_player_element.innerHTML="MuseScorePlayer: An error occured loading score '"+_this.score_name+"'";
			return;
		}

		if (!_this.playerCreated && _this.loadJSONready) {
			_this.score_loader.remove();
			_this.createPlayer(_this);
			let p = _this.score_pages;
			let s = window.getComputedStyle(_this.score_div);
			let scoreWidth = parseFloat(s.width);
			let digits = String(p).length;
			for (let i=1; i<=p; i++) {
				let div=document.createElement('div');
				div.id='score_container_'+i;
				div.classList.add('score_container');
				let img = document.createElement('img');
				let num = i.toString();
				while (num.length < digits) num = "0" + num;
				img.src = _this.score_path+_this.score_name + '-' + num + '.png';
				img.id = 'score_image_' + i;
				img.classList.add('score_image');
				div.appendChild(img);
				_this.score_div.appendChild(div);
				if (p>1) { //(i < p) {
					let hr = document.createElement('hr');
					_this.score_div.appendChild(hr);
				}
				if (i==1) _this.firstScoreImage=img;
			}
			_this.playerCreated = true;
			console.log('player created');
		}
		if (_this.playerCreated) {
			let p = _this.score_pages;
			let l = 0;
			for (let i=1; i<=p; i++) {
				let img = document.getElementById('score_image_' + i);
				if (img.complete) l++;
			}
			if (l==p) _this.imagesComplete = true;
		}
		if (!_this.audioReady) {
			if (_this.score_audio.readyState >= 3 && _this.score_audio.duration !== Infinity) {
				_this.audioTime.innerHTML = _this.getAudioTime();
				_this.audioReady = true;
				console.log('audio ready, duration '+_this.score_audio.duration);
			}
		}

		if (_this.playerCreated && _this.imagesComplete && !_this.isResized) {
			if (!isNaN(_this.firstScoreImage.naturalWidth) && _this.firstScoreImage.naturalWidth>0) {
				_this.setMeasureDivs(_this, true);
				_this.resize(_this);
				_this.isResized = true;
			}
		}
		if (_this.playerCreated && _this.imagesComplete && _this.isResized && _this.audioReady) {
			console.log("Ready to play '"+_this.score_name+"'");
		} else {
			_this.loadRaf = requestAnimationFrame(function(timeStamp) {
				_this.isLoaded(_this);
			});
			return;
		}
	}

	loadJSONError (e) {
		_this.errors++;
		_this.errorMessage='Error loading JSON file';
		window.console.log(_this.errorMessage);
	}

	loadJSON (_this, url, callback) {
		let req = new XMLHttpRequest();
		req.addEventListener('error', _this.LoadJSONError);
		req.addEventListener('abort', _this.LoadJSONError);
		req.overrideMimeType('application/json');
		req.open('GET', url, true);
		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				let status = req.status;
				switch (status) {
					case 0: // local file
					case 200:
					case 304:
						callback(req.responseText);
						break;
					default:
						window.alert('url ' + url + ' status ' + status + ' : ' + req.statusText);
						_this.errors++;
						_this.errorMessage = 'url ' + url + ' status ' + status + ' : ' + req.statusText;
						break;
				}
			}
		};
		req.send(null);
	}

	onAudioError(_this, e) {
		if (!e.target.error.code===undefined) switch (e.target.error.code) {
     			case e.target.error.code.MEDIA_ERR_ABORTED:
       				_this.errorMessage='Aborted the audio playback.';
       				break;
     			case e.target.error.code.MEDIA_ERR_NETWORK:
       				_this.errorMessage='A network error caused the audio download to fail.';
       				break;
     			case e.target.error.code.MEDIA_ERR_DECODE:
       				_this.errorMessage='The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.';
       				break;
     			case e.target.error.code.MEDIA_ERR_SRC_NOT_SUPPORTED:
       				_this.errorMessage='The audio could not be loaded, either because the server or network failed or because the format is not supported.';
       				break;
     			default:
       				_this.errorMessage='An unknown error occurred with the audio.';
       				break;
   			} else {
       				_this.errorMessage='An unknown error occurred with the audio.';
   			}
		_this.errors++;
		console.log('Error audio: '+_this.errorMessage);
	}

	load(score_name, score_options) {
		let _this = this;

		if (score_name==='undefined'||score_name==='') {
			_this.init(_this);
			_this.score_player_element.innerHTML=_this.scriptName+': Score name not defined/specified';
			return;
		}
		_this.score_name = score_name;
		_this.score_options = score_options;
		_this.init(_this);
		console.log("Load '"+_this.score_path+_this.score_name+"'");
		console.log(" score_name: '"+_this.score_name+"'");
		console.log(" score_path: '"+_this.score_path+"'");
		console.log("script_path: '"+_this.script_path+"'");
		console.log(" image_path: '"+_this.image_path+"'");
		console.log("   css_path: '"+_this.css_path+"'");

		/*
		let source_ogg=document.createElement('source');
		source_ogg.src=_this.score_path+_this.score_name+'.mp3';
		source_ogg.type='audio/mpeg';
		_this.score_audio.appendChild(source_ogg);

		source_ogg.addEventListener('error', function(e) {
			_this.errors++;
			_this.errorMessage='Audio source error: '+this.src+' '+JSON.stringify(e.currentTarget);
		});
		*/

		let source_mp3=document.createElement('source');
		source_mp3.src=_this.score_path+_this.score_name+'.mp3';
		source_mp3.type='audio/mpeg';
		_this.score_audio.appendChild(source_mp3);

		source_mp3.addEventListener('error', function(e) {
			_this.errors++;
			_this.errorMessage='Audio source error: '+this.src+' '+JSON.stringify(e.currentTarget);
		});

		_this.score_audio.addEventListener('error', function(e) {
			_this.errors++;
			_this.errorMessage='Audio error: '+this.src+' '+JSON.stringify(e.currentTarget);
		});

		_this.loadRaf = requestAnimationFrame(function(timeStamp) {
			_this.isLoaded(_this);
		});

		_this.loadJSON(_this, _this.score_path+_this.score_name + '_space.json', function(response) {
			try {
				_this.time_space=JSON.parse(response);
				_this.score_pages=_this.time_space.pages;
				_this.score_measures=_this.time_space.measures;
				_this.loopMeasureStart=0;
				_this.loopMeasureEnd=_this.time_space.measures;
				_this.loadJSONready = true;
			} catch (error) {
				_this.errors++;
				_this.errorMessage='Error loading '+_this.score_path+_this.score_name + '_space.json';
				if (window.location.protocol == 'file:') {
					_this.errorMessage	+=' Your browser might not allow local files.'+
						' Please place your files on a webserver or disable local file restrictions (not advisable).';
				}
			}
		});
		return _this;
	}
}