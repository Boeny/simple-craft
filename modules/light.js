var image = require(MODULES+'/image');

module.exports = function(size){
	this.size = size;
	this.light = size;
	this.mult = this.power * this.radius;
	
	this.init();
};

module.exports.prototype = {
	power: 255,
	radius: 10,
	color: image.getColor(255,255,255),
	
	init: function(){
		this.map = {};
		var len, p;
		
		for (var y=0; y < this.size.y; y++)
		for (var x=0; x < this.size.x; x++)
		{
			p = vget(x,y);
			len = vlen(p, this.light);
			
			this.color.a = len > this.radius ? this.mult/Math.sqrt(len) : this.power;
			
			image.setColor(this.map, p, vcopy(this.color));
		}
	},
	
	apply: function(data, p){
		var ps = this.getCollisionPoints(this.light, p, 0.5);// from the light to this point
		var vs = this.getCollisionPoints(p, this.light, this.radius);// from this point to the light
		
		vs = vs.map((v,i) => vnorm(vsub(ps[i], v, true), true));
		
		while (image.inScr(ps)){
			for (var i in ps)
			{
				if (!image.isPoint(data, ps[i]))
					this.setShadowPoint(data, ps[i], p);
				
				vadd(ps[i], vs[i]);
			}
		}
	},
	
	setShadowPoint: function(data, p, origin){
		var len = vlen(p, this.light);
		var power_percent = 1 - this.getShadowSquare(p, origin)/(len * this.radius);
		image.setColor(data, p, {a: power_percent * this.mult / Math.sqrt(len)});
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
		var vs = this.getCollisionVectors(p, this.light, this.radius);// from this point to the light center
		var vsn = vs.map((v) => vnorm(v, true));
		
		var min = vmin(vsn);
		var max = vmax(vsn);
		
		var pvs = this.getCollisionVectors(p, origin, 0.5);// from this point to the filled point
		var pvsn = pvs.map((v) => vnorm(v, true));
		var len;
		
		if (this.inAngles(pvsn[0], min, max)){
			if (this.inAngles(pvsn[1], min, max))// reduce conus to min
				return 0;
			else{
				pvs[1] = vs[1];
				len = vlen(pvs[1]);
				vset(pvs[0], len);
			}
		}
		else{
			if (this.inAngles(pvsn[1], min, max))// reduce conus to max
				pvs[0] = vs[0];
				len = vlen(pvs[0]);
				vset(pvs[1], len);
			else
				return 0;
		}
		
		return this.getSquare(len, len, vlen(pvs[0], pvs[1])) || 0;
	},
	
	getSquare: function(a,b,c){
		var p = (a+b+c)/2;
		return Math.sqrt(p*(p-a)*(p-b)*(p-c));
	},
	
	inAngles: function(v, min, max){
		return in_range(v.x, min.x, max.x) && in_range(v.y, min.y, max.y);
	}
};
