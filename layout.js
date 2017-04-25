var h = require('./html');
var external = 'https://code.jquery.com/jquery-3.0.0.min.js';

function createModule(name){
	return '(function(global){var module = {exports: {}};'+__server.read(__dirname+'/'+name)+'return module.exports;})(window);';
}

var vars = ['','','h','Canvas'];
var files = ['mobile_err','base','html','canvas'];
var modules = '';
var v;

for (var i in files){
	v = vars[i];
	if (v) v = 'var '+v+' = ';
	modules += h.script(v + createModule(files[i]));
}

module.exports = function(content){
	return  h.type+
		h.html(
			h.head(
				h.getMetas()+
				h.style()+
				h.script({src: external})
			)+
			h.body(modules + content)
		);
};
