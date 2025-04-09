function ms_player_query() {
	var userLanguage=(navigator.language || navigator.userLanguage).split("-")[0];
	var translations = [
		{ "lang" : "en", "title" : "Score", "errormessage" : "Score not specified." },
		{ "lang" : "nl", "title" : "Partituur", "errormessage" : "Partituur niet gespecificeerd." }
	];
	var languageIndex=0;
	
	var query = window.location.search;
	// Skip the leading ?, which should always be there, 
	// but be careful anyway
	if (query.substring(0, 1) == '?') query = query.substring(1);
	var data = query.split('&'); 
	var name="", path="", lang="";
	for (i = 0; (i < data.length); i++) {
		data[i] = decodeURIComponent(data[i]);
		var temp = data[i].split("=");
		if (temp[0]=="name") name=temp[1];
		if (temp[0]=="path") path=temp[1];
		if (temp[0]=="lang") userLanguage=temp[1];
	}
	
	for (var i=0;i<translations.length;i++) if (userLanguage==translations[i]["lang"]) { languageIndex=i; break; }	
	var title=translations[languageIndex]["title"];
	var errormessage=translations[languageIndex]["errormessage"];
	
	document.getElementsByTagName("title")[0].innerHTML=title+" : "+name;
	if (name!=="") {
		if (path!=="") ms_player.load(name, { "path": path});
		else ms_player.load(name);
	} else document.getElementsByTagName("body")[0].innerHTML=errormessage;

}
