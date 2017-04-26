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
		'^m_(.*)_(.*)':'margin:$1px $2px',
		'^p_(.*)':'padding:$1px',
		'^p_(.*)_(.*)':'padding:$1px $2px',
		
		'^w_(.*)':'width:$1px',
		'^h_(.*)':'height:$1px',
		
		'^bk_(.*)':'background:#$1',
		'^c_(.*)':'color:#$1',
		
		'^b$':'border:1px solid #aaa',
		'^bc_(.*)':'border-color:#$1',
		'^b_(.*)_(.*)':'border-$1:1px solid #$2',
		'^br_(.*)':'border-radius:$1px',
		
		'^iblock':'display:inline-block',
		'^block':'display:block',
		
		'^center':'text-align:center',
		'lh_(.*)':'line-height:$1',
		'lhp_(.*)':'line-height:$1px',
		'pointer':'cursor:pointer',
		
		'shadow_(.*)_(.*)_(.*)_(.*)':'box-shadow: $1px $2px $3px #$4',
		'shadow_inset_(.*)_(.*)_(.*)_(.*)_(.*)':'box-shadow: inset $1px $2px $3px $4px #$5',
		
		'pull-(.*)':'float:$1'
	},
	combined: {
		'bar':'w_0 h_16 bk_00f',
		'btn':'center pointer b_1_ccc br_3 p_3_9 shadow_1_1_1_777 bk_fff',
		'btn:active':'bk_eee shadow_inset_2_2_3_0_777',
		'counter':'pull-right lh_1.5'
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
			
			if (this.match(elem_class, regexp)){
				found = true;
				replaced = elem_class.replace(regexp, params);
				
				if (for_each_class_do)
					for_each_class_do(elem_class, replaced);
				else
					this.result_styles[elem_class] = replaced;
			}
		}
		
		if (found) return;
		
		// combine params of the multiple classes
		for (var i in this.combined){
			if (this.match(elem_class, new RegExp(i,'g'))){
				this.setStyle(i, this.combined[i]);
			}
		}
	},
	
	setStyle: function(name, selector){
		this.result_styles[name] = '';
		
		this.parseClasses(selector, (cls, replace) => {
			this.result_styles[name] += replace.replace(/;$/,'')+';';
		});
	},
	
	match: function(elem_class, regexp){
		return elem_class.match(regexp) || (elem_class+':hover').match(regexp) || (elem_class+':active').match(regexp);
	}
};
