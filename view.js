var h = require('./html');

var content = h.canvas({id: 'canvas'});
content += h.div(
	h.div(h.div({'id': 'bar', 'class': 'w_0 h_16 bk_blue'}), {'class': 'w_100 b'})+
	h.button('restart', {'class': 'restart', style: 'display: none'}),
	{'class': 'abs top'}
);

var script = h.script(require('fs').readFileSync(__dirname+'/vm.js', 'utf-8'));

module.exports.content = h.div(content, {id: 'app', 'class': 'rel'}) + script;