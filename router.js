var main_process = require(ROOT+'/actions/calc');
var layout = require(ROOT+'/views/layout');
var view = require(ROOT+'/views/index');
var content = layout(view.content);

module.exports = function(path){
	switch (path){
		case '/':
			return content;
		
		case '/favicon.ico':
			return '';
		
		default:
			return JSON.stringify(main_process.step());
	}
};
