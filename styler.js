module.exports = {
	result_styles: {},
	styles: {
		'^app':'width:100%;height:100%',
		'^abs':'position:absolute',
		'^fix':'position:fixed',
		'^rel':'position:relative',
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
		
		'^b$':'border:1px solid #aaa',
		'^bc_(.*)':'border-color:$1',
		'^b_(.*)_(.*)':'border-$1:1px solid $2',
		
		'^iblock':'display:inline-block',
		'^block':'display:block',
		
		'^center':'text-align:center',
		'lh_(.*)':'line-height:$1',
		'lhp_(.*)':'lie-height:$1px'
	},
	combined: {
		'cell':'iblock center b w_50 h_50 lh_3'
	},
	
	parseClasses: function(cls, for_each_class_do){
		if (!cls) return;
		
		var elem_classes = cls.split(' ');
		var existing_classes = Object.keys(this.result_styles);
		
		for (var elem_class in elem_classes){
			if (elem_class && !in_array(elem_class, existing_classes))
				this.parseOne(elem_classes[elem_class], for_each_class_do);
		}
	},
	
	parseOne: function(elem_class, for_each_class_do){
		var found = false;
		var regexp, params, replaced;
		
		for (var i in this.styles)
		{
			params = this.styles[i];
			regexp = new RegExp(i,'g');
			
			if (elem_class.match(regexp)){
				found = true;
				replaced = elem_class.replace(regexp, params);
				
				if (for_each_class_do)
					foreach_class_do(elem_class, replaced);
				else
					this.result_styles[elem_class] = replaced;
			}
		}
		
		if (found) return;
		
		// combine params of the multiple classes
		for (var i in this.combined){
			if (elem_class.match(new RegExp(i,'g'))){
				this.setStyle(i, this.combined[i]);
			}
		}
	},
	
	setStyle: function(name, selector){
		this.result_styles[name] = '';
		
		this.parseClasses(selector, (cls, replace) => {
			this.result_styles[name] += replace.replace(/;$/,'')+';';
		});
	}
};
