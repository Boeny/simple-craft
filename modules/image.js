module.exports = {
	roundCoo: function(p, ret){
		if (ret) return vwith(p, (coo) => coo >> 0);
		
		p.x = p.x >> 0;
		p.y = p.y >> 0;
	},
	
	isPoint: function(data, v){
		v = this.roundCoo(v, true);
		return data[v.y] && data[v.y][v.x];
	},
	
	inScr: function(v){
		if (is_array(v)){
			for (var i in v){
				if (!this.inScr(v[i])) return false;
			}
			return true;
		}
		
		v = this.roundCoo(v, true);
		return in_range(v.x, 0, this.size.x) && in_range(v.y, 0, this.size.y);
	},
	
	clampColor: function(c,min,max){
		if (min === undefined) min = 0;
		if (max === undefined) max = 255;
		return c > max ? max : (c < min ? min : c);
	},
	
	getColor: function(r,g,b,a){
		if (typeof r === 'object'){
			a = r.a;
			b = r.b;
			g = r.g;
			r = r.r;
		}
		
		return {
			r: r || 0,
			g: g || 0,
			b: b || 0,
			a: a === undefined ? 255 : a
		};
	},
	
	setColor: function(data, v, c){
		v = this.roundCoo(v, true);
		check_obj(data, v.y, {});
		data[v.y][v.x] = c || this.getColor();
	}
};
