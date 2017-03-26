var h = require('./html');
var fs = require('fs');
var external = 'https://code.jquery.com/jquery-3.0.0.min.js';

function createModule(name){
	return '(function(global){var module = {exports: {}};'+fs.readFileSync(__dirname+'/'+name+'.js', 'utf-8')+'return module.exports;})(window);';
}

module.exports = function(content, response){
	response.end(h.type+
		h.html(
			h.head(
				h.getMetas()+
				h.style()+
				h.script({src: external})+
				h.script(createModule('base'))+
				h.script('var h = '+createModule('html'))
			)+
			h.body(content)
		)
	);
};
