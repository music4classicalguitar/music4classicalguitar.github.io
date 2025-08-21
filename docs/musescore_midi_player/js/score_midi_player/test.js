// import the modules
import { WORKLET_URL_ABSOLUTE } from './spessasynth_lib/synthetizer/worklet_url.js';
import { Sequencer } from './spessasynth_lib/sequencer/sequencer.js';
import { Synthetizer } from './spessasynth_lib/synthetizer/synthetizer.js';
import { MIDI } from './spessasynth_lib/midi_parser/midi_loader.js';

const BASE_DIR = import.meta.url.match(/(.*)[\/\\]/)[1]||'';
const PARENT_DIR = BASE_DIR.match(/(.*)[\/\\]/)[1]||'';
const GRAND_PARENT_DIR = PARENT_DIR.match(/(.*)[\/\\]/)[1]||'';
const SOUNDFONT = BASE_DIR+'/soundfonts/SoundfontWeb.sf3';
const MIDI_FILE = GRAND_PARENT_DIR+'/scores/Other/Traditional - Mardyanda - Dance, girl - Gypsy song - tab.mid';

export class Test {
	constructor() {
		let _this = this;
		document.getElementById('pause').onclick = () => {
			_this.loadAudio();
			document.getElementById('pause').innerText = 'Pause';
		}
	}
	
	loadAudio() {
		let _this = this;
		// load the soundfont
		fetch(SOUNDFONT).then(async response => {
			if (!response.ok) { throw response }
			return response.arrayBuffer();
		}).then( async soundFontBuffer => {
			// load the soundfont into an array buffer
			document.getElementById('message').innerText = 'SoundFont has been loaded!';

			// create the context and add audio worklet
			const context = new AudioContext();
			await context.audioWorklet.addModule(new URL('./spessasynth_lib/' + WORKLET_URL_ABSOLUTE, import.meta.url));
			this.synth = new Synthetizer(context.destination, soundFontBuffer);	 // create the synthetizer
			this.synth.setLogLevel(false, false, false, false);

 			// load midi
			fetch(MIDI_FILE).then(async response => {
				if (!response.ok) { throw response }
				return response.arrayBuffer();
			}).then( midiBuffer => {
				let parsedMIDI = new MIDI(midiBuffer);	
   				this.seq = new Sequencer([parsedMIDI], this.synth);
   	
				// make the slider move with the song, see on play/pause click
				this.slider = document.getElementById('progress');
				this.slider_setInterval = null;

				// set currentTime
				this.slider.onchange = () => {
					console.log( _this.slider.value+'/'+ _this.slider.max+' of '+_this.seq.duration);
					_this.seq.currentTime = _this.slider.value/_this.slider.max*_this.seq.duration;
				}
				
				// on play/pause click
				document.getElementById('pause').onclick = () => {
					if (_this.seq.paused) {
						document.getElementById('pause').innerText = 'Pause';
						_this.seq.play(); // resume
						this.slider_setInterval = setInterval(() => {
							// slider ranges from 0 to 1000
							_this.slider.value = Math.round((_this.seq.currentTime / _this.seq.duration) * 1000);
							document.getElementById('currentTime_value').innerText = Math.round(_this.seq.currentTime*100)/100 +'/' + Math.round(_this.seq.duration*100)/100;
						}, 100);
					}
					else {
						document.getElementById('pause').innerText = 'Play';
						_this.seq.pause(); // pause
						if (_this.slider_setInterval) window.cancelAnimationFrame(_this.slider_setInterval);

					}
				}

				// set tempo
				this.tempo = document.getElementById('tempo');
				this.tempo_factor = Math.pow(2,2/this.tempo.max);
				tempo.onchange = () => {
					let v = Math.pow(_this.tempo_factor,_this.tempo.value-_this.tempo.max/2);
					_this.seq.playbackRate = v;
					document.getElementById('playbackRate_value').innerText = v;
				}

				// set volume
				this.volume = document.getElementById('volume');
				this.volume.onchange = () => {
					let v = _this.volume.value/_this.volume.max;
					_this.synth.setMainVolume(v);
					console.log('volume '+v);
					document.getElementById('mainVolume_value').innerText = v;
				}

				// set pan
				this.pan = document.getElementById('pan');
				pan.onchange = () => {
					let v = _this.pan.value/_this.pan.max;
					_this.synth.setMasterPan(v);
					document.getElementById('pan_value').innerText = v;
				}

				// transpose
				this.transpose = document.getElementById('transpose');
				transpose.onchange = () => {
					let v = parseInt(_this.transpose.value,10);
					_this.synth.transpose(v);
					document.getElementById('transpose_value').innerText = v;
				}
				
				
			}).catch( err => {
				document.getElementsByTagName('body')[0].innerHTML = 'Error: '+err;
				return;
			});
		}).catch( err => {
			document.getElementsByTagName('body')[0].innerHTML = 'Error: '+err;
			return;
		});
	}
}

new Test();