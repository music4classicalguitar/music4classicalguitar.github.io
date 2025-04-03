window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

var div_swf = document.getElementById('swf');
var _stage = null;
var _swf_file = null;
var _quality = document.getElementById('quality');
var _audio = document.getElementById('audio');
var _bgcolor = document.getElementById('bgcolor');
var _overrule_bgcolor = document.getElementById('overrule_bgcolor');
var _autoStart = document.getElementById('autoStart');
var _debug = document.getElementById('debug');

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

function input(e) {
	if (e.target.files[0]) {
		resize();
		_swf_file = URL.createObjectURL(e.target.files[0]);
		load(URL.createObjectURL(e.target.files[0]));
		//document.getElementById('input').disabled = true; //removeEventListener('change', input);
		document.getElementById('input').addEventListener('click', function(e) {
			document.getElementById('input').disabled = true;
			window.alert('Please refresh page to test another SWF-file');
		});
	}
}

document.getElementById('input').addEventListener('change', input);

function load(obj) {
	var _options = {
		'tagId': 'swf'
	};
	if (_quality.options[_quality.selectedIndex].value != 'medium')
		_options.quality = _quality.options[_quality.selectedIndex].value;
	if (_audio.options[_audio.selectedIndex].value != 'webaudio')
		_options.audioType = _audio.options[_audio.selectedIndex].value;
	if (_overrule_bgcolor.options[_overrule_bgcolor.selectedIndex].value==1)
		_options.bgcolor = _bgcolor.value;
	if (_debug.options[_debug.selectedIndex].value==1)
		_options.debug = true;
	var w = document.getElementById('width').value;
	if (w && !isNaN(w)) _options.width = w;
	var h = document.getElementById('height').value;
	if (h && !isNaN(h)) _options.height = h;
	_stage = swf2js.load(obj, _options);
	document.getElementById('play').addEventListener('click', play );
	document.getElementById('stop').addEventListener('click', stop );
	document.getElementById('step').addEventListener('click', step );
	document.getElementById('show_info').addEventListener('click', info );
	document.getElementById('show_debug').addEventListener('click', debug );
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

function debug() {
	console.log('Debug');
	if (_stage) _stage.showDebug();
}
