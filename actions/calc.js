/**
 * Module calculates the points' positions on every request
 */
var Light = require(MODULES+'/light');
var image = require(MODULES+'/image');

module.exports = {
	initialized: false,
	
	data: {},
	count: 1,// of the frames generated by the single request
	
	points: [],
	points_count: 100,
	radius: 70,
	
	mass: 0.00005,
	collision_distance: 0.5,
	temp_color_inc: 50,
	outer_mult: 0,// 0.0001,
	
	// main process
	step: function(){
		__server.msg(__server.POST);
		this.initialized = !__server.POST || !obj_length(__server.POST);
		
		var result = {data: []};
		
		if (this.initialized)
		{
			for (var i=0; i<this.count; i++){
				this.process();
				result.data.push(this.data);
			}
		}
		else{
			this.init();
			this.initialProcess();
			result.data.push(this.data);
			result.light_map = this.light.map;
		}
		
		return result;// data is an array of the frames
	},
	
	init: function(){
		var params = __server.POST;
		
		this.size = vget(+params.width, +params.height);
		this.size2 = vmult(this.size, 0.5, true);
		this.radius = this.radius || Math.min(this.size2.x/2, this.size2.y/2);
		
		this.light = new Light(this.size);
		image.size = this.size;
	},
	initialProcess: function(){
		this.points = [];
		this.data = {};
		
		this.light.setCoo(vuno(0));
		this.outer_grav = this.light.getCoo();
		
		var p;
		
		for (var i=0; i<this.points_count; i++){
			p = randomInCircle(this.size2.x, this.size2.y, this.radius, true);// as float
			
			this.points.push({
				x: p.x,
				y: p.y,
				speed: vuno(0)
			});
			
			this.setFramePoint(p);
		}
	},
	
	addOuterGrav: function(p){
		if (!this.outer_mult) return;
		
		var d = vsub(this.outer_grav, p, true);
		var l = vlen(d);
		
		if (l < this.collision_distance) return;
		
		vmult(d, this.outer_mult/l);
		vadd(p.speed, d);
		vsub(this.light.speed, this.mass/l);
	},
	
	process: function(){
		this.data = {};
		var p, p2, l, d;
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				d = vsub(p2, p, true);
				l = vlen(d);
				
				if (l > this.collision_distance){
					if (this.mass){
						vmult(d, this.mass/l);
						vadd(p.speed, d);
						vsub(p2.speed, d);
					}
				}
				else{// collision
					vmult(d, (l-this.collision_distance)/l);// normalize and set the backward direction
					vadd(p, d);
					vsub(p2, d);
					
					d = vmult(vadd(p.speed, p2.speed, true), 0.4, true);
					p.speed = vcopy(d);
					p2.speed = vcopy(d);
				}
			}
			
			this.addOuterGrav(p);
			
			vadd(p, p.speed);
			
			if (this.outer_mult && p.y > this.height)
				p.y = 2*this.height - p.y;
			
			//__server.e('!');
			this.setFramePoint(p);
		}

		//this.light.move();
	},
	
	// with color of temperature
	setFramePoint: function(p){
		p = image.roundCoo(p, true);
		
		if (!image.inScr(p)) return;
		
		if (image.isPoint(this.data, p))
		{
			this.data[p.y][p.x].r = image.clampColor(this.data[p.y][p.x].r + this.temp_color_inc);
		}
		else{
			image.setColor(this.data, p);
			this.light.apply(this.data, p);
		}
	}
};
