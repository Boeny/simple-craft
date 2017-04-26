var main_process = require(ROOT+'/actions/calc');

module.exports = function(path){
	switch (path){
		case '/':
			return require(ROOT+'/views/layout')(require(ROOT+'/views/index').content);
		
		case '/favicon.ico':
			return '';
		
		default:
			return JSON.stringify(main_process.step());
	}
};