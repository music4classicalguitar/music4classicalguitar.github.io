window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
	"autoplay": "on",
	"splashScreen": false
};
let ruffle = window.RufflePlayer.newest();
let _swf_player = ruffle.createPlayer();
let div_swf = document.getElementById('swf');
div_swf.appendChild(_swf_player);

var _swf_file = null;
var _swf_object = null;
var _quality = document.getElementById('quality');
var _bgcolor = document.getElementById('bgcolor');
var _scaling = document.getElementById('scaling');
var _autoPlay = document.getElementById('autoPlay');


document.getElementById('play').addEventListener('click', function(e) {
	_swf_player.play();
});
document.getElementById('stop').addEventListener('click', function(e) {
	_swf_player.pause();
});
document.getElementById('reload').addEventListener('click', function(e) {
	//_swf_player.reload();
	if (_swf_object) load(_swf_object)
});
document.getElementById('info').addEventListener('click', function(e) {
	info();
});

function info() {
	if (document.getElementById('showInfo')) return;
	if (!_swf_object) return;
	var parent = div_swf.parentNode;
	var div_info = document.createElement('div');
	var info = '<table><tbody>';
	for (var key in _swf_player.metadata) {
		info += '<tr><td>'+key+'</td><td>'+_swf_player.metadata[key]+'</td></tr>';
	}
	info  += '</tbody></table><p></p>';
	div_info.innerHTML = info;
	div_info.style = 'position: absolute; top: 20px; left: 20px;';
	div_info.id = 'showInfo';
	var button = document.createElement('button');
	button.innerHTML = 'Close';
	button.setAttribute('onclick', 'var s=document.getElementById("showInfo"); s.parentElement.removeChild(s);');
	div_info.appendChild(button);
	parent.appendChild(div_info);
}

function load(obj) {
	var _options = {
		"preloader":false,
		'quality': _quality.options[_quality.selectedIndex].value,
		'bgcolor': _bgcolor.value,
		'autoplay': _autoPlay.options[_autoPlay.selectedIndex].value
	};
	var w = document.getElementById('width').value;
	if (!isNaN(w)) _swf_player.style.width = w; //_options.width = w;
	var h = document.getElementById('height').value;
	if (!isNaN(h))  _swf_player.style.height = h; // _options.height = h;
	window.RufflePlayer.config = _options;
	_swf_player.ruffle().load(obj, _options);
	resize();
	console.log('Options: '+JSON.stringify(_options));
}

function resize() {
	if (_swf_player.readyState) {
		if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
		if (_scaling.options[_scaling.selectedIndex].value==0) {
			_swf_player.style.width = _swf_player.metadata["width"]+"px";
			_swf_player.style.height = _swf_player.metadata["height"]+"px";
		} else {
			var w = document.getElementById('width').value;
			if (w && !isNaN(w)) _options.width = w;
			var h = document.getElementById('height').value;
			if (h && !isNaN(h)) _options.height = h;
			var rect = div_swf.getBoundingClientRect();
			var vw, vh;
			if (w && !isNaN(w)) vw = w ;
			else vw = Math.max(div_swf.clientWidth, window.innerWidth || 0);
			if (h && !isNaN(h)) vh = h
			else vh = Math.max(div_swf.clientHeight, window.innerHeight || 0);
			var m = 20;
			var scale = Math.min((vw-rect.left-m)/_swf_player.metadata.width,(vh-rect.top-m)/_swf_player.metadata.height);
			_swf_player.style.width = Math.floor(scale*_swf_player.metadata.width)+'px';
			_swf_player.style.height = Math.floor(scale*_swf_player.metadata.height)+'px';
		}
	} else {
		var requestAnimationFrameId = requestAnimationFrame(function(timeStamp) {
			resize();
		});
	}
}

window.onresize = function() { resize(); };

document.getElementById('input').addEventListener('change', function(e) {
	if (e.target.files[0]) {
		//clear();
		_swf_file = URL.createObjectURL(e.target.files[0]);
		_swf_object = URL.createObjectURL(e.target.files[0]);
		load(_swf_object);
		resize();
	}
});
