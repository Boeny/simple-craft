var h = require('./html');

var content = h.div('1', 'cell bk_red') + h.div('2', 'cell bk_blue');

var script = h.script(require('fs').readFileSync(__dirname+'/vm.js', 'utf-8'));

module.exports.content = h.div(content, {'class':'app'}) + script;