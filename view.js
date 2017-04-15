var h = require('./html');

var content = h.canvas({id: 'canvas', style: 'width: 100%; height: 100%'});

var script = h.script(require('fs').readFileSync(__dirname+'/vm.js', 'utf-8'));

module.exports.content = h.div(content, {id: 'app'}) + script;
