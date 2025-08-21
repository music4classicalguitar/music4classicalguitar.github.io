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
		this.debug = 0;
		
		this.audio = {
			'seq': { 'currentTime': 0, 'duration': 0, 'playbackRate': 1, 'paused': true, pause() {}, play() { _this.loadAudio(); } },
			'synth': { 'mainVolume': 1, 'pan': 0, 'transposition':0, setMainVolume(v) { this.mainVolume=v; }, setMasterPan(v) { this.pan = v; }, transpose(v) { this.transposition = v; } }
		};

		// make the slider move with the song, see on play/pause click
		this.currentTime = document.getElementById('currentTime');
		this.currentTime_value = document.getElementById('currentTime_value');
		this.currentTime_setInterval = null;

		// set currentTime
		this.currentTime.onchange = () => {
			_this.audio.seq.currentTime = _this.currentTime.value/_this.currentTime.max*_this.audio.seq.duration;
			_this.currentTime_value.innerText = Math.round(_this.audio.seq.currentTime*100)/100 +'/' + Math.round(_this.audio.seq.duration*100)/100;
			if (_this.debug) console.log('currentTime '+_this.audio.seq.currentTime);
		}
		//on reload
		this.currentTime.value = 0;
		this.currentTime_value.innerText = Math.round(_this.audio.seq.currentTime*100)/100 +'/' + Math.round(_this.audio.seq.duration*100)/100;

		// on play/pause click
		document.getElementById('pause').onclick = () => {
			if (_this.debug) console.log('currentTime '+_this.audio.seq.currentTime+' playbackRate '+_this.audio.seq.playbackRate+' pan '+_this.audio.synth.pan+' mainVolume '+_this.audio.synth.mainVolume+' transpose '+_this.audio.synth.transposition);
			if (_this.audio.seq.paused) {
				document.getElementById('pause').innerText = 'Pause';
				_this.audio.seq.play();
				_this.currentTime_setInterval = setInterval(() => {
					// slider ranges from 0 to 1000
					_this.currentTime.value = Math.round((_this.audio.seq.currentTime / _this.audio.seq.duration) * 1000);
					_this.currentTime_value.innerText = Math.round(_this.audio.seq.currentTime*100)/100 +'/' + Math.round(_this.audio.seq.duration*100)/100;
				}, 100);
			}
			else {
				document.getElementById('pause').innerText = 'Play';
				_this.audio.seq.pause();
				if (_this.currentTime_setInterval) window.cancelAnimationFrame(_this.currentTime_setInterval);

			}
		}

		// set playbackRate
		this.playbackRate = document.getElementById('playbackRate');
		this.playbackRate_value = document.getElementById('playbackRate_value');
		this.playbackRate_factor = Math.pow(2,2/this.playbackRate.max);
		this.playbackRate.onchange = () => {
			let v = Math.pow(_this.playbackRate_factor,_this.playbackRate.value-_this.playbackRate.max/2);
			if (_this.debug) console.log('playbackRate '+v);
			_this.audio.seq.playbackRate = v;
			_this.playbackRate_value.innerText = v;
		}
		//on reload
		this.playbackRate.value = 4;
		this.playbackRate_value.innerText = Math.pow(_this.playbackRate_factor,_this.playbackRate.value-_this.playbackRate.max/2);

		// set volume
		this.mainVolume = document.getElementById('mainVolume');
		this.mainVolume_value = document.getElementById('mainVolume_value');
		this.mainVolume.onchange = () => {
			let v = _this.mainVolume.value/_this.mainVolume.max;
			if (_this.debug) console.log('mainVolume '+v);
			_this.audio.synth.setMainVolume(v);
			this.mainVolume_value.innerText = v;
		}
		//on reload
		this.mainVolume.value = 10;
		this.mainVolume_value.innerText = _this.mainVolume.value/_this.mainVolume.max;

		// set pan
		this.pan = document.getElementById('pan');
		this.pan_value = document.getElementById('pan_value');
		pan.onchange = () => {
			let v = _this.pan.value/_this.pan.max;
			if (_this.debug) console.log('pan '+v);
			_this.audio.synth.setMasterPan(v);
			_this.pan_value.innerText = v;
		}
		//on reload
		this.pan.value = 0;
		this.pan_value.innerText = _this.pan.value/_this.pan.max;

		// transpose
		this.transpose = document.getElementById('transpose');
		this.transpose.value = 0;
		this.transpose_value = document.getElementById('transpose_value');
		transpose.onchange = () => {
			let v = parseInt(_this.transpose.value,10);
			if (_this.debug) console.log('transpose '+v);
			_this.audio.synth.transpose(v);
			this.transpose_value.innerText = v;
		}
		//on reload
		this.transpose.value = 0;
		this.transpose_value.innerText = parseInt(_this.transpose.value,10);

		this.loadMidi();
	}

	loadMidi() {
 		// load midi
		fetch(MIDI_FILE).then(async response => {
			if (!response.ok) { throw response }
			return response.arrayBuffer();
		}).then( midiBuffer => {
			this.parsedMIDI = new MIDI(midiBuffer);
			this.audio.seq.duration = this.parsedMIDI.duration;
			document.getElementById('currentTime_value').innerText = Math.round(this.audio.seq.currentTime*100)/100 +'/' + Math.round(this.audio.seq.duration*100)/100;
		}).catch( err => {
			document.getElementsByTagName('body')[0].innerHTML = 'Error: '+err;
			return;
		});
	}

	loadAudio() {
		let _this = this;
		// preserve previous values
		const old_audio_seq = _this.audio.seq, old_audio_synth = _this.audio.synth ;
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

			// create the synthetizer
			this.audio.synth = new Synthetizer(context.destination, soundFontBuffer);
			//this.audio.synth.setLogLevel(false, false, false, false);
			// create the sequencer
			this.audio.seq = new Sequencer([_this.parsedMIDI], _this.audio.synth);

			// adapt, use preserved previous values
			this.audio.seq.currentTime = old_audio_seq.currentTime;
			this.audio.seq.playbackRate = old_audio_seq.playbackRate;
			this.audio.synth.pan = old_audio_synth.pan;
			this.audio.synth.setMainVolume(old_audio_synth.mainVolume);
			this.audio.synth.transpose(old_audio_synth.transposition);

			document.getElementById('pause').innerText = 'Pause';
			_this.audio.seq.play();
			this.currentTime_setInterval = setInterval(() => {
				// slider ranges from 0 to 1000
				_this.currentTime.value = Math.round((_this.audio.seq.currentTime / _this.audio.seq.duration) * 1000);
				_this.currentTime_value.innerText = Math.round(_this.audio.seq.currentTime*100)/100 +'/' + Math.round(_this.audio.seq.duration*100)/100;
			}, 100);

		}).catch( err => {
			document.getElementsByTagName('body')[0].innerHTML = 'Error: '+err;
			return;
		});
	}
}

new Test();