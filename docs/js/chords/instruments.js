class Instruments {

	constructor() {

		// strings_width at pos: 0 and l/2
		this.instrumentList = [
			{ instrument: 'Guitar', strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
				image: 'GuitarNeck.png', width: '840', height: '160',
				string_offset_x: '67', string_offset_y_mid: '80', string_length: '1312', strings_width: ['86', '101'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Electric guitar', strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
				image: 'ElectricGuitarNeck.png', width: '1200', height: '256',
				string_offset_x: '112', string_offset_y_mid: '130', string_length: '1850', strings_width: ['108', '131'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Bass guitar', strings: ['E1', 'A1', 'D2', 'G2'],
				image: 'BassGuitarNeck.png', width: '2400', height: '400',
				string_offset_x: '250', string_offset_y_mid: '200', string_length: '3620', strings_width: ['150', '200'],
				clef: 'bass', transpose: 12 // clef: 'bass_8vb', transpose: 24 // 
			},
			{ instrument: 'Plectrum banjo', strings: ['C3', 'G3', 'B3', 'D4'],
				image: 'PlectrumBanjoNeck.png', width: '820', height: '90',
				string_offset_x: '52', string_offset_y_mid: '46', string_length: '1308', strings_width: ['46', '56'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Tenor banjo', strings: ['C3', 'G3', 'D4', 'A4'],
				image: 'TenorBanjoNeck.png', width: '1250', height: '165',
				string_offset_x: '86', string_offset_y_mid: '90', string_length: '1980', strings_width: ['85', '97'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Irish banjo', strings: ['G2', 'D3', 'A3', 'E4'],
				image: 'IrishBanjoNeck.png', width: '761', height: '144',
				string_offset_x: '33', string_offset_y_mid: '71', string_length: '1078', strings_width: ['52', '65'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Ukulele', strings: ['G4', 'C4', 'E4', 'A4'],
				image: 'UkuleleNeck.png', width: '1105', height: '211',
				string_offset_x: '35', string_offset_y_mid: '100', string_length: '1560', strings_width: ['101', '124'],
				clef: 'treble', transpose: 0
			}/*,
			{ instrument: 'Violin', strings: ['G3', 'D4', 'A4', 'E5'],
				image: 'ViolinPart.png', width: '4318', height: '745',
				string_offset_x: '84', string_offset_y_mid: '46', string_length: '1308', strings_width: ['46', '56'],
				clef: 'treble'
			},
			{ instrument: 'Viola', strings: ['C3', 'G3', 'D4', 'A4'],
				image: 'ViolaPart.png', width: '1170', height: '210',
				string_offset_x: '84', string_offset_y_mid: '46', string_length: '1308', strings_width: ['46', '56'],
				clef: 'treble'
			},
			{ instrument: 'Cello', strings: ['C2', 'G2', 'D3', 'A3'],
				image: 'CelloPart.png', width: '1144', height: '146',
				string_offset_x: '84', string_offset_y_mid: '46', string_length: '1308', strings_width: ['46', '56'],
				clef: 'tenor'
			},
			{ instrument: 'Double bass', strings: ['E1', 'A1', 'D2', 'G2'],
				image: 'DoubleBassPart.png', width: '4018', height: '694',
				string_offset_x: '84', string_offset_y_mid: '46', string_length: '1308', strings_width: ['46', '56'],
				clef: 'bass_8vb', transpose: 12
			}*/,
			{ instrument: 'Piano/Keyboard', strings: [],
				clef: 'treble', transpose: 0
			}
		];
		const piano = this.instrumentList.length-1;

		this.image_dir = 'images/chords/';

		this.instrumentIndex = 0;
		this.notenames = new NoteNames();
		this.frets = 15;
		this.strings ;
		this.stringTpcs = [];
		this.stringPitches = [];
		this.stringNotes = [];
		this.stringOctaves = [];
		this.piano = piano;
		this.setInstrument(this.instrumentIndex);
		this.canvas;
		this.canvas_context;
		this.canvas_parent;
		this.image;
		this.image_width;
		this.image_height;
		this.loaded = false;
		this.scale = 1;
		this.stringChordNotes;
		this.notepositions = [] ;
		let c = 1/Math.pow(2,1/12);
		let l = 1;
		let p = 0;
		for (let i=0; i<=this.frets; i++) {
			this.notepositions.push(p);
			l = l*c;
			p = 1-l;
		}

		this.pianoChordType;
		this.piano_octaves = 3;
		this.piano_wkl = 150;
		this.piano_wkw = 23+5/7;
		this.piano_bkl = 100;
		this.piano_bkw = 15;
		this.piano_offset_x = 5;
		this.piano_offset_y = 5;
		this.piano_keys = [
			[ [0, 0], [this.piano_wkw-10, 0], [this.piano_wkw-10, this.piano_bkl], [this.piano_wkw, this.piano_bkl], [this.piano_wkw, this.piano_wkl], [0, this.piano_wkl] ],
			[ [this.piano_wkw-10, 0], [this.piano_wkw+5, 0], [this.piano_wkw+5, this.piano_bkl], [this.piano_wkw-10, this.piano_bkl] ],
			[ [this.piano_wkw+5, 0], [2*this.piano_wkw-5, 0], [2*this.piano_wkw-5, this.piano_bkl], [2*this.piano_wkw, this.piano_bkl],
				[ 2*this.piano_wkw, this.piano_wkl], [this.piano_wkw, this.piano_wkl], [this.piano_wkw, this.piano_bkl], [this.piano_wkw+5, this.piano_bkl] ],
			[ [2*this.piano_wkw-5, 0], [2*this.piano_wkw+10, 0], [2*this.piano_wkw+10, this.piano_bkl], [2*this.piano_wkw-5, this.piano_bkl] ],
			[ [2*this.piano_wkw+10, 0],  [3*this.piano_wkw, 0], [3*this.piano_wkw, this.piano_wkl], [2*this.piano_wkw, this.piano_wkl], [2*this.piano_wkw, this.piano_bkl],
				[2*this.piano_wkw+10, this.piano_bkl] ],
			[ [3*this.piano_wkw, 0], [4*this.piano_wkw-11, 0], [4*this.piano_wkw-11, this.piano_bkl], [4*this.piano_wkw, this.piano_bkl],
				[ 4*this.piano_wkw, this.piano_wkl], [3*this.piano_wkw, this.piano_wkl], [3*this.piano_wkw, 0]],
			[ [4*this.piano_wkw-11, 0], [4*this.piano_wkw+4, 0], [4*this.piano_wkw+4, this.piano_bkl], [4*this.piano_wkw-11, this.piano_bkl] ],
			[ [4*this.piano_wkw+4, 0], [5*this.piano_wkw-7.5, 0], [5*this.piano_wkw-7.5, this.piano_bkl], [5*this.piano_wkw, this.piano_bkl],
				[ 5*this.piano_wkw, this.piano_wkl], [4*this.piano_wkw, this.piano_wkl], [4*this.piano_wkw, this.piano_bkl], [4*this.piano_wkw+4, this.piano_bkl] ],
			[ [5*this.piano_wkw-7.5, 0], [5*this.piano_wkw+7.5, 0], [5*this.piano_wkw+7.5, this.piano_bkl], [5*this.piano_wkw-7.5, this.piano_bkl] ],
			[ [5*this.piano_wkw+7.5, 0], [6*this.piano_wkw-4, 0], [6*this.piano_wkw-4, this.piano_bkl], [6*this.piano_wkw, this.piano_bkl],
				[6*this.piano_wkw, this.piano_wkl], [5*this.piano_wkw, this.piano_wkl], [5*this.piano_wkw, this.piano_bkl], [5*this.piano_wkw+7.5, this.piano_bkl] ],
			[ [6*this.piano_wkw-4, 0], [6*this.piano_wkw+11, 0], [6*this.piano_wkw+11, this.piano_bkl], [6*this.piano_wkw-4, this.piano_bkl] ],
			[ [6*this.piano_wkw+11, 0], [7*this.piano_wkw, 0], [7*this.piano_wkw, this.piano_wkl], [6*this.piano_wkw, this.piano_wkl], [6*this.piano_wkw, this.piano_bkl], [6*this.piano_wkw+11, this.piano_bkl] ]
		];
		this.piano_black_keys = [ 1, 3, 6, 8, 10];

		this.colors;
	}

	setStringChordNotes(stringChordNotes, colors) {
		this.stringChordNotes = stringChordNotes;
		this.colors = colors;
	}

	setInstrument(instrumentIndex) {
		if (this.instrumentIndex != this.piano && instrumentIndex == this.piano) {
			this.canvas.remove();
			this.canvas = null;
			this.canvas_context = null;
		}
		this.instrumentIndex = instrumentIndex;
		if (this.instrumentIndex != this.piano) {
			this.stringNotes = this.instrumentList[this.instrumentIndex].strings;
			this.strings = this.stringNotes.length;
			this.stringTpcs = [];
			for (var i=0; i<this.strings; i++) {
				this.stringTpcs[i] = this.notenames.tonalPitchClasses[0].notes.indexOf(this.stringNotes[i].substring(0,this.stringNotes[i].length-1).toUpperCase());
				this.stringPitches[i] = this.notenames.tpc2pitch(this.stringTpcs[i]);
				this.stringOctaves[i] = parseInt(this.stringNotes[i].substr(this.stringNotes[i].length-1));
			}
		}
	}

	addInstrument(parent) {
		this.canvas_parent = parent;
		if (this.instrumentIndex == this.piano) this.addPiano(parent);
		else this.addStringInstrument(parent);
	}

	addStringInstrument(parent) {
		this.canvas_parent = parent;
		let windowWidth = window.innerWidth;
		this.scale = window.innerWidth * 0.8 / this.instrumentList[this.instrumentIndex].width;
		let w = Math.ceil((this.instrumentList[this.instrumentIndex].width)*this.scale);
		let h = Math.ceil((this.instrumentList[this.instrumentIndex].height)*this.scale);
		this.canvas = document.createElement('canvas');
		this.canvas.width = w;
		this.canvas.height = h;
		this.canvas_context = this.canvas.getContext('2d');
		this.image = new Image();
		this.image.src = this.image_dir+this.instrumentList[this.instrumentIndex].image;
		this.image_width = w;
		this.image_height = h;
		let _this = this;
		this.loaded = false;
		this.image.onload = function() {
			//console.log('image '+_this.image.src+' w '+_this.instrumentList[_this.instrumentIndex].width+' h '+_this.instrumentList[_this.instrumentIndex].height+ ' scale '+_this.scale);
			_this.canvas_context.drawImage(_this.image, 0, 0, _this.image_width, _this.image_height);
			_this.loaded = true;
			_this.drawStringChordNotes(_this.stringChordNotes);
		};
		let pos = [ [ 3, 'III'], [ 5, 'V'], [ 7 , 'VII' ], [ 10, 'X'], [ 12, 'XII'], [ 15, 'XV']];
		this.canvas_context.fillStyle = "#000000";
		this.canvas_context.font = Math.floor(this.instrumentList[this.instrumentIndex].width*this.scale/100)+'px Arial';
		let f = Math.pow(2,1/12);
		let l = this.instrumentList[this.instrumentIndex].string_length * this.scale;
		let hh = (this.instrumentList[this.instrumentIndex].height+20)*this.scale;
		for (let p=0; p<pos.length; p++) {
			let x = this.instrumentList[this.instrumentIndex].string_offset_x* this.scale  +l*(1-Math.pow(f,-pos[p][0]+.5));
			let y = (this.instrumentList[this.instrumentIndex].string_offset_y_mid+this.instrumentList[this.instrumentIndex].strings_width[1]/2 + 10) * this.scale;
			this.canvas_context.fillText(pos[p][1], x, y);
		}
		this.canvas_parent.append(this.canvas);
	}

	updateStringInstrument(parent) {
		if (this.canvas) this.canvas.remove();
		this.addStringInstrument(this.canvas_parent);
	}

	drawCircle(x, y, r, color) {
		this.canvas_context.beginPath();
		x = Math.floor(x);
		y = Math.floor(y);
		r = Math.floor(r);
		this.canvas_context.beginPath();
		this.canvas_context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.canvas_context.fillStyle = color;
		this.canvas_context.fill();
		this.canvas_context.fillStyle = "#000000";
		this.canvas_context.stroke();
	}

	drawStringChordNotes(stringChordNotes) {
		//console.log('drawStringChordNotes '+JSON.stringify(this.stringChordNotes));
		let l = this.instrumentList[this.instrumentIndex].string_length * this.scale;
		let offset_x = this.instrumentList[this.instrumentIndex].string_offset_x * this.scale;
		let offset_y = this.instrumentList[this.instrumentIndex].string_offset_y_mid * this.scale;
		let string_distance_0 = this.instrumentList[this.instrumentIndex].strings_width[0] * this.scale;
		let string_distance_1 = this.instrumentList[this.instrumentIndex].strings_width[1] * this.scale;
		let r = 0.4 * string_distance_0 / (this.instrumentList[this.instrumentIndex].strings.length-1);
		let st = this.instrumentList[this.instrumentIndex].strings.length;
		for (let n=0; n<stringChordNotes.length; n++) {
			let s = this.stringChordNotes[n].string;
			let p = this.stringChordNotes[n].string_pos;
			let f = this.notepositions[p];
			let x = offset_x + f*l-2*r;
			let y = offset_y + (string_distance_0+2*f*(string_distance_1-string_distance_0))*(st-1-2*s)/(st-1)/2; // ((st-1)/2-s);
			this.drawCircle(x,y,r,stringChordNotes[n].color);
		}
	}

	setPianoChordType(chordType, colors) {
		this.pianoChordType = chordType;
		this.colors = colors;
	}

	drawPath(scale, offset_x, offset_y, xy, color) {
		this.canvas_context.beginPath();
		let i=0, x, y;
		x = Math.floor(scale*(offset_x+xy[i][0]));
		y = Math.floor(scale*(offset_y+xy[i][1]));
		this.canvas_context.moveTo(x,y);
		for (let i=1; i<xy.length; i++) {
			x = Math.floor(scale*(offset_x+xy[i][0]));
			y = Math.floor(scale*(offset_y+xy[i][1]));
			this.canvas_context.lineTo(x,y);
		}
		this.canvas_context.closePath();
		if (color) {
			this.canvas_context.fillStyle = color;
			this.canvas_context.fill();
		} else this.canvas_context.stroke();
	}

	addPiano(parent) {
		console.log('addPiano');
		this.canvas_parent = parent;
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)*0.45;
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)*0.45;
		this.pianoscale = Math.min(vw/(this.piano_octaves*7*this.piano_wkw+2*this.piano_offset_x),vh/(this.piano_wkl+2*this.piano_offset_y));
		this.canvas_parent = parent;
		this.canvas = document.createElement('canvas');
		this.canvas.width = vw;
		this.canvas.height = vw*(2*this.piano_offset_y+this.piano_wkl)/(2*this.piano_offset_x+this.piano_octaves*7*this.piano_wkw);
		this.canvas_context = this.canvas.getContext('2d');
		this.canvas_parent.append(this.canvas);
		console.log('addPiano '+vw+'/'+vh);
		console.log('add screen w/h '+vw+'/'+vh+' canvas w/h '+this.canvas.width+'/'+this.canvas.height+' scale '+this.pianoscale+' piano w/h '+(this.piano_octaves*7*this.piano_wkw+2*this.piano_offset_x)+'/'+(this.piano_wkl+2*this.piano_offset_y));
		this.updatePiano();
	}

	updatePiano(parent) {
		console.log('updatePiano');
		this.canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (let o=0; o<this.piano_octaves; o++) {
			for (let i=0;i<this.piano_keys.length; i++) {
				let color = this.piano_black_keys.indexOf(i)!=-1?'black':null;
				if (this.pianoChordType.chordPitches.indexOf(i+12*o)==-1 && this.piano_black_keys.indexOf(i)!=-1) color = 'black';
				else color = null;
				this.drawPath(this.pianoscale, this.piano_offset_x+o*7*this.piano_wkw, this.piano_offset_y, this.piano_keys[i], color);
			}
		}

		let o=0, pn = this.pianoChordType.chordPitches[0];
		for (let i=0; i<this.pianoChordType.chordPitches.length; i++) {
			let n = this.pianoChordType.chordPitches[i];
			if (n<pn) o++;
			let p = (12+this.pianoChordType.chordPitches[i])%12;
			let c = (12+this.pianoChordType.chordPitches[i]-this.pianoChordType.chordPitches[0])%12;
			this.drawPath(this.pianoscale, this.piano_offset_x+ o*7*this.piano_wkw, this.piano_offset_y, this.piano_keys[p], this.colors[c]);
			pn = n ;
		}
	}

	update() {
		console.log('instruments update');
		if (this.instrumentIndex == this.piano) {
			console.log('instruments update -> piano');
			console.log('canvas '+JSON.stringify(this.canvas)+' parent '+JSON.stringify(this.parent));
			if (this.canvas) this.updatePiano(this.parent);
			else if (this.canvas_parent) this.addPiano(this.canvas_parent);
		} else {
			console.log('instruments update -> string instrument');
			if (this.canvas) this.updateStringInstrument(this.canvas_parent);
			else if (this.canvas_parent) this.addStringInstrument(this.canvas_parent);
		}
	}
}