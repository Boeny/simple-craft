var files = [
	'modules/base',
	'Canvas=front/canvas',
	'front/vm'
];

if (__server.is_mobile) files.unshift('front/mobile_error');

function createModule(name){
	return '(function(global){var module={exports:{}};'+__server.read(ROOT+'/'+name)+'return module.exports;})(window);';
}

var modules = '';
var h = require('./html');
var f, v;

for (var i=0; i<files.length; i++){
	f = files[i];
	v = '';
	
	if (in_str('=', f)){// separate variable name and module's result
		f = f.split('=');
		v = 'var '+f[0]+'=';
		f = f[1];
	}
	
	modules += v + createModule(f);
}

module.exports = h.script(modules);
