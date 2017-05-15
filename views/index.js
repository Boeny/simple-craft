var h = require(MODULES+'/html');

var content =	h.canvas({id: 'canvas', 'class': 'canvas'})+
				h.div(
					h.div(h.div({'id': 'bar', 'class': 'bar'}), {'class': 'w_100 b'})+
					h.button('restart', {id: 'restart', 'class': 'btn', style: 'display: none'})+
					h.div({id: 'counter', 'class': 'counter'}),
					
					{'class': 'abs top bk_fff'}
				);

module.exports.content = h.div(content, {id: 'app', 'class': 'app'});
