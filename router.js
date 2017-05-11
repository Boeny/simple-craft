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
			var data = main_process.step();
			__server.response.writeHead(200, {
				'Content-Type': 'application/octet-stream',
				'Content-Length' : data.length
			});
			__server.response.write(data);
			return null;
	}
};
