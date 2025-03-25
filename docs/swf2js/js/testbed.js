window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

var div_swf = document.getElementById('swf');
var _stage = null;
var _swf_file = null;
var _quality = document.getElementById('quality');
var _audio = document.getElementById('audio');
var _bgcolor = document.getElementById('bgcolor');
var _autoStart = document.getElementById('autoStart');

function load(obj, isReload) {
	clear();
	var _options = {
		'tagId': 'swf',
		'quality': _quality.options[_quality.selectedIndex].value,
		'audioType': _audio.options[_audio.selectedIndex].value,
		'bgcolor': _bgcolor.value,
		'autoStart': (_autoStart.options[_autoStart.selectedIndex].value==1)
	};
	//if (isReload) _options['stage'] = window.swf2js;
	var w = document.getElementById('width').value;
	if (!isNaN(w)) _options.width = w;
	var h = document.getElementById('height').value;
	if (!isNaN(h)) _options.height = h;
	_stage = swf2js.load(obj, _options);
	document.getElementById('play').addEventListener('click', play );
	document.getElementById('stop').addEventListener('click', stop );
	document.getElementById('step').addEventListener('click', step );
	document.getElementById('reload').addEventListener('click', reload );
	document.getElementById('clear').addEventListener('click', clear) ;
	document.getElementById('info').addEventListener('click', info );
}

function clear() {
	if (_stage) {
		_stage.stop();
		document.getElementById('play').removeEventListener('click', play	);
		document.getElementById('stop').removeEventListener('click', stop );
		document.getElementById('step').removeEventListener('click', step );
		document.getElementById('reload').removeEventListener('click', reload );
		document.getElementById('clear').removeEventListener('click', clear );
		document.getElementById('info').removeEventListener('click', info );
	}
	while (div_swf.firstChild) { div_swf.removeChild(div_swf.lastChild); }
	console.log('Clear');
}

function play() {
	console.log('Play');
	if (_stage) _stage.play();
}
function step() {
	console.log('Step');
	if (_stage) _stage.step();
}
function stop() {
	console.log('Stop');
	if (_stage) _stage.stop();
}
function info() {
	console.log('Info');
	if (_stage) _stage.showInfo();
}
function reload() {
	console.log('Reload');
	if (_stage) clear();
	if (_swf_file) load(_swf_file, true);
}

function resize() {
		var rect = div_swf.getBoundingClientRect();
		var vw = Math.max(div_swf.clientWidth || 0, window.innerWidth || 0)
		var vh = Math.max(div_swf.clientHeight || 0, window.innerHeight || 0)
		div_swf.style.width = Math.floor(vw - rect.left/2-20)+'px';
		div_swf.style.height = Math.floor(vh - rect.top-20)+'px';
}

window.addEventListener('resize', function() {
	resize();
	if (_stage) _stage.resize();
});

document.getElementById('input').addEventListener('change', function(e) {
	if (e.target.files[0]) {
		clear();
		resize();
		_swf_file = URL.createObjectURL(e.target.files[0]);
		load(URL.createObjectURL(e.target.files[0]));
	}
});
