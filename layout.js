var h = require('./html');
var external = 'https://code.jquery.com/jquery-3.0.0.min.js';

function createModule(name){
	return '(function(global){var module = {exports: {}};'+__server.read(__dirname+'/'+name)+'return module.exports;})(window);';
}

module.exports = function(content){
	return h.type+
		h.html(
			h.head(
				h.getMetas()+
				h.style()+
				h.script({src: external})+
				h.script(createModule('base'))+
				h.script('var h = '+createModule('html'))+
				h.script('var Canvas = '+createModule('canvas'))
			)+
			h.body(content)
		);
};
