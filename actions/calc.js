/**
 * Module calculates the points' positions on every request
 */
module.exports = {
	initialized: false,
	
	count: 10,// of the frames generated by the single request
	
	points: [],
	points_count: 200,
	radius: 100,
	
	mass: 0.00005,
	collision_distance: 0.5,
	temp_color_inc: 50,
	outer_mult: 0,//0.1,
	
	// main process
	step: function(){
		this.initialized = !__server.POST || !obj_length(__server.POST);
		
		var data = [];
		
		if (this.initialized)
		{
			for (var i=0; i<this.count; i++){
				this.process();
				data.push(this.getFramePoints());
			}
		}
		else{
			this.initialized = true;
			this.init();
			data.push(this.getFramePoints());
		}
		
		return data;// array of the frames
	},
	
	init: function(){
		var params = __server.POST;
		
		this.width = params.width;
		this.height = params.height;
		
		var w2 = this.width/2;
		var h2 = this.height/2;
		this.outer_grav = vget(w2, h2 + 10000);
		
		this.radius = this.radius || Math.min(w2/2,h2/2);
		var p;
		
		this.points = [];
		
		iterate(this.points_count, () => {
			p = randomInCircle(w2, h2, this.radius, true);// as float
			
			this.points.push({
				x: p.x,
				y: p.y,
				speed: vuno(0)
			});
		});
	},
	
	addOuterGrav: function(p){
 		if (!this.outer_mult) return;
 		
 		var d = vsub(this.outer_grav, p, true);
 		var l = vlen(d);
 		
 		if (l < this.collision_distance) return;
 		
 		vmult(d, this.outer_mult/l);
 		vadd(p.speed, d);
 	},
	
	process: function(){
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
  		}
  	},
	// with color of temperature
	getFramePoints: function(){
		var data = {};
		var p, red;
		
		for (var i in this.points){
			p = vwith(this.points[i], (coo) => Math.round(coo));
			
			if (!this.inScr(p)) continue;
			
			if (data[p.y] && data[p.y][p.x])
			{
				red = data[p.y][p.x].r + this.temp_color_inc;
				data[p.y][p.x].r = red > 255 ? 255 : red;
			}
			else{
				check_obj(data, p.y, {});
				data[p.y][p.x] = {r: 0, g: 0, b: 0, a: 255};
			}
		}
		
		return data;
	},
	
	inScr: function(_x,y){
		var x;
		if (typeof _x == 'object'){
			y = _x.y;
			x = _x.x;
		}
		else x = _x;
		
		return x > 0 && x < this.width && y > 0 && y < this.height;
	},
};