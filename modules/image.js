module.exports = {
	isPoint: function(data, x,y){
		if (typeof x === 'object'){
			y = x.y;
			x = x.x;
		}
		return data[y] && data[y][x];
	},
	
	inScr: function(x,y){
		if (typeof x === 'object'){
			y = x.y;
			x = x.x;
		}
		return in_range(x, 0, this.size.x) && in_range(y, 0, this.size.y);
	},
	
	clampColor: function(c){
		return c > 255 ? 255 : c;
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
			a: a === undefined ? 255 : 0
		};
	},
	setColor: function(data, x,y, c){
		if (typeof x === 'object'){
			c = y;
			y = x.y;
			x = x.x;
		}
		
		check_obj(data, y, {});
		data[y][x] = c || this.getColor();
	}
};