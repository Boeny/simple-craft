require('./base');
var router = require('./router');

module.exports = function(path, response){
	response.end(router(path));
};
