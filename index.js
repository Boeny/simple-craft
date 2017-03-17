
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
	for (var ic in cls){
		if (ic)
		for (var i in styles){
			reg = new 
RegExp(i);

		if (ic.match(reg)){
			reg = 
		styles[i].replace(/$\d/g,
'(.*)');
			styles[ic] = 
styles[i].replace(reg,s[i]);
		}

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
'm':'top:50%;margin:auto',
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
	if (i.indexOf('(') === -1)
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
__server.msg(h);
r.end(h);
};
