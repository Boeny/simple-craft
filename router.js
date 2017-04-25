module.exports = function(path){
	switch (path){
		case '/':
			return require('./layout')(require('./view').content);
		
		case '/favicon.ico':
			return '';
		
		default:
			return JSON.stringify(require('./calc'));
	}
};
