var files = ['modules/base','h=modules/html','Canvas=front/canvas','front/vm'];

if (__server.is_mobile) files.unshift('front/mobile_error');

function createModule(name){
	return '(function(global){var module={exports:{}};'+__server.read(ROOT+'/'+name)+'return module.exports;})(window);';
}

var modules = '';
var h = require('./html');
var f, v;

for (var i in files){
	f = files[i];
	v = '';
	
	if (in_str('=', f)){// separate variable name and module's result
		f = f.split('=');
		v = 'var '+f[0]+'=';
		f = f[1];
	}
	
	modules += h.script(v + createModule(f));
}

module.exports = modules;