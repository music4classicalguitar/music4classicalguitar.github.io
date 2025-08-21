class Diagrams {
	constructor(parent_id, instrument) {
		this.rnotes = [ '1',       '#1 / b2',   '2',       '#2 / b3',   '3',       '4',       '#4b / 5',   '5',       '#5 / b6',   '6',       '#6 / b7',   '7',
						'8',       '#8 / b9',   '9',       '#9 / b10',  '10',      '11',      '#11 / b12', '12',      '#12 / b13', '13' ];
		this.cnotes = [ 'C',       'C# / Db', 'D',       'D# / Eb', 'E',       'F',       'F# / Gb', 'G',       'G# / Ab', 'A',       'A# / Bb', 'B' ];
		this.colors = [ '#FFFF00', '#FFCC88', '#FFCC00', '#FF8800', '#FF0000', '#CC0088', '#FF88FF', '#DD00FF', '#6666FF', '#008888', '#00CC00', '#CCFF00' ];
		this.instruments = new Instruments();
		this.instruments.instrumentList = this.instruments.instrumentList.filter((entry) => entry.instrument !='Piano/Keyboard');
		this.notenames = new NoteNames();
		this.chordtypes = new ChordTypes();
		this.chordtypes.notenames = this.notenames;
		this.stringNotes = [];
		this.chordinfo;
		this.instrument_div;
		
		this.parent = document.getElementById(parent_id);
		this.selectdiv = document.createElement('div');
		this.selectdiv.id = 'select-div';
		this.parent.append(this.selectdiv);
		var currentparent = this.selectdiv;
		
		this.addSelectInstrument(currentparent);
		this.addSelectBaseNoteTpc(currentparent);
		this.addSelectChordType(currentparent);

		currentparent = this.parent;
		this.setNotes();
		this.addChordInfo(currentparent);
		if (instrument!='') {
			var index = this.instruments.instrumentList.findIndex(s => s.instrument == instrument);
			if (index>=0) this.setInstrument(index);
			var sel = document.getElementById('select-instrument');
			sel.selectedIndex = this.instruments.instrumentIndex;
		}
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
		var _this = this;
		var label = document.createElement('label');
		label.for = 'select-instrument';
		label.innerHTML = 'Select an instrument: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		var sel = document.createElement('select');
		sel.name = 'instrument';
		sel.id = 'select-instrument';
		sel.onchange = function() {
			_this.selectInstrument(this);
		};
		for (var  i=0; i<this.instruments.instrumentList.length; i++) {
			var  option = document.createElement('option');
			option.value = this.instruments.instrumentList[i].instrument;
			var s = ' ';
			for (var  n=0; n<this.instruments.instrumentList[i].strings.length; n++) {
				s += this.instruments.instrumentList[i].strings[n];
			}
			option.innerHTML = this.instruments.instrumentList[i].instrument+s;
			sel.appendChild(option);
		}
		sel.classList.add('chord_select_child');
		sel.selectedIndex = this.instrumentIndex;
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
		var _this = this;
		var p = document.createElement('p');
		parent.append(p);
		var label = document.createElement('label');
		label.for = 'select-base-note';
		label.innerHTML = 'Select base note: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		var sel = document.createElement('select');
		sel.name = 'base-note';
		sel.id = 'select-base-note';
		sel.onchange = function() { _this.selectBaseNoteTpc(this); };
		for (var i=0; i<this.notenames.baseNoteTpcs.length; i++) {
			var option = document.createElement('option');
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
		var _this = this;
		var label = document.createElement('label');
		label.for = 'select-chord-type';
		label.innerHTML = 'Select chordtype: ';
		label.classList.add('chord_select_child');
		parent.appendChild(label);
		var sel = document.createElement('select');
		sel.name = 'chord';
		sel.id = 'select-chord-type';
		sel.onchange = function() { _this.selectChordType(this); };
		var len = 0;
		var optgroup;
		for (var i=0; i<this.chordtypes.chordTypes.length; i++) {
			var chord_notes = this.chordtypes.chordTypes[i][2].split(" ");
			if (chord_notes.length!=len) {
				if (optgroup) sel.appendChild(optgroup);
				len = chord_notes.length;
				optgroup = document.createElement("optgroup");
				optgroup.label = 'Chords with '+len+' notes';
			}
			var option = document.createElement("option");
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
	addInstrument(parent) {
		this.instrument_div = document.createElement('div');
		this.instrument_div.id = 'instrument';
		this.instrument_div.classList.add('chord_child');
		this.instruments.addInstrument(this.instrument_div);
		parent.appendChild(this.instrument_div);
	}
	*/
	addChordInfo(parent) {
		this.chordinfo = document.createElement('div');
		this.chordinfo.id = 'chordinfo';
		this.chordinfo.innerHTML = 'Chord info';
		this.chordinfo.classList.add('chord_child');
		this.updateChordInfo();
		parent.appendChild(this.chordinfo);
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
		var div = document.createElement('div');
		var p = document.createElement('p');
		p.innerHTML = 'Colors used are :';
		parent.append(p);
		var table = document.createElement('table');
		
		var tr = document.createElement('tr');
		for (var c=0; c<this.colors.length; c++) {
			var td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			td.innerHTML = this.adaptContent(this.rnotes[c]);
			tr.append(td);
		}
		table.append(tr);
		
		tr = document.createElement('tr');
		for (var c=0; c<this.colors.length; c++) {
			var td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			if (c+12<this.rnotes.length) td.innerHTML = this.adaptContent(this.rnotes[c+12]);
			tr.append(td);
		}
		table.append(tr);

		tr = document.createElement('tr');
		for (var c=0; c<this.colors.length; c++) {
			var td = document.createElement('td');
			td.style['background-color'] = this.colors[c];
			td.innerHTML =this.adaptContent(this.cnotes[c]);
			tr.append(td);
		}
		table.append(tr);

		tr = document.createElement('tr');
		for (var c=0; c<this.colors.length; c++) {
			var td = document.createElement('td');
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
		this.allNotes = [];
		this.setStringChordNotes();
	}

	setStringChordNotes() {
		//console.log('chords setStringChordNotes '+JSON.stringify(this.instruments.stringNotes));
		var noteNames = 'CDEFGAB';
		var octave_transpose = Math.floor(this.instruments.instrumentList[this.instruments.instrumentIndex].transpose/12);
		for (var c=0; c<this.chordtypes.chordPitches.length; c++) {
			for (var i=0; i<this.instruments.instrumentList[this.instruments.instrumentIndex].strings.length; i++) {
				var octave = parseInt(this.instruments.instrumentList[this.instruments.instrumentIndex].strings[i].substr(1,1))+octave_transpose;
				var stringChordNoteIndex = noteNames.indexOf(this.instruments.instrumentList[this.instruments.instrumentIndex].strings[i].substr(0,1));
				//console.log('octave '+octave);
				if (noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1))<stringChordNoteIndex) octave++;
				//console.log('octave '+octave+' stringChordNoteIndex '+stringChordNoteIndex+' '+noteNames.indexOf(this.chordtypes.chordNotes[c].substr(0,1)) );
				var stringPosition = (12+this.chordtypes.chordPitches[c]-this.chordtypes.notenames.tpc2pitch(this.instruments.stringTpcs[i]))%12;
				var spn = this.chordtypes.chordPitches[c]+octave*12 ;
				var color = this.colors[(12+this.chordtypes.chordPitches[c]-this.chordtypes.chordPitches[0])%12];
				this.stringNotes.push({string: i, string_pos: stringPosition, octave: octave, tpc: this.chordtypes.chordTpcs[c], pitch: this.chordtypes.chordPitches[c], note: this.chordtypes.chordNotes[c], spn: spn, color: color });
				const duplicate = this.allNotes.some(entry => entry.spn === spn);
				if (!duplicate) this.allNotes.push({string: i, string_pos: stringPosition, spn: spn, note: this.chordtypes.chordNotes[c], octave: octave, color: color });
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
					const duplicate = this.allNotes.some(entry => entry.spn === spn);
					if (!duplicate) this.allNotes.push({string: i, string_pos: stringPosition, spn: spn, note: this.chordtypes.chordNotes[c], octave: octave, color: color });
				}
			}
		}
		this.allNotes.sort(function(a, b) {
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
		this.instruments.setStringChordNotes(this.stringNotes);
	}

	updateChordInfo() {
		this.chordinfo.firstChild.remove();
		var p = document.createElement('p');
		// 'Instrument '+this.instruments.instrumentList[this.instruments.instrumentIndex].instrument+' 
		var t = document.createTextNode('Chord: '+this.chordtypes.getShortChordName()+' ');
		p.append(t);
		for (var c=0; c<this.chordtypes.chordNotes.length; c++) {
			var s = document.createElement('span');
			s.style['background-color'] = this.colors[(12+this.chordtypes.chordPitches[c]-this.chordtypes.chordPitches[0])%12];
			s.innerHTML = this.chordtypes.chordNotes[c].replace('b','♭').replace('#','♯');
			p.append(s);
			t = document.createTextNode(' ');
			p.append(t);
		}
		var s = ' (';
		for (var c=0; c<this.chordtypes.chordRelativeNotes.length; c++) {
			s+= this.chordtypes.chordRelativeNotes[c]+' ';
		}
		s += ')';
		t = document.createTextNode(s);
		p.append(t);
		this.chordinfo.append(p);
	}

	removeDiagrams() {
		var elements = document.getElementsByClassName('diagram');
		while(elements.length > 0) {
			elements[0].parentNode.removeChild(elements[0]);
		}
	}

	drawCircle(canvas_context, x, y, r, color) {
		canvas_context.beginPath();
		canvas_context.arc(x, y, r, 0, 2 * Math.PI, false);
		canvas_context.fillStyle = color;
		canvas_context.fill();
		canvas_context.fillStyle = "#000000";
		canvas_context.stroke();
	}

	generateDiagram(s, p, r, diagramNotes) {
		var fret = p==0?0:p;
		if (p) p = p-1;
		var tpcs = [].concat(...diagramNotes).map(({tpc})=>tpc);
		var strings = [].concat(...diagramNotes).map(({string})=>string);
		var pos = [].concat(...diagramNotes).map(({string_pos})=>string_pos);
		var diagram_parent = document.getElementById('diagram_parent');
		var div = document.createElement('div');
		div.classList.add('diagram');
		div.style = 'display: inline-block';
		var canvas = document.createElement('canvas');
		var canvas_context = canvas.getContext('2d');
		var h = 20;
		var width = (s+1)*h+3*h;
		var height = (r+2)*h;
		canvas.width = width;
		canvas.height = height;
		var h = 20;
		for (var i=0;i<r+1;i++) {
			canvas_context.beginPath();
			canvas_context.moveTo(h,(i+1)*h);
			canvas_context.lineTo(s*h,(i+1)*h);
			canvas_context.strokeStyle = '#000000';
			canvas_context.lineWidth = (i==0 && p==0) ? 6:1;
			canvas_context.stroke();
		}
		for (var i=0;i<s;i++) {
			canvas_context.beginPath();
			canvas_context.moveTo((i+1)*h,h);
			canvas_context.lineTo((i+1)*h,(r+1)*h);
			canvas_context.stroke();
			canvas_context.strokeStyle = '#000000';
			canvas_context.lineWidth = 2;
		}
		for (var i=0; i<diagramNotes.length; i++) {
			var note = diagramNotes[i];
			this.drawCircle(canvas_context, (note.string+1)*h, (note.string_pos-p+0.5)*h, h/4,note.color);
		}
		//console.log
		for (var i=0; i<s; i++) {
			if (!strings.includes(i)) {
				canvas_context.font = "10px Arial";
				const xw = canvas_context.measureText('X').width;
				canvas_context.fillText('X',(i+1)*h-xw/2,h/2);
			}
			//this.drawCross((note.string+1)*h)
		}
		const r_p = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
		if (fret) {
			// 'fret '+fret.toString()
			canvas_context.font = h+"px Arial";
			canvas_context.fillText(r_p[fret-1],(s+1)*h,3/2*h);
		}
		div.append(canvas);
		diagram_parent.append(div);

	}

	generateDiagrams(stringNotes) {
		this.removeDiagrams();
		var s = this.instruments.instrumentList[this.instruments.instrumentIndex].strings.length;
		var r = 4;
		for (var p=0;p<12;p++) {
			var diagramNotes = stringNotes.filter((note) => note.string_pos>=p && note.string_pos<p+r);
			var pos = [].concat(...diagramNotes).map(({string_pos})=>string_pos);
			if (p == 0 && pos.includes(p)) this.generateDiagram(s, p, r, diagramNotes);
			else if (p>1 && pos.includes(p)) this.generateDiagram(s, p, r, diagramNotes);
		}
	}

	update() {
		this.setNotes();
		this.updateChordInfo();
		this.generateDiagrams(this.stringNotes);
	}
}