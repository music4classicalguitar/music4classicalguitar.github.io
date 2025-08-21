class ScoreFilter {
	
	constructor(parent_id, sel) {
		this.parent_id = parent_id;
		this.parent = document.getElementById(parent_id);
		
		this.scores = new Scores();
		//this.filterComposer("Francisco Tárrega");	
		//this.filterComposer("Willie Brown");
		//this.filterCompositionStyle("Blues");
		if (sel) {
			console.log('Selection: '+JSON.stringify(sel));
			if (sel.composer) this.makeTable(this.filterComposer(sel.composer));
		} else this.makeTable(this.scores.score_data);
		//this.makeTable(this.filterComposer("Johann Sebastian Bach"));
		//this.showSelection(this.filterComposer("Willie Brown"));
		//this.showSelection(this.filterCompositionStyle("Blues"));
	}

	secondsToTime(sec) {
		var s = parseInt(sec,10);
		var h = Math.floor(s/3600);
		var m = Math.floor((s-(h*3600))/60);
		var s = s-(h*3600)-(m*60);
		var t = "";

		if (h>0) {
			t=h+":";
			if (m<10) { t=t+"0"+m+":"; } else t=t+m+":";
			if (s<10) { t=t+"0"+s; } else t=t+s;
		} else if (m>0) {
			if (s<10) { t=m+":0"+s; } else t=m+":"+s;
		} else t=s;
		console.log(sec+": "+h+" "+m+" "+s+" ->"+t);
		return t;
	}
	
	filterComposer(find_composer) {
		let current_selection = this.scores.score_data.filter(element => element.composer === find_composer);
		return current_selection;
	}

	filterCompositionStyle(find_style) {
		let current_selection = this.scores.score_data.filter(eachVal => {
			let opt = eachVal.compositions.some(
				({ style }) => style === find_style);
			return opt;
		})
		return current_selection;
	}
	
	showSelection(obj) {
		//console.log(JSON.stringify(obj,null, 4));
		console.log('Selection:');
		for (let i=0; i<obj.length; i++) {
			console.log('  composer: '+obj[i].composer);
			for (let c=0; c<obj[i].compositions.length; c++) {
				console.log('	composition: '+obj[i].compositions[c].name);
			}
		}
	}
	
	makeTable(current_selection) {
		//console.log(JSON.stringify(obj,null, 4));
		let p, t, a, strong, table, tr, th, td, img;
		if (current_selection.length>=1) {
			p = document.createElement('p');
			t = document.createTextNode('Composers: ');
			p.append(t);
			for (let i=0; i<current_selection.length; i++) {
				a = document.createElement('a');
				a.href = '#'+current_selection[i].composer_name_uri;
				t = document.createTextNode(current_selection[i].composer);
				a.append(t);
				p.append(a);
				if (i<current_selection.length-1) {
					t = document.createTextNode(', ');
					p.append(t);
				}
			}
			this.parent.append(p);
		}

		table = document.createElement('table');
		for (let i=0; i<current_selection.length; i++) {
			tr = document.createElement('tr');
			th = document.createElement('th');
			th.classList.add('composer');
			th.id = current_selection[i].composer_name_uri;
			th.colSpan = '8';
			strong = document.createElement('strong');
			t = document.createTextNode('Composer: ');
			strong.append(t);
			th.append(strong);
			a = document.createElement('a');
			a.id = current_selection[i].composer_name_uri;
			a.href= current_selection[i].composer_name_link;
			t = document.createTextNode(current_selection[i].composer+(current_selection[i].composer_period!=''?' '+current_selection[i].composer_period:''));
			a.append(t);
			th.append(a);
			tr.append(th);
			table.append(tr);
			
			tr = document.createElement('tr');
			th = document.createElement('th'); th.innerHTML = 'View &amp; hear'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Duration'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Pages'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'MuseScore'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Pdf'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Mp3'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Video'; tr.append(th);
			th = document.createElement('th'); th.innerHTML = 'Source'; tr.append(th);
			table.append(tr);

			for (let c=0; c<current_selection[i].compositions.length; c++) {
				
				tr = document.createElement('tr');
				td = document.createElement('td');
				a = document.createElement('a');
				a.href = current_selection[i].compositions[c].play_link;
				a.innerHTML = current_selection[i].compositions[c].score;
				td.append(a);
				tr.append(td);
				
				td = document.createElement('td');
				td.innerHTML = this.secondsToTime(current_selection[i].compositions[c].duration);
				tr.append(td);
				table.append(tr);
				
				td = document.createElement('td');
				td.innerHTML = current_selection[i].compositions[c].pages;
				tr.append(td);
				table.append(tr);
				
				td = document.createElement('td');
				a = document.createElement('a');
				a.href = current_selection[i].compositions[c].link_prefix+current_selection[i].compositions[c].musescore_link_suffix;
				img = document.createElement('img');
				img.src = 'images/links/icon_musescore.svg';
				img.width = '20';
				img.height = '20';
				img.alt = 'icon musescore';
				a.append(img);
				td.append(a);
				tr.append(td);
				table.append(tr);
				
				td = document.createElement('td');
				a = document.createElement('a');
				a.href = current_selection[i].compositions[c].link_prefix+current_selection[i].compositions[c].pdf_link_suffix;
				img = document.createElement('img');
				img.src = 'images/links/icon_pdf.svg';
				img.width = '16';
				img.height = '19';
				img.alt = 'icon pdf';
				a.append(img);
				td.append(a);
				tr.append(td);
				table.append(tr);
								
				td = document.createElement('td');
				a = document.createElement('a');
				a.href = current_selection[i].compositions[c].link_prefix+current_selection[i].compositions[c].mp3_link_suffix;
				img = document.createElement('img');
				img.src = 'images/links/icon_mp3.svg';
				img.width = '17';
				img.height = '20';
				img.alt = 'icon mp3';
				a.append(img);
				td.append(a);
				tr.append(td);
				table.append(tr);
								
				td = document.createElement('td');
				if (current_selection[i].compositions[c].musician) {
					a = document.createElement('a');
					a.href = current_selection[i].compositions[c].video;
					t = document.createTextNode(current_selection[i].compositions[c].musician);
					a.append(t);
					td.append(a);
				}
				tr.append(td);
				table.append(tr);
								
				td = document.createElement('td');
				if (current_selection[i].compositions[c].source_link) {
					a = document.createElement('a');
					a.href = current_selection[i].compositions[c].source_link;
					t = document.createTextNode(current_selection[i].compositions[c].source_collection);
					a.append(t);
					td.append(a);
				}
				tr.append(td);
				table.append(tr);
			}
		}
		
		this.parent.append(table);
	}

}
