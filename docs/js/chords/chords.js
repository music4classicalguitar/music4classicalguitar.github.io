class Chords {

	constructor(parent_id, instrument) {		
		// accidentals: .replace('b','♭').replace('#','♯')
		// this.colors = [ '#FFFF00', '#FFCC88', '#FFCC00', '#FF8800', '#FF0000', '#CC0088', '#FF88FF', '#8800CC', '#0000FF', '#008888', '#00CC00', '#CCFF00' ];
		// too dark '#8800CC' -> '#DD00FF',   '#0000FF' -> '#6666FF'
		this.rnotes = [ '1',       '#1 / b2',   '2',       '#2 / b3',   '3',       '4',       '#4b / 5',   '5',       '#5 / b6',   '6',       '#6 / b7',   '7',
		                '8',       '#8 / b9',   '9',       '#9 / b10',  '10',      '11',      '#11 / b12', '12',      '#12 / b13', '13' ];
		this.cnotes = [ 'C',       'C# / Db', 'D',       'D# / Eb', 'E',       'F',       'F# / Gb', 'G',       'G# / Ab', 'A',       'A# / Bb', 'B' ];
		this.colors = [ '#FFFF00', '#FFCC88', '#FFCC00', '#FF8800', '#FF0000', '#CC0088', '#FF88FF', '#DD00FF', '#6666FF', '#008888', '#00CC00', '#CCFF00' ];
		this.instruments = new Instruments();
		if (instrument!='') {			
			this.instruments.instrumentIndex 
			let index = this.instruments.instrumentList.findIndex(s => s.instrument == instrument);
			if (index>=0) this.instruments.setInstrument(index);
		}
		this.notenames = new NoteNames();
		//this.instruments.notenames = this.notenames;
		this.chordtypes = new ChordTypes();
		this.chordtypes.notenames = this.notenames;
		//this.scalecolors = new ScaleColors();
		//this.colors = this.scalecolors.getColors();
		this.stringNotes = [];
		this.chordinfo;
		this.instrument_div;
		this.vexflow_div;
		this.vexflowNotes;
		this.debug = 0;
		
		this.parent = document.getElementById(parent_id);
		this.selectdiv = document.createElement('div');
		this.selectdiv.id = 'select-div';
		this.parent.append(this.selectdiv);
		let currentparent = this.selectdiv;
		
		this.addSelectInstrument(currentparent);
		this.addSelectBaseNoteTpc(currentparent);
		this.addSelectChordType(currentparent);
		//if (this.debug) console.log('addSelectScaleColor');
		//this.addSelectScaleColor(currentparent);
		
		/*
		this.showdiv = document.createElement('div');
		this.showdiv.id = 'show-div';
		this.parent.append(this.showdiv);
		currentparent = this.showdiv;
		*/
		currentparent = this.parent;

		//this.addInstrument(currentparent);
				
		this.setNotes();
		this.addChordInfo(currentparent);
		if (this.instruments.instrumentIndex == this.instruments.piano) this.instruments.setPianoChordType(this.chordtypes, this.colors);
		else this.instruments.setStringChordNotes(this.stringNotes);
		this.addInstrument(currentparent);
		//this.instruments.update();
		this.addVexflow(currentparent);
		
		//this.addColorTable(currentparent);
	}

	setPiano(i) {
		//this.drawPiano();
		console.log('setPiano '+i);
		this.update();
	}

	setStringInstrument(i) {
		this.update();
	}
	
	setInstrument(i) {
		this.instruments.setInstrument(i);
		this.update();
	}

	selectInstrument(sel) {
		this.setInstrument(sel.selectedIndex);
	}

	addSelectInstrument(parent) {
		let _this = this;
		let label = document.createElement('label');
		label.for = 'select-instrument';
		label.innerHTML = 'Select an instrument: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		let sel = document.createElement('select');
		sel.name = 'instrument';
		sel.id = 'select-instrument';
		sel.onchange = function() {
			_this.selectInstrument(this);
		};
		for (let  i=0; i<this.instruments.instrumentList.length; i++) {
			let  option = document.createElement('option');
			option.value = this.instruments.instrumentList[i].instrument;
			let  s = i==this.instruments.piano?'':':';
			for (let  n=0; n<this.instruments.instrumentList[i].strings.length; n++) {
				s += ' '+this.instruments.instrumentList[i].strings[n];
			}
			option.innerHTML = this.instruments.instrumentList[i].instrument+s;
			sel.appendChild(option);
		}
		sel.classList.add('chord_select_child');
		sel.selectedIndex = this.instruments.instrumentIndex;
		parent.appendChild(sel);
	}

	setBaseNoteTpc(i) {
		this.chordtypes.setBaseNoteTpc(i);
		this.update();
	}

	selectBaseNoteTpc(sel) {
		this.setBaseNoteTpc(sel.selectedIndex);
	}

	addSelectBaseNoteTpc(parent) {
		let _this = this;
		let p = document.createElement('p');
		parent.append(p);
		let label = document.createElement('label');
		label.for = 'select-base-note';
		label.innerHTML = 'Select base note: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		let sel = document.createElement('select');
		sel.name = 'base-note';
		sel.id = 'select-base-note';
		sel.onchange = function() { _this.selectBaseNoteTpc(this); };
		for (let i=0; i<this.notenames.baseNoteTpcs.length; i++) {
			let option = document.createElement('option');
			option.value = this.notenames.getBaseNote(i);
			option.innerHTML = option.value;
			sel.appendChild(option);
		}
		sel.classList.add('chord_select_child');
		parent.appendChild(sel);
	}

	setChordType(i) {
		this.chordtypes.setChordType(i);
		this.update();
	}

	selectChordType(sel) {
		this.setChordType(sel.selectedIndex);
	}

	addSelectChordType(parent) {
		let _this = this;
		let label = document.createElement('label');
		label.for = 'select-chord-type';
		label.innerHTML = 'Select chordtype: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		let sel = document.createElement('select');
		sel.name = 'chord';
		sel.id = 'select-chord-type';
		sel.onchange = function() { _this.selectChordType(this); };
		let len = 0;
		let optgroup;
		for (let i=0; i<this.chordtypes.chordTypes.length; i++) {
			let chord_notes = this.chordtypes.chordTypes[i][2].split(" ");
			if (chord_notes.length!=len) {
				if (optgroup) sel.appendChild(optgroup);
				len = chord_notes.length;
				optgroup = document.createElement("optgroup");
				optgroup.label = 'Chords with '+len+' notes';
			}
			let option = document.createElement("option");
			option.value = this.chordtypes.chordTypes[i][0];
			option.innerHTML = this.chordtypes.chordTypes[i][0]+(this.chordtypes.chordTypes[i][1]==''?'':' ('+this.chordtypes.chordTypes[i][1]+')');
			//+' &#160; &#160; e.g. ['+this.chordtypes.chordTypes[i][2]+']';
			optgroup.appendChild(option);
		}
		sel.appendChild(optgroup);
		sel.classList.add('chord_select_child');
		sel.selectedIndex = this.chordtypes.chordType;
		parent.appendChild(sel);
	}

	/*
	setScaleColor(sel) {
		this.scalecolors.setIndex(sel);
		this.update();
	}

	selectScaleColor(sel) {
		if (this.debug) console.log('selectChordType '+_this.selectedIndex);
		this.setScaleColor(sel.selectedIndex);
	}

	addSelectScaleColor(parent) {
		let _this = this;
		let label = document.createElement('label');
		label.for = 'select-scale-color';
		label.innerHTML = 'Select scale color: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		let sel = document.createElement('select');
		sel.name = 'scale-color';
		sel.id = 'select-scale-color';
		sel.onchange = function() { _this.selectScaleColor(this); };
		if (this.debug) console.log('scale-color '+JSON.stringify(this.chordtypes));
		for (let i=0; i<this.scalecolors.scalecolors.length; i++) {
			let option = document.createElement('option');
			option.value = this.scalecolors.scalecolors[i].mapping;
			option.innerHTML = this.scalecolors.scalecolors[i].mapping+' ('+this.scalecolors.scalecolors[i].year+')';
			sel.appendChild(option);
		}
		sel.classList.add('chord_select_child');
		sel.selectedIndex = this.scalecolors.index;
		parent.appendChild(sel);
	}
	*/
		
	addInstrument(parent) {
		this.instrument_div = document.createElement('div');
		this.instrument_div.id = 'instrument';
		this.instrument_div.classList.add('chord_child');
		this.instruments.addInstrument(this.instrument_div);
		parent.appendChild(this.instrument_div);
	}
	
	addChordInfo(parent) {
		this.chordinfo = document.createElement('div');
		this.chordinfo.id = 'chordinfo';
		this.chordinfo.innerHTML = 'Chord info';
		this.chordinfo.classList.add('chord_child');
		this.updateChordInfo();
		parent.appendChild(this.chordinfo);
	}

	addVexflow(parent) {
		// https://github.com/0xfe/vexflow/wiki/The-VexFlow-FAQ 
		this.vexflow_div = document.createElement('div');
		this.vexflow_div.id = 'vexflow';
		this.vexflow_div.classList.add('vexflow');
		parent.append(this.vexflow_div);
		let VF = Vex.Flow;
		let renderer = new VF.Renderer(this.vexflow_div.id, VF.Renderer.Backends.SVG);
		let w = this.vexflowNotes.length * 40;
		renderer.resize(w+100, 300);
		let context = renderer.getContext();
		let stave = new VF.Stave(10, 40, w);
		let clef = this.instruments.instrumentList[this.instruments.instrumentIndex].clef;
		let is_bass=0;
		switch(clef) {
			case 'treble': stave.addClef('treble'); break;
			case 'treble_8vb': stave.addClef('treble', 'default', '8vb'); break;
			case 'bass': stave.addClef('bass', 'default'); is_bass=1; break;
			case 'bass_8vb': stave.addClef('bass', 'default', '8vb'); is_bass=1; break;
		}
		stave.setContext(context).draw();
		let notes = [];
		let s = '';
		for (let i=0;i<this.vexflowNotes.length; i++) {
			let note = this.vexflowNotes[i].note.toLowerCase()+'/'+this.vexflowNotes[i].octave;
			s += note+' ';
			let accidental = this.vexflowNotes[i].note.substring(1);
			let color = this.vexflowNotes[i].color;
			// let vexflowNote = is_bass=1?new VF.StaveNote({clef: "bass", keys: [note], duration: 'q' }):new VF.StaveNote({clef: "treble", keys: [note], duration: 'q' });
			let vexflowNote =new VF.StaveNote({keys: [note], duration: 'q' });
			if (accidental !='') vexflowNote.addAccidental(0, new VF.Accidental(accidental));
			vexflowNote.setStyle({fillStyle: color, strokeStyle: color});
			if (this.vexflowNotes[i].spn<48) vexflowNote.setStemDirection(Vex.Flow.Stem.UP);
			else vexflowNote.setStemDirection(Vex.Flow.Stem.DOWN);
			notes.push(vexflowNote);
			if (accidental !='') accidental='n';
		}
		let voice = new Vex.Flow.Voice({num_beats: this.vexflowNotes.length, beat_value: 4});
		voice.addTickables(notes);
		var formatter = new VF.Formatter();
		formatter.joinVoices([voice]).formatToStave([voice], stave);
		voice.draw(context, stave);
		//console.log('Notes:'+notes.length);
		// console.log('vexflow notes '+s);
	}
	
	updateVexflow(parent) {
		console.log('Update vexflow');
		this.vexflow_div.remove();
		this.addVexflow(this.parent);
	}

	adaptContent(s) {
		switch(s.length) {
			case 1: return '&#160; &#160; '+s+' &#160; &#160;';
			case 2: return ' &#160; '+s+' &#160; &#160;';
			case 7: return ' '+s+' ';
			case 8: return ' '+s;
			default: return s;
		}
	}
	addColorTable(parent) {
		let div = document.createElement('div');
		let p = document.createElement('p');
		p.innerHTML = 'Colors used are :';
		parent.append(p);
		let table = document.createElement('table');
		
		let tr = document.createElement('tr');
		for (let c=0; c<this.colors.length; c++) {
			let td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			td.innerHTML = this.adaptContent(this.rnotes[c]);
			tr.append(td);
		}
		table.append(tr);
		
		tr = document.createElement('tr');
		for (let c=0; c<this.colors.length; c++) {
			let td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			if (c+12<this.rnotes.length) td.innerHTML = this.adaptContent(this.rnotes[c+12]);
			tr.append(td);
		}
		table.append(tr);

		tr = document.createElement('tr');
		for (let c=0; c<this.colors.length; c++) {
			let td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			td.innerHTML =this.adaptContent(this.cnotes[c]);
			tr.append(td);
		}
		table.append(tr);

		tr = document.createElement('tr');
		for (let c=0; c<this.colors.length; c++) {
			let td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			td.innerHTML = ' '+this.colors[c];
			tr.append(td);
		}
		table.append(tr);

		div.append(table);
		parent.append(div);
	}	

	setNotes() {
		this.stringNotes = [];
		this.vexflowNotes = [];
		if (this.instruments.instrumentIndex == this.instruments.piano) {
			this.setPianoNotes();
		} else {
			this.setStringChordNotes();
		}
	}
	
	setPianoNotes() {
		console.log('chords setPianoNotes');
		let octave = 4;
		let noteNames = "CDEFGAB";
		let previousChordNoteIndex = noteNames.indexOf(this.chordtypes.chordNotes[0].substr(0,1));
		for (let c=0; c<this.chordtypes.chordPitches.length; c++) {
			if (noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1))<previousChordNoteIndex) octave++;
			let spn = octave*12+this.chordtypes.chordPitches[c] ;
			let color = this.colors[(12+this.chordtypes.chordPitches[c]-this.chordtypes.chordPitches[0])%12];
			console.log('piano tpc ' + this.chordtypes.chordTpcs[c] + ' notes o '+octave+' n '+this.chordtypes.chordNotes[c]+' p '+this.chordtypes.chordPitches[c]);
			this.vexflowNotes.push({ spn: spn, note: this.chordtypes.chordNotes[c], octave: octave, color: color });
			previousChordNoteIndex = noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1));
		}
		this.instruments.setPianoChordType(this.chordtypes, this.colors);
	}

	setStringChordNotes() {
		//console.log('chords setStringChordNotes '+JSON.stringify(this.instruments.stringNotes));
		let noteNames = 'CDEFGAB';
		let octave_transpose = Math.floor(this.instruments.instrumentList[this.instruments.instrumentIndex].transpose/12);
		for (let c=0; c<this.chordtypes.chordPitches.length; c++) {
			for (let i=0; i<this.instruments.instrumentList[this.instruments.instrumentIndex].strings.length; i++) {
				let octave = parseInt(this.instruments.instrumentList[this.instruments.instrumentIndex].strings[i].substr(1,1))+octave_transpose;
				let stringChordNoteIndex = noteNames.indexOf(this.instruments.instrumentList[this.instruments.instrumentIndex].strings[i].substr(0,1));
				//console.log('octave '+octave);
				if (noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1))<stringChordNoteIndex) octave++;
				//console.log('octave '+octave+' stringChordNoteIndex '+stringChordNoteIndex+' '+noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1)) );
				let stringPosition = (12+this.chordtypes.chordPitches[c]-this.chordtypes.notenames.tpc2pitch(this.instruments.stringTpcs[i]))%12;
				let spn = this.chordtypes.chordPitches[c]+octave*12 ;
				let color = this.colors[(12+this.chordtypes.chordPitches[c]-this.chordtypes.chordPitches[0])%12];
				this.stringNotes.push({string: i, string_pos: stringPosition, octave: octave, tpc: this.chordtypes.chordTpcs[c], pitch: this.chordtypes.chordPitches[c], note: this.chordtypes.chordNotes[c], spn: spn, color: color });
				const duplicate = this.vexflowNotes.some(entry => entry.spn === spn);
				if (!duplicate) this.vexflowNotes.push({string: i, string_pos: stringPosition, spn: spn, note: this.chordtypes.chordNotes[c], octave: octave, color: color });
				/*
				console.log('String:'+i+' '+this.chordtypes.chordNotes[c]+'=> '+this.instruments.stringNotes[i]+'/'+' '+stringPosition+' : '+
					this.chordtypes.chordTpcs[c]+' '+this.instruments.stringTpcs[i]+' '+
					this.chordtypes.chordNotes[c]+'/'+octave);
				*/
				
				if (stringPosition+12<=this.instruments.frets) {
					octave++;
					stringPosition += 12;
					spn = this.chordtypes.chordPitches[c]+octave*12 ;
					this.stringNotes.push({string: i, string_pos: stringPosition, octave: octave, tpc: this.chordtypes.chordTpcs[c], pitch: this.chordtypes.chordPitches[c], note: this.chordtypes.chordNotes[c], spn: spn, color: color });
					/*
					console.log('String:'+i+' '+this.chordtypes.chordNotes[c]+'=> '+this.instruments.stringNotes[i]+'/'+' '+stringPosition+' : '+
						this.chordtypes.chordTpcs[c]+' '+this.instruments.stringTpcs[i]+' '+
						this.chordtypes.chordNotes[c]+'/'+octave);
					*/
					//console.log(this.stringNotes[this.stringNotes.length-1]);
					const duplicate = this.vexflowNotes.some(entry => entry.spn === spn);
					if (!duplicate) this.vexflowNotes.push({string: i, string_pos: stringPosition, spn: spn, note: this.chordtypes.chordNotes[c], octave: octave, color: color });
				}
			}
		}
		this.vexflowNotes.sort(function(a, b) {
			if (a['octave'] < b['octave']) {
				return -1;
			} else if (a['octave'] > b['octave']) {
				return 1;
			} else {
				if ('CDEFGAB'.indexOf(a['note'].substr(0,1))<'CDEFGAB'.indexOf(b['note'].substr(0,1))) {
					return -1;
				} else if ('CDEFGAB'.indexOf(a['note'].substr(0,1))>'CDEFGAB'.indexOf(b['note'].substr(0,1))) {
					return 1;
				}
				return 0;
			}
		return 0;
		});
		//console.log(JSON.stringify(this.vexflowNotes));
		this.instruments.setStringChordNotes(this.stringNotes);
	}
	
	
	updateChordInfo() {
		this.chordinfo.firstChild.remove();
		let p = document.createElement('p');
		// 'Instrument '+this.instruments.instrumentList[this.instruments.instrumentIndex].instrument+' 
		let t = document.createTextNode('Chord: '+this.chordtypes.getShortChordName()+' ');
		p.append(t);
		for (let c=0; c<this.chordtypes.chordNotes.length; c++) {
			let s = document.createElement('span');
			s.style['background-color'] = this.colors[(12+this.chordtypes.chordPitches[c]-this.chordtypes.chordPitches[0])%12];
			s.innerHTML = this.chordtypes.chordNotes[c].replace('b','♭').replace('#','♯');
			p.append(s);
			t = document.createTextNode(' ');
			p.append(t);
		}
		let s = ' (';
		for (let c=0; c<this.chordtypes.chordRelativeNotes.length; c++) {
			s+= this.chordtypes.chordRelativeNotes[c]+' ';
		}
		s += ')';
		t = document.createTextNode(s);
		p.append(t);
		this.chordinfo.append(p);
	}
		
	update() {
		this.setNotes();
		this.updateChordInfo();
		if (this.instruments.instrumentIndex == this.instruments.piano) this.instruments.setPianoChordType(this.chordtypes, this.colors);
		else this.instruments.setStringChordNotes(this.stringNotes);
		this.updateChordInfo();
		this.instruments.update();
		this.updateVexflow(this.parent);
	}
}