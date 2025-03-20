function show_flash() {
	document.title=name.charAt(0).toUpperCase() + name.slice(1) + " - Flash";
	
	var w = window.innerWidth;
	var h = window.innerHeight;
            
    var embed=document.createElement("embed");
    embed.src=name+".swf";
    embed.loop="false";
    embed.quality="high";
    embed.bgcolor="#FFFFFF";
    embed.width=w;
    embed.height=h;
    document.body.appendChild(embed);

    window.addEventListener("resize", function() {
    	var w = window.innerWidth;
		var h = window.innerHeight;
		var o=document.getElementsByTagName("embed")[0];
		o.width=w;
		o.height=h;
	});
}

function show_javascript() {
	document.title=name.charAt(0).toUpperCase() + name.slice(1) + " - Javascript";
    swf2js.load(name+".swf");
}

var page=window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
var name=page.substring(0,page.indexOf('\.'));

if (FlashDetect.installed) show_flash();
else show_javascript();