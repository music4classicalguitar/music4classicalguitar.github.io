class Instruments {

	constructor() {

		// strings_width at pos: 0 and l/2
		this.instrumentList = [
			{ instrument: 'Guitar', strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
				image: 'GuitarNeck.png', width: '840', height: '160',
				string_offset_x: '67', string_offset_y_mid: '80', string_length: '1312', strings_width: ['86', '101'],
				clef: 'treble_8vb', transpose: 12
			},
			{ instrument: 'Bass guitar/Double bass', strings: ['E1', 'A1', 'D2', 'G2'],
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
			}
		];

		this.instrumentIndex = 0;
		this.notenames = new NoteNames();
		this.frets = 15;
		this.strings ;
		this.stringTpcs = [];
		this.stringPitches = [];
		this.stringNotes = [];
		this.stringOctaves = [];
		this.setInstrument(this.instrumentIndex);

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

		this.colors;
	}

	setStringChordNotes(stringChordNotes, colors) {
		this.stringChordNotes = stringChordNotes;
		this.colors = colors;
	}

	setInstrument(instrumentIndex) {
		this.instrumentIndex = instrumentIndex;
		this.stringNotes = this.instrumentList[this.instrumentIndex].strings;
		this.strings = this.stringNotes.length;
		this.stringTpcs = [];
		for (var i=0; i<this.strings; i++) {
			this.stringTpcs[i] = this.notenames.tonalPitchClasses[0].notes.indexOf(this.stringNotes[i].substring(0,this.stringNotes[i].length-1).toUpperCase());
			this.stringPitches[i] = this.notenames.tpc2pitch(this.stringTpcs[i]);
			this.stringOctaves[i] = parseInt(this.stringNotes[i].substr(this.stringNotes[i].length-1));
		}
	}

	addInstrument(parent) {
		this.canvas_parent = parent;
		this.addStringInstrument(parent);
	}
}