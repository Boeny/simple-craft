var image = require(MODULES+'/image');

module.exports = function(width, height){
	if (typeof width === 'object'){
		height = width.y;
		width = width.x;
	}
	this.width = width;
	this.height = height;
	this.light = vget(width + 10, -10);
};

module.exports.prototype = {
	power: 255,
	radius: 10,
	color: image.getColor(255,255,255),
	
	apply: function(data){
		var mult = this.power*this.radius;
		var len, res_power, p;
		var light_square;
		
		for (var y=0; y<this.height; y++){
			for (var x=0; x<this.width; x++)
			{
				if (image.isPoint(data, x,y)) continue;
				
				p = vget(x,y);
				len = vlen(p, this.light);
				
				if (len > this.radius){
					res_power = mult/Math.sqrt(len);
					
					if (len > this.min_distance)
					{
						light_square = len * this.radius;
						res_power *= light_square / (light_square - this.getShadowSquare(data, p));
					}
					
					this.color.a = res_power;
				}
				else{
					this.color.a = this.power;
				}
				
				image.setColor(data, x,y, vcopy(this.color));
			}
			
			console.log('y=%d, height=%d',y,this.height);
		}
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
	
	getShadowSquare: function(data, cur_p){
		var vs = this.getCollisionVectors(cur_p, this.light, this.radius);// from this point to the light center
		
		var vsn = vs.map((v) => vnorm(v, true));
		var min = vmin(vsn);
		var max = vmax(vsn);
		
		var pvs, pvsn, result=0;
		
		for (var y in data)
		for (var x in data[+y])
		{
			pvs = this.getCollisionVectors(cur_p, vget(+x,+y), 0.5);// from this point to the filled point
			pvsn = pvs.map((v) => vnorm(v, true));
			
			if (this.inAngles(pvsn[0], min, max)){
				if (this.inAngles(pvsn[1], min, max)){
					// shadow conus into the light conus
				}
				else{// reduce conus to min
					pvs[1] = vs[1];
				}
			}
			else{// reduce conus to max
				if (this.inAngles(pvsn[1], min, max)){
					pvs[0] = vs[0];
				}
				else{// out of the light conus
					continue;
				}
			}
			
			result += this.getSquare(vlen(pvs[0]), vlen(pvs[1]), vlen(pvs[0], pvs[1]));
		}
		
		return result || 0;
	},
	
	getSquare: function(a,b,c){
		var p = (a+b+c)/2;
		return Math.sqrt(p*(p-a)*(p-b)*(p-c));
	},
	
	inAngles: function(v, min, max){
		return in_range(v.x, min.x, max.x) && in_range(v.y, min.y, max.y);
	},
	
	checkMinDistance: function(p){
		var len = vlen(p, this.light);
		
		if (this.min_distance === undefined || len < this.min_distance)
			this.min_distance = len;
	}
};
