module.exports = {
	light: vget(-10,-10),
	power: 255,
	radius: 10,
	color: {r:255,g:255,b:255},

	apply: function(width, height){
		this.width = width;
		this.height = height;
		
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
		
	}
};
