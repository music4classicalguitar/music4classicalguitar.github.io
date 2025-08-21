// import the modules
import { Sequencer } from './spessasynth_lib/sequencer/sequencer.js';
import { Synthetizer } from './spessasynth_lib/synthetizer/synthetizer.js';
import { WORKLET_URL_ABSOLUTE } from './spessasynth_lib/synthetizer/worklet_url.js';
import { MIDI } from "./spessasynth_lib/midi_parser/midi_loader.js";

export class ScorePlayer {

	constructor() {
		let query;
		this.score_player = document.getElementsByClassName('score_player')[0];
		if (window.location.search.substring(0, 1) == '?') {
			query = window.location.search.substring(1);
		} else {
			this.score_player.innerHTML = 'Error: no score specified.';
			return;
		}
		this.score_name = decodeURIComponent(query);

		this.scriptName = 'score_player.js';
		this.script_path = import.meta.url.match(/(.*)[\/\\]/)[1]||'';

		this.script_parent_path = this.script_path.match(/(.*)[\/\\]/)[1];

		this.script_grand_parent_path = this.script_parent_path.match(/(.*)[\/\\]/)[1];

		this.image_path = this.script_grand_parent_path+'/images/score_player/';
		this.imageScale = 1;

		let _this = this;

		document.getElementById('skip_backward').onclick = () => { _this.skipBackward(); };

		document.getElementById('toggle_play_pause').onclick = () => { _this.togglePlayPause(); };

		this.image_play = document.getElementById('toggle_play_pause').childNodes[0];
		this.image_pause = document.createElement('img');
		this.image_pause.src = this.image_path+'media-playback-pause.svg';
		this.image_pause.alt = 'toggle play/pause' ;

		document.getElementById('skip_forward').onclick = () => { _this.skipForward(); };

		document.getElementById('show_loop').onclick = () => { _this.toggleShowLoop(); };

		document.getElementById('close_loop').onclick = () => { _this.toggleShowLoop(); };

		this.loopDiv = document.getElementById('loop');
		this.loopStatus = document.getElementById('loop_status');
		this.loopStartElement = document.getElementById('loop-start');
		this.loopEndElement = document.getElementById('loop-end');
		this.loopRadioStartElement = document.getElementById('loop_start');
		this.loopRadioEndElement = document.getElementById('loop_end');
		this.loopStart = null;
		this.loopEnd = null;
		this.loopAudioStart = null;
		this.loopAudioEnd = null;
		this.loopIsSet = false;
		this.loopIsReverse = false;

		this.dragCreate(this.loopDiv,this.loopStatus);

		document.getElementById('set_loop').onclick = () => { _this.setLoop(); };

		document.getElementById('clear_loop').onclick = () => { _this.clearLoop(); };

		document.getElementById('tempo_minus').onclick = () => { _this.changeTempo('-'); };
		document.getElementById('tempo_plus').onclick = () => { _this.changeTempo('+'); };
		this.tempoElement = document.getElementsByClassName('tempo')[0];
		this.tempoScale = 100;

		this.scoreAudioTime = document.getElementById('score_time');

		this.sliderAudioPosition = document.getElementsByClassName('score_audio_position')[0];
		this.sliderAudioPosition.value = 0;
		this.sliderAudioPosition.onchange = () => { _this.setAudioPosition(); };
		this.updateWindow_setInterval = null ;

		window.addEventListener('resize', function() {
			_this.resize();
		});

		document.addEventListener('keydown' , function(e) {
			if ((e || window.event).code === 'Escape') {
			if (!e.repeat) _this.togglePlayPause();
			}
		});

		this.time_space = null;

		this.score_div = document.getElementsByClassName('score')[0];
		this.firstScoreImage = null;
		this.score_loader = null;

		this.last_elid_color = null;
		this.last_elid = 0;

		this.audioContext ;
		this.scoreAudio = { currentTime: 0, duration: 0, isPaused: true, paused: true, pause() {}, play() { _this.loadAudio(); } };
		this.parsedMIDI = null;

		this.COLOR_CURRENT_MEASURE = 'blue';
		this.COLOR_LOOP_MEASURE_START = 'green';
		this.COLOR_LOOP_MEASURE = 'yellow';
		this.COLOR_LOOP_MEASURE_END = 'red';

		this.measureDivsCreated = false;
		this.scrollOffset = 200;
		this.load();
	}
	
	load() {
		this.score_loader = document.createElement('div');
		this.score_loader.classList.add('score_loader');
		this.score_player.appendChild(this.score_loader);

		fetch(this.score_name + '.json').then(async response => {
			if (!response.ok) { throw response }
			return response.json();
		}).then( json => {
			this.time_space = json;
			this.loopMeasureStart = 0;
			this.loopMeasureEnd = this.time_space.measures;
			this.loopStartElement.value = 1;
			this.loopEndElement.max = this.time_space.measures;
			this.loopEndElement.value = this.time_space.measures;
			// add score images
			let digits = String(this.time_space.pages).length;
			for (let i=1; i<=this.time_space.pages; i++) {
				let div=document.createElement('div');
				div.id='score_container_'+i;
				div.classList.add('score_container');
				let img = document.createElement('img');
				let num = i.toString();
				while (num.length < digits) num = "0" + num;
				img.src = this.score_name + '-' + num + '.png';
				img.id = 'score_image_' + i;
				img.classList.add('score_image');
				div.appendChild(img);
				this.score_div.appendChild(div);
				if (this.time_space.pages>1) {
					let hr = document.createElement('hr');
					this.score_div.appendChild(hr);
				}
				if (i==1) this.firstScoreImage=img;
			}
			let _this = this;
			// load midi
			fetch(_this.score_name + '.mid').then(async response => {
				if (!response.ok) { throw response }
				return response.arrayBuffer();
			}).then( midiBuffer => {
				_this.parsedMIDI = new MIDI(midiBuffer);
				_this.scoreAudio.duration = _this.parsedMIDI.duration;
				_this.setTextAudioTime();
			}).catch( err => {
				_this.score_player.innerHTML = 'Error: '+err;
				return;
			});
			this.firstScoreImage.onload = function () {
				_this.score_player.removeChild(_this.score_loader);
				_this.resize();
				_this.setMeasureView(0);			
			};
		}).catch( err => {
			this.score_player.innerHTML = 'Error, status: '+err.status+' '+err.statusText+' "'+this.score_name + '.json"';
			return;
		});
	}

	loadAudio() {
		let _this = this;
		fetch("js/score_midi_player/soundfonts/SoundfontWeb.sf3").then(async response => {
			if (!response.ok) { throw response };
			let soundFontBuffer = await response.arrayBuffer();
			// create the context and add audio worklet
			this.audioContext = new AudioContext();
			await this.audioContext.audioWorklet.addModule(new URL('./spessasynth_lib/synthetizer/worklet_system/worklet_processor.js',import.meta.url));
			// create the synthetizer
			const synth = new Synthetizer(this.audioContext.destination, soundFontBuffer);
			synth.setInterpolationType(1);
			let currentTime = this.scoreAudio.currentTime;
			this.scoreAudio = new Sequencer([this.parsedMIDI], synth);
			this.scoreAudio.currentTime = currentTime;
			this.scoreAudio.loop = false;
			this.scoreAudio.isPaused = true;
			await this.scoreAudio.isReady;
			// Safari workaround for : An AudioContext was prevented from starting automatically
			// see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state
			if (this.audioContext.state !== "running") {
				this.audioContext.resume().then(() => this.scoreAudio.play());
			} else this.scoreAudio.play();
			this.scoreAudio.isPaused = false;
			this.image_play.replaceWith(this.image_pause);
			this.updateWindow_setInterval = window.requestAnimationFrame(function () { _this.updateWindow(); }, 50);
		}).catch( err => {
			this.score_player.innerHTML = 'Error, status: '+err;
			return;
		});
	}

	getScoreContainer(c) {
		let elements=this.score_div.childNodes;
		for (let e=0;e<elements.length;e++) {
			if (elements[e].getAttribute('id')==='score_container_'+c) {
				return elements[e];
			}
		}
		console.log("Score '"+this.score_name+"' score_container "+c+" not found");
		return null;
	}

	getScoreImage(n) {
		let elements=this.score_div.childNodes;
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
		console.log("Score '"+this.score_name+"' image "+n+" not found");
		return null;
	}

	setMeasureDivs() {
		let _this = this;
		let scoreWidth = this.firstScoreImage.scrollWidth;
		this.imageScale = scoreWidth/this.firstScoreImage.naturalWidth;
		for (let i=0;i<this.time_space.space.length;i++) {
			let space = this.time_space.space[i];
			let score_container=this.getScoreContainer(space.page);
			let img=this.getScoreImage(space.page);
			let f = 12;
			let w = Math.floor(space.sx*this.imageScale/f);
			let h = Math.floor(space.sy*this.imageScale/f);
			let x = Math.floor(space.x*this.imageScale/f);
			let y = Math.floor(space.y*this.imageScale/f);
			let div;
			if (!this.measureDivsCreated) {
				div=document.createElement('div');
				div.id='score_elid_'+i;
				div.classList.add('score_elid');
				div.onclick = (e) => { 
					let m = Number(e.target.id.substring(11));
					_this.setMeasure(m, true);
				};
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
			let z=i+2;
			div.style['z-index'] = z;
			div.style.position = 'absolute';
			div.style.left = x + 'px'; 
			div.style.top = y + 'px'; 
			div.style.width = w + 'px'; 
			div.style.height = h + 'px';
		}
		this.measureDivsCreated = true;
	}

	resize() {
		this.imageScale = this.firstScoreImage.scrollWidth/this.firstScoreImage.naturalWidth;
		let scaledHeight = Math.ceil(this.imageScale*this.firstScoreImage.naturalHeight);
		let computedHeight = window.innerHeight - this.score_div.getBoundingClientRect().top - 10;
		let h = Math.min(scaledHeight,computedHeight);
		this.score_div.style.height = h+'px';
		this.setMeasureDivs();
	}
	
	dragCreate(elmnt,handle) {
		let _this = this;
		this.dragCurrentX = 0;
		this.dragCurrentY = 0;
		this.dragInitialX = 0;
		this.dragInitialY = 0;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		this.dragelmnt = elmnt;
		this.draghandle = handle;
		this.dragActive = false;

		this.draghandle.onmousedown = (event) => { _this.dragStart(event); };
		this.draghandle.ontouchstart = (event) => { _this.dragStart(event); };
	}
	
	dragStart(e) {
		e = e || window.event;
		if (e.type === "touchstart") {
			this.dragInitialX = e.touches[0].clientX;
			this.dragInitialY = e.touches[0].clientY;
		} else {
			this.dragInitialX = e.clientX;
			this.dragInitialY = e.clientY;
		}
		this.dragOffsetX = this.dragelmnt.getBoundingClientRect().left;
		this.dragOffsetY = this.dragelmnt.getBoundingClientRect().top;
		this.dragActive = true;
		let _this = this;
		document.ontouchmove = (event) => { _this.dragMove(event); };
		document.ontouchstop = (event) => { _this.dragStop(event); };
		document.ontouchcancel = (event) => { _this.dragStop(event); };
		document.onmousemove = (event) => { _this.dragMove(event); };
		document.onmouseup = (event) => { _this.dragStop(event); };
		document.onmouseout = (event) => { _this.dragStop(event); };
	}

	dragMove(e) {
		e = e || window.event;
		if (this.dragActive) {
			e.preventDefault();
			if (e.type === "touchmove") {
				this.dragCurrentX =  e.touches[0].clientX - this.dragInitialX;
				this.dragCurrentY = e.touches[0].clientY - this.dragInitialY ;
			} else {
				this.dragCurrentX = e.clientX - this.dragInitialX;
				this.dragCurrentY = e.clientY - this.dragInitialY;
			}
			this.dragelmnt.style.left = (this.dragOffsetX + this.dragCurrentX) + "px";
			this.dragelmnt.style.top = (this.dragOffsetY + this.dragCurrentY) + "px";
		}
	}

	dragStop(e) {
		this.dragOffsetX = this.dragelmnt.offsetLeft;
		this.dragOffsetY = this.dragelmnt.offsetTop;
		this.dragActive = false;
		document.ontouchmove = (event) => { null; };
		document.ontouchstop = (event) => { null; };
		document.ontouchcancel = (event) => { null; };
		document.onmousemove = (event) => { null; };
		document.onmouseup = (event) => { null; };
		document.onmouseout = (event) => { null; };
	}

	setAudioCurrentTime(currentTime) {
		this.scoreAudio.currentTime = currentTime;
		if (this.scoreAudio.isPaused) this.scoreAudio.pause();
	}

	setAudioPosition() {
		this.setAudioCurrentTime(this.sliderAudioPosition.value/this.sliderAudioPosition.max*this.scoreAudio.duration);
		this.setTextAudioTime();
		this.setViewMeasureAudioPosition();
	}

	setSliderAudioPosition() {
		this.sliderAudioPosition.value = Math.floor(this.sliderAudioPosition.max * this.scoreAudio.currentTime / this.scoreAudio.duration);
	}

	formatTime(t) {
		let s = parseInt(t % 60);
		let m = parseInt((t / 60) % 60);
		if (s < 10) s = '0' + s;
		return m + ':' + s;
	}

	getFormattedAudioTime() {
		return this.formatTime(this.scoreAudio.currentTime) + ' / ' + this.formatTime(this.scoreAudio.duration);
	}

	setTextAudioTime() {
		this.scoreAudioTime.innerHTML = this.getFormattedAudioTime();
	}

	setMeasureColor(m, color) {
		let e = this.getMeasureElement(m);
		if (e) {
			e.style.opacity = '0.1';
			e.style.background = color;
			let ps = this.score_div.getBoundingClientRect();
			let pe = e.getBoundingClientRect();
		}
	}
	
	setLoopMeasureView() {
		let color = this.COLOR_LOOP_MEASURE_START;
		if (this.loopIsReverse) {
			color = this.COLOR_LOOP_MEASURE;
			for (let i=0;i<=this.loopEnd; i++) {
				color = i==this.loopEnd?this.COLOR_LOOP_MEASURE_END:this.COLOR_LOOP_MEASURE;
				this.setMeasureColor(this.time_space.time[i].elid,color);
			}
			for (let i=this.loopStart; i<this.time_space.time.length; i++) {
				color = i==this.loopStart?this.COLOR_LOOP_MEASURE_START:this.COLOR_LOOP_MEASURE;
				this.setMeasureColor(this.time_space.time[i].elid,color);
			}
		} else {
			for (let i=this.loopStart; i<=this.loopEnd; i++) {
				color = i==this.loopStart?this.COLOR_LOOP_MEASURE_START:i==this.loopEnd?this.COLOR_LOOP_MEASURE_END:this.COLOR_LOOP_MEASURE;
				this.setMeasureColor(this.time_space.time[i].elid, color);
			}
		}
	}

	clearLoopMeasureView() {
		if (this.loopIsReverse) {
			for (let i=0; i<=this.loopEnd; i++) {
				this.setMeasureColor(this.time_space.time[i].elid,'none');
			}
			for (let i=1; i<=this.loopStart; i++) {
				this.setMeasureColor(this.time_space.time[i].elid,'none');
			}
		} else {
			for (let i=this.loopStart; i<=this.loopEnd; i++) {
				this.setMeasureColor(this.time_space.time[i].elid,'none');
			}
		}
		this.setMeasureColor(this.last_elid,this.COLOR_CURRENT_MEASURE);
	}

	gotoMeasure(m, first) {
		let s=0;
		for (let i=0; i<this.time_space.time.length;i++) {
			if (this.time_space.time[i].elid===m) {
				s=i;
				if (first) break;
			}
		}
		let currentTime = this.time_space.time[s].position/1000;
		this.setAudioCurrentTime(currentTime);
		this.setSliderAudioPosition();
		this.setMeasureView(m);
	}

	setMeasure(m, first) {
		if (this.loopDiv.style.display=='block') {
			if (this.loopRadioStartElement.checked) this.loopStartElement.value = m+1;
			else this.loopEndElement.value = m+1;
		} else if (this.loopIsSet) {
			let found = false;
			for (let i=this.loopStart;i<=this.loopEnd; i++) {
				if (this.time_space.time[i].elid == m) {
					this.setAudioCurrentTime(this.time_space.time[i].position/1000);
					found = true;
					break ;
				}
			}
			if (! found) window.alert('Measure is not within loop');
			else this.gotoMeasure(m, first);
		} else this.gotoMeasure(m, first);
	}

	setMeasureView(m) {
		let e = this.getMeasureElement(m);
		if (e) {
			if (m != this.last_elid) {
				this.clearMeasureView(this.last_elid);
				this.last_elid = m;
				this.last_elid_color = e.style.background;
			}
			e.style.opacity = '0.1';
			e.style.background = this.COLOR_CURRENT_MEASURE;
			// scroll into view
			if (e.parentNode.offsetTop+e.offsetTop-this.imageScale*this.scrollOffset<this.score_div.scrollTop ||
				e.parentNode.offsetTop+e.offsetTop+this.imageScale*this.scrollOffset>this.score_div.scrollTop+this.score_div.clientHeight)
				this.score_div.scrollTo(0,e.parentNode.offsetTop+e.offsetTop-this.scrollOffset);
		}
	}

	clearMeasureView(m) {
		let e = this.getMeasureElement(m);
		if (e) {
			let color = this.last_elid_color?this.last_elid_color:'none';
			e.style.opacity = '0.1';
			e.style.background = this.last_elid_color ;
		}
	}

	setViewMeasureAudioPosition() {
		let m = 0;
		let t = this.scoreAudio.currentTime;
		for (let i = 0; i < this.time_space.time.length; i++) {
			if (t * 1000 < this.time_space.time[i].position) break;
			m = i;
		}
		this.setMeasureView(this.time_space.time[m].elid);
	}

	updateWindow() {
		let _this = this;
		if (!this.scoreAudio.isPaused) {
			if (this.loopIsSet) {
				if (this.loopIsReverse) {
					if (this.scoreAudio.currentTime>=this.scoreAudio.duration) {
						this.setAudioCurrentTime(0);
					}
				} else if (this.scoreAudio.currentTime>=this.loopAudioEnd) {
					this.setAudioCurrentTime(this.loopAudioStart);
				}
				this.updateWindow_setInterval = window.requestAnimationFrame(function () { _this.updateWindow(); }, 50);
			} else if (this.scoreAudio.currentTime>=this.scoreAudio.duration) {
				this.image_pause.replaceWith(this.image_play);
				this.scoreAudio.isPaused = true;
			} else this.updateWindow_setInterval = window.requestAnimationFrame(function () { _this.updateWindow(); }, 50);
		}
		this.setTextAudioTime();
		this.setSliderAudioPosition();
		this.setViewMeasureAudioPosition();
	}

	getMeasureElement(m) {
		for (let p=1; p<=this.time_space.pages;p++) {
			let score_containers=this.score_div.childNodes;
			for (let c=0;c<score_containers.length;c++) {
				let elements=score_containers[c].childNodes;
				for (let e=0;e<elements.length;e++) {
					if (elements[e].getAttribute('id')==='score_elid_'+m) {
						return elements[e];
					}
				}
			}
		}
		console.log("Score '"+this.score_name+"' measure "+m+" not found");
		return null;
	}

	changeTempo(dir) {
		this.tempoScale = Number(this.tempoElement.innerHTML.substr(0, this.tempoElement.innerHTML.length - 1));
		if (dir === '+') {
			if (this.tempoScale < 200) this.tempoScale += 10;
		} else {
			if (this.tempoScale > 50) this.tempoScale -= 10;
		}
		this.tempoElement.innerHTML = this.tempoScale + '%';
		this.scoreAudio.playbackRate = this.tempoScale / 100;
		if (this.scoreAudio.isPaused) this.scoreAudio.pause();
	}

	skipBackward() {
		this.gotoMeasure(0, true);
	}

	togglePlayPause() {
		let _this = this;
		if (this.scoreAudio.isPaused) {
			// Safari workaround for : An AudioContext was prevented from starting automatically
			// see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state
			if (this.audioContext && this.audioContext.state !== "running") {
				this.audioContext.resume().then(() => this.scoreAudio.play());
			} else this.scoreAudio.play();
			this.scoreAudio.isPaused = false;
			this.image_play.replaceWith(this.image_pause);
			this.updateWindow_setInterval = window.requestAnimationFrame(function () { _this.updateWindow(); }, 50);
		} else {
			if (this.updateWindow_setInterval) window.cancelAnimationFrame(this.updateWindow_setInterval);
			this.scoreAudio.pause();
			this.scoreAudio.isPaused = true;
			this.image_pause.replaceWith(this.image_play);
		}
	}

	skipForward() {
		this.gotoMeasure(this.time_space.space[this.time_space.space.length-1].id, false);
	}

	toggleShowLoop() {
		if (this.loopDiv.style.display==='none') this.loopDiv.style.display='block';
		else this.loopDiv.style.display='none';
	}

	setLoop() {
		let message="";
		if (isNaN(this.loopStartElement.value))
			message+=" Start measure '"+this.loopStartElement.value+"' is not a number";
		else if (this.loopStartElement.value !== parseInt(this.loopStartElement.value, 10)+"")
			message+=" Start measure '"+this.loopStartElement.value+"' is not a whole number";
		else if (this.loopStartElement.min>Number(this.loopStartElement.value)||this.loopStartElement.value>Number(this.loopStartElement.max))
			message+=" Start measure '"+this.loopStartElement.value+"' should be in the range ["+this.loopStartElement.min+"-"+this.loopStartElement.max+"]";
		if (isNaN(this.loopEndElement.value))
			message+=" End measure '"+this.loopEndElement.value+"' is not a number";
		else if (this.loopEndElement.value !== parseInt(this.loopEndElement.value, 10)+"")
			message+=" End measure '"+this.loopEndElement.value+"' is not a whole number";
		else if (this.loopEndElement.min>Number(this.loopEndElement.value)||Number(this.loopEndElement.value)>Number(this.loopEndElement.max))
			message+=" End measure should be in the range ["+this.loopEndElement.min+"-"+this.loopEndElement.max+"]";
		if (message==='') {
			let loopMeasureStart = this.loopStartElement.value-1;
			let loopMeasureEnd = this.loopEndElement.value-1;
			let ranges = [];
			let duration ;
			for (let i=0; i<this.time_space.time.length; i++) {
				if (this.time_space.time[i].elid==loopMeasureStart) {
					for (let j=0; j<this.time_space.time.length; j++) {
						if (this.time_space.time[j].elid==loopMeasureEnd) {
							if (i<=j) {
								if (j+1>=this.time_space.time.length) duration = this.scoreAudio.duration-this.time_space.time[j].position;
								else duration = this.time_space.time[j+1].position-this.time_space.time[i].position;
							} else {
								duration = this.time_space.time[i].position + this.scoreAudio.duration-this.time_space.time[j].position;
							}
							ranges.push({ 'start': i, 'end': j, 'duration': duration });
						}
					}
				}
			}
			let rev = ranges.filter(item => item.start <= item.end) ;
			let min ;
			if (rev.length>0) {
				min = Math.min(...rev.map(item => item.duration));
			} else {
				min = Math.min(...ranges.map(item => item.duration));
			}
			let result = ranges.filter(item => item.duration == min);
			if (this.loopIsSet) this.clearLoopMeasureView();
			else this.setMeasureColor(this.last_elid, 'none');
			this.loopStart = result[0].start;
			this.loopEnd = result[0].end;
			this.loopIsReverse = result[0].start>result[0].end;
			this.loopMeasureStart = this.time_space.time[result[0].start].elid;
			this.loopMeasureEnd = this.time_space.time[result[0].end].elid;
			this.loopAudioStart = this.time_space.time[result[0].start].position/1000;
			this.loopAudioEnd = (result[0].end+1>=this.time_space.time.length)?this.scoreAudio.duration:this.time_space.time[result[0].end+1].position/1000;
			this.loopIsSet = true;
			this.toggleShowLoop();
			this.setLoopMeasureView();
			this.last_elid = this.loopMeasureStart;
			this.last_elid_color = this.COLOR_LOOP_MEASURE_START;
			this.setAudioCurrentTime(this.loopAudioStart);
			this.sliderAudioPosition.value = Math.floor(this.sliderAudioPosition.max * this.loopAudioStart / this.scoreAudio.duration);
			this.setMeasureView(this.loopMeasureStart);
			this.scoreAudioTime.innerHTML = this.formatTime(this.loopAudioStart) + ' / ' + this.formatTime(this.scoreAudio.duration)
			this.loopStatus.innerHTML = 'Loop: ['+(this.loopMeasureStart+1)+'-'+(this.loopMeasureEnd+1)+']';
		} else window.alert(message);
	}

	clearLoop() {
		this.clearLoopMeasureView();
		this.loopStatus.innerHTML = 'Loop: not set';
		this.loopIsSet=false;
		this.toggleShowLoop();
	}

}

new ScorePlayer();
