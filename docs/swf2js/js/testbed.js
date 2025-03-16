var div_swf = document.getElementById('swf');

function clear() {
	var div_swf = document.getElementById('swf');
	while (div_swf.firstChild) { div_swf.removeChild(div_swf.lastChild); }
}

function resize() {
		var rect = div_swf.getBoundingClientRect();
		var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
		var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
		div_swf.style.width = Math.floor(vw - rect.left/2)+"px";
		div_swf.style.height = Math.floor(vh - rect.top)+"px";
}

document.getElementById('input').addEventListener('change', function(e) {
	if (e.target.files[0]) {
		clear();
		resize();
		var fileReader  = new FileReader;
		fileReader.readAsArrayBuffer(this.files[0]);
		var url = URL.createObjectURL(this.files[0]); 
		swf2js.load(url, { 'tagId': 'swf'});
	}
});

document.getElementById('clear').addEventListener('click', function(e) {
	console.log('Clear');
	document.getElementById('input').value = '';
	clear();
});
