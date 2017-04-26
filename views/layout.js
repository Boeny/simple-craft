var h = require(MODULES+'/html');

module.exports = function(content){
	return  h.type+
		h.html(
			h.head(
				h.getMetas()+
				h.style()+
				h.script({src: 'https://code.jquery.com/jquery-3.0.0.min.js'})
			)+
			h.body(require(MODULES+'/modules') + content)
		);
};
