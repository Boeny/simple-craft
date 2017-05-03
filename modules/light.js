var image = require(MODULES+'/image');

module.exports = function(size){
	this.size = size;
	this.mult = this.power * this.distanceFunction(this.radius);
	this.speed = vuno(0);
	this.init();
};

module.exports.prototype = {
	power: 255,
	radius: 100,
	color: image.getColor(255,255,255),
	
	distanceFunction: function(d){
		return Math.sqrt(d);
	},
	getPower: function(d){
		return this.mult / this.distanceFunction(d);
	},
	
	getCoo: function(){
		return this.light;
	},
	setCoo: function(p){
		this.light = vcopy(p);
	},
	move: function(v){
		vadd(this.light, v || this.speed);
	},
	
	init: function(){
		this.map = {};
		var len, p;
		
		for (var y=0; y < this.size.y; y++)
		for (var x=0; x < this.size.x; x++)
		{
			p = vget(x,y);
			len = vlen(p, this.light);
			
			this.color.a = len > this.radius ? this.getPower(len) : this.power;
			
			image.setColor(this.map, p, vcopy(this.color));
		}
	},
	
	apply: function(data, point){
		var ps = this.getCollisionPoints(this.light, point, 0.5);// from the light to this point
		var vs = this.getCollisionPoints(point, this.light, this.radius);// from this point to the light
		
		vs = vs.map((v,i) => vnorm(vsub(ps[i], v, true), true));
		
		var inScr = ps.map((v) => image.inScr(v));
		this.borders = {};
		
		while (inScr[0] || inScr[1]){
			for (var i in ps)
			{
				if (!inScr[i]) continue;
				
				this.setBorder(ps[i]);
				this.setShadowPoint(data, ps[i], point);
				
				vadd(ps[i], vs[i]);
				inScr[i] = image.inScr(ps[i]);
			}
		}
		
		this.fillSector(data, vs, point);
	},
	
	setBorder: function(p){
		p = image.roundCoo(p, true);
		this.borders[p.x+'-'+p.y] = 1;
	},
	getBorder: function(p){
		p = image.roundCoo(p, true);
		return this.borders[p.x+'-'+p.y];
	},
	
	setShadowPoint: function(data, p, origin){
		var point = image.isPoint(data, p);
		if (point && (!point.a || point.a >= 255)) return;
		
		var len = vlen(p, this.light);
		var power = this.getPower(len);
		if (power < 0.5) return;// rounds to 0
		
		var power_percent = 1 - this.getShadowSquare(p, origin)/(len * this.radius);
		
		this.color.a = power_percent * power;
		if (point) this.color.a = Math.min(point.a, this.color.a);
		
		this.color.a = image.clampColor(this.color.a);
		
		image.setColor(data, p, vcopy(this.color));
	},
	
	isFree: function(data, p){
		return !this.getBorder(p) && image.inScr(p);
	},
	
	fillSector: function(data, vs, p){
		vs = vadd(vs[0], vs[1], true);
		vnorm(vs);
		
		// middle point
		var m = vadd(p, vs, true),
			ps = [vget(m.x, m.y-i), vget(m.x, m.y+i)],
			isFree = ps.map((v) => this.isFree(data, v));
			dir = [1,-1];
		
		while (isFree[0] || isFree[1]){
			for (var i in ps)
			{
				if (!isFree[i]) continue;
				
				this.fillLine(data, ps[i], p);
				
				ps[i].y += dir[i];
				isFree[i] = this.isFree(data, ps[i]);
				
				// sliding along the border
				while(!isFree[i] && image.inScr(ps[i])){
					ps[i].x += vs.x;
					isFree[i] = this.isFree(data, ps[i]);
				}
			}
		}
	},
	
	fillRay: function(data,m,p,dir){
		while (this.isFree(data, m)){
			this.setShadowPoint(data, m, p);
			m.x += dir;
		}
	},
	
	fillLine: function(data, m, p){
		this.fillRay(data, vget(m.x+1, m.y), p, 1);
		this.fillRay(data, vget(m.x-1, m.y), p, -1);
		if (this.isFree(data, m)) this.setShadowPoint(data, m, p);
	},
	
	getCollisionPoints: function(source, collision_target, radius){
		var line = vsub(collision_target, source, true);
		vset(line, radius);
		
		return [
			vadd(collision_target, vget(-line.y, line.x), true),
			vadd(collision_target, vget(line.y, -line.x), true)
		];
	},
	
	getCollisionVectors: function(source, collision_points){
		if (!is_array(collision_points)){
			collision_points = this.getCollisionPoints.apply(this, arguments);
		}
		
		return [
			vsub(collision_points[0], source, true),
			vsub(collision_points[1], source, true)
		];
	},
	
	getShadowSquare: function(p, origin){
		var vs = this.getCollisionVectors(p, this.light, this.radius);// from this point to the light
		var vsn = vs.map((v) => vnorm(v, true));
		
		var min = vmin(vsn);
		var max = vmax(vsn);
		
		var pvs = this.getCollisionVectors(p, origin, 0.5);// from this point to the filled point
		var pvsn = pvs.map((v) => vnorm(v, true));
		var len;
		
		if (this.inAngles(pvsn[0], min, max)){
			if (this.inAngles(pvsn[1], min, max)){
				len = (vlen(vs[0]) + vlen(vs[1]))/2;
				vset(pvs[0], len);
				vset(pvs[1], len);
			}
			else{// reduce conus to min
				pvs[1] = vs[1];
				len = vlen(pvs[1]);
				vset(pvs[0], len);
			}
		}
		else{
			if (this.inAngles(pvsn[1], min, max)){// reduce conus to max
				pvs[0] = vs[0];
				len = vlen(pvs[0]);
				vset(pvs[1], len);
			}
			else
				return 0;
		}
		
		return this.getSquare(len, len, vlen(pvs[0], pvs[1])) || 0;
	},
	// Geron square of the triangle
	getSquare: function(a,b,c){
		var p = (a+b+c)/2;
		return Math.sqrt(p*(p-a)*(p-b)*(p-c));
	},
	
	inAngles: function(v, min, max){
		return in_range(v.x, min.x, max.x) && in_range(v.y, min.y, max.y);
	}
};
