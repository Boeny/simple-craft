var Styler = require('./styler');

module.exports = {
	getOptions: function(o){
		var content = '';
		if (o)
		for (var i in o){
			content += ' '+i+'="'+o[i]+'"';
		}
		return content;
	},
	getStyleOptions: function(o){
		var content = '';
		for (var i in o){
			content += i+':'+o[i]+';';
		}
		return content;
	},
	
	tag: function(elem, content, opt, open){
		if (is_object(content)){
			opt = content;
			content = '';
			
			if (opt.content !== undefined){
				content = opt.content;
				delete opt.content;
			}
			if (opt.options) opt = opt.options;
		}
		else
			content = content === 0 && '0' || content || '';
		
		var opthtml = '';
		
		if (opt){
			if (!is_object(opt)) opt = {'class': opt};
			
			Styler.parseClasses(opt['class']);
			
			if (is_object(opt.style)) opt.style = this.getStyleOptions(opt.style);
			
			opthtml = this.getOptions(opt);
		}
		
		return '<'+elem + opthtml + (open ? '/' : '')+'>' + (open ? '' : content+'</'+elem+'>');
	},
	
	getMetas: function(){
		return	this.meta({charset: 'utf-8'})+
				this.meta({'http-equiv': 'X-UA-Compatible', content: 'IE=edge'})+
				this.meta({name: 'viewport', content: 'width=device-width, initial-scale=1'});
	},
	
	style: function(){
		var content = '';
		var params;
		
		for (var elem_class in Styler.result_styles)
		{
			params = Styler.result_styles[elem_class];
			content += '.'+elem_class+'{'+params+'}';
		}
		
		return this.tag('style', content);
	},
	
	br: '<br>',
	hr: '<hr>',
	type: '<!DOCTYPE html>',
	
	a: function(content, opt){
		if (opt && !is_object(opt)) opt = {href: opt};
		return this.tag('a', content, opt);
	},
	i: function(_class, content){
		if (!is_object(_class)) _class = _class ? {'class':_class} : null;
		return this.tag('i', content, _class);
	},
	p: function(content, opt){
		return this.tag('p', content, opt);
	},
	sup: function(content, opt){
		return this.tag('sup', content, opt);
	},
	
	meta: function(opt){
		return this.tag('meta', '', opt, true);
	},
	title: function(content, opt){
		return this.tag('title', content, opt);
	},
	html: function(content, opt){
		return this.tag('html', content, opt);
	},
	head: function(content, opt){
		return this.tag('head', content, opt);
	},
	body: function(content, opt){
		return this.tag('body', content, opt);
	},
	
	div: function(content, opt){
		return this.tag('div', content, opt);
	},
	span: function(content, opt){
		return this.tag('span', content, opt);
	},
	
	table: function(content, opt){
		return this.tag('table', content, opt);
	},
	tr: function(content, opt){
		return this.tag('tr', content, opt);
	},
	td: function(content, opt){
		return this.tag('td', content, opt);
	},
	
	ul: function(content, opt){
		return this.tag('ul', content, opt);
	},
	li: function(content, opt){
		return this.tag('li', content, opt);
	},
	
	button: function(content, opt){
		return this.tag('button', content, opt);
	},
	select: function(options, opt){
		return this.tag('select', this.getSelectOptions(options), opt);
	},
	input: function(opt){
		opt = opt || {};
		opt.type = opt.type || 'text';
		return this.tag('input', '', opt, true);
	},
	textarea: function(content, opt){
		return this.tag('textarea', content, opt);
	},
	
	img: function(src, opt){
		if (is_object(src))
			opt = src;
		else{
			if (!opt) opt = {};
			if (src) opt.src = src;
		}
		return this.tag('img', '', opt, true);
	},
	canvas: function(content, opt){
		return this.tag('canvas', content, opt);
	},
	script: function(content, opt){
		return this.tag('script', content, opt);
	},
	iframe: function(content, opt){
		return this.tag('iframe', content, opt);
	},
	form: function(content, opt){
		return this.tag('form', content, opt);
	}
};
