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
	
	apply: function(data, p){
		var ps = this.getCollisionPoints(this.light, p, 0.5);// from the light to this point
		var vs = this.getCollisionPoints(p, this.light, this.radius);// from this point to the light
		
		vs = vs.map((v,i) => vnorm(vsub(ps[i], v, true), true));
		
		var inScr = ps.map((v) => image.inScr(v));
		
		while (inScr[0] || inScr[1]){
			for (var i in ps)
			{
				if (!inScr[i]) continue;
				if (!image.isPoint(data, ps[i]))
					this.setShadowPoint(data, ps[i], p);
				
				vadd(ps[i], vs[i]);
				inScr[i] = image.inScr(ps[i]);
			}
		}
		
		// middle point
		var vs = vadd(vs[0], vs[1], true);
		vnorm(vs);
		var m = vadd(p, vs, true);
		
		while (image.inScr(m)){
			this.fillLine(data, m, p);
			vadd(m, vs);
		}
	},
	
	setShadowPoint: function(data, p, origin){
		var len = vlen(p, this.light);
		var power = this.getPower(len);
		if (power < 0.5){
			image.setColor(data, p, {a:0});
			return;// rounds to 0
		}
		
		var power_percent = 1 - this.getShadowSquare(p, origin)/(len * this.radius);
		image.setColor(data, p, {r:255, g:255, b:255, a:power_percent * power});
	},
	
	isFree: function(data, p){
		return !image.isPoint(data, p) && image.inScr(p);
	},
	
	fillRay: function(data,m,p,dir){
		while (this.isFree(data, m)){
			this.setShadowPoint(data,
 m, p);
			m.x += dir;
		}
	},
	
	fillLine: function(data, m, p){
		this.fillRay(data, vget(m.x+1,m.y), p, 1);
		this.fillRay(data, vget(m.x-1,m.y), p, -1);
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
			if (this.inAngles(pvsn[1], min, max))// reduce conus to min
				return 0;// impossible! we're always in the shadow or halfshadow
			else{
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
