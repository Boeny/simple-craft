require('./base');
var layout = require('./layout');
var view = require('./view');

module.exports = function(p, response){
	if (p == '/favicon.ico')return;
	layout(view.content, response);
};