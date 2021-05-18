const tonalPitchClass = [
	"Fbb", "Cbb", "Gbb", "Dbb", "Abb", "Ebb", "Bbb",
	"Fb", "Cb", "Gb", "Db", "Ab", "Eb", "Bb",
	"F", "C", "G", "D", "A", "E", "B",
	"F#", "C#", "G#", "D#", "A#", "E#", "B#",
	"F##", "C##", "G##", "D##", "A##", "E##", "B##"];
const tpcl = tonalPitchClass.length;
const notes = [ 15, 22, 10, 17, 24, 12, 19, 14, 21, 9, 16, 23, 11, 18, 25, 13, 20];
const colors = [ "#FFFF00", "#FFCC88", "#FFCC00", "#FF8800", "#FF0000", "#CC0088", "#FF88FF", "#8800CC", "#0000FF", "#008888", "#00CC00", "#CCFF00" ];

// C 0 C#/Db 1 ...
// 'col' : tpc % 7, 'row' : Math.floor(tcp/7)
function tpc2pitch(tpc) {
	return (3+7*(tpc%7)+Math.floor(tpc/7))%12;
}

function note2tpc(note) {
	return tonalPitchClass.indexOf(note);
}

function note2pitch(note) {
	return tpc2pitch(tonalPitchClass.indexOf(note));
}

const chordTypes = [
	[ "diminished", "C Eb Gb", "o"],
	[ "minor",  "C Eb G", "m"],
	[ "major", "C E G", ""],
	[ "augmented", "C E G#", "+"],
	[ "diminished seventh", "C Eb Gb Bbb", "o7" ],
	[ "half-diminished seventh", "C Eb Gb Bb", "ø" ],
	[ "minor sixth", "C Eb G A", "m6"],
	[ "minor seventh", "C Eb G Bb", "m7"],
	[ "minor-major seventh", "C Eb G B", "mM7"],
	[ "major 6", "C E G A", "6"],
	[ "dominant 7", "C E G Bb", "7"],
	[ "major 7",  "C E G B", "∆7"],
	[ "seventh augmented fifth", "C E G# Bb", "+7"],
	[ "seventh minor ninth", "C E G Bb Db", "7b9"],
	[ "dominant 9", "C E G Bb D", "9"],
	[ "seventh sharp ninth", "C E G Bb D#", "7#9"],
	[ "dominant 11", "C E G Bb D F", "11"],
	[ "seventh augmented eleventh", "C E G Bb D F#", "7#11"],
	[ "seventh diminished thirteenth", "C E G Bb D F Ab", "7b13"],
	[ "dominant 13", "C E G Bb D F A", "13"]
];

var chordType = 2, chordTpcs = [], chordPitches = [];

function setChordPitches() {
	for (var i=0; i<chordTypes.length; i++) {
		var notes = chordTypes[i][1].split(" ");
		chordTpcs[i] = [];
		chordPitches[i] = [];
		for (var n=0; n<notes.length; n++) {
			chordTpcs[i][n] = note2tpc(notes[n]);
			chordPitches[i][n] = note2pitch(notes[n]);
		}
	}
}

const instruments = [
	[ "Guitar", ["E2", "A2", "D3", "G3", "B3", "E4"]],
	[ "Bass guitar", ["E1", "A1", "D2", "G2"]],
	[ "Tenor banjo", ["C3", "G3", "D4", "A4"]],
	[ "Plectrum banjo", ["C3", "G3", "B3", "D4"]],
	[ "Violin", ["G3", "D4", "A4", "E5"]],
	[ "Viola", ["C3", "G3", "D4", "A4"]],
	[ "Cello", ["C2", "G2", "D3", "A3"]],
	[ "Double bass", ["E1", "A1", "D2", "G2"]],
	[ "Piano/Keyboard", []]
];

const piano = instruments.length-1;
var instrument = 0, strings, stringnotes;

var stringNoteTpcs = [];

function addSelectInstrument() {
	var body = document.getElementsByTagName("body")[0];
	var label = document.createElement("label");
	label.for = "select-instrument";
	label.innerHTML = "Instrument: ";
	body.appendChild(label);
	var sel = document.createElement("select");
	sel.name = "instrument";
	sel.id = "select-instrument";
	sel.onchange = function() { selectInstrument(this); };
	for (var i=0; i<instruments.length; i++) {
		var option = document.createElement("option");
		option.value = instruments[i][0];
		var s = i==piano?"":":";
		for (var n=0; n<instruments[i][1].length; n++) {
			s += " "+instruments[i][1][n];
		}
		option.innerHTML = instruments[i][0]+s;
		sel.appendChild(option);
	}
	body.appendChild(sel);
}

function setPiano() {
	drawPiano();
}

function setStringInstrument(i) {
	stringnotes = instruments[i][1];
	strings = stringnotes.length;
	for (n=0;n<stringnotes.length;n++) {
		stringNoteTpcs[n] =  note2tpc(stringnotes[n].substring(0,stringnotes[n].length-1).toUpperCase());
	}
	drawNeck();
}

function setInstrument(i) {
	instrument = i;
	if (i==piano)setPiano();
	else setStringInstrument(i);
}

function selectInstrument(_this) {
	var name = _this.value;
	for (i=0;i<instruments.length;i++) {
		if (instruments[i][0] == name) {
			setInstrument(i);
			break;
		}
	}
	selectChord(baseNoteTpc,chordType);
}

var baseNoteTpc = notes[0];

function setbaseNoteTpc(i) {
	baseNoteTpc = notes[i];
}

function selectbaseNoteTpc(_this) {
	baseNoteTpc = setbaseNoteTpc(note2tpc(_this.value));
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
	sel.onchange = function() { selectbaseNoteTpc(this); };
	for (var i=0; i<order.length; i++) {
		var option = document.createElement("option");
		option.value = scale[order[i]];
		option.innerHTML = accidentals(scale[order[i]]);
		sel.appendChild(option);
	}
	body.appendChild(sel);
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
	sel.onchange = function() { selectchordType(this); };
	for (var i=0; i<chordTypes.length; i++) {
		var option = document.createElement("option");
		option.value = chordTypes[i][0];
		option.innerHTML = chordTypes[i][0]+" : "+chordTypes[i][2];
		sel.appendChild(option);
	}
	body.appendChild(sel);
}

var chordNotes = [], chordNotePitches = [] ;

function setChordType(i) {
	var s = "";
	var b = baseNoteTpc-notes[0] ;
	chordNotePitches = [] ;
	for (var j=0; j<chordTpcs[chordType].length; j++) {
		chordNotePitches[j] = tpc2pitch(b+chordTpcs[chordType][j]);
		chordNotes[j] = tonalPitchClass[b+chordTpcs[chordType][j]];
		s += "<span style=\"background-color: "+colors[chordPitches[chordType][j]%12]+";\">"+accidentals(chordNotes[j])+"</span> ";
	}
	chordinfo.innerHTML = "Chord: "+tonalPitchClass[baseNoteTpc]+chordTypes[chordType][2]+" ("+chordTypes[chordType][0]+"): "+s;
}

function selectchordType(_this) {
	setchordType(_this.selectedIndex);
}

function drawLine(x1, y1, x2, y2) {
	ctx.beginPath();
	x1 = Math.floor(x1);
	y1 = Math.floor(y1);
	x2 = Math.floor(x2);
	y2 = Math.floor(y2);
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawCircle(x, y, r, color) {
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

function drawRectangle(x1, y1, x2, y2, color) {
	ctx.beginPath();
	x1 = Math.floor(x1);
	y1 = Math.floor(y1);
	x2 = Math.floor(x2);
	y2 = Math.floor(y2);
	if (color) {
		ctx.fillStyle = color;
		ctx.fillRect(x1, y1, x2, y2);
	} else {
		ctx.rect(x1, y1, x2, y2);
		ctx.stroke();
	}
}

function drawPath(scale, xy, offset_x, color) {
	ctx.beginPath();
	var i=0, x, y;
	x = Math.floor(borderwidth+scale*(xy[i][0]+offset_x));
	y = Math.floor(borderwidth+scale*xy[i][1]);
	ctx.moveTo(x,y);
	for (i=1; i<xy.length; i++) {
		x = Math.floor(borderwidth+scale*(xy[i][0]+offset_x));
		y = Math.floor(borderwidth+scale*xy[i][1]);
		ctx.lineTo(x,y);
	}
	ctx.closePath();
	if (color) {
		ctx.fillStyle = color;
		ctx.fill();
	} else ctx.stroke();
}

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
var canvas, ctx, vl, l;
const borderwidth = 0.02*vw, h = 0.02*vw, offset_x = 2*borderwidth, offset_y = borderwidth;
const p = Math.exp(Math.log(2)/12);
const frets = 15;

const piano_wkl = 150, piano_wkw = 23+5/7, piano_bkl = 100, piano_bkw = 15;
const piano_octaves = 3;
const pianoscale = 5*h/piano_wkl;
const piano_keys = [
	[ [0, 0], [piano_wkw-10, 0], [piano_wkw-10, piano_bkl], [piano_wkw, piano_bkl], [piano_wkw, piano_wkl], [0, piano_wkl]],
	[ [piano_wkw-10, 0], [piano_wkw+5, 0], [piano_wkw+5, piano_bkl], [piano_wkw-10, piano_bkl]],
	[ [piano_wkw+5, 0], [2*piano_wkw-5, 0], [2*piano_wkw-5, piano_bkl], [2*piano_wkw, piano_bkl], [2*piano_wkw, piano_wkl], [piano_wkw, piano_wkl], [piano_wkw, piano_bkl], [piano_wkw+5, piano_bkl]],
	[ [2*piano_wkw-5, 0], [2*piano_wkw+10, 0], [2*piano_wkw+10, piano_bkl], [2*piano_wkw-5, piano_bkl]],
	[ [2*piano_wkw+10, 0],  [3*piano_wkw, 0], [3*piano_wkw, piano_wkl], [2*piano_wkw, piano_wkl], [2*piano_wkw, piano_bkl], [2*piano_wkw+10, piano_bkl]],
	[ [3*piano_wkw, 0], [4*piano_wkw-11, 0], [4*piano_wkw-11, piano_bkl], [4*piano_wkw, piano_bkl], [4*piano_wkw, piano_wkl], [3*piano_wkw, piano_wkl], [3*piano_wkw, 0]],
	[ [4*piano_wkw-11, 0], [4*piano_wkw+4, 0], [4*piano_wkw+4, piano_bkl], [4*piano_wkw-11, piano_bkl]],
	[ [4*piano_wkw+4, 0], [5*piano_wkw-7.5, 0], [5*piano_wkw-7.5, piano_bkl], [5*piano_wkw, piano_bkl], [5*piano_wkw, piano_wkl], [4*piano_wkw, piano_wkl], [4*piano_wkw, piano_bkl], [4*piano_wkw+4, piano_bkl]],
	[ [5*piano_wkw-7.5, 0], [5*piano_wkw+7.5, 0], [5*piano_wkw+7.5, piano_bkl], [5*piano_wkw-7.5, piano_bkl]],
	[ [5*piano_wkw+7.5, 0], [6*piano_wkw-4, 0], [6*piano_wkw-4, piano_bkl], [6*piano_wkw, piano_bkl], [6*piano_wkw, piano_wkl], [5*piano_wkw, piano_wkl], [5*piano_wkw, piano_bkl], [5*piano_wkw+7.5, piano_bkl]],
	[ [6*piano_wkw-4, 0], [6*piano_wkw+11, 0], [6*piano_wkw+11, piano_bkl], [6*piano_wkw-4, piano_bkl]],
	[ [6*piano_wkw+11, 0], [7*piano_wkw, 0], [7*piano_wkw, piano_wkl], [6*piano_wkw, piano_wkl], [6*piano_wkw, piano_bkl], [6*piano_wkw+11, piano_bkl]]
];
const piano_black_keys = [ 1, 3, 6, 8, 10];

function addCanvas() {
	canvas = document.getElementById("Chords");
	canvas = document.createElement("canvas");
	canvas.id= "Chords";
	canvas.width  = vw;
	canvas.height = 2*borderwidth+5*h;
	vl = canvas.width-offset_x-2*borderwidth, l = vl / (1 - Math.pow(p,-frets));
	document.getElementsByTagName("body")[0].appendChild(canvas);
	ctx = canvas.getContext("2d");
}

function drawPiano() {
	var pianoChordNotePitches = chordNotePitches;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var o=0, pk = 12*o+tpc2pitch(baseNoteTpc);
	for (var i=0; i<chordTpcs[chordType].length; i++) {
		var p = (12+tpc2pitch(baseNoteTpc)+tpc2pitch(chordTpcs[chordType][i]))%12;
		if (12*o+p<pk) o++;
		pianoChordNotePitches[i] += o*12;
		drawPath(pianoscale, piano_keys[p], o*7*piano_wkw, colors[tpc2pitch(chordTpcs[chordType][i])]);
		pk = 12*o+p;
	}
	for (var o=0; o<piano_octaves; o++) {
		for (var i=0;i<piano_keys.length; i++) {
			var color = piano_black_keys.indexOf(i)!=-1?"black":null;
			if (pianoChordNotePitches.indexOf(i+12*o)==-1 && piano_black_keys.indexOf(i)!=-1) color = "black";
			else color = null;
			drawPath(pianoscale, piano_keys[i], o*7*piano_wkw, color);
		}
	}
}

function drawNeck() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i=0;i<strings;i++) {
		drawLine(offset_x, offset_y+i*h, offset_x+vl, offset_y+i*h);
	}
	for (var i=0;i<=frets;i++) {
		var x = offset_x+l*(1-Math.pow(p,-i));
		drawLine(x, offset_y, x, offset_y+(strings-1)*h);
	}
	ctx.fillStyle = "#000000";
	ctx.font = Math.floor(vw/100)+"px Arial";
	var x, y;
	x = 0.1*offset_x;
	for (var n=0;n<strings; n++) {
		ctx.fillText(stringnotes[strings-n-1], x, offset_y+n*h);
	}
	x = offset_x+l*(1-Math.pow(p,-3+.5));
	ctx.fillText("III", x,  offset_y+strings*h);
	x = offset_x+l*(1-Math.pow(p,-5+.5));
	ctx.fillText("V", x,  offset_y+strings*h);
	x = offset_x+l*(1-Math.pow(p,-7+.5));
	ctx.fillText("VII", x,  offset_y+strings*h);
	x = offset_x+l*(1-Math.pow(p,-10+.5));
	ctx.fillText("X", x,  offset_y+strings*h);
	x = offset_x+l*(1-Math.pow(p,-12+.5));
	ctx.fillText("XII", x,  offset_y+strings*h);
	x = offset_x+l*(1-Math.pow(p,-15+.5));
	ctx.fillText("XV", x,  offset_y+strings*h);
}

function accidentals(s) {
	var p = s.indexOf("b");
	while (p>=0) { s=s.substring(0,p)+"♭"+s.substring(p+1); p = s.indexOf("b"); }
	p = s.indexOf("#");
	while (p>=0) { s=s.substring(0,p)+"♯"+s.substring(p+1); p = s.indexOf("#"); }
	p = s.indexOf("##");
	while (p>=0) { s=s.substring(0,p)+"𝄪"+s.substring(p+1); p = s.indexOf("##"); }
	return s;
}

function drawInstrument() {
	if (instrument==piano) drawPiano();
	else {
		drawNeck();
		drawStringNotes();
	}
}

function setStringNote(str, pos, color) {
	var r = Math.floor(vw/200);
	var x = offset_x+l*(1-Math.pow(p,-pos))-2*r;
	drawCircle(x, offset_y+(strings-str-1)*h, r, color);
}

function drawStringNotes() {
	for (var i=0; i<chordTpcs[chordType].length; i++) {
		for (n=0;n<strings;n++) {
			var p = (12+chordNotePitches[i]-tpc2pitch(stringNoteTpcs[n]))%12;
			setStringNote(n, p, colors[chordPitches[chordType][i]]);
			p +=12;
			if (p<=frets) {
				setStringNote(n, p, colors[chordPitches[chordType][i]]);
			}
		}
	}
}

function selectChord(b,c) {
	baseNoteTpc = b;
	chordType = c;
	setChordType(b, c);
	drawInstrument();
}

function addSelectTable() {
	var div = document.createElement("div");
	div.style.margin="20px";
	var table = document.createElement("table");
	//table.border = "1";
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	tr.appendChild(th);
	for (var c=0; c<chordTypes.length; c++) {
		th = document.createElement("th");
		th.innerHTML = chordPitches[c].length;
		tr.appendChild(th);
	}
	table.appendChild(tr);
	for (var o=0; o<notes.length; o++) {
		var tr = document.createElement("tr");
		var i=notes[o];
		var th = document.createElement("th");
		th.innerHTML = tonalPitchClass[notes[o]];
		tr.appendChild(th);
		for (var c=0; c<chordTypes.length; c++) {
			var td = document.createElement("td");
			var a = document.createElement("a");
			let p1 = i, p2 = c;
			a.onclick = function() { selectChord(p1,p2); };
			a.href="#";
			a.title = chordTypes[c][0];
			a.innerHTML = tonalPitchClass[notes[o]] + chordTypes[c][2];
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
	setChordPitches();
	addSelectInstrument();
	addSelectTable();
	addChordInfo();
	addCanvas();
	setInstrument(instrument);
	if (instrument!=0) document.getElementById("select-instrument").selectedIndex = instrument;
	selectChord(baseNoteTpc,chordType);
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
	for (var c=0; c<chordTypes.length; c++) {
		chordType = c ;
		for (var o=0; o<order.length; o++) {
			i=order[o];
			selectChord(i,c);
		}
	}
}