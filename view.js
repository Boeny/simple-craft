var h = require('./html');

var script = h.script(require('fs').readFileSync(__dirname+'/vm.js', 'utf-8'));

var content = h.canvas({'class': 'w_640 h_480', 'id': 'canvas'});

module.exports.content = h.div(content, {'id':'app'}) + script;