global.onerror = function (msg, url, line){
	alert(msg + "\n" + url + "\n\non line " + line);
	return true;
};
