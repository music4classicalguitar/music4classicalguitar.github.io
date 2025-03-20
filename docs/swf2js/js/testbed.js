window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

var div_swf = document.getElementById('swf');
var _swf = null;
var _swf_file = null;
var _quality = document.getElementById('quality');
var _audio = document.getElementById('audio');
var _bgcolor = document.getElementById('bgcolor');
var _autoStart = document.getElementById('autoStart');

function clear() {
	if (_swf) {
		_swf.stop();
		//_swf.reset();
		/*
		for (sound in _swf.sounds) sound.Audio = null ;
		for (soundStream in _swf.soundStreams) {
			console.log('Soundstream '+soundstream);
			soundStream.Audio = null ;
		}
		*/
	}
	while (div_swf.firstChild) { div_swf.removeChild(div_swf.lastChild); }
	console.log('Clear');
}

function load(obj) {
	var _options = {
		'tagId': 'swf',
		'quality': _quality.options[_quality.selectedIndex].value,
		'audioType': _audio.options[_audio.selectedIndex].value,
		'bgcolor': _bgcolor.value,
		'autoStart': (_autoStart.options[_autoStart.selectedIndex].value==1)
	};
	var w = document.getElementById('width').value;
	if (!isNaN(w)) _options.width = w;
	var h = document.getElementById('height').value;
	if (!isNaN(h)) _options.height = h;
	_swf = swf2js.load(obj, _options);
		document.getElementById('play').addEventListener('click', function(e) {
			console.log('play');
			var c = document.getElementById('control');
			if (c) c.remove();
			_swf.play();
		});
		document.getElementById('stop').addEventListener('click', function(e) {
			console.log('stop');
			_swf.stop();
		});
		document.getElementById('step').addEventListener('click', function(e) {
			console.log('step');
			_swf.nextFrame();
			_swf.stop();
		});
		document.getElementById('reload').addEventListener('click', function(e) {
			clear();
			console.log('Reload');
			if (_swf_file) load(_swf_file);
			else window.alert('No file selected');
		});
		document.getElementById('clear').addEventListener('click', function(e) {
			console.log('clear');
			document.getElementById('input').value = '';
			clear();
		});
		document.getElementById('info').addEventListener('click', function(e) {
			console.log('info');
			_swf.showInfo();
		});
}

function resize() {
		var rect = div_swf.getBoundingClientRect();
		var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
		var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
		div_swf.style.width = Math.floor(vw - rect.left/2-20)+'px';
		div_swf.style.height = Math.floor(vh - rect.top-20)+'px';
}

window.addEventListener("resize", function() {
	resize();
	if (_swf) _swf.resize();
});

document.getElementById('input').addEventListener('change', function(e) {
	if (e.target.files[0]) {
		clear();
		resize();
		_swf_file = URL.createObjectURL(e.target.files[0]);
		load(URL.createObjectURL(e.target.files[0]));
	}
});

//document.getElementById('audio').addEventListener('change', function(e) {
//	console.log(this.selectedIndex+' '+this.options[this.selectedIndex].value);
//});
