module.exports = {
	light: vget(-10,-10),
	power: 255,
	radius: 10,
	color: {r:255,g:255,b:255},

	apply: function(width, height, inScr){
		this.width = width;
		this.height = height;
		this.inScr = inScr;
		
		var mult = this.power*this.radius;
		var len;
		var data = {};
		
		for (var y=0; y<height; y++)
		for (var x=0; x<width; x++){
			check_obj(data, y, {});
			
			len = vlen(vsub(this.light, vget(x,y), true));
			this.color.a = len > this.radius ? mult/Math.sqrt(len) : this.power;
			data[y][x] = vcopy(this.color);
		}
		
		return data;
	},
	
	shadows: function(data){
		this.shadow = {};
		var p,v,p1,p2,v1,v2;

		for (var y in data)
		for (var x in data[+y]){
			x = +x;
			y = +y;
			
			check_obj(this.shadow, y, {});
			this.shadow[y][x] = data[y][x];
			
			if (data[y][x].s) continue;

			p = vget(x,y);
			v = vsub(p, this.light, true);
			vmult(v, 0.5/vlen(v));
			
			// collision points
			p1 = vadd(p, vget(-v.y, v.x), true);
			p2 = vadd(p, vget(v.y,-v.x), true);

			// collision vectors
			v1 = vsub(p1, this.light, true);
			v2 = vsub(p2, this.light, true);
			vmult(v1, 1/vlen(v1));
			vmult(v2, 1/vlen(v2));
			
			this.setShadow(data, p1, p2, v1, v2);
		}

		return this.shadow;
	},

	setShadow: function(data, p1, p2, v1, v2){
		while (this.inScr(p1) && this.inScr(p2)){
			this.setShadowPoint(data, p1);
			this.setShadowPoint(data, p2);
			vadd(p1,v1);
			vadd(p2,v2);
		}
	},

	setShadowPoint: function(data, p){
		var x = Math.round(p.x);
                var y = Math.round(p.y);
		
		if (data[y] && data[y][x])
			data[y][x].s = 1;

		if (!this.shadow[y] || !this.shadow[y][x]){
			check_obj(this.shadow, y, {});
			this.shadow[y][x] = {r:0,g:0,b:0,a:255};
		}
	}
};
