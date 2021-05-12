const instruments = [
	[ "Guitar", ["E2", "A2", "D3", "G3", "B3", "E4"]],
	[ "Bass guitar", ["E1", "A1", "D2", "G2"]],
	[ "Tenor banjo", ["C3", "G3", "D4", "A4"]],
	[ "Plectrum banjo", ["C3", "G3", "B3", "D4"]],
	[ "Violin", ["G3", "D4", "A4", "E5"]],
	[ "Viola", ["C3", "G3", "D4", "A4"]],
	[ "Cello", ["C2", "G2", "D3", "A3"]],
	[ "Double bass", ["E1", "A1", "D2", "G2"]]
];

var stringnotenumbers = [];

function addSelectInstrument() {
	var body = document.getElementsByTagName("body")[0];
	var label = document.createElement("label");
	label.for = "select-instrument";
	label.innerHTML = "Select instrument:";
	body.appendChild(label);
	var sel = document.createElement("select");
	sel.name = "instrument";
	sel.id = "select-instrument";
	sel.onchange = function() { selectInstrument(this); };
	for (var i=0; i<instruments.length; i++) {
		var option = document.createElement("option");
		option.value = instruments[i][0];
		var s = ":";
		for (var n=0; n<instruments[i][1].length; n++) {
			s += " "+instruments[i][1][n];
		}
		option.innerHTML = instruments[i][0]+s;
		sel.appendChild(option);
	}
	body.appendChild(sel);
}

function setInstrument(i) {
	stringnotes = instruments[i][1];
	strings = stringnotes.length;
	for (n=0;n<strings;n++) {
		var note = stringnotes[n].substring(0,stringnotes[n].length-1).toUpperCase();
		var p = scale.findIndex(e => e == note);
		console.log("string "+n+" "+note+" "+p);
		stringnotenumbers[n] = noteOffsets[p];
	}
	drawneck();
}

function selectInstrument(_this) {
	var name = _this.value;
	console.log("selectInstrument "+name);
	for (i=0;i<instruments.length;i++) {
		if (instruments[i][0] == name) {
			setInstrument(i);
			break;
		}
	}
	selectChord(baseNote,chordType);
}

// ♭ ♯
//              0     1     2     3     4     5    6    7    8    9    10   11   12    13    14    15    16
const scale = ["Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"];
const sl = scale.length;
const noteOffset = 6 ;
const order = [ 6, 13, 1, 8, 15, 3, 10, 5, 12, 0, 7, 14, 2, 9, 16, 4, 11 ];
const noteOffsets = [ 6, 1, 8, 3, 10, 5, 0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10 ];

const colors = [ "#FFFF00", "#FFCC88", "#FFCC00", "FF8800", "FF0000", "#CC0088", "#FF88FF", "#8800CC", "#0000FF", "#008888", "#00CC00", "#CCFF00" ];

var baseNote = noteOffset;

function setBaseNote(i) {
	baseNote = order[i];
}

function selectBaseNote(_this) {
	var value = _this.value;
	for (var i=0; i<scale.length;i++) {
		if (value == scale[i]) { setBaseNote(i); break; }		
	}
}

function addSelectNote() {
	var body = document.getElementsByTagName("body")[0];
	var label = document.createElement("label");
	label.for = "select-base-note";
	label.innerHTML = "Select base note:";
	body.appendChild(label);
	var sel = document.createElement("select");
	sel.name = "base-note";
	sel.id = "select-base-note";
	sel.onchange = function() { selectBaseNote(this); };
	for (var i=0; i<order.length; i++) {
		var option = document.createElement("option");
		option.value = scale[order[i]];
		option.innerHTML = scale[order[i]];
		sel.appendChild(option);
	}
	body.appendChild(sel);
}

const chordtypes = [
	[ "major", "C E G", ""],
	[ "major 6", "C E G A", "6"],
	[ "dominant 7", "C E G Bb", "7"],
	[ "major 7",  "C E G B", "∆7"],
	[ "augmented", "C E G#", "+"],
	[ "augmented seventh",  "C E G# Bb", "+7"],
	[ "minor",  "C Eb G", "m"],
	[ "minor sixth", "C Eb G A", "m6"],
	[ "minor seventh", "C Eb G Bb", "m7"],
	[ "minor-major seventh", "C Eb G B", "mM7"],
	[ "diminished", "C Eb Gb", "o"],
	[ "diminished seventh", "C Eb Gb A", "o7" ],
	[ "half-diminished seventh", "C Eb Gb Bb", "ø" ],
	[ "dominant 9", "C E G Bb D", "9"],
	[ "dominant 11", "C E G Bb D F", "11"],
	[ "dominant 13", "C E G Bb D F A", "13"],
	[ "seventh augmented fifth", "C E G# Bb", "7#5"],
	[ "seventh minor ninth", "C E G Bb Db", "7b9"],
	[ "seventh sharp ninth", "C E G Bb D#", "7#9"],
	[ "seventh augmented eleventh", "C E G Bb D F#", "7#11"],
	[ "seventh diminished thirteenth", "C E G Bb D F Ab", "7b13"],
	[ "half-diminished seventh", "C Eb Gb Bb", "m7b5"],
];

var chordnotenumbers = [], chordnoteoffsets = [] ;

function setChordNoteNumbers() {
	for (var i=0; i<chordtypes.length; i++) {
		var notes = chordtypes[i][1].split(" ");
		var notenumbers = [];
		var noteoffsets = [];
		for (var n=0; n<notes.length; n++) {
			notenumbers[n] = scale.indexOf(notes[n]);
			noteoffsets[n] = noteOffsets[notenumbers[n]];
		}
		chordnotenumbers[i] = notenumbers;
		chordnoteoffsets[i] = noteoffsets;
		console.log(chordtypes[i][1]+" "+chordnotenumbers[i]+" "+JSON.stringify(noteoffsets));
	}
}

function addSelectChord() {
	var body = document.getElementsByTagName("body")[0];
	var label = document.createElement("label");
	label.for = "select-chord-type";
	label.innerHTML = "Select chord-type:";
	body.appendChild(label);
	var sel = document.createElement("select");
	sel.name = "chord";
	sel.id = "select-chord-type";
	sel.onchange = function() { selectChordType(this); };
	for (var i=0; i<chordtypes.length; i++) {
		var option = document.createElement("option");
		option.value = chordtypes[i][0];
		option.innerHTML = chordtypes[i][0]+" : "+chordtypes[i][2];
		sel.appendChild(option);
	}
	body.appendChild(sel);
}

var chordType = 0;
var chordNoteOffsets = [];

function setChordType(i) {
	var s = "";
	for (var j=0; j<chordnotenumbers[chordType].length; j++) {
		var n = (sl+baseNote-noteOffset+chordnotenumbers[chordType][j])%sl;
		chordNoteOffsets[j] = 
		s += scale[n]+" ";
	}
	s=accidentals(s);
}

function selectChordType(_this) {
	setChordType(_this.selectedIndex);
}

function drawline(ctx, x1, y1, x2, y2) {
	ctx.beginPath();
	x1 = Math.floor(x1);
	y1 = Math.floor(y1);
	x2 = Math.floor(x2);
	y2 = Math.floor(y2);
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawcircle(ctx, x, y, r, color) {
	ctx.beginPath();
	x = Math.floor(x);
	y = Math.floor(y);
	r = Math.floor(r);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.fillStyle = "#000000";
	ctx.stroke();
}

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
var canvas, ctx, vl, l;
const borderwidth = 0.02*vw, h = 0.02*vw, offset = borderwidth;
const p = Math.exp(Math.log(2)/12);
const frets = 15;

function addCanvas() {
	canvas = document.getElementById("Chords");
	canvas = document.createElement("canvas");
	canvas.id= "Chords";
	canvas.width  = vw;
	canvas.height = 2*borderwidth+5*h;
	vl = canvas.width-2*offset-borderwidth, l = vl / (1 - Math.pow(p,-frets-1));
	document.getElementsByTagName("body")[0].appendChild(canvas);
	ctx = canvas.getContext("2d");
}

function drawneck() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	console.log(vw+" "+vh+"  vl "+vl+" l "+l+" p "+p);
	for (var i=0;i<strings;i++) {
		drawline(ctx, 2*offset, offset+i*h, offset+vl, offset+i*h);
	}
	for (var i=0;i<=frets;i++) {
		var x = 2*offset+l*(1-Math.pow(p,-i));
		drawline(ctx, x, offset, x, offset+(strings-1)*h);
	}
	ctx.fillStyle = "#000000";
	ctx.font = "16px Arial";
	var x, y;
	x = 1.5*offset+l*(1-Math.pow(p,+.2));
	for (var n=0;n<strings; n++) {
		ctx.fillText(stringnotes[strings-n-1], x, offset+n*h);
	}
	x = 2*offset+l*(1-Math.pow(p,-3+.5));
	ctx.fillText("III", x,  offset+strings*h);
	x = 2*offset+l*(1-Math.pow(p,-5+.5));
	ctx.fillText("V", x,  offset+strings*h);
	x = 2*offset+l*(1-Math.pow(p,-7+.5));
	ctx.fillText("VII", x,  offset+strings*h);
	x = 2*offset+l*(1-Math.pow(p,-10+.5));
	ctx.fillText("X", x,  offset+strings*h);
	x = 2*offset+l*(1-Math.pow(p,-12+.5));
	ctx.fillText("XII", x,  offset+strings*h);
	x = 2*offset+l*(1-Math.pow(p,-15+.5));
	ctx.fillText("XV", x,  offset+strings*h);
}

function accidentals(s) {
	var p = s.indexOf("b");
	while (p>=0) { s=s.substring(0,p)+"♭"+s.substring(p+1); p = s.indexOf("b"); }
	p = s.indexOf("#");
	while (p>=0) { s=s.substring(0,p)+"♯"+s.substring(p+1); p = s.indexOf("#"); }
	p = s.indexOf("x");
	while (p>=0) { s=s.substring(0,p)+"𝄪"+s.substring(p+1); p = s.indexOf("X"); }
	return s;
}

function setStringNote(str, pos, color) {
	var r = 7;
	var x = 2*offset+l*(1-Math.pow(p,-pos))-2*r;
	drawcircle(ctx, x, offset+(strings-str-1)*h, r, color);
}

function selectChord(b,c) {
	drawneck();
	var s = "";
	var notes = [] ;
	for (var j=0; j<chordnotenumbers[c].length; j++) {
		var n = (sl+b-noteOffset+chordnotenumbers[c][j])%sl;
		notes[j] = (noteOffsets[b]+chordnoteoffsets[c][j])%12;
		s += "<span style=\"background-color: "+colors[chordnoteoffsets[c][j]%12]+";\">"+scale[n]+"</span> ";
	}
	chordinfo.innerHTML = "Chord: "+scale[(sl+b-noteOffset+chordnotenumbers[c][0])%sl]+chordtypes[c][2]+" ("+chordtypes[c][0]+"): "+s;
	for (var i=0; i<notes.length; i++) {
		for (n=0;n<strings;n++) {
			var p = (12+notes[i]-stringnotenumbers[n])%12;				
			setStringNote(n, p, colors[chordnoteoffsets[c][i]%12]);
			p +=12;
			if (p<=frets) {
				setStringNote(n, p, colors[chordnoteoffsets[c][i]%12]);
			}
		}
	}
}

function addSelectTable() {
	var h1 = document.createElement("h1");
	h1.innerHTML="Chords";
	document.getElementsByTagName("body")[0].appendChild(h1);

	addSelectInstrument();

	var div = document.createElement("div");
	div.style.margin="20px";
	var table = document.createElement("table");
	table.border = "1";
	for (var o=0; o<order.length; o++) {
		var tr = document.createElement("tr");
		var i=order[o];
		for (var c=0; c<chordtypes.length; c++) {
			var td = document.createElement("td");
			var a = document.createElement("a");
			let p1 = i, p2 = c;
			a.onclick = function() { selectChord(p1,p2); };
			a.href="#";
			a.title = chordtypes[c][0];
			a.innerHTML = scale[(22+i-noteOffset+chordnotenumbers[c][0])%22] + chordtypes[c][2];
			td.appendChild(a);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	div.appendChild(table);
	document.getElementsByTagName("body")[0].appendChild(div);
}

function addSelectElements() {
	addSelectNote();
	addSelectChord();
}

var chordinfo ;

function addChordInfo() {
	chordinfo = document.createElement("p");
	chordinfo.id = "chordinfo";
	document.getElementsByTagName("body")[0].appendChild(chordinfo);
}

function init() {
	setChordNoteNumbers();
	addSelectTable();
	addChordInfo();
	addCanvas();
	setInstrument(0);
	setBaseNote(0);
	setChordType(0);
	selectChord(baseNote,chordType);
}


function showColors() {
	var body = document.getElementsByTagName("body")[0];
	var r=0,g=0,b=0, c, cn ;
	for (var i=0; i<12; i++) {
		var p = document.createElement("p");
		p.innerHTML = "xxxxxx  "+colors[i];
		p.style["background-color"]= colors[i];
		body.appendChild(p);
	}
}

function showChords() {
	for (var c=0; c<chordtypes.length; c++) {
		chordType = c ;
		for (var o=0; o<order.length; o++) {
			i=order[o];
			selectChord(i,c);
		}
	}
}