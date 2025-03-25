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
var _autoPlay = document.getElementById('autoPlay');

function clear() {
	if (_swf_player) {
		_swf_player.pause();
		//while (div_swf.firstChild) {
    	//	div_swf.removeChild(div_swf.firstChild);
		//}
	}
	console.log('Clear');
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
	console.log('Options: '+JSON.stringify(_options));
		document.getElementById('play').addEventListener('click', function(e) {
			_swf_player.play();
		});
		document.getElementById('stop').addEventListener('click', function(e) {
			_swf_player.pause();
		});
		document.getElementById('step').addEventListener('click', function(e) {
			_swf_player.play();
			_swf_player.pause();
		});
		document.getElementById('reload').addEventListener('click', function(e) {
			//_swf_player.reload();
			load(_swf_object)
		});
		document.getElementById('clear').addEventListener('click', function(e) {
			console.log('clear');
			document.getElementById('input').value = '';
			clear();
		});
		document.getElementById('info').addEventListener('click', function(e) {
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
		});
}

function resize() {
	if (_swf_player.readyState) {
		if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
		var rect = div_swf.getBoundingClientRect();
		var vw = Math.max(div_swf.clientWidth, window.innerWidth || 0);;
		var vh = Math.max(div_swf.clientHeight, window.innerHeight || 0);
		var m = 20;
		var scale = Math.min((vw-rect.left-m)/_swf_player.metadata.width,(vh-rect.top-m)/_swf_player.metadata.height);
		_swf_player.style.width = Math.floor(scale*_swf_player.metadata.width)+'px';
		_swf_player.style.height = Math.floor(scale*_swf_player.metadata.height)+'px';
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
