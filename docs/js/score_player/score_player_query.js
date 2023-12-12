window.onerror = function(message, source, lineno, colno, error) {
	window.alert("Message : " + message + "\nSource : " + source + "\nLine : " + lineno + "\nCol : " + colno + "\nError : " + error);
};

function score_player_query() {
	let userLanguage=(navigator.language || navigator.userLanguage).split('-')[0];
	let translations = [
		{ 'lang' : 'en', 'title' : 'Score', 'errormessage' : 'Score not specified.' },
		{ 'lang' : 'nl', 'title' : 'Partituur', 'errormessage' : 'Partituur niet gespecificeerd.' }
	];
	let languageIndex=0;

	let tagId = 'score_player_parent', score_name = '', score_path = ''; // score_player_parent

	let query = window.location.search;
	// Skip the leading ?, which should always be there, 
	// but be careful anyway
	if (query.substring(0, 1) == '?') query = query.substring(1);
	let data = query.split('&'); 
	let name='', path='', lang='';
	for (i = 0; (i < data.length); i++) {
		data[i] = decodeURIComponent(data[i]);
		let temp = data[i].split('=');
		if (temp[0]=='tagId') { tagId=temp[1]; console.log('tagId: '+tagId); }
		if (temp[0]=='score_name') { score_name=temp[1]; console.log('score_name: '+score_name); }
		if (temp[0]=='score_path') { score_path=temp[1]; console.log('score_path: '+score_path); }
		if (temp[0]=='lang') userLanguage=temp[1];
	}

	for (let i=0;i<translations.length;i++) if (userLanguage==translations[i]['lang']) { languageIndex=i; break; }
	let title=translations[languageIndex]['title'];
	let errormessage=translations[languageIndex]['errormessage'];

	document.getElementsByTagName('title')[0].innerHTML=title+' : '+score_name;
	let sc = new ScorePlayer();
	if (score_name!=='') {
		if (tagId!=='' && score_path!=='')  sc.load(score_name, { 'tagId' : tagId, 'score_path': score_path } );
		else if (tagId!=='') sc.load(score_name, { 'tagId' : tagId } );
		else if (score_path!=='') sc.load(score_name, { 'score_path': score_path } );
		else sc.load(score_name);
	} else document.getElementsByTagName('body')[0].innerHTML=errormessage;
}
