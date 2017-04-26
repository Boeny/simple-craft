global.ROOT = __dirname;
global.MODULES = ROOT+'/modules';

require(MODULES+'/base');

module.exports = function(path, response){
	response.end(require(ROOT+'/router')(path));
};
