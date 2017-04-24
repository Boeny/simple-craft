module.exports = function(path){
	if (path == '/favicon.ico') return '';
	
	if (path == '/') return require('./layout')(require('./view').content);
	
	return JSON.stringify(require('./calc')(path.replace('/calc?','').split('&').map((o) => {
		o = o.split('=');
		var res = {};
        	res[o[0]] = o[1];
		return res;
	})));
};
