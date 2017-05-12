var main_process = require(ROOT+'/actions/calc');
var layout = require(ROOT+'/views/layout');
var view = require(ROOT+'/views/index');
var content = layout(view.content);

module.exports = function(path, response){
	switch (path){
		case '/':
			return content;
		
		case '/favicon.ico':
			return '';
		
		default:
			var data = main_process.step();
			response.writeHead(200, {
				'Content-Type': 'application/octet-stream',
				'Content-Length' : data.length
			});
			response.write(data);
	}
};
