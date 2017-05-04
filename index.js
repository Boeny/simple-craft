global.ROOT = __dirname;
global.MODULES = ROOT+'/modules';

require(MODULES+'/base');
var router = require(ROOT+'/router');

module.exports = function(path, response){
	response.end(router(path));
};
