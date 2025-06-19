class ChordTypes {
	
	constructor() {
	
		this.chordTypes = [
			[ "power",                            "5",      "C G"],
			[ "tritone",                          "b5",     "C Gb"],
			[ "sus2",                             "sus2",   "C D G"],
			[ "diminished",                       "o",      "C Eb Gb"],
			[ "minor",                            "m",      "C Eb G"],
			[ "major flat fifth",                 "b5",     "C E Gb"],
			[ "major",                            "",       "C E G"],
			[ "augmented",                        "+",      "C E G#"],
			[ "sus4",                             "sus4",   "C F G"],
			[ "diminished seventh",               "o7",     "C Eb Gb Bbb" ], // dim7
			[ "half-diminished seventh",          "ø",      "C Eb Gb Bb" ], // m7b5	
			[ "minor sixth",                      "m6",     "C Eb G A"],
			[ "minor seventh",                    "m7",     "C Eb G Bb"],
			[ "minor-major seventh",              "mM7",    "C Eb G B"],
			[ "minor add ninth",                  "m(add9)","C Eb G D"],
			[ "seven flat fifth",                 "7b5",    "C E Gb Bb"],
			[ "major 6",                          "6",      "C E G A"],
			[ "dominant 7",                       "7",      "C E G Bb"],
			[ "major 7",                          "∆7",     "C E G B"],
			[ "add ninth",                        "add9",   "C E G D"],
			[ "major 7 sus 4",                    "7sus4",  "C F G Bb"],
			[ "seventh augmented fifth",          "+7",     "C E G# Bb"],
			[ "minor ninth flat fifth",           "m9b5",   "C Eb Gb Bb D"],
			[ "minor ninth",                      "m9",     "C Eb G Bb D"],
			[ "minor major seventh flat ninth",   "m7b9",   "C Eb G B Db"],
			[ "ninth flat fifth",                 "9b5",    "C E Gb Bb D"],
			[ "sixth ninth",                      "6/9",    "C E G A D"],
			[ "seventh flat fifth flat ninth",    "7b5b9",  "C E Gb Bb Db"],
			[ "dominant 9",                       "9",      "C E G Bb D"],
			[ "seventh sharp ninth",              "7#9",    "C E G Bb D#"],
			[ "seventh flat fifth flat ninth",    "13b5b9", "C E Gb Bb Db"],
			[ "ninth sharp fifth",                "9#5",    "C E G# Bb D"],
			[ "minor 11",                         "m11",    "C Eb G Bb D F"],
			[ "dominant 11",                      "11",     "C E G Bb D F"],
			[ "seventh augmented eleventh",       "7#11",   "C E G Bb D F#"],
			[ "thirteenth flat fifth flat ninth", "13b5b9", "C E Gb Bb Db A"],
			[ "seventh diminished thirteenth",    "7b13",   "C E G Bb D F Ab"],
			[ "dominant 13",                      "13",     "C E G Bb D F A"]
		];

		this.r = [ '1', '#1', 'b2', '2', '#2', 'b3', '3', '#3', 'b4', '4', '#4', 'b5', '5', '#5', 'b6', '6', 'bb7', 'b7', '7', '#7',
			'b8', '8', '#8', 'b9', '9', '#9', 'b10', '10', '#10','b11', '11', '#11', 'b12', '12', '#12', 'b13', '13'];
		this.n = [ 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'Bbb', 'Bb', 'B', 'B#',
			'Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb',  'E',  'E#', 'Fb',  'F',  'F#',  'Gb',  'G',  'G#',  'Ab',  'A' ];

		this.notenames = new NoteNames();		
		this.baseNoteTpc = this.notenames.baseNoteTpcs[0];			
		this.chordType = 6;
		this.chordTpcs = [];
		this.chordNotes = [];
		this.chordPitches = [];
		this.chordRelativeNotes = [];
		
		this.allChordRelativeNotes = [];
		this.setAllRelativeNotes();
		this.setChord();
	}	

	setAllRelativeNotes() {
		this.allChordRelativeNotes = [];
		for (let c=0; c<this.chordTypes.length; c++) {
			let chord_notes = this.chordTypes[c][2].split(" ");
			this.allChordRelativeNotes[c] = [];
			for (let n=0; n<chord_notes.length; n++) {
				let s = n>4?23:(n>3?15:(n>2?15:(n>1?11:(n>0?3:0))));
				this.allChordRelativeNotes[c][n] = this.r.slice(s)[this.n.slice(s).indexOf(chord_notes[n])];
			}
		}
	}

	setChord() {
		let chord_notes = this.chordTypes[this.chordType][2].split(" ");
		this.chordTpcs = [];
		this.chordPitches = [];
		this.chordNotes = [];
		this.chordRelativeNotes = [];
		for (let n=0; n<chord_notes.length; n++) {
			this.chordTpcs[n] = this.baseNoteTpc-this.notenames.baseNoteTpcs[0]+this.notenames.note2tpc(chord_notes[n]);
			this.chordNotes[n] = this.notenames.tonalPitchClasses[this.notenames.langIndex].notes[this.chordTpcs[n]];
			this.chordPitches[n] = this.notenames.tpc2pitch(this.chordTpcs[n]);
		}
		this.chordRelativeNotes = this.allChordRelativeNotes[this.chordType];
		// console.log('setChord '+JSON.stringify(this.chordNotes)+' '+JSON.stringify(this.chordTpcs)+' '+JSON.stringify(this.chordPitches)+' '+JSON.stringify(this.chordRelativeNotes));
	}
		
	setBaseNoteTpc(b) {
		this.baseNoteTpc = this.notenames.baseNoteTpcs[b];
		this.setChord();
	}
	
	getBaseNote() {
		return this.notenames.baseNoteTpcs[this.baseNoteTpc];
	}

	setChordType(ct) {
		//console.log('setChordType '+this.chordType+'->'+ct);
		this.chordType = ct;
		this.setChord();
		//console.log('setChord '+this.chordType+'->'+ct);
	}
	
	getChordName() {
		return this.notenames.tonalPitchClasses[this.notenames.langIndex].notes[this.baseNoteTpc]+this.chordTypes[this.chordType][0];
	};
	
	getShortChordName() {
		return this.notenames.tonalPitchClasses[this.notenames.langIndex].notes[this.baseNoteTpc]+this.chordTypes[this.chordType][1]+' ('+this.chordTypes[this.chordType][0]+')';
	}
	
	getChordNotes() {
		return this.chordNotes;
	}
	
	getChordTpcs() {
		return this.chordTpcs;
	}
	
	getChordPitches() {
		return this.chordPitches;
	}

}