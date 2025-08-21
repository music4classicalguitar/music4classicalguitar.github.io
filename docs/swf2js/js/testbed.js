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
var _scaling = document.getElementById('scaling');
var _debug = document.getElementById('debug');

var _play = document.getElementById('play');
var _step = document.getElementById('step');
var _stop = document.getElementById('stop');
var _reload = document.getElementById('reload');
var _show_info = document.getElementById('show_info');
var _show_debug = document.getElementById('show_debug');

_play.disabled = true;
_step.disabled = true;
_stop.disabled = true;
_reload.disabled = true;
_show_info.disabled = true;
_show_debug.disabled = true;
_play.addEventListener('click', play );
_step.addEventListener('click', step );
_stop.addEventListener('click', stop );
_reload.addEventListener('click', reload );
_show_info.addEventListener('click', info );
_show_debug.addEventListener('click', debug );

function resize() {
	var rect = div_swf.getBoundingClientRect();
	var vw = Math.max(div_swf.clientWidth || 0, window.innerWidth || 0);
	var vh = Math.max(div_swf.clientHeight || 0, window.innerHeight || 0);
	div_swf.style.width = Math.floor(vw - rect.left/2-20)+'px';
	div_swf.style.height = Math.floor(vh - rect.top-20)+'px';
}

window.addEventListener('resize', function() {
	resize();
	//if (_stage) _stage.resize();
});

function clear() {
	if (_stage) {
		_stage.clear();
		//_stage = null;
	}
};

function input(e) {
	if (e.target.files[0]) {
		resize();
		clear();
		_swf_file = URL.createObjectURL(e.target.files[0]);
		load(URL.createObjectURL(e.target.files[0]));
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
	if (_scaling.options[_scaling.selectedIndex].value==0) {
		_options.noScaling = true;
		var w = document.getElementById('width').value;
		if (w && !isNaN(w)) _options.width = w;
		var h = document.getElementById('height').value;
		if (h && !isNaN(h)) _options.height = h;
	}
	if (_autoStart.options[_autoStart.selectedIndex].value==0)
		_options.autoStart = false;
	_stage = swf2js.load(obj, _options);
	_play.disabled = false;
	_step.disabled = false;
	_stop.disabled = false;
	_reload.disabled = false;
	_show_info.disabled = false;
	//if (_debug.options[_debug.selectedIndex].value==1) {
		_show_debug.disabled = false;
	//} else {
	//	_show_debug.disabled = true;		
	//}
}

function play() {
	if (_stage) _stage.play();
}
function step() {
	if (_stage) _stage.step();
}
function stop() {
	if (_stage) _stage.stop();
}

function reload() {
	if (_stage) _stage.clear();
	if (_swf_file) load(_swf_file);
}

function info() {
	if (_stage) _stage.showInfo();
}

function debug() {
	if (_stage) _stage.showDebug();
}
