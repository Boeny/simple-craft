var result_styles = {};
var styles = {
	'^app':'width:100%;height:100%',
	'^abs':'position:absolute',
	'^fix':'position:fixed',
	'^top':'top:0',
	'^bottom':'bottom:0',
	'^right':'right:0',
	'^left':'left:0',
	'^mid':'top:50%;left:50%',
	
	'^m_(.*)':'margin:$1px',
	'^p_(.*)':'padding:$1px',
	
	'^w_(.*)':'width:$1px',
	'^h_(.*)':'height:$1px',
	
	'^bk_(.*)':'background:$1',
	'^c_(.*)':'color:$1',
	
	'^b$':'border:1px solid #333',
	'^bc_(.*)':'border-color:$1',
	'^b_(.*)_(.*)':'border-$1:1px solid $2',
	
	'^iblock':'display:inline-block',
	'^block':'display:block',
	
	'^center':'text-align:center',
	'lh_(.*)':'line-height:$1',
	'lhp_(.*)':'lie-height:$1px'
};

var combined = {
	'cell':'iblock center b w_50 h_50 lh_3'
};

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
	parseClass: function(cls, foreach_class_do){
		if (!cls) return;
		
		var elem_classes = cls.split(' ');
		var classes = Object.keys(result_styles);
		var regexp;
		
		for (var elem_class in elem_classes)
		{
			elem_class = elem_classes[elem_class];// index to value
			if (!elem_class || in_array(elem_class,classes)) continue;
			
			var found = false;
			for (var i in styles)
			{
				regexp = new RegExp(i,'g');
				if (elem_class.match(regexp)){
					found = true;
					foreach_class_do(elem_class, elem_class.replace(regexp, styles[i]));
				}
			}
			
			if (found) continue;
			for (var i in combined){
				if (elem_class.match(new RegExp(i,'g'))){
					this.setStyle(i, combined[i]);
				}
			}
		}
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
			
			this.parseClass(opt['class'], function(cls, replace){
				result_styles[cls] = replace;
			});
			
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
	setStyle: function(name, selector){
		result_styles[name] = '';
		
		this.parseClass(selector, function(cls, replace){
			result_styles[name] += replace.replace(/;$/,'')+';';
		});
	},
	style: function(){
		var content = '';
		for (var elem_class in result_styles){
			content += '.'+elem_class+'{'+result_styles[elem_class]+'}';
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
	},
	
	getSelectOptions: function(arr){
		if (!is_('object', arr)) return arr || '';
		
		var content = '';
		
		for (var o in arr)
			content += this.tag('option', arr[o], {value: o});
		
		return content;
	},
	getSelectedText: function(elem){
		elem = $(elem);
		return elem.find('option[value="'+elem.val()+'"]').text();
	},
	getSelectFirstVal: function(elem){
		return elem.find('option:first-of-type').attr('value');
	},
	getSelectValByText: function(elem, text){
		var v = 0;
		
		elem.children().each(function(){
			if ($(this).text() == text){
				v = $(this).attr('value');
				return false;
			}
		});
		
		return v;
	}
};