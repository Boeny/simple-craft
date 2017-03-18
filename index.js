function in_array(el,arr){
return arr.indexOf(el) > -1;
}


function ho(o){
var c = '';
if (o)
for (var i in o){
c += ' '+i+'="'+o[i]+'"';
}
return c;
}


function tag(t,c,o){
if (o && typeof o != 'object') o = 
{'class':o};
if (o && o['class']){
	var cls = o['class'].split(' ');
	var reg;
	var classes = Object.keys(s);
	for (var ic in cls){
		ic = cls[ic];
		if (ic && 
!in_array(ic,classes))
		for (var i in styles){
		reg = new RegExp(i,'g');
		if (ic.match(reg))
			s[ic] = 
ic.replace(reg, styles[i]);
		}
	}
}
return '<'+t+ho(o)+'>'+c+'</'+t+'>';
}

var s = {};
var styles = {
'abs':'position:absolute',
'fix':'position:fixed',
't':'top:0',
'b':'bottom:0',
'r':'right:0',
'l':'left:0',
'm':'top:50%;left:50%',
'w_(.*)':'width:$1px',
'h_(.*)':'height:$1px',
'bk_(.*)':'background:$1',
'c_(.*)':'color:$1',
'b':'border:1px solid #333',
'bc(.*)':'border:1px solid $1',
'b_(.*)_(.*)':'border-$1:1px solid $2'
};


function style(){
var c = '';
for (var i in s){
	c += '.'+i+'{'+s[i]+'}';
}
return tag('style',c);
}

function div(c,o){return tag('div',c,o)}

module.exports = function(p, r){
if (p=='/favicon.ico')return;
var h=div('hello','fix bk_red m w_50 h_50 \
b');
h = style()+h;
__server.lmsg(h);
r.end(h);
};
