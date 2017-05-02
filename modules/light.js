var image = require(MODULES+'/image');

module.exports = function(width, height){
	if (typeof width === 'object'){
		height = width.y;
		width = width.x;
	}
	
	this.width = width;
	this.height = height;
	this.light = vget(width, height);
	this.mult = this.power * this.radius;
	
	this.init();
};

module.exports.prototype = {
	power: 255,
	radius: 10,
	color: image.getColor(255,255,255),
	
	init: function(){
		this.map = {};
		var len;
		
		for (var y=0; y<this.height; y++)
		for (var x=0; x<this.width; x++)
		{
			len = vlen(vget(x,y), this.light);
			
			this.color.a = len > this.radius ? this.mult/Math.sqrt(len) : this.power;
			
			image.setColor(this.map, x,y, vcopy(this.color));
		}
	},
	
	apply: function(data, p){
		var ps = this.getCollisionPoints(this.light, p, 0.5);
		var vs = this.getCollisionVectors(this.light, ps);
		vs = vs.map((v) => vnorm(v, true));
		
		for (var i=0; image.inScr(ps[0]) && image.inScr(ps[1]); i++)
		for (var j in ps){
			this.setShadowPoint(data, ps[j], p);
			vadd(ps[j], vs[j]);
		}
	},
	
	setShadowPoint: function(data, p, origin){
		if (image.isPoint(data, p)) return;
		
		var len = vlen(p, this.light);
		power_percent = 1 - this.getShadowSquare(data, p, origin)/(len * this.radius);
		image.setColor(data, p, {r:255,g:255,b:255, a: power_percent * this.mult / Math.sqrt(len)});
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
	
	getShadowSquare: function(data, cur_p, p){
		var vs = this.getCollisionVectors(cur_p, this.light, this.radius);// from this point to the light center
		
		var vsn = vs.map((v) => vnorm(v, true));
		var min = vmin(vsn);
		var max = vmax(vsn);
		
		var result = 0;
		var pvs = this.getCollisionVectors(cur_p, p, 0.5);// from this point to the filled point
		var pvsn = pvs.map((v) => vnorm(v, true));
			
		if (this.inAngles(pvsn[0], min, max)){
			if (!this.inAngles(pvsn[1], min, max))// reduce conus to min
				pvs[1] = vs[1];
		}
		else{// reduce conus to max
			if (this.inAngles(pvsn[1], min, max))
				pvs[0] = vs[0];
			else return 0;
		}
		
		return this.getSquare(vlen(pvs[0]), vlen(pvs[1]), vlen(pvs[0], pvs[1])) || 0;
	},
	
	getSquare: function(a,b,c){
		var p = (a+b+c)/2;
		return Math.sqrt(p*(p-a)*(p-b)*(p-c));
	},
	
	inAngles: function(v, min, max){
		return in_range(v.x, min.x, max.x) && in_range(v.y, min.y, max.y);
	}
};
