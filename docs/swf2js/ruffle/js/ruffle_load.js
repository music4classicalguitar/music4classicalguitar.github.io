window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

const nosound=",links,ofra,quizned,sitemap,test,varia,vv,";
const _swf_name = document.getElementsByTagName('title')[0].innerHTML;
const _swf_file = _swf_name +'.swf';

window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
	"autoplay": "on",
	"splashScreen": false
};
if (nosound.includes(','+_swf_name+',')) window.RufflePlayer.config["unmuteOverlay"] = "hidden";
let ruffle = window.RufflePlayer.newest();
let _swf_player = ruffle.createPlayer();
let _swf_parent = document.getElementsByTagName('body')[0];
_swf_parent.appendChild(_swf_player);

function load() {
	_swf_player.ruffle().load(_swf_file, {"autoplay": "on"});
	resize();
}

function resize() {
	if (_swf_player.readyState) {
		if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
		var rect = _swf_parent.getBoundingClientRect();
		var vw = Math.max(_swf_parent.clientWidth, window.innerWidth || 0);;
		var vh = Math.max(_swf_parent.clientHeight, window.innerHeight || 0);
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

load();