class NoteNames {
	
	constructor() {
		this.tonalPitchClasses = [
			{ langName: 'English', notes: [
				'Fbb', 'Cbb', 'Gbb', 'Dbb', 'Abb', 'Ebb', 'Bbb',
				'Fb',  'Cb',  'Gb',  'Db',  'Ab',  'Eb',  'Bb',
				'F',   'C',   'G',   'D',   'A',   'E',   'B',
				'F#',  'C#',  'G#',  'D#',  'A#',  'E#',  'B#',
				'F##', 'C##', 'G##', 'D##', 'A##', 'E##', 'B##'
			]},
			{ langName: 'French', notes: [
				'Fabb', 'Dobb', 'Solbb', 'Rébb', 'Labb', 'Mibb', 'Sibb',
				'Fab',  'Dob',  'Solb',  'Réb',  'Lab',  'Mib',  'Sib',
				'Fa',   'Do',   'Sol',   'Ré',   'La',   'Mi',   'Si',
				'Fa#',  'Do#',  'Sol#',  'Ré#',  'La#',  'Mi#',  'Si#',
				'Fa##', 'Do##', 'Sol##', 'Ré##', 'La##', 'Mi##', 'Si##'
			]},
			{ langName: 'German', notes: [
				'fbb', 'cbb', 'gbb', 'dbb', 'abb', 'ebb', 'Bb',
				'fb',  'cb',  'gb',  'db',  'ab',  'eb',  'B',
				'F',   'C',   'G',   'D',   'A',   'E',   'H',
				'f#',  'c#',  'g#',  'd#',  'a#',  'e#',  'b#',
				'f##', 'c##', 'g##', 'd##', 'a##', 'e##', 'b##'
			]}
		];
		this.langIndex = 0;

		this.baseNotes =     [ 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
		this.baseNoteTpcs =  [ 15,   22,   10,  17,  24,    12,  19,  14,   21,    9,  16,   23,   11,  18,   25,   13,  20 ];
	}	
	
	setNoteLanguage(i) {
		this.langIndex = i;
	}
	
	getNoteLanguage() {
		return this.tonalPitchClasses[this.langIndex].langName;
	}
	
	setNoteLanguageByName(langName) {
		for (var i=0; i<tonalPitchClasses.length; i++) {
			if (tonalPitchClasses[i].langName == langName) {
				this.langIndex = i;
				return;
			}
		};
		console.log("Language '" + langName +"' not found");			
	}
	
	getBaseNote(i) {
		return this.baseNotes[i];
	}
	
	getBaseNoteTpc(i) {
		return this.baseNoteTpcs[i];
	}
	
	// pitch : C 0 C#/Db 1 ...
	// 'col' : tpc % 7, 'row' : Math.floor(tcp/7)
	tpc2pitch(tpc) {
		return (3+7*(tpc%7)+Math.floor(tpc/7))%12;
	}

	note2tpc(note) {
		return this.tonalPitchClasses[0].notes.indexOf(note);
	}

	note2pitch(note) {
		return this.tpc2pitch(this.tonalPitchClasses[0].notes.indexOf(note));
	}
}